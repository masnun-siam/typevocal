// Run: bun src/components/onboarding/onboarding-logo.test.ts (throws on failure)
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const path = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));
const read = (rel: string) => readFileSync(path(rel), "utf8");

for (const f of ["./Onboarding.tsx", "./AccessibilityOnboarding.tsx"]) {
  const src = read(f);
  assert.match(
    src,
    /import TypeVocalTextLogo from "\.\.\/icons\/TypeVocalTextLogo"/,
    `${f} must import TypeVocalTextLogo`,
  );
  assert.match(src, /<TypeVocalTextLogo\b/, `${f} must render TypeVocalTextLogo`);
  assert.doesNotMatch(src, /Handy(Hand|TextLogo)/, `${f} still references Handy logo`);
}

for (const f of ["../icons/HandyHand.tsx", "../icons/HandyTextLogo.tsx"]) {
  assert.ok(!existsSync(path(f)), `${f} must be deleted`);
}

assert.doesNotMatch(read("../icons/index.ts"), /Handy(Hand|TextLogo)/);
