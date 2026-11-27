# Parhelio (`parhelio.ru`) — Порты игр на Wii U и нативные приложения для macOS

Официальный сайт: **[parhelio.ru](https://parhelio.ru)** (РФ/СНГ) · **[global.parhelio.ru](https://global.parhelio.ru)** (Мир)  
Репозиторий: [Nikita56792/land](https://github.com/Nikita56792/land).

## Разделы сайта

- **Wii U Ports (`#games`)** — двухэкранные порты для Nintendo Wii U (TV + GamePad) с прямыми сборками **Aroma `.wuhb`** и **WUP Installer GX2 (`.zip`)**:
  - **Minecraft: Wii U Edition (`v688`)** — C++-реконструкция RedHills с кооперативом на двух независимых экранах (`SeparateGamePad`), апскейлом `720p→1080p AMD FidelityFX CAS` и раздельным звуком AX DSP на Core 2.
  - **Buckshot Roulette (`Build 116 / v44`)** — нативный C++20/PowerPC/WUT рантайм (28 шейдеров GX2, AMD CAS, AX IMA-ADPCM 303 МБ) + локальный PvP 1v1 (TV ↔ GamePad).
  - **Slime Rancher (`v42 NoLog`)** — 100% Full-AOT Unity 5.6.5p4 (`50 719` методов), Core 2 Paired Singles SIMD (`slime_wiiu_nolog.rpl`), Dual-Volume WPVS, Luma AMD CAS, аппаратный GCADPCM и живая карта MapUI на GamePad (только WUP Installer).
  - **Subnautica (`R&D v18`)** — экспериментальный Full-AOT порт (`45 582` метода, `5 600` GX2-шейдеров, Single-RT WBOIT, `432p→720p CAS`).
- **Mac Apps (`#apps`)** — нативные приложения под Apple Silicon:
  - **Epidaurus** (`v0.2.0`), **Kraken** (`v0.4.0`), **Real3D** (`v1.2.0`), **Fovea** (`v1.0.0`).

## Инфраструктура и зеркала

- **Сайт:** `parhelio.ru` (Yandex Object Storage, DNS-only) + `global.parhelio.ru` (Cloudflare Workers Static Assets) + GitHub Pages.
- **Файлы (`/releases/`):** автовыбор зеркала (`SmartMirror`) между **Cloud.ru Evolution S3** (`parhelio-ru-storage`, РФ/СНГ) и **Cloudflare R2** (`dl.parhelio.ru`, мир).
- **Синхронизация с Mac:**
  ```bash
  ./scripts/setup-rclone.sh --gh-secrets
  ./scripts/sync-mirrors.sh --all
  ```
