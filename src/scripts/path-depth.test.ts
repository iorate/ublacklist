import assert from "node:assert";
import { test } from "node:test";
import { PathDepth } from "./path-depth.ts";
import { AltURL } from "./utilities.ts";

test("PathDepth", () => {
  const pd1 = new PathDepth(new AltURL("http://www.example.com/foo/bar/baz"));
  assert.strictEqual(pd1.maxDepth(), 2);
  assert.strictEqual(
    pd1.suggestMatchPattern(1, false),
    "*://www.example.com/foo/*",
  );
  assert.strictEqual(
    pd1.suggestMatchPattern(2, true),
    "@*://www.example.com/foo/bar/*",
  );
  assert.throws(() => pd1.suggestMatchPattern(3, false));

  const pd2 = new PathDepth(new AltURL("https://www.example.com/"));
  assert.strictEqual(pd2.maxDepth(), 0);
  assert.strictEqual(
    pd2.suggestMatchPattern(0, false),
    "*://www.example.com/*",
  );
  assert.throws(() => pd2.suggestMatchPattern(-1, true));

  const pd3 = new PathDepth(new AltURL("ftp://www.example.com/foo/?bar=baz"));
  assert.strictEqual(pd3.maxDepth(), 1);
  assert.strictEqual(
    pd3.suggestMatchPattern(1, false),
    "ftp://www.example.com/foo/*",
  );
});
