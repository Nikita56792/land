use crate::catalog::{embedded_catalog, MirrorConfig};
use futures_util::future::join_all;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::time::{Duration, Instant};

const PING_TIMEOUT: Duration = Duration::from_millis(2500);
const SPEED_PROBE_TIMEOUT: Duration = Duration::from_millis(3500);
const SPEED_PROBE_RANGE: &str = "bytes=0-524287"; // 512 KiB
const SPEED_PROBE_PATHS: [&str; 2] = [
    "/releases/Kraken-0.4.0.pkg",
    "/releases/BuckshotRoulette.wuhb",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MirrorStatus {
    pub id: String,
    pub name: String,
    pub region: String,
    pub base_url: String,
    pub reachable: bool,
    pub latency_ms: Option<u64>,
    pub speed_mbps: Option<f64>,
    pub recommended: bool,
}

pub fn default_mirrors() -> Vec<MirrorConfig> {
    if let Ok(cat) = embedded_catalog() {
        if !cat.mirrors.is_empty() {
            return cat.mirrors;
        }
    }
    vec![
        MirrorConfig {
            id: "ru".to_string(),
            name: "РФ / СНГ (Cloud.ru)".to_string(),
            region: "RU / CIS".to_string(),
            base_url: "https://parhelio-dl.s3.cloud.ru".to_string(),
            ping_path: "/ping.txt".to_string(),
        },
        MirrorConfig {
            id: "global".to_string(),
            name: "Мир (Cloudflare R2)".to_string(),
            region: "Global CDN".to_string(),
            base_url: "https://dl.parhelio.ru".to_string(),
            ping_path: "/ping.txt".to_string(),
        },
    ]
}

pub fn build_release_url(base_url: &str, file_name: &str) -> String {
    let trimmed_base = base_url.trim_end_matches('/');
    let trimmed_file = file_name.trim_start_matches('/');
    if trimmed_file.starts_with("releases/") {
        format!("{trimmed_base}/{trimmed_file}")
    } else {
        format!("{trimmed_base}/releases/{trimmed_file}")
    }
}

async fn probe_single_mirror(client: &reqwest::Client, mirror: MirrorConfig) -> MirrorStatus {
    let base = mirror.base_url.trim_end_matches('/');
    let ping_path = if mirror.ping_path.starts_with('/') {
        mirror.ping_path.clone()
    } else {
        format!("/{}", mirror.ping_path)
    };
    let ping_url = format!("{base}{ping_path}");

    let ping_start = Instant::now();
    let ping_result = client.get(&ping_url).timeout(PING_TIMEOUT).send().await;

    let (reachable, latency_ms) = match ping_result {
        Ok(resp) if resp.status().is_success() => {
            let elapsed = ping_start.elapsed().as_millis().max(1) as u64;
            match resp.text().await {
                Ok(body) if body.trim().to_ascii_lowercase().starts_with("ok") => {
                    (true, Some(elapsed))
                }
                _ => (false, None),
            }
        }
        _ => (false, None),
    };

    if !reachable {
        return MirrorStatus {
            id: mirror.id,
            name: mirror.name,
            region: mirror.region,
            base_url: mirror.base_url,
            reachable: false,
            latency_ms: None,
            speed_mbps: None,
            recommended: false,
        };
    }

    let mut speed_mbps: Option<f64> = None;
    for probe_path in SPEED_PROBE_PATHS {
        let probe_url = format!("{base}{probe_path}");
        let req_result = client
            .get(&probe_url)
            .header(reqwest::header::RANGE, SPEED_PROBE_RANGE)
            .timeout(SPEED_PROBE_TIMEOUT)
            .send()
            .await;

        if let Ok(resp) = req_result {
            if resp.status().is_success() {
                let transfer_start = Instant::now();
                if let Ok(bytes) = resp.bytes().await {
                    if bytes.len() >= 16_384 {
                        let secs = transfer_start.elapsed().as_secs_f64().max(0.001);
                        let mbps = (bytes.len() as f64 * 8.0) / (secs * 1_000_000.0);
                        speed_mbps = Some((mbps * 10.0).round() / 10.0);
                        break;
                    }
                }
            }
        }
    }

    MirrorStatus {
        id: mirror.id,
        name: mirror.name,
        region: mirror.region,
        base_url: mirror.base_url,
        reachable: true,
        latency_ms,
        speed_mbps,
        recommended: false,
    }
}

pub async fn probe_all_mirrors() -> Vec<MirrorStatus> {
    let mirrors = default_mirrors();
    let client = match reqwest::Client::builder()
        .connect_timeout(Duration::from_millis(2000))
        .user_agent("ParhelioLauncher/1.0")
        .build()
    {
        Ok(c) => c,
        Err(_) => {
            return mirrors
                .into_iter()
                .map(|m| MirrorStatus {
                    id: m.id,
                    name: m.name,
                    region: m.region,
                    base_url: m.base_url,
                    reachable: false,
                    latency_ms: None,
                    speed_mbps: None,
                    recommended: false,
                })
                .collect();
        }
    };

    let futures = mirrors
        .into_iter()
        .map(|mirror| probe_single_mirror(&client, mirror));
    let mut statuses = join_all(futures).await;

    mark_recommended(&mut statuses);
    statuses
}

pub fn mark_recommended(statuses: &mut [MirrorStatus]) {
    for s in statuses.iter_mut() {
        s.recommended = false;
    }

    let best_idx = statuses
        .iter()
        .enumerate()
        .filter(|(_, s)| s.reachable)
        .max_by(|(_, a), (_, b)| compare_mirror_quality(a, b))
        .map(|(i, _)| i);

    if let Some(idx) = best_idx {
        statuses[idx].recommended = true;
    }
}

/// Returns Ordering::Greater when `a` is better than `b`.
fn compare_mirror_quality(a: &MirrorStatus, b: &MirrorStatus) -> Ordering {
    match (a.speed_mbps, b.speed_mbps) {
        (Some(sa), Some(sb)) => match sa.partial_cmp(&sb).unwrap_or(Ordering::Equal) {
            Ordering::Equal => compare_latency(a.latency_ms, b.latency_ms),
            ord => ord,
        },
        (Some(_), None) => Ordering::Greater,
        (None, Some(_)) => Ordering::Less,
        (None, None) => compare_latency(a.latency_ms, b.latency_ms),
    }
}

/// Lower latency is better (returns Ordering::Greater when `a` has lower latency).
fn compare_latency(a: Option<u64>, b: Option<u64>) -> Ordering {
    match (a, b) {
        (Some(la), Some(lb)) => lb.cmp(&la),
        (Some(_), None) => Ordering::Greater,
        (None, Some(_)) => Ordering::Less,
        (None, None) => Ordering::Equal,
    }
}

/// Resolves ordered primary + optional fallback mirrors for a download request.
pub async fn resolve_mirror_order(preference: &str) -> Vec<MirrorConfig> {
    let all = default_mirrors();
    match preference {
        "ru" | "global" => {
            let mut ordered = Vec::new();
            if let Some(primary) = all.iter().find(|m| m.id == preference) {
                ordered.push(primary.clone());
            }
            for other in &all {
                if other.id != preference {
                    ordered.push(other.clone());
                }
            }
            ordered
        }
        _ => {
            let statuses = probe_all_mirrors().await;
            let mut reachable: Vec<MirrorStatus> =
                statuses.into_iter().filter(|s| s.reachable).collect();
            reachable.sort_by(|a, b| compare_mirror_quality(b, a));

            let mut ordered = Vec::new();
            for status in &reachable {
                if let Some(cfg) = all.iter().find(|m| m.id == status.id) {
                    ordered.push(cfg.clone());
                }
            }
            for cfg in all {
                if !ordered.iter().any(|m| m.id == cfg.id) {
                    ordered.push(cfg);
                }
            }
            ordered
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recommended_prioritizes_speed_then_latency() {
        let mut statuses = vec![
            MirrorStatus {
                id: "ru".into(),
                name: "RU".into(),
                region: "RU".into(),
                base_url: "https://parhelio-dl.s3.cloud.ru".into(),
                reachable: true,
                latency_ms: Some(15),
                speed_mbps: Some(85.0),
                recommended: false,
            },
            MirrorStatus {
                id: "global".into(),
                name: "Global".into(),
                region: "Global".into(),
                base_url: "https://dl.parhelio.ru".into(),
                reachable: true,
                latency_ms: Some(45),
                speed_mbps: Some(140.0),
                recommended: false,
            },
        ];

        mark_recommended(&mut statuses);
        assert!(!statuses[0].recommended);
        assert!(statuses[1].recommended);

        // Tie on speed -> lower latency wins
        statuses[0].speed_mbps = Some(140.0);
        mark_recommended(&mut statuses);
        assert!(statuses[0].recommended);
        assert!(!statuses[1].recommended);
    }

    #[test]
    fn release_url_builds_under_releases_prefix() {
        assert_eq!(
            build_release_url("https://dl.parhelio.ru/", "Minecraft.WiiU.wuhb"),
            "https://dl.parhelio.ru/releases/Minecraft.WiiU.wuhb"
        );
        assert_eq!(
            build_release_url("https://parhelio-dl.s3.cloud.ru", "/releases/test.zip"),
            "https://parhelio-dl.s3.cloud.ru/releases/test.zip"
        );
    }
}
