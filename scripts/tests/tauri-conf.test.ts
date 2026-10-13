import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const conf = JSON.parse(
  readFileSync(`${root}src-tauri/tauri.conf.json`, "utf8"),
);

// FR-3: app identity
assert.equal(conf.productName, "TypeVocal");
assert.equal(conf.identifier, "com.masnunsiam.typevocal");
const { deb, rpm } = conf.bundle.linux;
assert.deepEqual(Object.keys(deb.files), ["/usr/lib/TypeVocal"]);
assert.deepEqual(Object.keys(rpm.files), ["/usr/lib/TypeVocal"]);

// FR-6: unsigned Windows build, no upstream signing account
assert.ok(
  !("signCommand" in (conf.bundle.windows ?? {})),
  "signCommand present",
);

// FR-4: updater points at this repo with a visible placeholder key
const { updater } = conf.plugins;
assert.deepEqual(updater.endpoints, [
  "https://github.com/masnun-siam/typevocal/releases/latest/download/latest.json",
]);
assert.equal(updater.pubkey, "REPLACE_WITH_TYPEVOCAL_MINISIGN_PUBLIC_KEY");

console.log("tauri-conf: all assertions passed");
