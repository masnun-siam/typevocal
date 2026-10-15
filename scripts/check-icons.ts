// Guards FR-10: icons are regenerated from the TypeVocal mark, none is Handy artwork.
// Usage: bun scripts/check-icons.ts [icons-dir]   (default: src-tauri/icons)
import assert from "node:assert";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS =
  process.argv[2] ?? path.join(__dirname, "..", "src-tauri", "icons");

// [file, width, height] — dimensions of the icon set as shipped on main.
const PNGS: [string, number, number][] = [
  ["128x128.png", 128, 128],
  ["128x128@2x.png", 256, 256],
  ["32x32.png", 32, 32],
  ["64x64.png", 64, 64],
  ["Square107x107Logo.png", 107, 107],
  ["Square142x142Logo.png", 142, 142],
  ["Square150x150Logo.png", 150, 150],
  ["Square284x284Logo.png", 284, 284],
  ["Square30x30Logo.png", 30, 30],
  ["Square310x310Logo.png", 310, 310],
  ["Square44x44Logo.png", 44, 44],
  ["Square71x71Logo.png", 71, 71],
  ["Square89x89Logo.png", 89, 89],
  ["StoreLogo.png", 50, 50],
  ["android/mipmap-hdpi/ic_launcher.png", 49, 49],
  ["android/mipmap-hdpi/ic_launcher_foreground.png", 162, 162],
  ["android/mipmap-hdpi/ic_launcher_round.png", 49, 49],
  ["android/mipmap-mdpi/ic_launcher.png", 48, 48],
  ["android/mipmap-mdpi/ic_launcher_foreground.png", 108, 108],
  ["android/mipmap-mdpi/ic_launcher_round.png", 48, 48],
  ["android/mipmap-xhdpi/ic_launcher.png", 96, 96],
  ["android/mipmap-xhdpi/ic_launcher_foreground.png", 216, 216],
  ["android/mipmap-xhdpi/ic_launcher_round.png", 96, 96],
  ["android/mipmap-xxhdpi/ic_launcher.png", 144, 144],
  ["android/mipmap-xxhdpi/ic_launcher_foreground.png", 324, 324],
  ["android/mipmap-xxhdpi/ic_launcher_round.png", 144, 144],
  ["android/mipmap-xxxhdpi/ic_launcher.png", 192, 192],
  ["android/mipmap-xxxhdpi/ic_launcher_foreground.png", 432, 432],
  ["android/mipmap-xxxhdpi/ic_launcher_round.png", 192, 192],
  ["icon.png", 512, 512],
  ["ios/AppIcon-20x20@1x.png", 20, 20],
  ["ios/AppIcon-20x20@2x-1.png", 40, 40],
  ["ios/AppIcon-20x20@2x.png", 40, 40],
  ["ios/AppIcon-20x20@3x.png", 60, 60],
  ["ios/AppIcon-29x29@1x.png", 29, 29],
  ["ios/AppIcon-29x29@2x-1.png", 58, 58],
  ["ios/AppIcon-29x29@2x.png", 58, 58],
  ["ios/AppIcon-29x29@3x.png", 87, 87],
  ["ios/AppIcon-40x40@1x.png", 40, 40],
  ["ios/AppIcon-40x40@2x-1.png", 80, 80],
  ["ios/AppIcon-40x40@2x.png", 80, 80],
  ["ios/AppIcon-40x40@3x.png", 120, 120],
  ["ios/AppIcon-512@2x.png", 1024, 1024],
  ["ios/AppIcon-60x60@2x.png", 120, 120],
  ["ios/AppIcon-60x60@3x.png", 180, 180],
  ["ios/AppIcon-76x76@1x.png", 76, 76],
  ["ios/AppIcon-76x76@2x.png", 152, 152],
  ["ios/AppIcon-83.5x83.5@2x.png", 167, 167],
];

// Non-PNG files: existence only.
const OTHER = [
  "icon.icns",
  "icon.ico",
  "android/mipmap-anydpi-v26/ic_launcher.xml",
  "android/values/ic_launcher_background.xml",
];

// sha256 prefixes of the pre-rebrand Handy icon.png, icon.icns, icon.ico, 128x128.png, 128x128@2x.png.
const HANDY_HASHES = new Set([
  "a65e70aa93eea4ee",
  "9a6709dfaf4d07af",
  "ce77779a3465eb9a",
  "d652772271988903",
  "f89ef38a54a2870f",
]);

const sha = (file: string) =>
  createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 16);

function pngSize(file: string): [number, number] {
  const b = fs.readFileSync(file); // IHDR: width @16, height @20
  assert.strictEqual(b.subarray(1, 4).toString(), "PNG", `${file}: not a PNG`);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

for (const [name, w, h] of PNGS) {
  const file = path.join(ICONS, name);
  assert.ok(fs.existsSync(file), `missing icon: ${name}`);
  assert.deepStrictEqual(pngSize(file), [w, h], `${name}: expected ${w}x${h}`);
}

for (const name of OTHER) {
  assert.ok(fs.existsSync(path.join(ICONS, name)), `missing icon: ${name}`);
}

for (const name of [...PNGS.map((p) => p[0]), ...OTHER]) {
  assert.ok(
    !HANDY_HASHES.has(sha(path.join(ICONS, name))),
    `${name}: still the old Handy artwork`,
  );
}

const walk = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [e.name],
    );
const handy = walk(ICONS).filter((n) => /handy/i.test(n));
assert.deepStrictEqual(handy, [], `icon files named for Handy: ${handy}`);

console.log(`icons OK: ${PNGS.length} PNGs + ${OTHER.length} other files`);
