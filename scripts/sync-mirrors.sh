#!/usr/bin/env bash
# Package WUP Installer folders into store-mode ZIPs and sync all Parhelio release builds
# + ping.txt to Cloudflare R2 (dl.parhelio.ru) and Cloud.ru (parhelio-ru-storage),
# and optionally build & deploy dist/ to Yandex Object Storage (parhelio.ru).
#
# Usage:
#   ./scripts/sync-mirrors.sh --files           # package WUP ZIPs & upload to configured mirrors (r2 + cloudru)
#   ./scripts/sync-mirrors.sh --files --r2      # upload only to Cloudflare R2
#   ./scripts/sync-mirrors.sh --files --cloudru # upload only to Cloud.ru
#   ./scripts/sync-mirrors.sh --site            # build dist/ and sync to Yandex Object Storage (parhelio.ru)
#   ./scripts/sync-mirrors.sh --all             # both files and site
set -euo pipefail

export PATH="/opt/homebrew/bin:$HOME/yandex-cloud/bin:$PATH"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$ROOT/downloads/staged-zips"
R2_BUCKET="${R2_BUCKET:-parhelio-wstorage}"
CLOUDRU_BUCKET="${CLOUDRU_BUCKET:-parhelio-ru-storage}"
YANDEX_BUCKET="${YANDEX_BUCKET:-parhelio.ru}"

DO_FILES=0
DO_SITE=0
ONLY_R2=0
ONLY_CLOUDRU=0

if [[ $# -eq 0 ]]; then
  DO_FILES=1
else
  for arg in "$@"; do
    case "$arg" in
      --files)   DO_FILES=1 ;;
      --site)    DO_SITE=1 ;;
      --all)     DO_FILES=1; DO_SITE=1 ;;
      --r2)      ONLY_R2=1 ;;
      --cloudru) ONLY_CLOUDRU=1 ;;
      *) echo "Unknown option: $arg" >&2; exit 1 ;;
    esac
  done
fi

command -v rclone >/dev/null 2>&1 || { echo "rclone not found. Run: brew install rclone" >&2; exit 1; }

pack_wup_zip() {
  local src_dir="$1"
  local zip_name="$2"
  local out_zip="$STAGE/$zip_name"
  mkdir -p "$STAGE"
  if [[ ! -d "$src_dir" ]]; then
    echo "WARN: WUP folder missing, skipping: $src_dir"
    return 1
  fi
  local parent_dir base_name
  parent_dir="$(dirname "$src_dir")"
  base_name="$(basename "$src_dir")"
  if [[ -f "$out_zip" && "$out_zip" -nt "$src_dir" ]]; then
    echo "==> Using cached WUP zip: $zip_name ($(du -h "$out_zip" | awk '{print $1}'))"
    return 0
  fi
  rm -f "$out_zip"
  echo "==> Packing WUP installer (store mode): $base_name -> $zip_name"
  (cd "$parent_dir" && zip -0 -r -q "$out_zip" "$base_name" -x "*.DS_Store")
  echo "    packed: $(du -h "$out_zip" | awk '{print $1}')"
}

