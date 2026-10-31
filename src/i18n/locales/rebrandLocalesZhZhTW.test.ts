import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));

const values = (node: unknown): string[] =>
  typeof node === "string"
    ? [node]
    : node && typeof node === "object"
      ? Object.values(node).flatMap(values)
      : [];

for (const lang of ["zh", "zh-TW"]) {
  const json = JSON.parse(
    readFileSync(`${root}${lang}/translation.json`, "utf8"),
  );
  for (const v of values(json)) {
    assert.doesNotMatch(v, /handy/i, `${lang}: ${v}`);
  }
}

console.log("rebrand locales: all assertions passed");
