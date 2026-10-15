import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Issue #65: ModelsSettings comment and Playwright suite name say TypeVocal.
// Named *.check.ts so Playwright's testMatch (*.spec|test.ts) does not pick it up; run with `bun`.
const root = fileURLToPath(new URL("..", import.meta.url));
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const models = read("src/components/settings/models/ModelsSettings.tsx");
assert.doesNotMatch(models, /handy/i);
assert.ok(models.includes("models added outside TypeVocal"));

const spec = read("tests/app.spec.ts");
assert.doesNotMatch(spec, /handy/i);
assert.ok(spec.includes('test.describe("TypeVocal App"'));
