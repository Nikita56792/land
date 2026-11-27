#!/usr/bin/env bash
# Direct, GitHub-independent deployment of Parhelio (parhelio.ru + global.parhelio.ru).
# Works even if GitHub is unavailable or the repository is removed.
#
# Usage:
#   ./scripts/deploy-site.sh             # build dist/ -> deploy to Yandex (parhelio.ru) + Cloudflare Worker (global.parhelio.ru)
#   ./scripts/deploy-site.sh --yandex    # deploy only to Yandex Object Storage (parhelio.ru)
#   ./scripts/deploy-site.sh --cf        # deploy only to Cloudflare Worker (global.parhelio.ru)
set -euo pipefail

export PATH="/opt/homebrew/bin:$HOME/yandex-cloud/bin:$PATH"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_FILE="${SECRETS_FILE:-$HOME/.parhelio-keys.env}"
YANDEX_BUCKET="${YANDEX_BUCKET:-parhelio.ru}"

DO_YANDEX=1
DO_CF=1
for arg in "$@"; do
  case "$arg" in
    --yandex) DO_YANDEX=1; DO_CF=0 ;;
    --cf)     DO_YANDEX=0; DO_CF=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if [[ -f "$SECRETS_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
  set +a
fi

echo "==> [1/3] Building static bundle (dist/)..."
(cd "$ROOT" && npm run build)

if [[ $DO_YANDEX -eq 1 ]]; then
  echo "==> [2/3] Deploying directly to Yandex Object Storage (https://parhelio.ru)..."
  command -v rclone >/dev/null 2>&1 || { echo "rclone not found. Run: brew install rclone" >&2; exit 1; }
  rclone sync "$ROOT/dist" "yandex:${YANDEX_BUCKET}" \
    --exclude "index.html" \
    --header-upload "Cache-Control: public, max-age=31536000, immutable" \
    --transfers 8 \
    --fast-list \
    --stats-one-line

  rclone copyto "$ROOT/dist/index.html" "yandex:${YANDEX_BUCKET}/index.html" \
    --header-upload "Content-Type: text/html; charset=utf-8" \
    --header-upload "Cache-Control: public, max-age=0, must-revalidate"
  echo "    ✓ Yandex Object Storage updated (parhelio.ru)"
fi

if [[ $DO_CF -eq 1 ]]; then
  echo "==> [3/3] Deploying directly to Cloudflare Worker 'parhelio' (https://global.parhelio.ru)..."
  if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || npx --yes wrangler whoami >/dev/null 2>&1; then
    (cd "$ROOT" && npx --yes wrangler deploy)
    echo "    ✓ Cloudflare Worker 'parhelio' updated (global.parhelio.ru)"
  else
    echo "    ! Wrangler is not authenticated yet."
    echo "      Run once: npx wrangler login"
    echo "      Or add CLOUDFLARE_API_TOKEN=\"...\" to $SECRETS_FILE"
    exit 1
  fi
fi

echo "==> Direct deploy finished cleanly (zero GitHub dependency)."
