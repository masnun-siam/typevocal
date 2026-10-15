import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const locales = ["ar", "bg", "ca", "cs", "da", "de"];

const collect = (node: unknown, path: string, out: [string, string][]) => {
  if (typeof node === "string") {
    out.push([path, node]);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      collect(value, path ? `${path}.${key}` : key, out);
    }
  }
};

for (const locale of locales) {
  const file = fileURLToPath(
    new URL(`./${locale}/translation.json`, import.meta.url),
  );
  const values: [string, string][] = [];
  collect(JSON.parse(readFileSync(file, "utf8")), "", values);
  for (const [path, value] of values) {
    assert.doesNotMatch(value, /handy/i, `${locale}: ${path}`);
  }
}

console.log("rebrandLocales: all assertions passed");
