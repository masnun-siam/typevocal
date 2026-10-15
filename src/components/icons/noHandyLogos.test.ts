import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Issue #61: the old Handy logo components are deleted.
for (const name of ["HandyHand.tsx", "HandyTextLogo.tsx"]) {
  assert.equal(
    existsSync(fileURLToPath(new URL(name, import.meta.url))),
    false,
    `${name} must not exist`,
  );
}
