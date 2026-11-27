pub mod catalog;
pub mod downloader;
pub mod drives;
pub mod installer;
pub mod mirrors;

use catalog::Catalog;
use drives::DriveInfo;
use installer::{InstallRequest, InstallResult};
use mirrors::MirrorStatus;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{AppHandle, State};
use tokio::sync::Mutex;

pub struct AppState {
    pub cancel_flag: Arc<AtomicBool>,
    pub install_lock: Arc<Mutex<()>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            cancel_flag: Arc::new(AtomicBool::new(false)),
            install_lock: Arc::new(Mutex::new(())),
        }
    }
}

#[tauri::command]
async fn get_catalog() -> Result<Catalog, String> {
    catalog::fetch_catalog().await
}

#[tauri::command]
async fn fetch_catalog() -> Result<Catalog, String> {
    catalog::fetch_catalog().await
}

#[tauri::command]
async fn probe_mirrors() -> Result<Vec<MirrorStatus>, String> {
    Ok(mirrors::probe_all_mirrors().await)
}

#[tauri::command]
async fn list_drives() -> Result<Vec<DriveInfo>, String> {
    tokio::task::spawn_blocking(drives::list_drives)
        .await
        .map_err(|e| format!("Ошибка сканирования дисков: {e}"))
}

#[tauri::command]
async fn eject_drive(mount_path: String) -> Result<String, String> {
    drives::eject_drive(mount_path).await
}

#[tauri::command]
async fn install_package(
    app: AppHandle,
    state: State<'_, AppState>,
    request: InstallRequest,
) -> Result<InstallResult, String> {
    let _guard = state
        .install_lock
        .try_lock()
        .map_err(|_| "Уже выполняется другая установка. Дождитесь завершения или отмените её.".to_string())?;

    installer::install_package(app, request, Arc::clone(&state.cancel_flag)).await
}

#[tauri::command]
fn cancel_install(state: State<'_, AppState>) -> Result<(), String> {
    state.cancel_flag.store(true, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
async fn check_installed(target_path: String, target_mode: String) -> Result<Vec<String>, String> {
    let path = PathBuf::from(target_path);
    tokio::task::spawn_blocking(move || installer::scan_installed_packages(&path, &target_mode))
        .await
        .map_err(|e| format!("Ошибка проверки установленных игр: {e}"))
}

#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
    let target = PathBuf::from(path.trim());
    if !target.exists() {
        return Err(format!("Путь не найден: {path}"));
    }

    let dir_to_open = if target.is_file() {
        target
            .parent()
            .map(PathBuf::from)
            .unwrap_or_else(|| target.clone())
    } else {
        target
    };

    #[cfg(target_os = "macos")]
    {
        tokio::process::Command::new("open")
            .arg(&dir_to_open)
            .spawn()
            .map_err(|e| format!("Не удалось открыть Finder: {e}"))?;
    }

    #[cfg(target_os = "windows")]
    {
        tokio::process::Command::new("explorer")
            .arg(&dir_to_open)
            .spawn()
            .map_err(|e| format!("Не удалось открыть Проводник: {e}"))?;
    }

    #[cfg(target_os = "linux")]
    {
        tokio::process::Command::new("xdg-open")
            .arg(&dir_to_open)
            .spawn()
            .map_err(|e| format!("Не удалось открыть файловый менеджер: {e}"))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_catalog,
            fetch_catalog,
            probe_mirrors,
            list_drives,
            eject_drive,
            install_package,
            cancel_install,
            check_installed,
            open_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Parhelio Launcher");
}
