# Parhelio Launcher — Архитектура, сборка и публикация релизов

**Parhelio Launcher** — кроссплатформенный нативный лаунчер и установщик игр Nintendo Wii U на **Rust + Tauri v2** (macOS Apple Silicon, Windows x64, Linux x64).

Лаунчер спроектирован по принципу **«3 шага без регистрации»** (в духе Apple + balenaEtcher + RPCS3):
1. **Выбор игры** из динамического каталога `launcher-catalog.json` (`.wuhb` для Aroma и/или `WUP Installer .zip`).
2. **Выбор SD-карты Wii U** (автоопределение съёмного накопителя) или любой локальной папки вручную.
3. **Загрузка и установка** в 8 параллельных потоков с автопереключением между зеркалами **Cloud.ru (РФ / СНГ)** и **Cloudflare R2 (Мир)**, автоматической раскладкой по путям Wii U и безопасным извлечением SD-карты.

---

## 1. Архитектура (`launcher/`)

| Слой | Технологии | Ответственность |
| :--- | :--- | :--- |
| **Фронтенд (`launcher/src/`)** | React 19 + TypeScript + Vite + Lucide | Минималистичный UI в стиле Parhelio, 3-шаговый пайплайн, отображение скорости/потоков/зеркал, выбор SD-карты или произвольной папки |
| **Бэкенд (`launcher/src-tauri/`)** | Rust 2021 + Tauri v2 (`tokio`, `reqwest` с `rustls-tls`, `zip`, `sysinfo`, `sha2`, `tauri-plugin-dialog`, `tauri-plugin-opener`) | Пинг зеркал, 8-поточный HTTP Range-загрузчик с failover, распаковка WUP `.zip` и раскладка `.wuhb`, детект и безопасное извлечение SD-карт |
| **Динамический каталог** | `public/launcher-catalog.json` | Список зеркал, портов, размеров, Title ID, форматов `.wuhb` / `WUP` и подсказок по установке — обновляется на сайте без пересборки лаунчера |

Конфигурация приложения (`launcher/src-tauri/tauri.conf.json`):
- `productName`: `Parhelio Launcher`
- `identifier`: `ru.parhelio.launcher`
- `version`: `1.0.0`
- Release-профиль Rust (`Cargo.toml`): `opt-level = 3`, `lto = "thin"`, `codegen-units = 1`, `strip = true` — компактный и быстрый нативный бинарник.

---

## 2. Многопоточный загрузчик (8 потоков) и SmartMirror Failover

Лаунчер **не использует GitHub** для скачивания игр. Все бинарники загружаются напрямую с двух независимых облачных зеркал Parhelio:
- **РФ / СНГ (Cloud.ru Evolution):** `https://parhelio-dl.s3.cloud.ru/releases/<fileName>`
- **Мир (Cloudflare R2):** `https://dl.parhelio.ru/releases/<fileName>`

Принцип работы загрузчика:
1. **Проба задержки (`/ping.txt`):** при запуске лаунчер параллельно опрашивает `/ping.txt` на обоих зеркалах (ожидается ответ `ok`) и выбирает ближайшее рабочее зеркало. Пользователь может в любой момент зафиксировать `Авто`, `РФ (Cloud.ru)` или `Мир (Cloudflare R2)`.
2. **8 параллельных HTTP Range-потоков:** при поддержке сервером `Accept-Ranges: bytes` файл разбивается на диапазоны и качается в 8 потоков через `reqwest` (`rustls-tls`), насыщая канал без ограничений одного TCP-соединения.
3. **Автопереключение (Failover):** при обрыве соединения, 5xx-ошибке, таймауте или недоступности активного зеркала сегмент автоматически перенаправляется на резервное зеркало без потери уже загруженных частей.
4. **Контроль целостности:** по завершении проверяется ожидаемый размер `sizeBytes` (и при наличии SHA-256), после чего выполняется установка на целевой носитель.

---

