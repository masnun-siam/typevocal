import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const read = (rel: string) => readFileSync(`${root}${rel}`, "utf8");

// FR-8: the theme storage key is typevocal.theme, defined once and used by every reader.
const theme = read("src/lib/utils/theme.ts");
assert.match(
  theme,
  /export const THEME_STORAGE_KEY = "typevocal\.theme";/,
  "THEME_STORAGE_KEY must be typevocal.theme",
);
const storageCalls =
  theme.match(/localStorage\.(get|set|remove)Item\([^)]*\)/g) ?? [];
assert.ok(storageCalls.length > 0, "theme.ts must touch localStorage");
for (const call of storageCalls) {
  assert.match(
    call,
    /\(THEME_STORAGE_KEY\b/,
    `reader must use the constant: ${call}`,
  );
}

// FR-14: no leftover Handy naming in the theme/settings files.
for (const file of [
  "src/lib/utils/theme.ts",
  "src/styles/theme.css",
  "src/stores/settingsStore.ts",
]) {
  assert.doesNotMatch(read(file), /handy/i, file);
}

console.log("theme rebrand: all assertions passed");
