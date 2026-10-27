#!/usr/bin/env bash
# Runs every bun assert script (*.test.ts, tests/*.check.ts); stops at the first failure.
set -eu
cd "$(git rev-parse --show-toplevel)"

for f in $(git ls-files '*.test.ts' 'tests/*.check.ts'); do
  echo "== $f"
  bun "$f"
done