## 3. Динамический каталог (`public/launcher-catalog.json`)

Файл каталога публикуется вместе со статическим сайтом по адресам:
- `https://parhelio.ru/launcher-catalog.json`
- `https://global.parhelio.ru/launcher-catalog.json`

Структура (`schemaVersion: 1`):
```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-11-27T20:00:00Z",
  "mirrors": [
    { "id": "ru", "name": "РФ / СНГ (Cloud.ru)", "baseUrl": "https://parhelio-dl.s3.cloud.ru", "pingPath": "/ping.txt" },
    { "id": "global", "name": "Мир (Cloudflare R2)", "baseUrl": "https://dl.parhelio.ru", "pingPath": "/ping.txt" }
  ],
  "games": [
    {
      "id": "minecraft-wiiu",
      "slug": "minecraft",
      "title": "Minecraft: Wii U Edition",
      "version": "Update v688",
      "titleId": "00050000101D7500",
      "status": "ready",
      "packages": [
        {
          "id": "mc-wuhb",
          "format": "wuhb",
          "fileName": "Minecraft.WiiU.wuhb",
          "sizeBytes": 1510059508,
          "defaultSubdir": "wiiu/apps"
        },
        {
          "id": "mc-wup",
          "format": "wup",
          "fileName": "Minecraft_WiiU-WUP.zip",
          "sizeBytes": 1541515992,
          "defaultSubdir": "install",
          "wupFolderName": "Minecraft_WiiU"
        }
      ]
    }
  ]
}
```

Чтобы добавить новый порт или обновить сборку:
1. Загрузите файл на оба зеркала (`./scripts/sync-mirrors.sh --files`).
2. Обновите `public/launcher-catalog.json` и выложите сайт (`./scripts/deploy-site.sh`).
3. Все установленные экземпляры **Parhelio Launcher** увидят новую игру/версию сразу при следующем запуске.

---

## 4. Автоопределение SD-карты Wii U и раскладка файлов

Лаунчер сканирует смонтированные диски через `sysinfo` и платформенные механизмы:

