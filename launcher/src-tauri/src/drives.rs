use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use sysinfo::Disks;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriveInfo {
    pub id: String,
    pub name: String,
    pub mount_path: String,
    pub fs_type: String,
    pub total_bytes: u64,
    pub free_bytes: u64,
    pub is_removable: bool,
    pub has_wiiu_apps: bool,
    pub has_install_dir: bool,
    pub is_likely_wiiu_sd: bool,
}

pub fn list_drives() -> Vec<DriveInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut seen_mounts: HashSet<String> = HashSet::new();
    let mut result: Vec<DriveInfo> = Vec::new();

    for disk in disks.list() {
        let mount = disk.mount_point();
        let mount_str = mount.to_string_lossy().to_string();
        let total_bytes = disk.total_space();
        if total_bytes == 0 || mount_str.is_empty() {
            continue;
        }

        let fs_type = disk.file_system().to_string_lossy().to_string();
        let raw_name = disk.name().to_string_lossy().to_string();
        let sys_removable = disk.is_removable();

        let Some((include, is_removable, display_name)) =
            classify_disk(mount, &mount_str, &raw_name, &fs_type, sys_removable)
        else {
            continue;
        };

        if !include {
            continue;
        }

        if !seen_mounts.insert(mount_str.clone()) {
            continue;
        }

        let has_wiiu_apps = mount.join("wiiu").join("apps").is_dir() || mount.join("wiiu").is_dir();
        let has_install_dir = mount.join("install").is_dir();
        let fs_lower = fs_type.to_lowercase();
        let is_fat = fs_lower.contains("fat") || fs_lower.contains("msdos");
        let is_likely_wiiu_sd = has_wiiu_apps || has_install_dir || is_fat;

        result.push(DriveInfo {
            id: mount_str.clone(),
            name: display_name,
            mount_path: mount_str,
            fs_type,
            total_bytes,
            free_bytes: disk.available_space(),
            is_removable,
            has_wiiu_apps,
            has_install_dir,
            is_likely_wiiu_sd,
        });
    }

    result.sort_by(|a, b| {
        let a_has_wiiu = a.has_wiiu_apps || a.has_install_dir;
        let b_has_wiiu = b.has_wiiu_apps || b.has_install_dir;
        b.is_likely_wiiu_sd
            .cmp(&a.is_likely_wiiu_sd)
            .then_with(|| b_has_wiiu.cmp(&a_has_wiiu))
            .then_with(|| b.is_removable.cmp(&a.is_removable))
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    result
}

#[cfg(target_os = "macos")]
fn classify_disk(
    mount: &Path,
    mount_str: &str,
    raw_name: &str,
    fs_type: &str,
    sys_removable: bool,
) -> Option<(bool, bool, String)> {
    if mount_str == "/"
        || mount_str.starts_with("/System/")
        || mount_str.starts_with("/private/")
        || mount_str.starts_with("/dev")
    {
        return None;
    }

    let mount_lower = mount_str.to_lowercase();
    if mount_lower.contains("timemachine")
        || mount_lower.contains(".timemachine")
        || mount_lower.contains("com.apple.timemachine")
        || fs_type.eq_ignore_ascii_case("devfs")
        || fs_type.eq_ignore_ascii_case("autofs")
    {
        return None;
    }

    let is_volumes = mount_str.starts_with("/Volumes/");
    if !is_volumes && !sys_removable {
        return None;
    }

    let display_name = mount
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .filter(|n| !n.is_empty())
        .unwrap_or_else(|| {
            if raw_name.is_empty() {
                mount_str.to_string()
            } else {
                raw_name.to_string()
            }
        });

    let is_removable = sys_removable || is_volumes;
    Some((true, is_removable, display_name))
}

#[cfg(target_os = "linux")]
fn classify_disk(
    mount: &Path,
    mount_str: &str,
    raw_name: &str,
    fs_type: &str,
    sys_removable: bool,
) -> Option<(bool, bool, String)> {
    let fs_lower = fs_type.to_lowercase();
    if matches!(
        fs_lower.as_str(),
        "tmpfs" | "squashfs" | "overlay" | "proc" | "sysfs" | "devtmpfs" | "fuse.portal"
    ) {
        return None;
    }

    let is_media_mount = mount_str.starts_with("/run/media/")
        || mount_str.starts_with("/media/")
        || mount_str.starts_with("/mnt/");

    if !sys_removable && !is_media_mount {
        return None;
    }

    let display_name = mount
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .filter(|n| !n.is_empty())
        .unwrap_or_else(|| {
            if raw_name.is_empty() {
                mount_str.to_string()
            } else {
                raw_name.to_string()
            }
        });

    let is_removable = sys_removable || is_media_mount;
    Some((true, is_removable, display_name))
}

#[cfg(target_os = "windows")]
fn classify_disk(
    _mount: &Path,
    mount_str: &str,
    raw_name: &str,
    _fs_type: &str,
    sys_removable: bool,
) -> Option<(bool, bool, String)> {
    let upper = mount_str.to_uppercase();
    let is_system = upper == "C:\\" || upper == "C:";
    if !sys_removable && is_system {
        return None;
    }

    let letter = mount_str.trim_end_matches('\\');
    let display_name = if raw_name.trim().is_empty() {
        format!("Диск ({letter})")
    } else {
        format!("{} ({letter})", raw_name.trim())
    };

    Some((true, sys_removable, display_name))
}

#[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
fn classify_disk(
    mount: &Path,
    mount_str: &str,
    raw_name: &str,
    _fs_type: &str,
    sys_removable: bool,
) -> Option<(bool, bool, String)> {
    if !sys_removable {
        return None;
    }
    let display_name = mount
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .filter(|n| !n.is_empty())
        .unwrap_or_else(|| raw_name.to_string());
    Some((true, sys_removable, display_name))
}

/// Finds available free bytes on the filesystem hosting `path` (or its closest existing ancestor).
pub fn available_space_for_path(path: &Path) -> Option<u64> {
    let mut existing: PathBuf = path.to_path_buf();
    while !existing.exists() {
        if !existing.pop() {
            break;
        }
    }
    let resolved = std::fs::canonicalize(&existing).unwrap_or(existing);

    let disks = Disks::new_with_refreshed_list();
    let mut best_match: Option<(usize, u64)> = None;

    for disk in disks.list() {
        let mount = disk.mount_point();
        let mount_resolved = std::fs::canonicalize(mount).unwrap_or_else(|_| mount.to_path_buf());
        if resolved.starts_with(&mount_resolved) {
            let depth = mount_resolved.as_os_str().len();
            if best_match.map_or(true, |(best_depth, _)| depth > best_depth) {
                best_match = Some((depth, disk.available_space()));
            }
        }
    }

    best_match.map(|(_, free)| free)
}

pub async fn eject_drive(mount_path: String) -> Result<String, String> {
    let trimmed = mount_path.trim();
    if trimmed.is_empty() {
        return Err("Путь к диску не указан".to_string());
    }

    let path = Path::new(trimmed);
    if !path.exists() {
        return Err(format!("Точка монтирования не найдена: {trimmed}"));
    }

    eject_drive_os(trimmed).await?;
    let label = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| trimmed.to_string());
    Ok(format!("Накопитель «{label}» безопасно извлечён"))
}

