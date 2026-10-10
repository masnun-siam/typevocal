#!/usr/bin/env bash
# Asserts CI release asset prefixes are typevocal (issue #4).
cd "$(dirname "$0")" || exit 1
fail=0
chk() { grep -qF "asset-prefix: \"$2\"" "$1" || { echo "FAIL $1: expected $2"; fail=1; }; }
chk release.yml 'typevocal'
chk build-test.yml 'typevocal-test'
chk pr-test-build.yml 'typevocal-pr-${{ inputs.pr_number }}'
if grep -i handy release.yml build-test.yml pr-test-build.yml; then echo "FAIL: handy found"; fail=1; fi
exit $fail
