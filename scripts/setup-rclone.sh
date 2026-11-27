#!/usr/bin/env bash
# Read S3 credentials from ~/.parhelio-keys.env (chmod 600, never in git)
# and configure rclone remotes: cloudru, yandex, r2.
# Optionally pass --gh-secrets to push Yandex deploy keys to GitHub Actions.
set -euo pipefail

export PATH="/opt/homebrew/bin:$HOME/yandex-cloud/bin:$PATH"

SECRETS_FILE="${SECRETS_FILE:-$HOME/.parhelio-keys.env}"
RCLONE_CONF="${XDG_CONFIG_HOME:-$HOME/.config}/rclone/rclone.conf"
PUSH_GH=0
[[ "${1:-}" == "--gh-secrets" ]] && PUSH_GH=1

if [[ ! -f "$SECRETS_FILE" ]]; then
  cat > "$SECRETS_FILE" <<'EOF'
# Local S3 credentials for Parhelio (chmod 600, stays only on this Mac)
# Fill in the keys you have, save, then run: ./scripts/setup-rclone.sh

# 1. Cloud.ru Evolution Object Storage (parhelio-ru-storage)
CLOUDRU_ACCESS_KEY_ID=""
CLOUDRU_SECRET_ACCESS_KEY=""

# 2. Yandex Object Storage (parhelio.ru static site)
YC_ACCESS_KEY_ID=""
YC_SECRET_ACCESS_KEY=""

# 3. Cloudflare R2 (parhelio-wstorage)
R2_ACCOUNT_ID="170f7b789cae451eb58d15c3151742d8"
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
EOF
  chmod 600 "$SECRETS_FILE"
  echo "Created template: $SECRETS_FILE (chmod 600)"
  echo "Fill in your keys and re-run ./scripts/setup-rclone.sh"
  exit 0
fi

# shellcheck disable=SC1090
set -a
source "$SECRETS_FILE"
set +a

mkdir -p "$(dirname "$RCLONE_CONF")"
touch "$RCLONE_CONF"
chmod 600 "$RCLONE_CONF"

# Remove old sections if re-running, then append fresh ones
python3 - "$RCLONE_CONF" <<'PY'
import configparser, os, sys
path = sys.argv[1]
cfg = configparser.ConfigParser()
cfg.read(path)

def set_s3(name, ak, sk, endpoint, region, provider="Other", force_path_style=False):
    if not ak or not sk:
        return False
    section = {
        "type": "s3",
        "provider": provider,
        "access_key_id": ak,
        "secret_access_key": sk,
        "endpoint": endpoint,
        "region": region,
        "acl": "private",
        "no_check_bucket": "true",
    }
    if force_path_style:
        section["force_path_style"] = "true"
    cfg[name] = section
    return True

configured = []
cr_ak = os.environ.get("CLOUDRU_ACCESS_KEY_ID", "").strip()
cr_tenant = os.environ.get("CLOUDRU_TENANT_ID", "").strip()
if cr_ak and cr_tenant and ":" not in cr_ak:
    cr_ak = f"{cr_tenant}:{cr_ak}"
if set_s3("cloudru", cr_ak, os.environ.get("CLOUDRU_SECRET_ACCESS_KEY", "").strip(), "https://s3.cloud.ru", "ru-central-1", force_path_style=True):
    configured.append("cloudru")
if set_s3("yandex", os.environ.get("YC_ACCESS_KEY_ID", "").strip(), os.environ.get("YC_SECRET_ACCESS_KEY", "").strip(), "https://storage.yandexcloud.net", "ru-central1"):
    configured.append("yandex")
r2_acc = os.environ.get("R2_ACCOUNT_ID", "170f7b789cae451eb58d15c3151742d8").strip()
if set_s3("r2", os.environ.get("R2_ACCESS_KEY_ID", "").strip(), os.environ.get("R2_SECRET_ACCESS_KEY", "").strip(), f"https://{r2_acc}.r2.cloudflarestorage.com", "auto", provider="Cloudflare"):
    configured.append("r2")

with open(path, "w") as f:
    cfg.write(f)
os.chmod(path, 0o600)
print("Configured rclone remotes:", ", ".join(configured) if configured else "(none - fill keys in ~/.parhelio-keys.env)")
PY

if [[ $PUSH_GH -eq 1 && -n "${YC_ACCESS_KEY_ID:-}" && -n "${YC_SECRET_ACCESS_KEY:-}" ]]; then
  gh secret set YC_ACCESS_KEY_ID --repo Nikita56792/land --body "$YC_ACCESS_KEY_ID"
  gh secret set YC_SECRET_ACCESS_KEY --repo Nikita56792/land --body "$YC_SECRET_ACCESS_KEY"
  echo "Updated GitHub Actions secrets for Nikita56792/land"
fi
