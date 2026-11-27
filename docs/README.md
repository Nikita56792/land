# Parhelio (`parhelio.ru`) — Документация проекта

Полная техническая документация лендинга **Parhelio** — витрины нативных портов для Nintendo Wii U и приложений для macOS (Apple Silicon) с отказоустойчивой двухрегиональной инфраструктурой и прямой публикацией без зависимости от GitHub.

## Содержание `docs/`

| Файл | Что внутри |
| :--- | :--- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектура доменов, DNS в Cloudflare, схема РФ (`parhelio.ru`) ↔ Мир (`global.parhelio.ru`), SmartMirror (`parhelio-dl.s3.cloud.ru` ↔ `dl.parhelio.ru`), SSL и защита от блокировок ТСПУ |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Прямой деплой сайта и файлов с Mac **без GitHub** (`scripts/deploy-site.sh`, `scripts/sync-mirrors.sh`, `wrangler.jsonc`, `rclone`), настройка секретов и план восстановления, если GitHub-репозиторий будет удалён |
| [RELEASES_AND_MIRRORS.md](./RELEASES_AND_MIRRORS.md) | Полный реестр всех 5 портов Wii U и 4 приложений Mac, локальные пути исходных сборок, форматы `.wuhb` и WUP Installer `.zip`, точные URL зеркал и лимиты Free Tier |
| [LAUNCHER.md](./LAUNCHER.md) | Архитектура **Parhelio Launcher** (Rust + Tauri v2), 8-поточный загрузчик и failover Cloud.ru ↔ R2, динамический `launcher-catalog.json`, автоопределение SD-карт (macOS/Windows/Linux), локальная сборка и публикация релизов |
| [CONTENT_AND_TECH_NOTES.md](./CONTENT_AND_TECH_NOTES.md) | Фактические инженерные спецификации всех 5 портов Wii U (Minecraft, Buckshot Roulette, Slime Rancher, Subnautica, Animal Crossing: New Horizons) и 4 приложений Mac |

## Быстрые команды (с Mac, без GitHub)

```bash
# 1. Собрать и выложить сайт сразу на Yandex (parhelio.ru) + Cloudflare Worker (global.parhelio.ru)
./scripts/deploy-site.sh

# 2. Обновить только РФ-зеркало сайта (Yandex Object Storage -> parhelio.ru)
./scripts/deploy-site.sh --yandex

# 3. Обновить только мировое зеркало сайта (Cloudflare Worker -> global.parhelio.ru)
./scripts/deploy-site.sh --cf

# 4. Перепаковать WUP ZIP и синхронизировать все сборки + ping.txt в Cloud.ru и Cloudflare R2
./scripts/sync-mirrors.sh --files

# 5. Настроить профили rclone из локального ~/.parhelio-keys.env (chmod 600)
./scripts/setup-rclone.sh
```
