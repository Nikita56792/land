#!/usr/bin/env bash
# Copy local installers and Wii U builds into ./downloads for Docker nginx serving.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DL="$ROOT/downloads"
mkdir -p "$DL"

copy_if_exists() {
  local src="$1"
  local dst="$2"
  if [[ -f "$src" ]]; then
    cp -f "$src" "$DL/$dst"
    echo "staged: $dst"
  else
    echo "skip (not found): $src"
  fi
}

copy_if_exists "/Users/nikitasyzdykov/Kraken Disk/Desktop/what-to-do/realgame/app/build/Epidaurus-0.2.0.dmg" "Epidaurus-0.2.0.dmg"
copy_if_exists "/Users/nikitasyzdykov/Kraken Disk/Desktop/kraken/dist/Kraken-0.4.0.pkg" "Kraken-0.4.0.pkg"
copy_if_exists "/Users/nikitasyzdykov/Kraken Disk/Desktop/real3d/checkpoints/Real3D-1.2.0.dmg" "Real3D-1.2.0.dmg"
copy_if_exists "/Users/nikitasyzdykov/Downloads/mcwiiu-reconstructed-main/build/wiiu/Minecraft.WiiU-DualScreenUI.wuhb" "Minecraft.WiiU-DualScreenUI.wuhb"

ls -lh "$DL"