#[cfg(target_os = "macos")]
async fn eject_drive_os(mount_path: &str) -> Result<(), String> {
    let output = tokio::process::Command::new("diskutil")
        .args(["eject", mount_path])
        .output()
        .await
        .map_err(|e| format!("Не удалось запустить diskutil: {e}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let detail = if !stderr.is_empty() { stderr } else { stdout };
        Err(format!("Не удалось извлечь диск: {detail}"))
    }
}

#[cfg(target_os = "linux")]
async fn eject_drive_os(mount_path: &str) -> Result<(), String> {
    // Prefer udisksctl (works unprivileged on desktop Linux) via block device from findmnt.
    if let Ok(findmnt) = tokio::process::Command::new("findmnt")
        .args(["-n", "-o", "SOURCE", "--target", mount_path])
        .output()
        .await
    {
        if findmnt.status.success() {
            let dev = String::from_utf8_lossy(&findmnt.stdout).trim().to_string();
            if !dev.is_empty() {
                if let Ok(unmount) = tokio::process::Command::new("udisksctl")
                    .args(["unmount", "-b", &dev])
                    .output()
                    .await
                {
                    if unmount.status.success() {
                        let _ = tokio::process::Command::new("udisksctl")
                            .args(["power-off", "-b", &dev])
                            .output()
                            .await;
                        return Ok(());
                    }
                }
            }
        }
    }

    let output = tokio::process::Command::new("umount")
        .arg(mount_path)
        .output()
        .await
        .map_err(|e| format!("Не удалось выполнить umount: {e}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(format!("Не удалось извлечь диск: {stderr}"))
    }
}

#[cfg(target_os = "windows")]
async fn eject_drive_os(mount_path: &str) -> Result<(), String> {
    let first_char = mount_path
        .chars()
        .next()
        .filter(|c| c.is_ascii_alphabetic())
        .ok_or_else(|| format!("Некорректная буква диска: {mount_path}"))?
        .to_ascii_uppercase();

    let script = format!(
        "$shell = New-Object -ComObject Shell.Application; \
         $item = $shell.Namespace(17).ParseName('{first_char}:'); \
         if ($null -eq $item) {{ exit 1 }}; \
         $item.InvokeVerb('Eject')"
    );

    let output = tokio::process::Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &script])
        .output()
        .await
        .map_err(|e| format!("Не удалось запустить PowerShell для извлечения: {e}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(format!("Не удалось извлечь диск {first_char}: {stderr}"))
    }
}

#[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
async fn eject_drive_os(_mount_path: &str) -> Result<(), String> {
    Err("Безопасное извлечение не поддерживается на данной ОС".to_string())
}
