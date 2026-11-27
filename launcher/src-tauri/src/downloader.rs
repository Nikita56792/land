use crate::catalog::MirrorConfig;
use crate::installer::InstallProgress;
use crate::mirrors::{build_release_url, resolve_mirror_order};
use futures_util::StreamExt;
use std::collections::VecDeque;
use std::fs::{File, OpenOptions};
use std::path::Path;
use std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

const NUM_STREAMS: usize = 8;
const CHUNK_SIZE: u64 = 8 * 1024 * 1024; // 8 MiB
const MIN_MULTISTREAM_SIZE: u64 = 16 * 1024 * 1024; // 16 MiB
const WRITE_BUFFER_THRESHOLD: usize = 512 * 1024; // 512 KiB batch writes to avoid excessive spawn_blocking overhead
const MAX_RETRIES_PER_CHUNK: usize = 6;
const FAILOVER_AFTER_FAILURES: usize = 2;
const PROGRESS_INTERVAL: Duration = Duration::from_millis(120);
const SPEED_WINDOW: Duration = Duration::from_millis(2500);

pub struct DownloadResult {
    pub total_bytes: u64,
    pub mirror_used: String,
    pub mirror_id: String,
}

#[derive(Clone)]
struct PositionedFile {
    #[cfg(unix)]
    file: Arc<File>,
    #[cfg(not(unix))]
    file: Arc<std::sync::Mutex<File>>,
}

impl PositionedFile {
    fn new(file: File) -> Self {
        #[cfg(unix)]
        {
            Self {
                file: Arc::new(file),
            }
        }
        #[cfg(not(unix))]
        {
            Self {
                file: Arc::new(std::sync::Mutex::new(file)),
            }
        }
    }

    async fn write_all_at(&self, offset: u64, data: Vec<u8>) -> Result<(), String> {
        let this = self.clone();
        tokio::task::spawn_blocking(move || this.write_all_at_sync(offset, &data))
            .await
            .map_err(|e| format!("Ошибка фонового потока записи: {e}"))?
    }

    #[cfg(unix)]
    fn write_all_at_sync(&self, offset: u64, data: &[u8]) -> Result<(), String> {
        use std::os::unix::fs::FileExt;
        self.file
            .write_all_at(data, offset)
            .map_err(|e| format!("Ошибка записи временного файла по смещению {offset}: {e}"))
    }

    #[cfg(not(unix))]
    fn write_all_at_sync(&self, offset: u64, data: &[u8]) -> Result<(), String> {
        use std::io::{Seek, SeekFrom, Write};
        let mut guard = self
            .file
            .lock()
            .map_err(|_| "Внутренняя ошибка блокировки файла".to_string())?;
        guard
            .seek(SeekFrom::Start(offset))
            .map_err(|e| format!("Ошибка seek временного файла: {e}"))?;
        guard
            .write_all(data)
            .map_err(|e| format!("Ошибка записи временного файла: {e}"))
    }

    async fn sync_all(&self) -> Result<(), String> {
        let this = self.clone();
        tokio::task::spawn_blocking(move || {
            #[cfg(unix)]
            {
                this.file
                    .sync_all()
                    .map_err(|e| format!("Ошибка синхронизации временного файла: {e}"))
            }
            #[cfg(not(unix))]
            {
                let guard = this
                    .file
                    .lock()
                    .map_err(|_| "Внутренняя ошибка блокировки файла".to_string())?;
                guard
                    .sync_all()
                    .map_err(|e| format!("Ошибка синхронизации временного файла: {e}"))
            }
        })
        .await
        .map_err(|e| format!("Ошибка фонового потока sync: {e}"))?
    }
}

struct ChunkTask {
    start: u64,
    end: u64, // inclusive
}

struct ProbeMeta {
    total_bytes: u64,
    supports_ranges: bool,
    mirror_idx: usize,
}

