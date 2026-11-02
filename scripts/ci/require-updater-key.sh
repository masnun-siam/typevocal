#!/usr/bin/env bash
#
# Fail fast when a release would ship without TypeVocal's own updater key.
#
# Requires:
#   - TAURI_SIGNING_PRIVATE_KEY to be set (the minisign private key secret)
#   - plugins.updater.pubkey in the tauri config to be neither the TypeVocal
#     placeholder nor upstream Handy's key
#
# Usage: require-updater-key.sh [tauri-conf.json]   (default: src-tauri/tauri.conf.json)

set -euo pipefail

conf="${1:-src-tauri/tauri.conf.json}"
placeholder="REPLACE_WITH_TYPEVOCAL_MINISIGN_PUBLIC_KEY"
upstream="dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEJBQjcyMDk1MjA2NjAxRjkK"

if [ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]; then
  echo "error: secret TAURI_SIGNING_PRIVATE_KEY is not set; releases must be signed with TypeVocal's minisign key" >&2
  exit 1
fi

pubkey=$(grep -o '"pubkey": *"[^"]*"' "$conf" | head -n1 | cut -d'"' -f4)

if [ -z "$pubkey" ] || [ "$pubkey" = "$placeholder" ] || [[ "$pubkey" == "$upstream"* ]]; then
  echo "error: plugins.updater.pubkey in $conf is missing, the placeholder, or upstream Handy's key; set TypeVocal's minisign public key" >&2
  exit 1
fi

echo "Updater key check passed."
