use crate::catalog::embedded_catalog;
use crate::downloader;
use crate::drives::available_space_for_path;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};

const IO_BUFFER_SIZE: usize = 4 * 1024 * 1024; // 4 MiB sequential SD buffer
const PROGRESS_EMIT_INTERVAL: Duration = Duration::from_millis(120);
const SAFETY_SPACE_MARGIN_BYTES: u64 = 32 * 1024 * 1024; // 32 MiB

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallRequest {
    pub game_id: String,
    pub game_title: String,
    pub package_id: String,
    pub format: String, // "wuhb" | "wup"
    pub file_name: String,
    pub size_bytes: u64,
    #[serde(default)]
    pub wup_folder_name: Option<String>,
    pub mirror_preference: String, // "auto" | "ru" | "global"
    pub target_mode: String,       // "sd_auto" | "custom_apps" | "custom_install" | "custom_wuhb_dir" | "custom_wup_dir"
    pub target_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallResult {
    pub package_id: String,
    pub destination_path: String,
    pub mirror_id: String,
    pub mirror_name: String,
    pub mirror_used: String,
    pub bytes_written: u64,
    pub files_installed: usize,
    pub files_extracted: usize,
    pub elapsed_ms: u64,
    pub elapsed_seconds: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallProgress {
    pub game_id: String,
    pub package_id: String,
    pub phase: String, // "connecting" | "downloading" | "copying" | "extracting" | "verifying" | "done" | "cancelled" | "error"
    pub percent: f64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub speed_bytes_per_sec: u64,
    pub eta_seconds: Option<u64>,
    pub active_streams: usize,
    pub mirror_id: String,
    pub mirror_name: String,
    pub extract_current: usize,
    pub extract_total: usize,
    pub current_file: String,
    pub destination_path: String,
    pub message: String,
}

struct TempFileGuard(PathBuf);

impl Drop for TempFileGuard {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

/// Validates that `file_name` is a safe single filename with no path traversal.
pub fn validate_file_name(file_name: &str) -> Result<&str, String> {
    let trimmed = file_name.trim();
    if trimmed.is_empty()
        || trimmed == "."
        || trimmed == ".."
        || trimmed.contains('/')
        || trimmed.contains('\\')
        || trimmed.contains('\0')
    {
        return Err(format!("Некорректное имя файла пакета: {file_name}"));
    }
    Ok(trimmed)
}

/// Resolves the target file path (for `wuhb`) or extraction root directory (for `wup`).
pub fn resolve_destination(
    target_mode: &str,
    format: &str,
    target_path: &Path,
    file_name: &str,
) -> Result<PathBuf, String> {
    let clean_file = validate_file_name(file_name)?;
    let fmt = format.to_ascii_lowercase();

    match (target_mode, fmt.as_str()) {
        ("sd_auto", "wuhb") => Ok(target_path.join("wiiu").join("apps").join(clean_file)),
        ("sd_auto", "wup") => Ok(target_path.join("install")),
        ("custom_wuhb_dir" | "custom_apps", "wuhb") => Ok(target_path.join(clean_file)),
        ("custom_wup_dir" | "custom_install", "wup") => Ok(target_path.to_path_buf()),
        // Allow explicit custom folder override even if format differs from default hint
        ("custom_apps", "wup") => Ok(target_path.to_path_buf()),
        ("custom_install", "wuhb") => Ok(target_path.join(clean_file)),
        _ => Err(format!(
            "Несовместимый режим назначения '{target_mode}' для формата '{format}'"
        )),
    }
}

/// Sanitizes a ZIP entry path against Zip-Slip (`..`, absolute paths, drive prefixes),
/// filters macOS/Windows junk (`__MACOSX/`, `.DS_Store`, `Thumbs.db`, `._*`),
/// and strips a leading `install/` component when `dest_ends_with_install` is true
/// to prevent `install/install/...` double nesting.
///
/// Returns:
/// - `Err(reason)` if the path attempts directory traversal (Zip-Slip).
/// - `Ok(None)` if the entry should be skipped (junk metadata or empty).
/// - `Ok(Some(clean_rel_path))` for valid entries to extract.
pub fn sanitize_zip_entry_path(
    raw_name: &str,
    dest_ends_with_install: bool,
) -> Result<Option<PathBuf>, String> {
    if raw_name.contains('\0') {
        return Err("ZIP-архив содержит недопустимый нулевой байт в имени файла".to_string());
    }

    let normalized = raw_name.replace('\\', "/");

    // Reject absolute Unix paths or Windows drive-letter paths (e.g., "C:/...")
    if normalized.starts_with('/') {
        return Err(format!(
            "Обнаружен абсолютный путь в архиве (Zip-Slip): {raw_name}"
        ));
    }
    let bytes = normalized.as_bytes();
    if bytes.len() >= 2 && bytes[0].is_ascii_alphabetic() && bytes[1] == b':' {
        return Err(format!(
            "Обнаружен путь с буквой диска в архиве (Zip-Slip): {raw_name}"
        ));
    }

    let mut segments: Vec<&str> = Vec::new();
    for seg in normalized.split('/') {
        if seg.is_empty() || seg == "." {
            continue;
        }
        if seg == ".." {
            return Err(format!(
                "Обнаружен выход за пределы каталога в архиве (Zip-Slip): {raw_name}"
            ));
        }
        segments.push(seg);
    }

    if segments.is_empty() {
        return Ok(None);
    }

    // Filter macOS & Windows metadata junk
    if segments
        .iter()
        .any(|s| s.eq_ignore_ascii_case("__MACOSX"))
    {
        return Ok(None);
    }
    if let Some(&file_name) = segments.last() {
        if file_name.eq_ignore_ascii_case(".DS_Store")
            || file_name.eq_ignore_ascii_case("Thumbs.db")
            || file_name.starts_with("._")
        {
            return Ok(None);
        }
    }

    // Prevent double install/install/ nesting
    if dest_ends_with_install
        && segments.len() >= 2
        && segments[0].eq_ignore_ascii_case("install")
    {
        segments.remove(0);
    }

    let mut rel = PathBuf::new();
    for seg in segments {
        rel.push(seg);
    }

    // Final safety check via std::path::Component
    for comp in rel.components() {
        match comp {
            Component::Normal(_) => {}
            _ => {
                return Err(format!(
                    "Небезопасный компонент пути в архиве: {raw_name}"
                ));
            }
        }
    }

    Ok(Some(rel))
}

fn format_bytes_human(bytes: u64) -> String {
    const GIB: f64 = 1024.0 * 1024.0 * 1024.0;
    const MIB: f64 = 1024.0 * 1024.0;
    if bytes as f64 >= GIB {
        format!("{:.2} ГБ", bytes as f64 / GIB)
    } else {
        format!("{:.0} МБ", bytes as f64 / MIB)
    }
}

pub async fn install_package(
    app: AppHandle,
    request: InstallRequest,
    cancel_flag: Arc<AtomicBool>,
) -> Result<InstallResult, String> {
    let started_at = Instant::now();
    cancel_flag.store(false, Ordering::SeqCst);

    let target_root = PathBuf::from(request.target_path.trim());
    if request.target_path.trim().is_empty() {
        return Err("Не выбрана SD-карта или папка назначения".to_string());
    }
    if !target_root.exists() || !target_root.is_dir() {
        return Err(format!(
            "Целевой каталог недоступен или SD-карта отключена: {}",
            target_root.display()
        ));
    }

    let destination = resolve_destination(
        &request.target_mode,
        &request.format,
        &target_root,
        &request.file_name,
    )?;
    let dest_display = destination.to_string_lossy().to_string();

    // Prepare fast local temp directory
    let temp_dir = std::env::temp_dir().join("parhelio-launcher");
    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Не удалось создать временный каталог: {e}"))?;

    // Pre-flight free space check on destination filesystem AND local temp filesystem
    let required_bytes = request.size_bytes.saturating_add(SAFETY_SPACE_MARGIN_BYTES);
    if request.size_bytes > 0 {
        if let Some(dest_free) = available_space_for_path(&target_root) {
            let existing_file_size = if request.format.eq_ignore_ascii_case("wuhb") {
                fs::metadata(&destination).map(|m| m.len()).unwrap_or(0)
            } else {
                0
            };
            if dest_free.saturating_add(existing_file_size) < required_bytes {
                return Err(format!(
                    "Недостаточно места на целевом накопителе: нужно {}, доступно {}",
                    format_bytes_human(required_bytes),
                    format_bytes_human(dest_free)
                ));
            }
        }

        if let Some(temp_free) = available_space_for_path(&temp_dir) {
            if temp_free < required_bytes {
                return Err(format!(
                    "Недостаточно места на системном диске для временной загрузки: нужно {}, доступно {}",
                    format_bytes_human(required_bytes),
                    format_bytes_human(temp_free)
                ));
            }
        }
    }

    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let safe_pkg_id: String = request
        .package_id
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect();
    let temp_file_path = temp_dir.join(format!("{safe_pkg_id}-{nonce}.part"));
    let _temp_guard = TempFileGuard(temp_file_path.clone());

    // Step 1: High-speed multi-stream download into fast local temp file
    let dl = match downloader::download_file(
        &app,
        &request.game_id,
        &request.package_id,
        &request.file_name,
        request.size_bytes,
        &request.mirror_preference,
        &dest_display,
        &temp_file_path,
        Arc::clone(&cancel_flag),
    )
    .await
    {
        Ok(res) => res,
        Err(err) => {
            let phase = if cancel_flag.load(Ordering::Relaxed) {
                "cancelled"
            } else {
                "error"
            };
            let _ = app.emit(
                "install-progress",
                InstallProgress {
                    game_id: request.game_id.clone(),
                    package_id: request.package_id.clone(),
                    phase: phase.to_string(),
                    percent: 0.0,
                    downloaded_bytes: 0,
                    total_bytes: request.size_bytes,
                    speed_bytes_per_sec: 0,
                    eta_seconds: None,
                    active_streams: 0,
                    mirror_id: request.mirror_preference.clone(),
                    mirror_name: String::new(),
                    extract_current: 0,
                    extract_total: 0,
                    current_file: String::new(),
                    destination_path: dest_display.clone(),
                    message: err.clone(),
                },
            );
            return Err(err);
        }
    };

    if cancel_flag.load(Ordering::Relaxed) {
        return Err("Установка отменена пользователем (cancelled)".to_string());
    }

    // Step 2: Copy (.wuhb) or extract (.zip WUP) sequentially to destination SD card
    let install_outcome = if request.format.eq_ignore_ascii_case("wuhb") {
        copy_wuhb_to_destination(
            app.clone(),
            request.clone(),
            temp_file_path.clone(),
            destination.clone(),
            dl.mirror_id.clone(),
            dl.mirror_used.clone(),
            Arc::clone(&cancel_flag),
        )
        .await
    } else if request.format.eq_ignore_ascii_case("wup") {
        extract_wup_zip_to_destination(
            app.clone(),
            request.clone(),
            temp_file_path.clone(),
            destination.clone(),
            dl.mirror_id.clone(),
            dl.mirror_used.clone(),
            Arc::clone(&cancel_flag),
        )
        .await
    } else {
        Err(format!("Неподдерживаемый формат пакета: {}", request.format))
    };

    match install_outcome {
        Ok((final_path, bytes_written, files_installed)) => {
            let elapsed = started_at.elapsed();
            let elapsed_ms = elapsed.as_millis() as u64;
            let elapsed_seconds = (elapsed.as_secs_f64() * 10.0).round() / 10.0;
            let final_dest_str = final_path.to_string_lossy().to_string();

            let _ = app.emit(
                "install-progress",
                InstallProgress {
                    game_id: request.game_id.clone(),
                    package_id: request.package_id.clone(),
                    phase: "done".to_string(),
                    percent: 100.0,
                    downloaded_bytes: bytes_written,
                    total_bytes: bytes_written,
                    speed_bytes_per_sec: 0,
                    eta_seconds: Some(0),
                    active_streams: 0,
                    mirror_id: dl.mirror_id.clone(),
                    mirror_name: dl.mirror_used.clone(),
                    extract_current: files_installed,
                    extract_total: files_installed,
                    current_file: request.file_name.clone(),
                    destination_path: final_dest_str.clone(),
                    message: format!("{} успешно установлена", request.game_title),
                },
            );

            Ok(InstallResult {
                package_id: request.package_id,
                destination_path: final_dest_str,
                mirror_id: dl.mirror_id,
                mirror_name: dl.mirror_used.clone(),
                mirror_used: dl.mirror_used,
                bytes_written,
                files_installed,
                files_extracted: files_installed,
                elapsed_ms,
                elapsed_seconds,
            })
        }
        Err(err) => {
            let phase = if cancel_flag.load(Ordering::Relaxed) {
                "cancelled"
            } else {
                "error"
            };
            let _ = app.emit(
                "install-progress",
                InstallProgress {
                    game_id: request.game_id.clone(),
                    package_id: request.package_id.clone(),
                    phase: phase.to_string(),
                    percent: 0.0,
                    downloaded_bytes: 0,
                    total_bytes: dl.total_bytes,
                    speed_bytes_per_sec: 0,
                    eta_seconds: None,
                    active_streams: 0,
                    mirror_id: dl.mirror_id,
                    mirror_name: dl.mirror_used,
                    extract_current: 0,
                    extract_total: 0,
                    current_file: String::new(),
                    destination_path: dest_display,
                    message: err.clone(),
                },
            );
            Err(err)
        }
    }
}

async fn copy_wuhb_to_destination(
    app: AppHandle,
    request: InstallRequest,
    src_temp: PathBuf,
    dest_file: PathBuf,
    mirror_id: String,
    mirror_name: String,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(PathBuf, u64, usize), String> {
    tokio::task::spawn_blocking(move || {
        if let Some(parent) = dest_file.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Не удалось создать папку {}: {e}", parent.display()))?;
        }

        let total_bytes = fs::metadata(&src_temp)
            .map_err(|e| format!("Не удалось прочитать размер временного файла: {e}"))?
            .len();

        // Remove any previous copy first so nearly-full SD cards don't fail on atomic rename
        if dest_file.exists() {
            let _ = fs::remove_file(&dest_file);
        }

        let dest_str = dest_file.to_string_lossy().to_string();
        let staging_dest = dest_file.with_extension("wuhb.parhelio.tmp");
        let mut reader = File::open(&src_temp)
            .map_err(|e| format!("Не удалось открыть загруженный файл: {e}"))?;
        let mut writer = File::create(&staging_dest)
            .map_err(|e| format!("Не удалось создать файл на накопителе: {e}"))?;

        let mut buf = vec![0u8; IO_BUFFER_SIZE];
        let mut copied: u64 = 0;
        let copy_start = Instant::now();
        let mut last_emit = Instant::now() - PROGRESS_EMIT_INTERVAL;

        loop {
            if cancel_flag.load(Ordering::Relaxed) {
                drop(writer);
                let _ = fs::remove_file(&staging_dest);
                return Err("Установка отменена пользователем (cancelled)".to_string());
            }

            let n = reader
                .read(&mut buf)
                .map_err(|e| format!("Ошибка чтения временного файла: {e}"))?;
            if n == 0 {
                break;
            }

            if let Err(e) = writer.write_all(&buf[..n]) {
                drop(writer);
                let _ = fs::remove_file(&staging_dest);
                return Err(format!("Ошибка записи на накопитель: {e}"));
            }

            copied += n as u64;

            if last_emit.elapsed() >= PROGRESS_EMIT_INTERVAL || copied >= total_bytes {
                last_emit = Instant::now();
                let elapsed = copy_start.elapsed().as_secs_f64().max(0.01);
                let speed = (copied as f64 / elapsed) as u64;
                let eta = if speed > 0 && total_bytes > copied {
                    Some((total_bytes - copied) / speed)
                } else {
                    Some(0)
                };
                let percent = if total_bytes > 0 {
                    ((copied as f64 / total_bytes as f64) * 100.0).min(100.0)
                } else {
                    100.0
                };

                let _ = app.emit(
                    "install-progress",
                    InstallProgress {
                        game_id: request.game_id.clone(),
                        package_id: request.package_id.clone(),
                        phase: "copying".to_string(),
                        percent,
                        downloaded_bytes: copied,
                        total_bytes,
                        speed_bytes_per_sec: speed,
                        eta_seconds: eta,
                        active_streams: 1,
                        mirror_id: mirror_id.clone(),
                        mirror_name: mirror_name.clone(),
                        extract_current: 1,
                        extract_total: 1,
                        current_file: request.file_name.clone(),
                        destination_path: dest_str.clone(),
                        message: "Запись файла на накопитель…".to_string(),
                    },
                );
            }
        }

        // Flush filesystem buffers to SD card before finalizing rename
        writer
            .sync_all()
            .map_err(|e| format!("Ошибка синхронизации данных на накопитель: {e}"))?;
        drop(writer);

        fs::rename(&staging_dest, &dest_file).map_err(|e| {
            let _ = fs::remove_file(&staging_dest);
            format!(
                "Не удалось завершить запись файла {}: {e}",
                dest_file.display()
            )
        })?;

        Ok((dest_file, copied, 1usize))
    })
    .await
    .map_err(|e| format!("Внутренняя ошибка копирования: {e}"))?
}

async fn extract_wup_zip_to_destination(
    app: AppHandle,
    request: InstallRequest,
    zip_temp: PathBuf,
    extract_root: PathBuf,
    mirror_id: String,
    mirror_name: String,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(PathBuf, u64, usize), String> {
    tokio::task::spawn_blocking(move || {
        fs::create_dir_all(&extract_root).map_err(|e| {
            format!(
                "Не удалось создать папку распаковки {}: {e}",
                extract_root.display()
            )
        })?;

        let dest_ends_with_install = extract_root
            .file_name()
            .and_then(|n| n.to_str())
            .map(|s| s.eq_ignore_ascii_case("install"))
            .unwrap_or(false);

        let zip_file = File::open(&zip_temp)
            .map_err(|e| format!("Не удалось открыть загруженный ZIP-архив: {e}"))?;
        let mut archive = zip::ZipArchive::new(zip_file)
            .map_err(|e| format!("ZIP-архив повреждён или имеет неверный формат: {e}"))?;

        // First pass: validate every entry for Zip-Slip, skip junk, collect stats
        let mut entries: Vec<(usize, PathBuf, u64)> = Vec::new();
        let mut total_uncompressed: u64 = 0;
        let mut all_bare_root_files = true;

        for idx in 0..archive.len() {
            let entry = archive
                .by_index(idx)
                .map_err(|e| format!("Ошибка чтения заголовка ZIP #{idx}: {e}"))?;
            if entry.is_dir() {
                continue;
            }
            let Some(rel_path) = sanitize_zip_entry_path(entry.name(), dest_ends_with_install)?
            else {
                continue;
            };
            if rel_path.components().count() > 1 {
                all_bare_root_files = false;
            }
            let size = entry.size();
            total_uncompressed = total_uncompressed.saturating_add(size);
            entries.push((idx, rel_path, size));
        }

        if entries.is_empty() {
            return Err("ZIP-архив не содержит файлов для установки".to_string());
        }

        // If archive contains bare WUP files at root and we know `wup_folder_name`, wrap them in that folder
        let effective_prefix: Option<PathBuf> = if all_bare_root_files {
            request
                .wup_folder_name
                .as_deref()
                .and_then(|name| validate_file_name(name).ok())
                .map(PathBuf::from)
        } else {
            None
        };

        let mut top_level_dirs: HashSet<String> = HashSet::new();
        let planned_entries: Vec<(usize, PathBuf, u64)> = entries
            .into_iter()
            .map(|(idx, rel, size)| {
                let final_rel = if let Some(ref prefix) = effective_prefix {
                    prefix.join(rel)
                } else {
                    rel
                };
                if let Some(Component::Normal(first)) = final_rel.components().next() {
                    top_level_dirs.insert(first.to_string_lossy().to_string());
                }
                (idx, final_rel, size)
            })
            .collect();

        let extract_root_str = extract_root.to_string_lossy().to_string();
        let extract_total = planned_entries.len();
        let mut extracted_bytes: u64 = 0;
        let mut buf = vec![0u8; IO_BUFFER_SIZE];
        let extract_start = Instant::now();
        let mut last_emit = Instant::now() - PROGRESS_EMIT_INTERVAL;

        for (file_idx, (zip_idx, rel_path, _entry_size)) in planned_entries.iter().enumerate() {
            if cancel_flag.load(Ordering::Relaxed) {
                return Err("Установка отменена пользователем (cancelled)".to_string());
            }

            let out_path = extract_root.join(rel_path);
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| {
                    format!("Не удалось создать папку {}: {e}", parent.display())
                })?;
            }

            let mut entry = archive
                .by_index(*zip_idx)
                .map_err(|e| format!("Ошибка чтения файла из ZIP: {e}"))?;
            let mut out_file = File::create(&out_path).map_err(|e| {
                format!("Не удалось создать файл {}: {e}", out_path.display())
            })?;

            let display_file = rel_path.to_string_lossy().to_string();

            loop {
                if cancel_flag.load(Ordering::Relaxed) {
                    drop(out_file);
                    let _ = fs::remove_file(&out_path);
                    return Err("Установка отменена пользователем (cancelled)".to_string());
                }

                let n = entry
                    .read(&mut buf)
                    .map_err(|e| format!("Ошибка распаковки {display_file}: {e}"))?;
                if n == 0 {
                    break;
                }

                out_file
                    .write_all(&buf[..n])
                    .map_err(|e| format!("Ошибка записи {display_file} на накопитель: {e}"))?;

                extracted_bytes = extracted_bytes.saturating_add(n as u64);

                if last_emit.elapsed() >= PROGRESS_EMIT_INTERVAL {
                    last_emit = Instant::now();
                    emit_extract_progress(
                        &app,
                        &request,
                        &mirror_id,
                        &mirror_name,
                        &extract_root_str,
                        extract_start,
                        extracted_bytes,
                        total_uncompressed,
                        file_idx + 1,
                        extract_total,
                        &display_file,
                    );
                }
            }

            out_file
                .sync_all()
                .map_err(|e| format!("Ошибка синхронизации {display_file}: {e}"))?;

            if file_idx + 1 == extract_total || last_emit.elapsed() >= PROGRESS_EMIT_INTERVAL {
                last_emit = Instant::now();
                emit_extract_progress(
                    &app,
                    &request,
                    &mirror_id,
                    &mirror_name,
                    &extract_root_str,
                    extract_start,
                    extracted_bytes,
                    total_uncompressed,
                    file_idx + 1,
                    extract_total,
                    &display_file,
                );
            }
        }

        let final_dest = if top_level_dirs.len() == 1 {
            let only_dir = top_level_dirs.into_iter().next().unwrap();
            let candidate = extract_root.join(only_dir);
            if candidate.is_dir() {
                candidate
            } else {
                extract_root
            }
        } else {
            extract_root
        };

        Ok((final_dest, extracted_bytes, extract_total))
    })
    .await
    .map_err(|e| format!("Внутренняя ошибка распаковки: {e}"))?
}

#[allow(clippy::too_many_arguments)]
fn emit_extract_progress(
    app: &AppHandle,
    request: &InstallRequest,
    mirror_id: &str,
    mirror_name: &str,
    destination_path: &str,
    extract_start: Instant,
    extracted_bytes: u64,
    total_uncompressed: u64,
    extract_current: usize,
    extract_total: usize,
    current_file: &str,
) {
    let elapsed = extract_start.elapsed().as_secs_f64().max(0.01);
    let speed = (extracted_bytes as f64 / elapsed) as u64;
    let eta = if speed > 0 && total_uncompressed > extracted_bytes {
        Some((total_uncompressed - extracted_bytes) / speed)
    } else {
        Some(0)
    };
    let percent = if total_uncompressed > 0 {
        ((extracted_bytes as f64 / total_uncompressed as f64) * 100.0).min(100.0)
    } else if extract_total > 0 {
        ((extract_current as f64 / extract_total as f64) * 100.0).min(100.0)
    } else {
        100.0
    };

    let _ = app.emit(
        "install-progress",
        InstallProgress {
            game_id: request.game_id.clone(),
            package_id: request.package_id.clone(),
            phase: "extracting".to_string(),
            percent,
            downloaded_bytes: extracted_bytes,
            total_bytes: total_uncompressed,
            speed_bytes_per_sec: speed,
            eta_seconds: eta,
            active_streams: 1,
            mirror_id: mirror_id.to_string(),
            mirror_name: mirror_name.to_string(),
            extract_current,
            extract_total,
            current_file: current_file.to_string(),
            destination_path: destination_path.to_string(),
            message: format!("Распаковка {extract_current}/{extract_total}…"),
        },
    );
}

/// Checks which packages from the catalog are already present at the given target path & mode.
pub fn scan_installed_packages(target_path: &Path, target_mode: &str) -> Vec<String> {
    let Ok(catalog) = embedded_catalog() else {
        return Vec::new();
    };
    if !target_path.is_dir() {
        return Vec::new();
    }

    let mut installed = Vec::new();
    for game in catalog.games {
        for pkg in game.packages {
            let exists = if pkg.format.eq_ignore_ascii_case("wuhb") {
                resolve_destination(target_mode, "wuhb", target_path, &pkg.file_name)
                    .map(|p| p.is_file())
                    .unwrap_or(false)
            } else if pkg.format.eq_ignore_ascii_case("wup") {
                resolve_destination(target_mode, "wup", target_path, &pkg.file_name)
                    .ok()
                    .and_then(|root| pkg.wup_folder_name.map(|folder| root.join(folder)))
                    .map(|dir| dir.is_dir())
                    .unwrap_or(false)
            } else {
                false
            };

            if exists {
                installed.push(pkg.id);
            }
        }
    }

    installed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn destination_resolution_all_modes() {
        let sd = Path::new("/Volumes/WIIU_SD");

        assert_eq!(
            resolve_destination("sd_auto", "wuhb", sd, "Minecraft.WiiU.wuhb").unwrap(),
            PathBuf::from("/Volumes/WIIU_SD/wiiu/apps/Minecraft.WiiU.wuhb")
        );

        assert_eq!(
            resolve_destination("sd_auto", "wup", sd, "Minecraft_WiiU-WUP.zip").unwrap(),
            PathBuf::from("/Volumes/WIIU_SD/install")
        );

        assert_eq!(
            resolve_destination(
                "custom_wuhb_dir",
                "wuhb",
                Path::new("/tmp/my_apps"),
                "BuckshotRoulette.wuhb"
            )
            .unwrap(),
            PathBuf::from("/tmp/my_apps/BuckshotRoulette.wuhb")
        );

        assert_eq!(
            resolve_destination(
                "custom_apps",
                "wuhb",
                Path::new("/tmp/my_apps"),
                "BuckshotRoulette.wuhb"
            )
            .unwrap(),
            PathBuf::from("/tmp/my_apps/BuckshotRoulette.wuhb")
        );

        assert_eq!(
            resolve_destination(
                "custom_wup_dir",
                "wup",
                Path::new("/tmp/my_wup"),
                "SlimeRancher_WiiU_NoLog-WUP.zip"
            )
            .unwrap(),
            PathBuf::from("/tmp/my_wup")
        );

        assert_eq!(
            resolve_destination(
                "custom_install",
                "wup",
                Path::new("/tmp/my_wup"),
                "SlimeRancher_WiiU_NoLog-WUP.zip"
            )
            .unwrap(),
            PathBuf::from("/tmp/my_wup")
        );

        // Mismatched strict mode/format fails cleanly
        assert!(resolve_destination("custom_wuhb_dir", "wup", sd, "a.zip").is_err());
        assert!(resolve_destination("custom_wup_dir", "wuhb", sd, "a.wuhb").is_err());

        // Path traversal in file_name fails cleanly
        assert!(resolve_destination("sd_auto", "wuhb", sd, "../evil.wuhb").is_err());
        assert!(resolve_destination("sd_auto", "wuhb", sd, "sub/evil.wuhb").is_err());
    }

    #[test]
    fn zip_slip_protection_and_sanitization() {
        // Normal WUP entry
        assert_eq!(
            sanitize_zip_entry_path("Minecraft_WiiU/title.tmd", true).unwrap(),
            Some(PathBuf::from("Minecraft_WiiU/title.tmd"))
        );

        // Double install/install/ prevention
        assert_eq!(
            sanitize_zip_entry_path("install/Minecraft_WiiU/title.tmd", true).unwrap(),
            Some(PathBuf::from("Minecraft_WiiU/title.tmd"))
        );
        // Preserves install/ when destination doesn't end with install
        assert_eq!(
            sanitize_zip_entry_path("install/Minecraft_WiiU/title.tmd", false).unwrap(),
            Some(PathBuf::from("install/Minecraft_WiiU/title.tmd"))
        );

        // Windows backslashes normalized cleanly
        assert_eq!(
            sanitize_zip_entry_path("BuckshotRoulette_WiiU\\00000001.app", true).unwrap(),
            Some(PathBuf::from("BuckshotRoulette_WiiU/00000001.app"))
        );

        // Skips macOS & Windows metadata
        assert_eq!(
            sanitize_zip_entry_path("__MACOSX/Minecraft_WiiU/._title.tmd", true).unwrap(),
            None
        );
        assert_eq!(
            sanitize_zip_entry_path("Minecraft_WiiU/.DS_Store", true).unwrap(),
            None
        );
        assert_eq!(
            sanitize_zip_entry_path("Minecraft_WiiU/._00000000.app", true).unwrap(),
            None
        );
        assert_eq!(
            sanitize_zip_entry_path("Minecraft_WiiU/Thumbs.db", true).unwrap(),
            None
        );

        // Rejects Zip-Slip attacks
        assert!(sanitize_zip_entry_path("../evil.txt", true).is_err());
        assert!(sanitize_zip_entry_path("Minecraft_WiiU/../../etc/passwd", true).is_err());
        assert!(sanitize_zip_entry_path("/etc/passwd", true).is_err());
        assert!(sanitize_zip_entry_path("C:\\Windows\\system32\\evil.dll", true).is_err());
        assert!(sanitize_zip_entry_path("foo\0bar.txt", true).is_err());
    }
}