fn build_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .pool_max_idle_per_host(NUM_STREAMS * 2)
        .connect_timeout(Duration::from_secs(10))
        .read_timeout(Duration::from_secs(20))
        .tcp_keepalive(Duration::from_secs(30))
        .user_agent("ParhelioLauncher/1.0")
        .build()
        .map_err(|e| format!("Не удалось инициализировать HTTP-клиент: {e}"))
}

async fn probe_remote_file(
    client: &reqwest::Client,
    mirrors: &[MirrorConfig],
    file_name: &str,
    expected_size: u64,
    cancel_flag: &AtomicBool,
) -> Result<ProbeMeta, String> {
    let mut last_error = String::from("Нет доступных зеркал для загрузки");

    for (idx, mirror) in mirrors.iter().enumerate() {
        if cancel_flag.load(Ordering::Relaxed) {
            return Err("Установка отменена пользователем (cancelled)".to_string());
        }

        let url = build_release_url(&mirror.base_url, file_name);

        // 1. Try HEAD first
        if let Ok(resp) = client
            .head(&url)
            .timeout(Duration::from_secs(8))
            .send()
            .await
        {
            if resp.status().is_success() {
                let accept_ranges = resp
                    .headers()
                    .get(reqwest::header::ACCEPT_RANGES)
                    .and_then(|v| v.to_str().ok())
                    .map(|v| v.to_ascii_lowercase().contains("bytes"))
                    .unwrap_or(false);

                let content_len = resp
                    .headers()
                    .get(reqwest::header::CONTENT_LENGTH)
                    .and_then(|v| v.to_str().ok())
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);

                if content_len > 0 && accept_ranges {
                    return Ok(ProbeMeta {
                        total_bytes: content_len,
                        supports_ranges: true,
                        mirror_idx: idx,
                    });
                }

                // HEAD succeeded, verify Range support via 1-byte GET if not explicitly advertised
                if let Some(meta) = probe_via_range_get(client, &url, idx).await {
                    return Ok(meta);
                }

                if content_len > 0 {
                    return Ok(ProbeMeta {
                        total_bytes: content_len,
                        supports_ranges: false,
                        mirror_idx: idx,
                    });
                }
            } else {
                last_error = format!("Зеркало {} вернуло HTTP {}", mirror.name, resp.status());
            }
        } else {
            last_error = format!("Не удалось подключиться к зеркалу {}", mirror.name);
        }

        // 2. Fallback: direct 1-byte Range GET (works even when HEAD is blocked)
        if let Some(meta) = probe_via_range_get(client, &url, idx).await {
            return Ok(meta);
        }
    }

    if expected_size > 0 && !mirrors.is_empty() {
        // Last resort: try single-stream download on mirror 0
        return Ok(ProbeMeta {
            total_bytes: expected_size,
            supports_ranges: false,
            mirror_idx: 0,
        });
    }

    Err(last_error)
}

async fn probe_via_range_get(
    client: &reqwest::Client,
    url: &str,
    mirror_idx: usize,
) -> Option<ProbeMeta> {
    let resp = client
        .get(url)
        .header(reqwest::header::RANGE, "bytes=0-0")
        .timeout(Duration::from_secs(8))
        .send()
        .await
        .ok()?;

    if resp.status() == reqwest::StatusCode::PARTIAL_CONTENT {
        if let Some(total) = resp
            .headers()
            .get(reqwest::header::CONTENT_RANGE)
            .and_then(|v| v.to_str().ok())
            .and_then(parse_content_range_total)
        {
            return Some(ProbeMeta {
                total_bytes: total,
                supports_ranges: true,
                mirror_idx,
            });
        }
    } else if resp.status().is_success() {
        let total = resp
            .headers()
            .get(reqwest::header::CONTENT_LENGTH)
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0);
        if total > 0 {
            return Some(ProbeMeta {
                total_bytes: total,
                supports_ranges: false,
                mirror_idx,
            });
        }
    }

    None
}

