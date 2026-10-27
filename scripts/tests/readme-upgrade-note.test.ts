import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const readme = readFileSync(`${root}README.md`, "utf8");

const start = readme.indexOf("If you used Handy before:");
assert.ok(start >= 0, "README has the 'If you used Handy before:' section");
const end = readme.indexOf("\n## ", start);
const section = readme.slice(start, end === -1 ? undefined : end);

// One distinctive phrase per FR-13 item.
const items: [string, RegExp][] = [
  ["separate fresh install", /manual fresh install.*earlier TypeVocal builds/s],
  ["no data carry-over", /No data carries over/],
  [
    "shared Hugging Face cache",
    /shared Hugging Face cache.*deleting one in either app removes it for all/s,
  ],
  [
    "macOS permissions and ad-hoc signing",
    /re-granted.*ad-hoc signed.*Gatekeeper.*reset after every update/s,
  ],
  [
    "shared global shortcut",
    /same shortcut.*quit Handy or change one app's shortcut/s,
  ],
  ["old login item", /login item.*by hand/s],
  [
    "env var rename",
    /`HANDY_\*`.*`TYPEVOCAL_\*`.*old names are ignored.*`HANDY_DISABLE_UPDATER`/s,
  ],
];

for (const [name, phrase] of items) {
  assert.match(section, phrase, name);
}

console.log("readme-upgrade-note: all assertions passed");
