import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const notesDir = "src/content/release-notes";
const files = [
  "index.html",
  "package.json",
  ...readdirSync(notesDir).map((f) => `${notesDir}/${f}`),
];

assert.match(readFileSync("index.html", "utf8"), /<title>TypeVocal<\/title>/);

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(pkg.name, "typevocal-app");
assert.equal(pkg.version, "0.9.8");

for (const file of files) {
  const text = readFileSync(file, "utf8").replace(/handy-computer/g, "");
  assert.doesNotMatch(text, /handy/i, file);
}

console.log("rebrand: all assertions passed");