sync_files() {
  local tmp_ping
  tmp_ping="$(mktemp -d)"
  trap 'rm -rf "$tmp_ping"' RETURN
  printf 'ok\n' > "$tmp_ping/ping.txt"

  pack_wup_zip \
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/OpenBuckshotRoulette-main/releases/WiiU/2026-11-27_Build116_v44/Install/BuckshotRoulette_WiiU" \
    "BuckshotRoulette_WiiU-WUP.zip" || true

  pack_wup_zip \
    "/Users/nikitasyzdykov/Kraken Disk/Downloads/slime-wiiu-sprint/out/SlimeRancher_WiiU_NoLog" \
    "SlimeRancher_WiiU_NoLog-WUP.zip" || true

  pack_wup_zip \
    "/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main/build/wiiu/Minecraft_WiiU" \
    "Minecraft_WiiU-WUP.zip" || true

  local -a entries=(
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/kraken/dist/Kraken-0.4.0.pkg|Kraken-0.4.0.pkg"
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/realgame/app/build/Epidaurus-0.2.0.dmg|Epidaurus-0.2.0.dmg"
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/eye_track/build/Fovea-1.0.0.dmg|Fovea-1.0.0.dmg"
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/OpenBuckshotRoulette-main/releases/WiiU/2026-11-27_Build116_v44/WUHB/BuckshotRoulette.wuhb|BuckshotRoulette.wuhb"
    "$STAGE/BuckshotRoulette_WiiU-WUP.zip|BuckshotRoulette_WiiU-WUP.zip"
    "/Users/nikitasyzdykov/Kraken Disk/Desktop/real3d/checkpoints/Real3D-1.2.0.dmg|Real3D-1.2.0.dmg"
    "$STAGE/SlimeRancher_WiiU_NoLog-WUP.zip|SlimeRancher_WiiU_NoLog-WUP.zip"
    "/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main/build/wiiu/Minecraft.WiiU.wuhb|Minecraft.WiiU.wuhb"
    "$STAGE/Minecraft_WiiU-WUP.zip|Minecraft_WiiU-WUP.zip"
  )

  local -a targets=()
  if [[ $ONLY_R2 -eq 1 ]]; then
    targets=("r2:$R2_BUCKET")
  elif [[ $ONLY_CLOUDRU -eq 1 ]]; then
    targets=("cloudru:$CLOUDRU_BUCKET")
  else
    targets=("r2:$R2_BUCKET" "cloudru:$CLOUDRU_BUCKET")
  fi

  for remote_spec in "${targets[@]}"; do
    local remote_name="${remote_spec%%:*}"
    if ! rclone listremotes | grep -qx "${remote_name}:"; then
      echo "SKIP $remote_spec (remote '$remote_name' not configured)"
      continue
    fi
    if ! rclone lsf "$remote_spec" >/dev/null 2>&1; then
      echo "WARN: cannot access $remote_spec (check credentials/tenant_id), skipping"
      continue
    fi

    echo "==> Uploading ping.txt to $remote_spec"
    rclone copyto "$tmp_ping/ping.txt" "${remote_spec}/ping.txt" \
      --header-upload "Content-Type: text/plain; charset=utf-8" \
      --header-upload "Cache-Control: no-store"

    for item in "${entries[@]}"; do
      local src="${item%%|*}"
      local dst="${item##*|}"
      if [[ -f "$src" ]]; then
        echo "==> Syncing $dst -> ${remote_spec}/releases/${dst}"
        rclone copyto "$src" "${remote_spec}/releases/${dst}" \
          --s3-no-check-bucket \
          --s3-chunk-size 16M \
          --s3-upload-concurrency 4 \
          --header-upload "Cache-Control: public, max-age=31536000, immutable" \
          --stats-log-level NOTICE --stats 30s --stats-one-line
      else
        echo "WARN: missing source file, skipping: $src"
      fi
    done
  done
}

sync_site() {
  if ! rclone listremotes | grep -qx "yandex:"; then
    echo "ERROR: remote 'yandex' not configured in rclone. Run ./scripts/setup-rclone.sh" >&2
    exit 1
  fi

  echo "==> Building static site..."
  (cd "$ROOT" && npm run build)

  echo "==> Syncing dist/ -> yandex:${YANDEX_BUCKET}"
  rclone sync "$ROOT/dist" "yandex:${YANDEX_BUCKET}" \
    --exclude "index.html" \
    --header-upload "Cache-Control: public, max-age=31536000, immutable" \
    --transfers 8 \
    --fast-list \
    --stats-one-line

  rclone copyto "$ROOT/dist/index.html" "yandex:${YANDEX_BUCKET}/index.html" \
    --header-upload "Content-Type: text/html; charset=utf-8" \
    --header-upload "Cache-Control: public, max-age=0, must-revalidate"

  echo "==> Done! Site synced to yandex:${YANDEX_BUCKET}"
}

if [[ $DO_FILES -eq 1 ]]; then sync_files; fi
if [[ $DO_SITE -eq 1 ]]; then sync_site; fi
