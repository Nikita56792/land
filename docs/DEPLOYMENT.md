# Прямой деплой и отказоустойчивость (без зависимости от GitHub)

## 1. Почему сайт не упадёт при удалении репозитория на GitHub

Живая инфраструктура **не зависит от GitHub**:
- **`https://parhelio.ru`** раздаётся из **Yandex Object Storage** (бакет `parhelio.ru`).
- **`https://global.parhelio.ru`** раздаётся из **Cloudflare Workers Static Assets** (скрипт `parhelio`).
- **Все установочные файлы** раздаются из **Cloud.ru (`parhelio-dl.s3.cloud.ru`)** и **Cloudflare R2 (`dl.parhelio.ru`)**.

Если GitHub удалит репозиторий `Nikita56792/land` или заблокирует аккаунт:
1. Оба сайта (`parhelio.ru`, `global.parhelio.ru`) и оба файловых зеркала продолжат работать без единой секунды простоя.
2. Все обновления сайта и файлов выкладываются напрямую с Mac через скрипты `scripts/deploy-site.sh` и `scripts/sync-mirrors.sh`.

---

## 2. Локальные ключи (`~/.parhelio-keys.env`, `chmod 600`)

Секреты хранятся **только локально на Mac** вне Git-репозитория в файле `~/.parhelio-keys.env`:

```bash
# 1. Cloud.ru Evolution Object Storage (бакет parhelio-ru-storage, домен parhelio-dl)
CLOUDRU_TENANT_ID="<tenant_id>"
CLOUDRU_ACCESS_KEY_ID="<key_id>"
CLOUDRU_SECRET_ACCESS_KEY="<key_secret>"

# 2. Yandex Object Storage (бакет parhelio.ru, сервисный аккаунт storage.editor)
YC_ACCESS_KEY_ID="<key_id>"
YC_SECRET_ACCESS_KEY="<key_secret>"

# 3. Cloudflare R2 (бакет parhelio-wstorage, Object Read & Write)
R2_ACCOUNT_ID="170f7b789cae451eb58d15c3151742d8"
R2_ACCESS_KEY_ID="<r2_access_key>"
R2_SECRET_ACCESS_KEY="<r2_secret_key>"

# 4. Опционально: Cloudflare API Token (Workers Scripts: Edit) для deploy-site.sh без wrangler login
CLOUDFLARE_API_TOKEN=""
```

Применение ключей в `~/.config/rclone/rclone.conf`:
```bash
./scripts/setup-rclone.sh
```

> **Важно для Cloud.ru Evolution:** `setup-rclone.sh` автоматически склеивает `access_key_id` в формат `<tenant_id>:<key_id>`, включает `force_path_style = true` и `no_check_bucket = true` для всех трёх профилей `rclone`.

---

## 3. Прямой деплой обновлённого сайта (без GitHub)

### Один раз авторизовать Wrangler (для Cloudflare Worker `parhelio`)
Выбери любой из двух способов:
- **Способ A (OAuth в браузере, 10 сек):** `npx wrangler login`
- **Способ B (API-токен):** создать в Cloudflare токен с правом `Workers Scripts: Edit` и вписать `CLOUDFLARE_API_TOKEN="..."` в `~/.parhelio-keys.env`.

### Выкладка новой версии сайта одной командой
```bash
./scripts/deploy-site.sh
```
Что делает скрипт:
1. Собирает продакшн-бандл `npm run build` (`tsc -b && vite build` → `dist/`).
2. Синхронизирует `dist/` напрямую в **Yandex Object Storage (`parhelio.ru`)** через `rclone sync` (хешированные ассеты с `Cache-Control: public, max-age=31536000, immutable`, `index.html` с `max-age=0, must-revalidate`).
3. Заливает `dist/` напрямую в **Cloudflare Worker `parhelio`** (`wrangler.jsonc` → `global.parhelio.ru` и `www.parhelio.ru`).

Точечный деплой:
```bash
./scripts/deploy-site.sh --yandex   # только parhelio.ru
./scripts/deploy-site.sh --cf       # только global.parhelio.ru
```

---

## 4. Загрузка и обновление бинарников на обоих зеркалах

```bash
# Запаковать WUP-папки в ZIP (store mode) и залить все файлы + ping.txt в R2 и Cloud.ru
./scripts/sync-mirrors.sh --files

# Только Cloudflare R2 или только Cloud.ru:
./scripts/sync-mirrors.sh --files --r2
./scripts/sync-mirrors.sh --files --cloudru
```

---

## 5. Опциональный резервный Git-бэкап

Поскольку GitHub не должен быть единственной копией исходников лендинга, рекомендуется периодически сохранять локальный/облачный бандл:
```bash
git bundle create ~/Desktop/parhelio-land-backup.bundle --all
```
А при желании можно подключить второе независимое зеркало Git (например, Codeberg, GitFlic или приватный бакет/внешний диск):
```bash
git remote add backup <url_резервного_репозитория>
git push backup main
```

---

## 6. Проверка работоспособности после деплоя

```bash
# Проверка обоих сайтов
curl -sI https://parhelio.ru | head -n 5
curl -sI https://global.parhelio.ru | head -n 5

# Проверка пинга и CORS обоих файловых зеркал
curl -sI -H "Origin: https://parhelio.ru" https://parhelio-dl.s3.cloud.ru/ping.txt
curl -sI -H "Origin: https://parhelio.ru" https://dl.parhelio.ru/ping.txt
```
