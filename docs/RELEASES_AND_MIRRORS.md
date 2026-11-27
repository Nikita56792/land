# Релизы и зеркала Parhelio (`dl.parhelio.ru` ↔ `parhelio-dl.s3.cloud.ru`)

Все установочные образы и сборки портов раздаются **исключительно с облачных зеркал Parhelio** (ссылки на скачивание с GitHub Releases полностью удалены с сайта; на GitHub оставлены только ссылки на открытый исходный код).

---

## 1. Облачные хранилища и бюджет Free Tier

| Зеркало | Провайдер / Бакет | Публичный URL | Free Tier | Занято сейчас |
| :--- | :--- | :--- | :--- | :--- |
| **РФ / СНГ** | Cloud.ru Evolution (`parhelio-ru-storage`, домен `parhelio-dl`) | `https://parhelio-dl.s3.cloud.ru` | **15 ГБ** хранения · **10 ТБ/мес** трафика | **~5.47 ГБ** (36%) |
| **Мир** | Cloudflare R2 (`parhelio-wstorage`, EEUR) | `https://dl.parhelio.ru` | **10 ГБ** хранения · **безлимит** трафика ($0 egress) | **~5.47 ГБ** (55%) |
| **Сайт РФ** | Yandex Object Storage (`parhelio.ru`) | `https://parhelio.ru` | ~2–5 ₽/мес (~10 МБ статики) | **~15 МБ** |
| **Сайт Мир** | Cloudflare Workers Static Assets (`parhelio`) | `https://global.parhelio.ru` | Free Plan (100k req/day) | **~15 МБ** |

---

## 2. Полный реестр опубликованных файлов (`/releases/`)

Каждый файл хранится с одинаковым именем в `releases/` на обоих зеркалах (`https://parhelio-dl.s3.cloud.ru/releases/<file>` и `https://dl.parhelio.ru/releases/<file>`):

### Порты для Nintendo Wii U

| Проект | Версия / Title ID | Файл в `/releases/` | Размер | Формат и путь установки | Локальный источник на Mac |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Minecraft: Wii U Edition** | `v688` · `00050000101D7500` | `Minecraft.WiiU.wuhb` | `1.41 ГБ` (`1,510,059,508 B`) | Aroma `.wuhb` → `sd:/wiiu/apps/` | `/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main/build/wiiu/Minecraft.WiiU.wuhb` |
| **Minecraft: Wii U Edition** | `v688` · `00050000101D7500` | `Minecraft_WiiU-WUP.zip` | `1.44 ГБ` (`1,541,515,992 B`) | WUP Installer GX2 → `sd:/install/Minecraft_WiiU/` | `/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main/build/wiiu/Minecraft_WiiU` |
| **Buckshot Roulette** | `Build 116 / v44` · `000500001337B001` | `BuckshotRoulette.wuhb` | `303 МБ` (`318,047,300 B`) | Aroma `.wuhb` → `sd:/wiiu/apps/` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/OpenBuckshotRoulette-main/releases/WiiU/2026-11-27_Build116_v44/WUHB/BuckshotRoulette.wuhb` |
| **Buckshot Roulette** | `Build 116 / v44` · `000500001337B001` | `BuckshotRoulette_WiiU-WUP.zip` | `313 МБ` (`328,575,016 B`) | WUP Installer GX2 → `sd:/install/BuckshotRoulette_WiiU/` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/OpenBuckshotRoulette-main/releases/WiiU/2026-11-27_Build116_v44/Install/BuckshotRoulette_WiiU` |
| **Slime Rancher** | `v42 NoLog` · `0005000021000002` | `SlimeRancher_WiiU_NoLog-WUP.zip` | `902 МБ` (`946,189,864 B`) | Только WUP Installer GX2 → `sd:/install/SlimeRancher_WiiU_NoLog/` | `/Users/nikitasyzdykov/Kraken Disk/Downloads/slime-wiiu-sprint/out/SlimeRancher_WiiU_NoLog` |
| **Subnautica** | `R&D v18` · `0005000021000003` | *(в разработке)* | `9.2 ГБ` (WUP R&D) | Планируется формат адаптера | `/Users/nikitasyzdykov/Downloads/subnautica-wiiu-sprint` |
| **Animal Crossing: New Horizons** | *Активная разработка и тестирование* | *(в разработке)* | — | В разработке / тестировании | `/Users/nikitasyzdykov/Desktop/animal-crossing` |

### Приложения для macOS (Apple Silicon)

| Приложение | Версия | Файл в `/releases/` | Размер | Репозиторий исходного кода | Локальный источник на Mac |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Epidaurus** | `v0.2.0` | `Epidaurus-0.2.0.dmg` | `31 МБ` (`33,002,895 B`) | `https://github.com/Nikita56792/epidaurus` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/realgame/app/build/Epidaurus-0.2.0.dmg` |
| **Kraken** | `v0.4.0` | `Kraken-0.4.0.pkg` | `9.9 МБ` (`10,414,255 B`) | `https://github.com/Nikita56792/kraken` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/kraken/dist/Kraken-0.4.0.pkg` |
| **Real3D** | `v1.2.0` | `Real3D-1.2.0.dmg` | `857 МБ` (`898,500,428 B`) | `https://github.com/Nikita56792/real3d` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/real3d/checkpoints/Real3D-1.2.0.dmg` |
| **Fovea** | `v1.0.0` | `Fovea-1.0.0.dmg` | `164 МБ` (`171,544,377 B`) | `https://github.com/Nikita56792/fovea` | `/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/eye_track/build/Fovea-1.0.0.dmg` |

### Parhelio Launcher (нативный загрузчик, Rust + Tauri v2)

| Платформа | Версия | Файл в `/releases/` | Размер | Формат / Архитектура | Сборка |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **macOS** | `v1.0.0` | `Parhelio-Launcher-1.0.0-macos-arm64.dmg` | `4.40 МБ` (`4,613,819 B`) | Apple Silicon (`arm64`) `.dmg` (ad-hoc `codesign --deep`) | Локально + GitHub Actions |
| **Windows** | `v1.0.0` | `Parhelio-Launcher-1.0.0-windows-x64.exe` | `3.11 МБ` (`3,266,052 B`) | `x86_64` NSIS Installer `.exe` | GitHub Actions (`windows-latest`) |
| **Linux** | `v1.0.0` | `Parhelio-Launcher-1.0.0-linux-x64.AppImage` | `84.1 МБ` (`88,185,336 B`) | `x86_64` portable `.AppImage` | GitHub Actions (`ubuntu-latest`) |

---

## 3. Правила упаковки WUP Installer

Файлы WUP Installer (`.app`, `.h3`, `title.cert`, `title.tik`, `title.tmd`) зашифрованы AES-CBC (NUS), поэтому не сжимаются. Скрипт `scripts/sync-mirrors.sh` пакует их командой `zip -0 -r` (режим Store без лишней нагрузки на CPU) с сохранением корневой папки тайтла внутри архива, чтобы пользователь распаковал архив прямо в `sd:/install/`.