| ОС | Обнаружение SD-карты | Безопасное извлечение |
| :--- | :--- | :--- |
| **macOS** | Съёмные тома в `/Volumes/*` (проверка флага removable + эвристика наличия `wiiu/` или `install/`) | `diskutil eject <mount_point>` |
| **Windows** | Съёмные диски (`DRIVE_REMOVABLE`, `D:\`, `E:\`, …) + проверка маркеров Wii U и свободного места | PowerShell `Shell.Application` / безопасное извлечение тома |
| **Linux** | Съёмные точки монтирования в `/media/*`, `/run/media/*`, `/mnt/*` (`sysinfo` + `/sys/block/*/removable`) | `udisksctl unmount` + `udisksctl power-off` (фолбэк `umount`) |

### Правила раскладки на целевом носителе
- **Aroma (`.wuhb`):** копируется напрямую в `<target>/wiiu/apps/<FileName>.wuhb`.
- **WUP Installer (`.zip`):** архив (упакованный в store-режиме без сжатия) распаковывается в `<target>/install/<wupFolderName>/` с защитой от zip-slip и созданием промежуточных директорий.
- **Ручной режим:** пользователь может выбрать любую папку через системный диалог (`tauri-plugin-dialog`) — например, локальную папку на диске или сетевую шару.

---

## 5. Локальная разработка и сборка

### Требования
- **Node.js 22+** и **npm**
- **Rust (stable)** + `cargo`
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** Visual Studio Build Tools (C++ workload) + WebView2 (предустановлен в Windows 10/11)
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get update && sudo apt-get install -y \
    libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssl-dev pkg-config
  ```

### Команды
```bash
cd launcher
npm ci

# Запуск в режиме разработки (Vite + Tauri hot-reload)
npm run tauri dev

# Продакшн-сборка под текущую платформу
npm run tauri build
```

Готовые установщики появляются в `launcher/src-tauri/target/release/bundle/`:
- macOS: `dmg/Parhelio Launcher_1.0.0_aarch64.dmg`
- Windows: `nsis/Parhelio Launcher_1.0.0_x64-setup.exe`
- Linux: `appimage/Parhelio Launcher_1.0.0_amd64.AppImage`

---

## 6. Сборка под 3 ОС в CI и публикация на Cloud.ru и Cloudflare R2

### Автоматическая сборка через GitHub Actions
Workflow [`.github/workflows/build-launcher.yml`](../.github/workflows/build-launcher.yml) запускается при пуше в `main` с изменениями в `launcher/**` или вручную через `workflow_dispatch`.

Матрица собирает и нормализует три артефакта (+ файлы `.sha256`):
- `Parhelio-Launcher-1.0.0-macos-arm64.dmg` (`macos-latest`, `aarch64-apple-darwin`)
- `Parhelio-Launcher-1.0.0-windows-x64.exe` (`windows-latest`, `x86_64-pc-windows-msvc`)
- `Parhelio-Launcher-1.0.0-linux-x64.AppImage` (`ubuntu-latest`, `x86_64-unknown-linux-gnu`)

> **Важно:** GitHub Actions используется **только как сборочный конвейер** (артефакты для скачивания разработчиком). На сайте `parhelio.ru` и `global.parhelio.ru` ссылки на скачивание лаунчера ведут **исключительно на Cloud.ru и Cloudflare R2** через `useSmartMirror().getReleaseUrl(...)`.

### Публикация собранных установщиков на зеркала Parhelio

1. Скачайте 3 артефакта из запуска `Build Parhelio Launcher` (или возьмите локально собранный `.dmg` на Mac) в локальную папку, например `~/Downloads/parhelio-launcher-1.0.0/`.
2. Загрузите файлы на оба зеркала через настроенный `rclone` (см. [DEPLOYMENT.md](./DEPLOYMENT.md)):

```bash
RELEASE_DIR="$HOME/Downloads/parhelio-launcher-1.0.0"

for FILE in \
  Parhelio-Launcher-1.0.0-macos-arm64.dmg \
  Parhelio-Launcher-1.0.0-windows-x64.exe \
  Parhelio-Launcher-1.0.0-linux-x64.AppImage
do
  rclone copyto "$RELEASE_DIR/$FILE" "cloudru:parhelio-ru-storage/releases/$FILE" \
    --s3-no-check-bucket --s3-chunk-size 16M --s3-upload-concurrency 4 \
    --header-upload "Cache-Control: public, max-age=31536000, immutable"

  rclone copyto "$RELEASE_DIR/$FILE" "r2:parhelio-wstorage/releases/$FILE" \
    --s3-no-check-bucket --s3-chunk-size 16M --s3-upload-concurrency 4 \
    --header-upload "Cache-Control: public, max-age=31536000, immutable"
done
```

3. Проверьте доступность с обоих зеркал:
```bash
for FILE in \
  Parhelio-Launcher-1.0.0-macos-arm64.dmg \
  Parhelio-Launcher-1.0.0-windows-x64.exe \
  Parhelio-Launcher-1.0.0-linux-x64.AppImage
do
  curl -sI "https://parhelio-dl.s3.cloud.ru/releases/$FILE" | head -n 1
  curl -sI "https://dl.parhelio.ru/releases/$FILE" | head -n 1
done
```

4. При выпуске новой версии (например, `1.1.0`):
   - Обновите версию в `launcher/package.json`, `launcher/src-tauri/tauri.conf.json`, `launcher/src-tauri/Cargo.toml`.
   - Обновите имена файлов в `.github/workflows/build-launcher.yml` и в массиве `LAUNCHER_DOWNLOADS` внутри `src/components/HomePage.tsx`.
   - Залейте новые артефакты на Cloud.ru и Cloudflare R2 и выложите сайт командой `./scripts/deploy-site.sh`.