fn parse_content_range_total(header_val: &str) -> Option<u64> {
    // Format: "bytes 0-0/1510059508"
    let slash_pos = header_val.rfind('/')?;
    let total_str = header_val[slash_pos + 1..].trim();
    if total_str == "*" {
        return None;
    }
    total_str.parse::<u64>().ok()
}

#[allow(clippy::too_many_arguments)]
pub async fn download_file(
    app: &AppHandle,
    game_id: &str,
    package_id: &str,
    file_name: &str,
    expected_size: u64,
    mirror_preference: &str,
    destination_path: &str,
    dest_temp_path: &Path,
    cancel_flag: Arc<AtomicBool>,
) -> Result<DownloadResult, String> {
    // Emit connecting/probing event
    let _ = app.emit(
        "install-progress",
        InstallProgress {
            game_id: game_id.to_string(),
            package_id: package_id.to_string(),
            phase: "connecting".to_string(),
            percent: 0.0,
            downloaded_bytes: 0,
            total_bytes: expected_size,
            speed_bytes_per_sec: 0,
            eta_seconds: None,
            active_streams: 0,
            mirror_id: mirror_preference.to_string(),
            mirror_name: "Выбор быстрого зеркала…".to_string(),
            extract_current: 0,
            extract_total: 0,
            current_file: file_name.to_string(),
            destination_path: destination_path.to_string(),
            message: "Проверка доступности зеркал Parhelio…".to_string(),
        },
    );

    if cancel_flag.load(Ordering::Relaxed) {
        return Err("Установка отменена пользователем (cancelled)".to_string());
    }

    let ordered_mirrors = resolve_mirror_order(mirror_preference).await;
    if ordered_mirrors.is_empty() {
        return Err("Список зеркал пуст".to_string());
    }

    let client = build_http_client()?;
    let meta = probe_remote_file(
        &client,
        &ordered_mirrors,
        file_name,
        expected_size,
        &cancel_flag,
    )
    .await?;

    let total_bytes = if meta.total_bytes > 0 {
        meta.total_bytes
    } else {
        expected_size
    };

    let mirrors = Arc::new(ordered_mirrors);
    let active_mirror_idx = Arc::new(AtomicUsize::new(meta.mirror_idx));
    let downloaded_bytes = Arc::new(AtomicU64::new(0));
    let active_streams = Arc::new(AtomicUsize::new(0));
    let progress_stop = Arc::new(AtomicBool::new(false));

    // Start 120ms smooth moving-average progress emitter
    let emitter_handle = {
        let app_clone = app.clone();
        let game_id = game_id.to_string();
        let package_id = package_id.to_string();
        let file_name = file_name.to_string();
        let destination_path = destination_path.to_string();
        let mirrors = Arc::clone(&mirrors);
        let active_mirror_idx = Arc::clone(&active_mirror_idx);
        let downloaded_bytes = Arc::clone(&downloaded_bytes);
        let active_streams = Arc::clone(&active_streams);
        let progress_stop = Arc::clone(&progress_stop);

        tokio::spawn(async move {
            let mut ticker = tokio::time::interval(PROGRESS_INTERVAL);
            let mut samples: VecDeque<(Instant, u64)> = VecDeque::with_capacity(32);
            let start_time = Instant::now();
            samples.push_back((start_time, 0));

            loop {
                ticker.tick().await;
                if progress_stop.load(Ordering::Relaxed) {
                    break;
                }

                let now = Instant::now();
                let current = downloaded_bytes.load(Ordering::Relaxed).min(total_bytes);
                samples.push_back((now, current));

                while samples.len() > 2 {
                    if let Some(&(ts, _)) = samples.front() {
                        if now.duration_since(ts) > SPEED_WINDOW {
                            samples.pop_front();
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                let speed_bps = if let Some(&(oldest_ts, oldest_bytes)) = samples.front() {
                    let dt = now.duration_since(oldest_ts).as_secs_f64();
                    if dt >= 0.05 && current >= oldest_bytes {
                        ((current - oldest_bytes) as f64 / dt) as u64
                    } else {
                        0
                    }
                } else {
                    0
                };

                let eta_seconds = if speed_bps > 0 && total_bytes > current {
                    Some((total_bytes - current) / speed_bps)
                } else {
                    None
                };

                let percent = if total_bytes > 0 {
                    ((current as f64 / total_bytes as f64) * 100.0).min(100.0)
                } else {
                    0.0
                };

                let m_idx = active_mirror_idx
                    .load(Ordering::Relaxed)
                    .min(mirrors.len().saturating_sub(1));
                let mirror = &mirrors[m_idx];

                let _ = app_clone.emit(
                    "install-progress",
                    InstallProgress {
                        game_id: game_id.clone(),
                        package_id: package_id.clone(),
                        phase: "downloading".to_string(),
                        percent,
                        downloaded_bytes: current,
                        total_bytes,
                        speed_bytes_per_sec: speed_bps,
                        eta_seconds,
                        active_streams: active_streams.load(Ordering::Relaxed),
                        mirror_id: mirror.id.clone(),
                        mirror_name: mirror.name.clone(),
                        extract_current: 0,
                        extract_total: 0,
                        current_file: file_name.clone(),
                        destination_path: destination_path.clone(),
                        message: String::new(),
                    },
                );
            }
        })
    };

    let result = if meta.supports_ranges && total_bytes >= MIN_MULTISTREAM_SIZE {
        download_multistream(
            &client,
            Arc::clone(&mirrors),
            Arc::clone(&active_mirror_idx),
            file_name,
            total_bytes,
            dest_temp_path,
            Arc::clone(&downloaded_bytes),
            Arc::clone(&active_streams),
            Arc::clone(&cancel_flag),
        )
        .await
    } else {
        download_single_stream(
            &client,
            Arc::clone(&mirrors),
            Arc::clone(&active_mirror_idx),
            file_name,
            total_bytes,
            dest_temp_path,
            Arc::clone(&downloaded_bytes),
            Arc::clone(&active_streams),
            Arc::clone(&cancel_flag),
        )
        .await
    };

    progress_stop.store(true, Ordering::Relaxed);
    let _ = emitter_handle.await;

    match result {
        Ok(final_bytes) => {
            let m_idx = active_mirror_idx
                .load(Ordering::Relaxed)
                .min(mirrors.len().saturating_sub(1));
            let mirror = &mirrors[m_idx];
            Ok(DownloadResult {
                total_bytes: final_bytes,
                mirror_used: mirror.name.clone(),
                mirror_id: mirror.id.clone(),
            })
        }
        Err(err) => {
            let _ = std::fs::remove_file(dest_temp_path);
            Err(err)
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn download_multistream(
    client: &reqwest::Client,
    mirrors: Arc<Vec<MirrorConfig>>,
    active_mirror_idx: Arc<AtomicUsize>,
    file_name: &str,
    total_bytes: u64,
    dest_temp_path: &Path,
    downloaded_bytes: Arc<AtomicU64>,
    active_streams: Arc<AtomicUsize>,
    cancel_flag: Arc<AtomicBool>,
) -> Result<u64, String> {
    // Pre-allocate destination temp file on disk
    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(dest_temp_path)
        .map_err(|e| format!("Не удалось создать временный файл загрузки: {e}"))?;
    file.set_len(total_bytes)
        .map_err(|e| format!("Не удалось выделить место под временный файл: {e}"))?;
    let positioned_file = PositionedFile::new(file);

    // Split file into 8 MiB chunks
    let mut chunks = VecDeque::new();
    let mut offset = 0u64;
    while offset < total_bytes {
        let end = (offset + CHUNK_SIZE - 1).min(total_bytes - 1);
        chunks.push_back(ChunkTask { start: offset, end });
        offset = end + 1;
    }

    let worker_count = NUM_STREAMS.min(chunks.len().max(1));
    let queue = Arc::new(Mutex::new(chunks));
    let primary_failures = Arc::new(AtomicUsize::new(0));
    let fatal_error: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let abort_all = Arc::new(AtomicBool::new(false));

    let mut handles = Vec::with_capacity(worker_count);

    for _ in 0..worker_count {
        let client = client.clone();
        let mirrors = Arc::clone(&mirrors);
        let active_mirror_idx = Arc::clone(&active_mirror_idx);
        let file_name = file_name.to_string();
        let queue = Arc::clone(&queue);
        let positioned_file = positioned_file.clone();
        let downloaded_bytes = Arc::clone(&downloaded_bytes);
        let active_streams = Arc::clone(&active_streams);
        let primary_failures = Arc::clone(&primary_failures);
        let cancel_flag = Arc::clone(&cancel_flag);
        let abort_all = Arc::clone(&abort_all);
        let fatal_error = Arc::clone(&fatal_error);

        let handle = tokio::spawn(async move {
            active_streams.fetch_add(1, Ordering::Relaxed);

            loop {
                if cancel_flag.load(Ordering::Relaxed) || abort_all.load(Ordering::Relaxed) {
                    break;
                }

                let next_chunk = {
                    let mut q = queue.lock().await;
                    q.pop_front()
                };

                let Some(chunk) = next_chunk else {
                    break;
                };

                if let Err(err) = download_chunk_with_failover(
                    &client,
                    &mirrors,
                    &active_mirror_idx,
                    &primary_failures,
                    &file_name,
                    chunk,
                    &positioned_file,
                    &downloaded_bytes,
                    &cancel_flag,
                    &abort_all,
                )
                .await
                {
                    abort_all.store(true, Ordering::Relaxed);
                    let mut guard = fatal_error.lock().await;
                    if guard.is_none() {
                        *guard = Some(err);
                    }
                    break;
                }
            }

            active_streams.fetch_sub(1, Ordering::Relaxed);
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await;
    }

    if cancel_flag.load(Ordering::Relaxed) {
        return Err("Установка отменена пользователем (cancelled)".to_string());
    }

    if let Some(err) = fatal_error.lock().await.take() {
        return Err(err);
    }

    positioned_file.sync_all().await?;
    Ok(total_bytes)
}

#[allow(clippy::too_many_arguments)]
async fn download_chunk_with_failover(
    client: &reqwest::Client,
    mirrors: &[MirrorConfig],
    active_mirror_idx: &AtomicUsize,
    primary_failures: &AtomicUsize,
    file_name: &str,
    chunk: ChunkTask,
    positioned_file: &PositionedFile,
    downloaded_bytes: &AtomicU64,
    cancel_flag: &AtomicBool,
    abort_all: &AtomicBool,
) -> Result<(), String> {
    let mut written_in_chunk: u64 = 0;
    let total_chunk_len = chunk.end - chunk.start + 1;
    let mut local_failures_on_primary: usize = 0;
    let mut last_err = String::from("Неизвестная ошибка загрузки фрагмента");

    for attempt in 0..MAX_RETRIES_PER_CHUNK {
        if cancel_flag.load(Ordering::Relaxed) {
            return Err("Установка отменена пользователем (cancelled)".to_string());
        }
        if abort_all.load(Ordering::Relaxed) {
            return Err("Загрузка прервана".to_string());
        }

        let current_start = chunk.start + written_in_chunk;
        if current_start > chunk.end {
            return Ok(());
        }

        let mirror_idx = active_mirror_idx
            .load(Ordering::Relaxed)
            .min(mirrors.len().saturating_sub(1));
        let mirror = &mirrors[mirror_idx];
        let url = build_release_url(&mirror.base_url, file_name);
        let range_header = format!("bytes={current_start}-{}", chunk.end);

        let send_res = client
            .get(&url)
            .header(reqwest::header::RANGE, &range_header)
            .send()
            .await;

        let mut attempt_failed: Option<String> = None;

        match send_res {
            Ok(resp) => {
                let status = resp.status();
                if status == reqwest::StatusCode::PARTIAL_CONTENT
                    || (status.is_success() && current_start == 0)
                {
                    let mut stream = resp.bytes_stream();
                    let mut write_buf: Vec<u8> = Vec::with_capacity(WRITE_BUFFER_THRESHOLD + 65_536);
                    let mut buf_offset = current_start;

                    while let Some(item) = stream.next().await {
                        if cancel_flag.load(Ordering::Relaxed) {
                            return Err("Установка отменена пользователем (cancelled)".to_string());
                        }
                        if abort_all.load(Ordering::Relaxed) {
                            return Err("Загрузка прервана".to_string());
                        }

                        match item {
                            Ok(bytes) => {
                                if bytes.is_empty() {
                                    continue;
                                }
                                let remaining =
                                    total_chunk_len.saturating_sub(written_in_chunk) as usize;
                                if remaining == 0 {
                                    break;
                                }
                                let slice = if bytes.len() > remaining {
                                    &bytes[..remaining]
                                } else {
                                    &bytes[..]
                                };

                                write_buf.extend_from_slice(slice);
                                written_in_chunk += slice.len() as u64;
                                downloaded_bytes.fetch_add(slice.len() as u64, Ordering::Relaxed);

                                if write_buf.len() >= WRITE_BUFFER_THRESHOLD {
                                    let flush_data = std::mem::replace(
                                        &mut write_buf,
                                        Vec::with_capacity(WRITE_BUFFER_THRESHOLD + 65_536),
                                    );
                                    let flush_len = flush_data.len() as u64;
                                    positioned_file.write_all_at(buf_offset, flush_data).await?;
                                    buf_offset += flush_len;
                                }
                            }
                            Err(e) => {
                                // Flush whatever complete bytes we already received so resume continues seamlessly
                                if !write_buf.is_empty() {
                                    let flush_data = std::mem::take(&mut write_buf);
                                    let _ = positioned_file
                                        .write_all_at(buf_offset, flush_data)
                                        .await;
                                }
                                attempt_failed = Some(format!(
                                    "Обрыв потока на зеркале {}: {e}",
                                    mirror.name
                                ));
                                break;
                            }
                        }
                    }

                    if attempt_failed.is_none() {
                        if !write_buf.is_empty() {
                            positioned_file.write_all_at(buf_offset, write_buf).await?;
                        }
                        if written_in_chunk >= total_chunk_len {
                            return Ok(());
                        }
                        attempt_failed = Some(format!(
                            "Неполный фрагмент от {} ({written_in_chunk}/{total_chunk_len} Б)",
                            mirror.name
                        ));
                    }
                } else {
                    attempt_failed = Some(format!(
                        "Зеркало {} вернуло HTTP {}",
                        mirror.name, status
                    ));
                }
            }
            Err(e) => {
                attempt_failed = Some(format!("Ошибка сети ({}): {e}", mirror.name));
            }
        }

        if let Some(err_msg) = attempt_failed {
            last_err = err_msg;

            // Automatic live failover after 2 failures on primary mirror
            if mirror_idx == 0 && mirrors.len() > 1 {
                local_failures_on_primary += 1;
                let global_fails = primary_failures.fetch_add(1, Ordering::Relaxed) + 1;
                if local_failures_on_primary >= FAILOVER_AFTER_FAILURES
                    || global_fails >= FAILOVER_AFTER_FAILURES
                {
                    let _ = active_mirror_idx.compare_exchange(
                        0,
                        1,
                        Ordering::SeqCst,
                        Ordering::Relaxed,
                    );
                }
            }

            if attempt + 1 < MAX_RETRIES_PER_CHUNK {
                let backoff_ms = 250u64 * (attempt as u64 + 1);
                tokio::time::sleep(Duration::from_millis(backoff_ms)).await;
            }
        }
    }

    Err(format!(
        "Не удалось скачать фрагмент файла после {MAX_RETRIES_PER_CHUNK} попыток: {last_err}"
    ))
}

#[allow(clippy::too_many_arguments)]
async fn download_single_stream(
    client: &reqwest::Client,
    mirrors: Arc<Vec<MirrorConfig>>,
    active_mirror_idx: Arc<AtomicUsize>,
    file_name: &str,
    _expected_total: u64,
    dest_temp_path: &Path,
    downloaded_bytes: Arc<AtomicU64>,
    active_streams: Arc<AtomicUsize>,
    cancel_flag: Arc<AtomicBool>,
) -> Result<u64, String> {
    active_streams.store(1, Ordering::Relaxed);
    let mut last_err = String::from("Не удалось скачать файл");

    let start_idx = active_mirror_idx
        .load(Ordering::Relaxed)
        .min(mirrors.len().saturating_sub(1));

    let mirror_indices: Vec<usize> = (start_idx..mirrors.len()).chain(0..start_idx).collect();

    for m_idx in mirror_indices {
        active_mirror_idx.store(m_idx, Ordering::Relaxed);
        let mirror = &mirrors[m_idx];
        let url = build_release_url(&mirror.base_url, file_name);

        for attempt in 0..2 {
            if cancel_flag.load(Ordering::Relaxed) {
                active_streams.store(0, Ordering::Relaxed);
                return Err("Установка отменена пользователем (cancelled)".to_string());
            }

            downloaded_bytes.store(0, Ordering::Relaxed);

            let resp = match client.get(&url).send().await {
                Ok(r) if r.status().is_success() => r,
                Ok(r) => {
                    last_err = format!("Зеркало {} вернуло HTTP {}", mirror.name, r.status());
                    tokio::time::sleep(Duration::from_millis(300 * (attempt + 1))).await;
                    continue;
                }
                Err(e) => {
                    last_err = format!("Ошибка сети ({}): {e}", mirror.name);
                    tokio::time::sleep(Duration::from_millis(300 * (attempt + 1))).await;
                    continue;
                }
            };

            let file = OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(dest_temp_path)
                .map_err(|e| format!("Не удалось создать временный файл: {e}"))?;
            let positioned = PositionedFile::new(file);

            let mut stream = resp.bytes_stream();
            let mut offset = 0u64;
            let mut write_buf = Vec::with_capacity(WRITE_BUFFER_THRESHOLD + 65_536);
            let mut stream_err: Option<String> = None;

            while let Some(item) = stream.next().await {
                if cancel_flag.load(Ordering::Relaxed) {
                    active_streams.store(0, Ordering::Relaxed);
                    return Err("Установка отменена пользователем (cancelled)".to_string());
                }
                match item {
                    Ok(bytes) => {
                        write_buf.extend_from_slice(&bytes);
                        downloaded_bytes.fetch_add(bytes.len() as u64, Ordering::Relaxed);
                        if write_buf.len() >= WRITE_BUFFER_THRESHOLD {
                            let flush_data = std::mem::replace(
                                &mut write_buf,
                                Vec::with_capacity(WRITE_BUFFER_THRESHOLD + 65_536),
                            );
                            let len = flush_data.len() as u64;
                            positioned.write_all_at(offset, flush_data).await?;
                            offset += len;
                        }
                    }
                    Err(e) => {
                        stream_err = Some(format!("Обрыв загрузки ({}): {e}", mirror.name));
                        break;
                    }
                }
            }

            if let Some(err) = stream_err {
                last_err = err;
                tokio::time::sleep(Duration::from_millis(300 * (attempt + 1))).await;
                continue;
            }

            if !write_buf.is_empty() {
                let len = write_buf.len() as u64;
                positioned.write_all_at(offset, write_buf).await?;
                offset += len;
            }

            positioned.sync_all().await?;
            active_streams.store(0, Ordering::Relaxed);
            return Ok(offset);
        }
    }

    active_streams.store(0, Ordering::Relaxed);
    Err(last_err)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_content_range_header() {
        assert_eq!(
            parse_content_range_total("bytes 0-0/1510059508"),
            Some(1510059508)
        );
        assert_eq!(parse_content_range_total("bytes 0-100/*"), None);
        assert_eq!(parse_content_range_total("invalid"), None);
    }
}
