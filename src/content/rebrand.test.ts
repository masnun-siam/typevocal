import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (rel: string) => readFileSync(`${root}${rel}`, "utf8");

const notesDir = "src/content/release-notes";
const files = [
  "index.html",
  "package.json",
  ...readdirSync(`${root}${notesDir}`).map((f) => `${notesDir}/${f}`),
];

assert.match(read("index.html"), /<title>TypeVocal<\/title>/);

const pkg = JSON.parse(read("package.json"));
assert.equal(pkg.name, "typevocal-app");

for (const file of files) {
  const text = read(file).replace(/handy-computer/g, "");
  assert.doesNotMatch(text, /handy/i, file);
}

console.log("rebrand: all assertions passed");
