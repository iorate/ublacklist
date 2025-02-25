import assert from "node:assert";
import { test } from "node:test";
import { type LinkProps, Ruleset, type TestRawResult } from "./ruleset.ts";

function testRaw(ruleset: Ruleset, props: LinkProps): TestRawResult {
  return ruleset
    .testRaw(props)
    .sort(({ lineNumber: a }, { lineNumber: b }) => a - b);
}

test("Ruleset", async (t) => {
  await t.test("Match patterns", () => {
    {
      const ruleset = new Ruleset("*://*/*");
      assert.ok(ruleset.test({ url: "https://example.com/" }));
      assert.ok(ruleset.test({ url: "https://a.org/some/path" }));
      assert.ok(!ruleset.test({ url: "ftp://ftp.example.org/" }));
      assert.ok(!ruleset.test({ url: "file:///a/" }));
    }
    {
      const ruleset = new Ruleset("*://*.mozilla.org/*");
      assert.ok(ruleset.test({ url: "http://mozilla.org/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(ruleset.test({ url: "http://a.mozilla.org" }));
      assert.ok(ruleset.test({ url: "https://a.b.mozilla.org" }));
      assert.ok(ruleset.test({ url: "https://b.mozilla.org/path" }));
      assert.ok(!ruleset.test({ url: "ftp://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.com/" }));
      assert.ok(!ruleset.test({ url: "http://firefox.org/" }));
    }
    {
      const ruleset = new Ruleset("*://mozilla.org/");
      assert.ok(ruleset.test({ url: "http://mozilla.org/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "ftp://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "http://a.mozilla.org" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.org/a" }));
    }
    {
      const ruleset = new Ruleset("ftp://mozilla.org"); // not supported
      assert.ok(!ruleset.test({ url: "ftp://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "ftp://sub.mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "ftp://mozilla.org/path" }));
    }
    {
      const ruleset = new Ruleset("https://*/path");
      assert.ok(ruleset.test({ url: "https://mozilla.org/path" }));
      assert.ok(ruleset.test({ url: "https://a.mozilla.org/path" }));
      assert.ok(ruleset.test({ url: "https://something.com/path" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.org/path" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/path/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/a" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/path?foo=1" }));
    }
    {
      const ruleset = new Ruleset("https://*/path/");
      assert.ok(ruleset.test({ url: "https://mozilla.org/path/" }));
      assert.ok(ruleset.test({ url: "https://a.mozilla.org/path/" }));
      assert.ok(ruleset.test({ url: "https://something.com/path/" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.org/path/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/path" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/a" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/path/?foo=1" }));
    }
    {
      const ruleset = new Ruleset("https://mozilla.org/*");
      assert.ok(ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/path" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/another" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/path/to/doc" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/path/to/doc?foo=1" }));
      assert.ok(!ruleset.test({ url: "http://mozilla.org/path" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.com/path" }));
    }
    {
      const ruleset = new Ruleset("https://mozilla.org/a/b/c/");
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/#section1" }));
    }
    {
      const ruleset = new Ruleset("https://mozilla.org/*/b/*/");
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/d/b/f/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/d/" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/d/#section1" }));
      assert.ok(ruleset.test({ url: "https://mozilla.org/a/b/c/d?foo=/" }));
      assert.ok(
        ruleset.test({
          url: "https://mozilla.org/a?foo=21314&bar=/b/&extra=c/",
        }),
      );
      assert.ok(!ruleset.test({ url: "https://mozilla.org/b/*/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/a/b/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.org/a/b/c/d/?foo=bar" }));
    }
    // Invalid match patterns
    {
      const ruleset = new Ruleset("https://mozilla.org");
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
    }
    {
      const ruleset = new Ruleset("https://mozilla.*.org/");
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
      assert.ok(!ruleset.test({ url: "https://mozilla.a.org/" }));
    }
    {
      const ruleset = new Ruleset("https://*zilla.org/");
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
    }
    {
      const ruleset = new Ruleset("http*://mozilla.org/");
      assert.ok(!ruleset.test({ url: "https://mozilla.org/" }));
    }
    {
      const ruleset = new Ruleset("https://mozilla.org:80/");
      assert.ok(!ruleset.test({ url: "https://mozilla.org:80/" }));
    }
    // Schemes and hosts are case-insensitive
    {
      const ruleset = new Ruleset("HTTPS://*.EXAMPLE.com/PATH/*");
      assert.ok(ruleset.test({ url: "https://example.com/PATH/" }));
      assert.ok(ruleset.test({ url: "HTTPS://WWW.EXAMPLE.COM/PATH/TO/DIR" }));
      assert.ok(!ruleset.test({ url: "https://example.com/path/" }));
    }
  });

  await t.test("Regular expressions (legacy)", () => {
    {
      const ruleset = new Ruleset(String.raw`/example\.(net|org)/`);
      assert.ok(ruleset.test({ url: "https://example.net/" }));
      assert.ok(ruleset.test({ url: "https://example.org/" }));
      assert.ok(ruleset.test({ url: "http://example.com/?query=example.net" }));
      assert.ok(!ruleset.test({ url: "ftp://example.net/" }));
      assert.ok(!ruleset.test({ url: "http://example.com/" }));
    }
    {
      const ruleset = new Ruleset(String.raw`url/example\.(net|org)/`);
      assert.ok(ruleset.test({ url: "https://example.net/" }));
      assert.ok(!ruleset.test({ url: "https://example.com/" }));
    }
    {
      const ruleset = new Ruleset("title/Example Domain/");
      assert.ok(
        ruleset.test({ url: "http://example.com", title: "Example Domain" }),
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com",
          title: "This Is An Example Domain",
        }),
      );
      assert.ok(!ruleset.test({ url: "http://example.com" }));
      assert.ok(
        !ruleset.test({ url: "http://example.com", title: "example domain" }),
      );
    }
    {
      const ruleset = new Ruleset("t/example domain/i");
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(!ruleset.test({ url: "http://example.com/" }));
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "example-domain" }),
      );
    }
    // https://iorate.github.io/ublacklist/advanced-features#regular-expressions
    {
      const ruleset = new Ruleset(String.raw`/https:\/\/www\.qinterest\./`);
      assert.ok(ruleset.test({ url: "https://www.qinterest.com/" }));
      assert.ok(ruleset.test({ url: "https://www.qinterest.jp/hoge" }));
      assert.ok(!ruleset.test({ url: "http://www.qinterest.com/" }));
      assert.ok(!ruleset.test({ url: "https://www.rinterest.com/" }));
    }
    {
      const ruleset = new Ruleset(String.raw`/https?:\/\/([^/.]+\.)*?xn--/`);
      assert.ok(ruleset.test({ url: "http://xn--fsq.xn--zckzah/" })); // http://例.テスト/
      assert.ok(!ruleset.test({ url: "http://example.test/" }));
    }
  });

  await t.test("Simple expressions", () => {
    {
      const ruleset = new Ruleset('title="Example Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('title = "Example Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title="example domain"i');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title = "example domain" I');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title^="Example"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(!ruleset.test({ url: "http://example.com/", title: "Domain" }));
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('title ^= "Example"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title^="Example"i');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title ^= "Example" I');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title$="Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "Example" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('title $= "Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('$domain$="Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", $domain: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title$="domain"i');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title $= "domain" I');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title*="ple Dom"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('title *= "ple Dom"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title*="PLE DOM"i');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('title *= "PLE DOM" I');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset("title=~/example/i");
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "Test Domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset("title =~ /example/i");
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    // String literals
    {
      const ruleset = new Ruleset(
        String.raw`title="foo bar \xA9 \u00A9 \u{2F804} \0 \b \f \n \r \t \v \a"`,
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          title: "foo bar \xA9 \u00A9 \u{2F804} \0 \b \f \n \r \t \v a",
        }),
      );
    }
    {
      const ruleset = new Ruleset(String.raw`title="foo bar \00"`);
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "foo bar \x000" }),
      );
    }
    {
      const ruleset = new Ruleset(String.raw`title="foo bar \xA"`);
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "foo bar \\xA" }),
      );
    }
    // Regular expression Literals
    // Escape sequence in class characters
    // https://github.com/iorate/ublacklist/issues/527
    {
      const ruleset = new Ruleset(String.raw`title=~/[\u3040-\u309F]/`);
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          title: "ひらがな",
        }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          title: "カタカナ",
        }),
      );
    }
    {
      const ruleset = new Ruleset(String.raw`title=~/[\u3040-\u309G]/`);
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          title: "ひらがな",
        }),
      );
    }
  });

  await t.test("Complex expressions", () => {
    {
      const ruleset = new Ruleset('(title="Example Domain")');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "example domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('( title = "Example Domain" )');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    {
      const ruleset = new Ruleset('!title="Example Domain"');
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('url*="example"&title="Example Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://something.com/",
          title: "Example Domain",
        }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset('url*="example"|title="Example Domain"');
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        ruleset.test({
          url: "http://something.com/",
          title: "Example Domain",
        }),
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          snippet: "Example Domain",
        }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://something.com/",
          snippet: "Example Domain",
        }),
      );
    }
    // Precedence
    {
      const ruleset = new Ruleset(
        'url *= "example" | title ^= "Example" & title $= "Domain"',
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "example domain" }),
      );
      assert.ok(
        ruleset.test({
          url: "http://something.com/",
          title: "Example Domain",
        }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://something.com/",
          snippet: "Example",
        }),
      );
    }
    // More complex expressions
    {
      const ruleset = new Ruleset(
        `a="1" & b^="2" | !(c$="3" & d*="4") | !!e=~/5/ & f=~/6/`,
      );
      assert.ok(ruleset.test({ url: "http://example.com/", a: "1", b: "20" }));
      assert.ok(ruleset.test({ url: "http://example.com/", a: "1", b: "3" }));
      assert.ok(
        !ruleset.test({ url: "http://example.com/", a: "1", c: "3", d: "4" }),
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          a: "1",
          b: "3",
          c: "3",
          d: "123567",
        }),
      );
      assert.ok(
        ruleset.test({
          url: "http://example.com/",
          a: "1",
          b: "3",
          c: "3",
          d: "4",
          e: "551",
          f: "169",
        }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.com/",
          a: "1",
          b: "3",
          c: "3",
          d: "4",
          e: "551",
          f: "777",
        }),
      );
    }
  });

  await t.test("Negate and highlight specifiers", () => {
    {
      const ruleset = new Ruleset("@*://example.com/*");
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "https://example.com/" }),
        [{ lineNumber: 1, specifier: { type: "negate" } }],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "https://example.net/" }),
        [],
      );
    }
    {
      const ruleset = new Ruleset(String.raw`@1 /example\.net/`);
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://www.example.net/" }),
        [{ lineNumber: 1, specifier: { type: "highlight", colorNumber: 1 } }],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://www.example.com/" }),
        [],
      );
    }
    {
      const ruleset = new Ruleset("@10t/bar/i");
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://example.com/", title: "FOO BAR BAZ" }),
        [{ lineNumber: 1, specifier: { type: "highlight", colorNumber: 10 } }],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, {
          url: "http://example.com/foo/bar/baz/",
          title: "QUX QUUX",
        }),
        [],
      );
    }
    // Invalid highlight specifier
    {
      const ruleset = new Ruleset(String.raw`@ 1 /example\.net/`);
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://www.example.net/" }),
        [],
      );
    }
  });

  await t.test("If specifier", () => {
    {
      const ruleset = new Ruleset("*://example.com/* @if(title=~/example/i)");
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({ url: "http://example.org/", title: "Example Domain" }),
      );
      assert.ok(
        !ruleset.test({
          url: "http://example.org/",
          snippet: "Example Domain",
        }),
      );
    }
    {
      const ruleset = new Ruleset(
        "*://example.com/* @if( (title =~ /example/i) )",
      );
      assert.ok(
        ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
    // Space is required before if specifier
    {
      const ruleset = new Ruleset("*://example.com/*@if(title=~/example/i)");
      assert.ok(
        !ruleset.test({ url: "http://example.com/", title: "Example Domain" }),
      );
    }
  });

  await t.test("Multiple rules", () => {
    {
      const ruleset = new Ruleset(`*://example.com/*
@https://example.com/*
@1*://www.example.com/*
@2*://*.example.com/*
@3*://example.com/path
@4http://a.b.example.com/*
@5http://*.b.example.com/*/b/*/
*://example.com/*`);
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "https://example.com/" }),
        [
          { lineNumber: 1, specifier: null },
          { lineNumber: 2, specifier: { type: "negate" } },
          { lineNumber: 4, specifier: { type: "highlight", colorNumber: 2 } },
          { lineNumber: 8, specifier: null },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://www.example.com/path" }),
        [
          { lineNumber: 3, specifier: { type: "highlight", colorNumber: 1 } },
          { lineNumber: 4, specifier: { type: "highlight", colorNumber: 2 } },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://example.com/path" }),
        [
          { lineNumber: 1, specifier: null },
          { lineNumber: 4, specifier: { type: "highlight", colorNumber: 2 } },
          { lineNumber: 5, specifier: { type: "highlight", colorNumber: 3 } },
          { lineNumber: 8, specifier: null },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "http://a.b.example.com/a/b/c/" }),
        [
          { lineNumber: 4, specifier: { type: "highlight", colorNumber: 2 } },
          { lineNumber: 6, specifier: { type: "highlight", colorNumber: 4 } },
          { lineNumber: 7, specifier: { type: "highlight", colorNumber: 5 } },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "https://example.net/a/b/c/" }),
        [],
      );
    }
    {
      const ruleset = new Ruleset(String.raw`@3 /example\.com/
@2 u/example\.net/
@1 url/www\.example\.com/
@ t/example/
title/domain/i`);
      assert.deepStrictEqual(
        testRaw(ruleset, {
          url: "https://www.example.com",
          title: "Example Domain",
        }),
        [
          { lineNumber: 1, specifier: { type: "highlight", colorNumber: 3 } },
          { lineNumber: 3, specifier: { type: "highlight", colorNumber: 1 } },
          { lineNumber: 5, specifier: null },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, {
          url: "ftp://ftp.example.net",
          title: "ftp example",
        }),
        [],
      );
    }
    {
      const ruleset = new Ruleset(String.raw`  *://*.example.com/*bar*
t/quux$/

# Invalid rule
example\.(net|org)

@2 /^HTTP:\/\//i
@https://example.com/*

# IPv4 address
/^https?:\/\/(\d{1,3}\.){3}\d{1,3}\//`);
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "https://example.com/foobar" }),
        [
          { lineNumber: 1, specifier: null },
          { lineNumber: 8, specifier: { type: "negate" } },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, {
          url: "http://www.example.com/hogefuga",
          title: "qux quux",
        }),
        [
          { lineNumber: 2, specifier: null },
          { lineNumber: 7, specifier: { type: "highlight", colorNumber: 2 } },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, {
          url: "https://127.0.0.1/hoge/fuga/",
          title: "qux quux",
        }),
        [
          { lineNumber: 2, specifier: null },
          { lineNumber: 11, specifier: null },
        ],
      );
      assert.deepStrictEqual(
        testRaw(ruleset, { url: "ftp://127.0.0.1/", title: "quux qux" }),
        [],
      );
    }
  });

  await t.test("Extension and deletion", () => {
    const ruleset = new Ruleset("");
    const props1 = { url: "https://example.net/path" };

    ruleset.extend("");
    assert.deepStrictEqual(testRaw(ruleset, props1), []);

    ruleset.extend(`*://example.com/*
@https://example.net/*
  @1 /example\.edu/
*://*.net/*`);
    assert.deepStrictEqual(testRaw(ruleset, props1), [
      { lineNumber: 2, specifier: { type: "negate" } },
      { lineNumber: 4, specifier: null },
    ]);

    ruleset.extend("");
    assert.deepStrictEqual(testRaw(ruleset, props1), [
      { lineNumber: 2, specifier: { type: "negate" } },
      { lineNumber: 4, specifier: null },
    ]);

    ruleset.extend(`title/example/i
@2*://*.example.net/path*`);
    assert.deepStrictEqual(testRaw(ruleset, props1), [
      { lineNumber: 2, specifier: { type: "negate" } },
      { lineNumber: 4, specifier: null },
      { lineNumber: 6, specifier: { type: "highlight", colorNumber: 2 } },
    ]);

    for (const { lineNumber, specifier } of ruleset.testRaw(props1)) {
      if (specifier && specifier.type === "highlight") {
        ruleset.delete(lineNumber);
      }
    }
    assert.deepStrictEqual(testRaw(ruleset, props1), [
      { lineNumber: 2, specifier: { type: "negate" } },
      { lineNumber: 4, specifier: null },
    ]);

    const props2 = {
      url: "https://example.com/",
      title: "**EXAMPLE**",
    };
    assert.deepStrictEqual(testRaw(ruleset, props2), [
      { lineNumber: 1, specifier: null },
      { lineNumber: 5, specifier: null },
    ]);

    for (const { lineNumber, specifier } of ruleset.testRaw(props2)) {
      if (!specifier) {
        ruleset.delete(lineNumber);
      }
    }
    assert.deepStrictEqual(testRaw(ruleset, props2), []);

    ruleset.extend("@*://*/*");
    assert.deepStrictEqual(testRaw(ruleset, props1), [
      { lineNumber: 2, specifier: { type: "negate" } },
      { lineNumber: 4, specifier: null },
      { lineNumber: 7, specifier: { type: "negate" } },
    ]);
    assert.deepStrictEqual(testRaw(ruleset, props2), [
      { lineNumber: 7, specifier: { type: "negate" } },
    ]);
  });
});
