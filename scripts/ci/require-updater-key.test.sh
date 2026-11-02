#!/usr/bin/env bash
# Checks for require-updater-key.sh. Run: bash scripts/ci/require-updater-key.test.sh
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail=0

conf() { printf '{"plugins":{"updater":{"pubkey": "%s","endpoints":[]}}}' "$1" > "$tmp/c.json"; }
check() { # name expected-exit secret pubkey
  conf "$4"
  TAURI_SIGNING_PRIVATE_KEY="$3" bash "$here/require-updater-key.sh" "$tmp/c.json" >/dev/null 2>&1
  [ $? -eq "$2" ] || { echo "FAIL: $1"; fail=1; }
}

check "secret unset" 1 "" "bXktcmVhbC1rZXk="
check "placeholder pubkey" 1 "k" "REPLACE_WITH_TYPEVOCAL_MINISIGN_PUBLIC_KEY"
check "upstream pubkey" 1 "k" "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEJBQjcyMDk1MjA2NjAxRjkKQUJD"
check "secret and real pubkey" 0 "k" "bXktcmVhbC1rZXk="
exit $fail
