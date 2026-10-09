import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "bun:test";

const notesDir = "src/content/release-notes";
const files = [
  "index.html",
  "package.json",
  ...readdirSync(notesDir).map((f) => `${notesDir}/${f}`),
];
const stripAllowed = (text: string) => text.replaceAll("handy-computer", "");

test("index.html title is TypeVocal", () => {
  assert.match(readFileSync("index.html", "utf8"), /<title>TypeVocal<\/title>/);
});

test("package.json is renamed and version is unchanged", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.name, "typevocal-app");
  assert.equal(pkg.version, "0.9.8");
});

test("no Handy mentions outside the handy-computer allowlist", () => {
  for (const file of files) {
    assert.doesNotMatch(
      stripAllowed(readFileSync(file, "utf8")),
      /handy/i,
      file,
    );
  }
});
