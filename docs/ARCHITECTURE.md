# Архитектура Parhelio (`parhelio.ru`)

Проект спроектирован для многолетней автономной работы с минимальной стоимостью (~2–5 ₽/мес), полной доступностью в РФ/СНГ без VPN, максимальной скоростью по всему миру и нулевой критической зависимостью от GitHub.

---

## 1. Карта доменов и DNS (Cloudflare Zone `parhelio.ru`)

NS-серверы у регистратора Timeweb делегированы на Cloudflare:
- `keenan.ns.cloudflare.com`
- `robin.ns.cloudflare.com`

| Запись | Тип | Значение | Режим прокси | Назначение |
| :--- | :--- | :--- | :--- | :--- |
| `parhelio.ru` | `CNAME` *(auto-flatten)* | `parhelio.ru.website.yandexcloud.net` | **DNS-only (серое облако)** | Главный сайт в РФ/СНГ и мире — напрямую из Yandex Object Storage (`213.180.193.247`), без ТСПУ |
| `_acme-challenge.parhelio.ru` | `CNAME` | `fpq2i73ia5gugfcfijo3.cm.yandexcloud.net` | **DNS-only (серое облако)** | Вечное автопродление Let's Encrypt в Yandex Certificate Manager |
| `global.parhelio.ru` | `AAAA` *(Worker)* | `100::` (`parhelio` Worker) | **Proxied (оранжевое облако)** | Быстрое мировое CDN-зеркало сайта на Cloudflare Workers Static Assets |
| `*.global.parhelio.ru` | `AAAA` *(Worker)* | `100::` (`parhelio` Worker) | **Proxied (оранжевое облако)** | Превью-версии Cloudflare Workers |
| `www.parhelio.ru` | `AAAA` *(Worker)* | `100::` (`parhelio` Worker) | **Proxied (оранжевое облако)** | Запасной вход через Cloudflare |
| `dl.parhelio.ru` | `CNAME` *(R2)* | `public.r2.dev` (`parhelio-wstorage`) | **Proxied (оранжевое облако)** | Мировое файловое зеркало (10 ГБ, $0 egress) |

### Сетевые настройки зоны `parhelio.ru` в Cloudflare
- `SSL/TLS`: `Full`
- `Always Use HTTPS`: `on`
- `Minimum TLS Version`: `1.2`
- `TLS 1.3`: `on`, `HTTP/3`: `on`, `Brotli`: `on`
- `ECH (Encrypted Client Hello)`: **`off`** (отключено намеренно: в РФ ТСПУ часто блокирует TLS ECH у Cloudflare).

---

## 2. Двухрегиональная схема сайтов и файлов

```text
Пользователь в РФ / СНГ
  └─ https://parhelio.ru (Yandex Object Storage, DNS-only -> 213.180.193.247)
       ├─ Сайт грузится напрямую из РФ по HTTPS (без Cloudflare и без ТСПУ)
       └─ Кнопки «Скачать» -> SmartMirror -> https://parhelio-dl.s3.cloud.ru/releases/*
          (Cloud.ru Evolution Object Storage, 15 ГБ / 10 ТБ в месяц бесплатно)

Пользователь вне РФ / СНГ (или на быстром зарубежном VPN)
  └─ Открыл https://parhelio.ru -> SmartMirror за ~150 мс проверяет таймзону и пинг ping.txt
       ├─ Мягкий автопереход -> https://global.parhelio.ru (Cloudflare CDN)
       │  (отключается параметром ?stay=1 или ручным выбором зеркала)
       └─ Кнопки «Скачать» -> SmartMirror -> https://dl.parhelio.ru/releases/*
          (Cloudflare R2, 10 ГБ, безлимитный бесплатный egress)
```

---

## 3. Как работает SmartMirror (`src/lib/mirrors.ts`)

1. При открытии сайта параллельно запрашиваются два микрофайла (3 байта `ok\n`, `Cache-Control: no-store`, `CORS GET/HEAD`):
   - РФ: `https://parhelio-dl.s3.cloud.ru/ping.txt`
   - Мир: `https://dl.parhelio.ru/ping.txt`
2. Логика выбора (`auto`):
   - Если доступен только один из серверов — выбирается он (например, при блокировке `dl.parhelio.ru` у провайдера в РФ сайт автоматически использует Cloud.ru).
   - Если доступны оба — сравниваются таймзона (список таймзон РФ/СНГ) и фактическая задержка RTT.
   - Пользователь в любой момент может вручную переключить зеркало (**`Авто / РФ / Мир`**) в панели под кнопками загрузки; выбор сохраняется в `localStorage` (`parhelio_mirror_pref`).
3. **Полный отказ от скачиваний с GitHub:**
   - Ни одна кнопка «Скачать» на сайте не ведёт на `github.com/.../releases`.
   - Все бинарники Wii U и macOS отдаются строго с **Cloud.ru** (`parhelio-dl.s3.cloud.ru`) и **Cloudflare R2** (`dl.parhelio.ru`).
   - Ссылки на GitHub оставлены исключительно для просмотра открытого исходного кода репозиториев.

---

## 4. CORS на обоих файловых хранилищах

Оба бакета (`parhelio-wstorage` в R2 и `parhelio-ru-storage` / домен `parhelio-dl` в Cloud.ru) настроены одинаково:
- `AllowedOrigins`: `https://parhelio.ru`, `https://www.parhelio.ru`, `https://global.parhelio.ru`, `https://parhelio.silent-echoes16.workers.dev`, `http://localhost:5173`, `http://127.0.0.1:5173`
- `AllowedMethods`: `GET`, `HEAD`
- `AllowedHeaders`: `*`
- `ExposeHeaders`: `Content-Length`, `Content-Range`, `ETag`, `Accept-Ranges`
- `MaxAgeSeconds`: `86400`

---

## 5. Добровольная поддержка (Донаты)

Прямые защищённые ссылки без бэкенда и API-ключей (`src/data/catalog.ts`, `src/components/SupportModal.tsx` с автоопределением вкладки через `useSmartMirror()`):
- **Из России (РФ / СНГ):** ЮMoney — `https://yoomoney.ru/to/4100119696403242` (+ альтернатива Boosty)
- **Международно:** Boosty — `https://boosty.to/parhelios/donate` и страница `https://boosty.to/parhelios`
