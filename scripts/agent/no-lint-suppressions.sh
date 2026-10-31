#!/usr/bin/env bash
# Fails when added lines introduce a lint or type-check suppression.
#   no args:   check staged changes (pre-commit)
#   <range>:   check a commit range, e.g. origin/main...HEAD (CI)
set -u

pattern='eslint-disable|@ts-ignore|@ts-nocheck|@ts-expect-error|prettier-ignore|#!?\[allow\(|rustfmt::skip'

if [ $# -gt 0 ]; then
  diff=$(git diff --unified=0 "$1" -- src src-tauri scripts tests ':!scripts/agent')
else
  diff=$(git diff --cached --unified=0 -- src src-tauri scripts tests ':!scripts/agent')
fi

hits=$(printf '%s\n' "$diff" | grep -E '^\+[^+]' | grep -E "$pattern" || true)
if [ -n "$hits" ]; then
  echo "Lint or type suppressions are not allowed. Fix the cause instead:"
  echo "$hits"
  exit 1
fi
exit 0
