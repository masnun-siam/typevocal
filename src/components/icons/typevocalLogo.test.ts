import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TypeVocalMark from "./TypeVocalMark";
import TypeVocalWordmark from "./TypeVocalWordmark";

// Issue #59: TypeVocal mark (decorative) and wordmark (accessible name).
const render = (c: unknown, props: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(c as never, props as never));

// Wordmark exposes the accessible name "TypeVocal"
const wordmark = render(TypeVocalWordmark);
assert.match(wordmark, /role="img"/);
assert.match(wordmark, /aria-label="TypeVocal"/);

// Wordmark accepts width and className
const sized = render(TypeVocalWordmark, { width: 200, className: "w-test" });
assert.match(sized, /<svg[^>]*width="200"/);
assert.match(sized, /<svg[^>]*class="w-test"/);

// Mark is hidden from assistive tech
const mark = render(TypeVocalMark);
assert.match(mark, /aria-hidden="true"/);
assert.doesNotMatch(mark, /role="img"|aria-label/);

// Mark accepts the props HandyHand did (width, height) plus className
const markSized = render(TypeVocalMark, {
  width: 40,
  height: 50,
  className: "m-test",
});
assert.match(markSized, /<svg[^>]*width="40"/);
assert.match(markSized, /<svg[^>]*height="50"/);
assert.match(markSized, /<svg[^>]*class="m-test"/);
