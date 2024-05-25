import assert from "node:assert";
import { test } from "node:test";
import { MatchPatternBatch } from "./match-pattern.ts";

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
test("MDN Match Patterns", () => {
  const batch = MatchPatternBatch.new<number>();
  batch.add("<all_urls>", 0);
  batch.add("*://*/*", 1);
  batch.add("*://*.mozilla.org/*", 2);
  batch.add("*://mozilla.org/", 3);
  assert.throws(() => batch.add("ftp://mozilla.org/", 4));
  batch.add("https://*/path", 5);
  batch.add("https://*/path/", 6);
  batch.add("https://mozilla.org/*", 7);
  batch.add("https://mozilla.org/a/b/c/", 8);
  batch.add("https://mozilla.org/*/b/*/", 9);
  assert.throws(() => batch.add("file:///blah/*", 10));

  const exec = (url: string) => batch.exec(url).sort();
  // <all_urls>
  assert.deepStrictEqual(exec("http://example.org/"), [0, 1]);
  assert.deepStrictEqual(exec("https://a.org/some/path/"), [0, 1]);
  assert.deepStrictEqual(exec("ws://sockets.somewhere.org/"), []);
  assert.deepStrictEqual(exec("wss://ws.example.com/stuff/"), []);
  assert.deepStrictEqual(exec("ftp://files.somewhere.org/"), []);
  assert.deepStrictEqual(exec("resource://a/b/c/"), []);
  assert.deepStrictEqual(exec("ftps://files.somewhere.org/"), []);
  // *://*/*
  assert.deepStrictEqual(exec("http://example.org/"), [0, 1]);
  assert.deepStrictEqual(exec("https://a.org/some/path/"), [0, 1]);
  assert.deepStrictEqual(exec("ws://sockets.somewhere.org/"), []);
  assert.deepStrictEqual(exec("wss://ws.example.com/stuff/"), []);
  assert.deepStrictEqual(exec("ftp://ftp.example.org/"), []);
  assert.deepStrictEqual(exec("file:///a/"), []);
  // *://*.mozilla.org/*
  assert.deepStrictEqual(exec("http://mozilla.org/"), [0, 1, 2, 3]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("http://a.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("http://a.b.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://b.mozilla.org/path/"), [0, 1, 2, 6]);
  assert.deepStrictEqual(exec("ws://ws.mozilla.org/"), []);
  assert.deepStrictEqual(exec("wss://secure.mozilla.org/something"), []);
  assert.deepStrictEqual(exec("ftp://mozilla.org/"), []);
  assert.deepStrictEqual(exec("http://mozilla.com/"), [0, 1]);
  assert.deepStrictEqual(exec("http://firefox.org/"), [0, 1]);
  // *://mozilla.org/
  assert.deepStrictEqual(exec("http://mozilla.org/"), [0, 1, 2, 3]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("ws://mozilla.org/"), []);
  assert.deepStrictEqual(exec("wss://mozilla.org/"), []);
  assert.deepStrictEqual(exec("ftp://mozilla.org/"), []);
  assert.deepStrictEqual(exec("http://a.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("http://mozilla.org/a"), [0, 1, 2]);
  // ftp://mozilla.org/
  assert.deepStrictEqual(exec("ftp://mozilla.org/"), []);
  assert.deepStrictEqual(exec("http://mozilla.org/"), [0, 1, 2, 3]);
  assert.deepStrictEqual(exec("ftp://sub.mozilla.org/"), []);
  assert.deepStrictEqual(exec("ftp://mozilla.org/path"), []);
  // https://*/path
  assert.deepStrictEqual(exec("https://mozilla.org/path"), [0, 1, 2, 5, 7]);
  assert.deepStrictEqual(exec("https://a.mozilla.org/path"), [0, 1, 2, 5]);
  assert.deepStrictEqual(exec("https://something.com/path"), [0, 1, 5]);
  assert.deepStrictEqual(exec("http://mozilla.org/path"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://mozilla.org/path/"), [0, 1, 2, 6, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/a"), [0, 1, 2, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/path?foo=1"), [0, 1, 2, 7]);
  // https://*/path/
  assert.deepStrictEqual(exec("http://mozilla.org/path/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://a.mozilla.org/path/"), [0, 1, 2, 6]);
  assert.deepStrictEqual(exec("https://something.com/path/"), [0, 1, 6]);
  assert.deepStrictEqual(exec("http://mozilla.org/path/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://mozilla.org/path"), [0, 1, 2, 5, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/a"), [0, 1, 2, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/path?foo=1"), [0, 1, 2, 7]);
  // https://mozilla.org/*
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/path"), [0, 1, 2, 5, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/another"), [0, 1, 2, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/path/to/doc"), [0, 1, 2, 7]);
  assert.deepStrictEqual(
    exec("https://mozilla.org/path/to/doc?foo=1"),
    [0, 1, 2, 7],
  );
  // https://mozilla.org/a/b/c/
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/"),
    [0, 1, 2, 7, 8, 9],
  );
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/#section1"),
    [0, 1, 2, 7, 8, 9],
  );
  // https://mozilla.org/*/b/*/
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/"),
    [0, 1, 2, 7, 8, 9],
  );
  assert.deepStrictEqual(exec("https://mozilla.org/d/b/f/"), [0, 1, 2, 7, 9]);
  assert.deepStrictEqual(exec("https://mozilla.org/a/b/c/d/"), [0, 1, 2, 7, 9]);
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/d/#section1"),
    [0, 1, 2, 7, 9],
  );
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/d/?foo=/"),
    [0, 1, 2, 7, 9],
  );
  assert.deepStrictEqual(
    exec("https://mozilla.org/a?foo=21314&bar=/b/&extra=c/"),
    [0, 1, 2, 7, 9],
  );
  assert.deepStrictEqual(exec("https://mozilla.org/b/*/"), [0, 1, 2, 7]);
  assert.deepStrictEqual(exec("https://mozilla.org/a/b/"), [0, 1, 2, 7]);
  assert.deepStrictEqual(
    exec("https://mozilla.org/a/b/c/d/?foo=bar"),
    [0, 1, 2, 7],
  );
  // file:///blah/*
  assert.deepStrictEqual(exec("file:///blah/"), []);
  assert.deepStrictEqual(exec("file:///blah/bleh"), []);
  assert.deepStrictEqual(exec("file:///bleh/"), []);

  // Invalid match patterns
  assert.throws(() => batch.add("resource://path/", 11));
  assert.throws(() => batch.add("https://mozilla.org", 12));
  assert.throws(() => batch.add("https://mozilla.*.org/", 13));
  assert.throws(() => batch.add("https://*zilla.org", 14));
  assert.throws(() => batch.add("http*://mozilla.org/", 15));
  assert.throws(() => batch.add("https://mozilla.org:80/", 16));
  assert.throws(() => batch.add("*//*", 17));
  assert.throws(() => batch.add("file://*", 18));
});

test("Serialization", () => {
  let batch = MatchPatternBatch.new<number>();
  batch.add("<all_urls>", 0);
  batch.add("*://*/*", 1);
  batch.add("*://*.mozilla.org/*", 2);
  batch.add("*://mozilla.org/", 3);
  // assert.throws(() => batch.add("ftp://mozilla.org/", 4));
  batch.add("https://*/path", 5);
  batch.add("https://*/path/", 6);
  batch.add("https://mozilla.org/*", 7);
  batch.add("https://mozilla.org/a/b/c/", 8);
  batch.add("https://mozilla.org/*/b/*/", 9);
  // assert.throws(() => batch.add("file:///blah/*", 10));
  const json = batch.toJSON();
  assert.strictEqual(
    json,
    '[[],[[0],[1],[5,"https","/path"],[6,"https","/path/"]],{"org":[[],[],{"mozilla":[[[3,"*","/"],[7,"https"],[8,"https","/a/b/c/"],[9,"https","/*/b/*/"]],[[2]]]}]}]',
  );

  batch = MatchPatternBatch.unsafeFromJSON(json);
  const exec = (url: string) => batch.exec(url).sort();
  assert.deepStrictEqual(exec("http://mozilla.org/"), [0, 1, 2, 3]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("http://a.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("http://a.b.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://b.mozilla.org/path/"), [0, 1, 2, 6]);
});
