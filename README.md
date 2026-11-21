# REAL // LAB — Порты игр на Wii U и нативные приложения для macOS

Лендинг и каталог открытых сборок: [Nikita56792/land](https://github.com/Nikita56792/land).

## Разделы сайта

- **Wii U Ports (`#games`)** — интерактивная двухэкранная сцена **TV + Wii U GamePad**, видео-превью, телеметрия и загрузки для:
  - **Minecraft: Wii U Edition (`DualScreenUI`)** — локальная игра вдвоём на разных экранах (Игрок 1 — TV, Игрок 2 — GamePad, без split-screen), `.wuhb` релиз.
  - **Buckshot Roulette** — нативный порт `GD → Wii U GX2/PowerPC` с локальным режимом `TV vs GamePad`.
  - **Slime Rancher** — порт `Unity → Cafe OS RPX`.
  - **Subnautica** — R&D порт-адаптер (`Cemu 24–30 FPS`, консоль Wii U в процессе оптимизации).
- **Mac Apps (`#apps`)** — нативные утилиты под Apple Silicon:
  - **Epidaurus** (`v0.2.0`, [репозиторий](https://github.com/Nikita56792/epidaurus)) — медиаплеер на Rust + FFmpeg 9 (H.266/VVdeC NEON, HDR/Dolby Vision, объектный Atmos HRTF, AI 3D-апмикс, торренты).
  - **Kraken** (`v0.4.0`, [репозиторий](https://github.com/Nikita56792/kraken)) — прозрачное сжатие и BLAKE3-дедупликация на Mac (Kraken Disk + Free Up Space).
  - **Real3D** (`v1.2.0`, [репозиторий](https://github.com/Nikita56792/real3d)) — 2D экран → стерео 3D `3840×1080 @ 60 FPS` на Core ML + Metal для XREAL.

## Локальная разработка

```bash
npm install
npm run dev
```

## Деплой через Docker (с локальным сервером файлов `/downloads`)

Поместите нужные дистрибутивы (`.wuhb`, `.dmg`, `.pkg`, `.zip`) в каталог `./downloads/` (или выполните `./scripts/stage-downloads.sh` на машине с исходниками) и поднимите контейнер:

```bash
docker compose up -d --build
```

Nginx раздаёт статику SPA и отдаёт файлы из `./downloads/` напрямую с поддержкой HTTP Range (докачка крупных образов).

## GitHub Pages

При пуше в `main` запускается `.github/workflows/deploy-pages.yml` и публикует статический билд. Ссылки «Скачать с сервера» автоматически проверяют доступность локального файла `/downloads/...` и при работе на статическом зеркале подсказывают загрузку с GitHub Releases.
