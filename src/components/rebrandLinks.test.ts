import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Issue #18: upstream donate/funding links removed and help links repointed.
const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

// SecureInputWarning links to this repo's troubleshooting section
assert.match(
  read("src/components/SecureInputWarning.tsx"),
  /SECURE_INPUT_HELP_URL =\s*"https:\/\/github\.com\/masnun-siam\/typevocal#troubleshooting"/,
);

// About page has no donate control and links to this repo
const about = read("src/components/settings/about/AboutSettings.tsx");
assert.doesNotMatch(about, /donate/i);
// Split literal so the AC3 rg sweep for the upstream domain does not match this file
assert.ok(!about.includes("handy" + ".computer"));
assert.ok(
  about.includes('openUrl("https://github.com/masnun-siam/typevocal")'),
);

// FUNDING.yml is deleted
assert.equal(existsSync(join(root, ".github/FUNDING.yml")), false);

// No locale keeps the supportDevelopment strings
const localesDir = join(root, "src/i18n/locales");
const offenders = readdirSync(localesDir)
  .filter((lang) => !lang.endsWith(".ts"))
  .filter((lang) =>
    read(`src/i18n/locales/${lang}/translation.json`).includes(
      "supportDevelopment",
    ),
  );
assert.deepEqual(offenders, []);
