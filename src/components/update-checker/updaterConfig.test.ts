// Standalone assert check (no JS unit-test runner in this repo). Run with:
//   bun src/components/update-checker/updaterConfig.test.ts
import assert from "node:assert";
import { readFileSync } from "node:fs";

const read = (rel: string) =>
  readFileSync(new URL(rel, import.meta.url), "utf8");

// 1. Updater endpoint is the fork's, and only the fork's.
const conf = JSON.parse(read("../../../src-tauri/tauri.conf.json"));
assert.deepEqual(conf.plugins.updater.endpoints, [
  "https://github.com/masnun-siam/typevocal/releases/latest/download/latest.json",
]);
assert.ok(!JSON.stringify(conf.plugins.updater).includes("cjpais"));

// 2. Release builds fail fast when the updater signing key is missing.
const yml = read("../../../.github/workflows/build.yml");
const guard = yml.indexOf("- name: Require updater signing key");
const build = yml.indexOf("- name: Build with Tauri");
assert.ok(guard !== -1, "missing 'Require updater signing key' step");
assert.ok(guard < build, "guard must precede the Tauri build step");
const step = yml.slice(guard, build);
assert.match(step, /if: inputs\.sign-binaries/);
assert.ok(
  step.includes("::error::TAURI_SIGNING_PRIVATE_KEY secret is not set"),
);

console.log("updaterConfig checks passed");
