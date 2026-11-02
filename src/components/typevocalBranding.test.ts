import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Issue #60: sidebar and onboarding use the TypeVocal logo, not the Handy one.
const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const sidebar = read("src/components/Sidebar.tsx");
const onboarding = read("src/components/onboarding/Onboarding.tsx");
const a11y = read("src/components/onboarding/AccessibilityOnboarding.tsx");

// AC1: all three render the wordmark
for (const [name, src] of [
  ["Sidebar", sidebar],
  ["Onboarding", onboarding],
  ["AccessibilityOnboarding", a11y],
] as const) {
  assert.match(
    src,
    /import TypeVocalWordmark from "[^"]*icons\/TypeVocalWordmark"/,
    `${name} imports wordmark`,
  );
  assert.match(src, /<TypeVocalWordmark\b/, `${name} renders wordmark`);
}

// AC1: sidebar nav icon is the mark
assert.match(sidebar, /import TypeVocalMark from "[^"]*icons\/TypeVocalMark"/);
assert.match(sidebar, /icon:\s*TypeVocalMark\b/);

// AC2: no Handy logo imports left in the three files
for (const src of [sidebar, onboarding, a11y]) {
  assert.doesNotMatch(src, /HandyHand|HandyTextLogo/);
}
