import assert from "node:assert";
import { test } from "node:test";
import { MatchPatternSet } from "./match-pattern.ts";

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
test("MDN Match Patterns", () => {
  const set = MatchPatternSet.new<number>();
  set.add("<all_urls>", 0);
  set.add("*://*/*", 1);
  set.add("*://*.mozilla.org/*", 2);
  set.add("*://mozilla.org/", 3);
  assert.throws(() => set.add("ftp://mozilla.org/", 4));
  set.add("https://*/path", 5);
  set.add("https://*/path/", 6);
  set.add("https://mozilla.org/*", 7);
  set.add("https://mozilla.org/a/b/c/", 8);
  set.add("https://mozilla.org/*/b/*/", 9);
  assert.throws(() => set.add("file:///blah/*", 10));

  const exec = (url: string) => set.exec(url).sort();
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
  assert.throws(() => set.add("resource://path/", 11));
  assert.throws(() => set.add("https://mozilla.org", 12));
  assert.throws(() => set.add("https://mozilla.*.org/", 13));
  assert.throws(() => set.add("https://*zilla.org", 14));
  assert.throws(() => set.add("http*://mozilla.org/", 15));
  assert.throws(() => set.add("https://mozilla.org:80/", 16));
  assert.throws(() => set.add("*//*", 17));
  assert.throws(() => set.add("file://*", 18));
});

test("Serialization", () => {
  let set = MatchPatternSet.new<number>();
  set.add("<all_urls>", 0);
  set.add("*://*/*", 1);
  set.add("*://*.mozilla.org/*", 2);
  set.add("*://mozilla.org/", 3);
  // assert.throws(() => set.add("ftp://mozilla.org/", 4));
  set.add("https://*/path", 5);
  set.add("https://*/path/", 6);
  set.add("https://mozilla.org/*", 7);
  set.add("https://mozilla.org/a/b/c/", 8);
  set.add("https://mozilla.org/*/b/*/", 9);
  // assert.throws(() => set.add("file:///blah/*", 10));
  const json = set.toJSON();
  assert.strictEqual(
    json,
    '[[],[[0],[1],[5,"https","/path"],[6,"https","/path/"]],{"org":[[],[],{"mozilla":[[[3,"*","/"],[7,"https"],[8,"https","/a/b/c/"],[9,"https","/*/b/*/"]],[[2]]]}]}]',
  );

  set = MatchPatternSet.unsafeFromJSON(json);
  const exec = (url: string) => set.exec(url).sort();
  assert.deepStrictEqual(exec("http://mozilla.org/"), [0, 1, 2, 3]);
  assert.deepStrictEqual(exec("https://mozilla.org/"), [0, 1, 2, 3, 7]);
  assert.deepStrictEqual(exec("http://a.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("http://a.b.mozilla.org/"), [0, 1, 2]);
  assert.deepStrictEqual(exec("https://b.mozilla.org/path/"), [0, 1, 2, 6]);
});
