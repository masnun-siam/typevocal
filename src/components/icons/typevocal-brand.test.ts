// Run: bun src/components/icons/typevocal-brand.test.ts (throws on failure)
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const mark = read("./TypeVocalMark.tsx");
const logo = read("./TypeVocalTextLogo.tsx");
const sidebar = read("../Sidebar.tsx");
const master = read("../../../src-tauri/icons/typevocal.svg");

// Mark: same geometry as master SVG
assert.match(mark, /viewBox="0 0 1024 1024"/);
assert.match(mark, /#4F46E5/);
assert.match(mark, /#FBBF24/);
for (const n of master.match(/(?:x1|y1|x2|y2)="\d+"/g) ?? []) {
  assert.ok(mark.includes(n), `mark missing ${n}`);
}
assert.match(mark, /width\??: number \| string/);
assert.match(mark, /height\??: number \| string/);
assert.match(mark, /export default/);

// Text logo: wordmark with accessible name and the old logo's props
assert.match(logo, /BRAND = "TypeVocal"/);
assert.match(logo, /\{BRAND\}\s*<\/text>/);
assert.match(logo, /aria-label=\{BRAND\}|<title>/);
assert.match(logo, /className/);
assert.match(logo, /export default/);

// Sidebar swapped
assert.match(sidebar, /TypeVocalMark/);
assert.match(sidebar, /TypeVocalTextLogo/);
assert.doesNotMatch(sidebar, /Handy(Hand|TextLogo)/);
