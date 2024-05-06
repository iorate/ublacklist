import assert from "node:assert";
import { describe, test } from "node:test";
import util from "node:util";
import { Ruleset } from "./ruleset.ts";
import type { SerpEntryProps } from "./types.ts";
import { AltURL, r } from "./utilities.ts";

function makeProps(
  url: string | { readonly url: string; readonly title?: string },
): SerpEntryProps {
  return typeof url === "string"
    ? { url: new AltURL(url), title: null }
    : { url: new AltURL(url.url), title: url.title ?? null };
}

function testTest(
  rules: string,
  table: readonly (readonly [
    url: string | { url: string; title?: string },
    result: number,
  ])[],
): void {
  describe(util.inspect(rules), () => {
    const ruleset = new Ruleset(Ruleset.compile(rules));
    for (const [url, result] of table) {
      test(util.inspect(url), () => {
        assert.strictEqual(ruleset.test(makeProps(url)), result);
      });
    }
  });
}

describe("Match patterns", () => {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
  testTest(r`*://*/*`, [
    ["http://example.org/", 0],
    ["https://a.org/some/path", 0],
    ["ftp://ftp.example.org/", -1],
    ["file:///a/", -1],
  ]);
  testTest(r`*://*.mozilla.org/*`, [
    ["http://mozilla.org/", 0],
    ["https://mozilla.org/", 0],
    ["http://a.mozilla.org", 0],
    ["https://a.b.mozilla.org", 0],
    ["https://b.mozilla.org/path", 0],
    ["ftp://mozilla.org/", -1],
    ["http://mozilla.com/", -1],
    ["http://firefox.org/", -1],
  ]);
  testTest(r`*://mozilla.org/`, [
    ["http://mozilla.org/", 0],
    ["https://mozilla.org/", 0],
    ["ftp://mozilla.org/", -1],
    ["http://a.mozilla.org", -1],
    ["http://mozilla.org/a", -1],
  ]);
  testTest(r`ftp://mozilla.org/`, [
    ["ftp://mozilla.org/", 0],
    ["http://mozilla.org/", -1],
    ["ftp://sub.mozilla.org/", -1],
    ["ftp://mozilla.org/path", -1],
  ]);
  testTest(r`https://*/path`, [
    ["https://mozilla.org/path", 0],
    ["https://a.mozilla.org/path", 0],
    ["https://something.com/path", 0],
    ["http://mozilla.org/path", -1],
    ["https://mozilla.org/path/", -1],
    ["https://mozilla.org/a", -1],
    ["https://mozilla.org/", -1],
    ["https://mozilla.org/path?foo=1", -1],
  ]);
  testTest(r`https://*/path/`, [
    ["https://mozilla.org/path/", 0],
    ["https://a.mozilla.org/path/", 0],
    ["https://something.com/path/", 0],
    ["http://mozilla.org/path/", -1],
    ["https://mozilla.org/path", -1],
    ["https://mozilla.org/a", -1],
    ["https://mozilla.org/", -1],
    ["https://mozilla.org/path/?foo=1", -1],
  ]);
  testTest(r`https://mozilla.org/*`, [
    ["https://mozilla.org/", 0],
    ["https://mozilla.org/path", 0],
    ["https://mozilla.org/another", 0],
    ["https://mozilla.org/path/to/doc", 0],
    ["https://mozilla.org/path/to/doc?foo=1", 0],
    ["http://mozilla.org/path", -1],
    ["https://mozilla.com/path", -1],
  ]);
  testTest(r`https://mozilla.org/a/b/c/`, [
    ["https://mozilla.org/a/b/c/", 0],
    ["https://mozilla.org/a/b/c/#section1", 0],
  ]);
  testTest(r`https://mozilla.org/*/b/*/`, [
    ["https://mozilla.org/a/b/c/", 0],
    ["https://mozilla.org/d/b/f/", 0],
    ["https://mozilla.org/a/b/c/d/", 0],
    ["https://mozilla.org/a/b/c/d/#section1", 0],
    ["https://mozilla.org/a/b/c/d?foo=/", 0],
    ["https://mozilla.org/a?foo=21314&bar=/b/&extra=c/", 0],
    ["https://mozilla.org/b/*/", -1],
    ["https://mozilla.org/a/b/", -1],
    ["https://mozilla.org/a/b/c/d/?foo=bar", -1],
  ]);
  // Invalid match patterns
  testTest(r`https://mozilla.org`, [["https://mozilla/org/", -1]]);
  testTest(r`https://mozilla.*.org/`, [
    ["https://mozilla.org/", -1],
    ["https://mozilla.a.org/", -1],
  ]);
  testTest(r`https://*zilla.org/`, [["https://mozilla.org/", -1]]);
  testTest(r`http*://mozilla.org/`, [["https://mozilla.org/", -1]]);
  testTest(r`https://mozilla.org:80/`, [["https://mozilla.org:80/", -1]]);
  // Schemes and hosts are case-insensitive
  testTest(r`HTTPS://*.EXAMPLE.com/PATH/*`, [
    ["https://example.com/PATH/", 0],
    ["HTTPS://WWW.EXAMPLE.COM/PATH/TO/DIR", 0],
    ["https://example.com/path/", -1],
  ]);
});

describe("Regular expressions", () => {
  testTest(r`/example\.(net|org)/`, [
    ["https://example.net/", 0],
    ["https://example.org/", 0],
    ["http://example.com/?query=example.net", 0],
    ["ftp://example.net/", 0],
    ["http://example.com/", -1],
  ]);
  testTest(r`url/example\.(net|org)/`, [
    ["https://example.net/", 0],
    ["http://example.com/", -1],
  ]);
  testTest(r`title/Example Domain/`, [
    [{ url: "http://example.com/", title: "Example Domain" }, 0],
    [{ url: "http://example.com/", title: "This Is An Example Domain" }, 0],
    [{ url: "http://example.com/" }, -1],
    [{ url: "http://example.com/", title: "example domain" }, -1],
  ]);
  testTest(r`t/example domain/i`, [
    [{ url: "http://example.com/", title: "Example Domain" }, 0],
    [{ url: "http://example.com/", title: "example domain" }, 0],
    [{ url: "http://example.com/" }, -1],
    [{ url: "http://example.com/", title: "example-domain" }, -1],
  ]);
  // https://iorate.github.io/ublacklist/advanced-features#regular-expressions
  testTest(r`/^https:\/\/www\.qinterest\./`, [
    ["https://www.qinterest.com/", 0],
    ["https://www.qinterest.jp/hoge", 0],
    ["http://www.qinterest.com/", -1],
    ["https://www.rinterest.com/", -1],
  ]);
  testTest(r`/^https?:\/\/([^/.]+\.)*?xn--/`, [
    ["http://xn--fsq.xn--zckzah/", 0], // http://例.テスト/
    ["http://example.test/", -1],
  ]);
  testTest(r`^https?:\/\/example\.com\/`, [["https://example.com/", -1]]);
  testTest(r`/^https?://example\.com//`, [["https://example.com/", -1]]);
});

function testExecAndTest(
  rules: string,
  table: readonly (readonly [
    props: string | { readonly url: string; readonly title?: string },
    execResult: readonly (readonly [line: number, value: number])[],
    testResult: number,
  ])[],
): void {
  describe(util.inspect(rules), () => {
    const ruleset = new Ruleset(Ruleset.compile(rules));
    for (const [url, execResult, testResult] of table) {
      test(util.inspect(url), () => {
        const props = makeProps(url);
        assert.deepStrictEqual(
          ruleset
            .exec(props)
            .map(([line, value]) => [line, value] as const)
            .sort(([l1], [l2]) => l1 - l2),
          [...execResult].sort(([l1], [l2]) => l1 - l2),
        );
        assert.strictEqual(ruleset.test(props), testResult);
      });
    }
  });
}

describe("Unblocking and highlighting rules", () => {
  testTest(r`@*://example.com/*`, [
    ["https://example.com/", 1],
    ["https://example.net/", -1],
  ]);
  testTest(r`@1 /example\.net/`, [
    ["http://www.example.net/", 2],
    ["http://www.example.com/", -1],
  ]);
  testTest(r`@10t/bar/i`, [
    [{ url: "http://example.com/", title: "FOO BAR BAZ" }, 11],
    [{ url: "http://example.com/foo/bar/baz/", title: "QUX QUUX" }, -1],
  ]);
  // Invalid highlighting rules
  testTest(r`@ 1 /example\.net/`, [["http://www.example.net/", -1]]);
});

describe("Multiple rules", () => {
  // Multiple match patterns
  testExecAndTest(
    r`*://example.com/*
@https://example.com/*
@1*://www.example.com/*
@2*://*.example.com/*
@3*://example.com/path
@4http://a.b.example.com/*
@5http://*.b.example.com/*/b/*/
*://example.com/*`,
    [
      [
        "https://example.com/",
        [
          [0, 0],
          [1, 1],
          [3, 3],
          [7, 0],
        ],
        3,
      ],
      [
        "http://www.example.com/path",
        [
          [2, 2],
          [3, 3],
        ],
        3,
      ],
      [
        "http://example.com/path",
        [
          [0, 0],
          [3, 3],
          [4, 4],
          [7, 0],
        ],
        4,
      ],
      [
        "http://a.b.example.com/a/b/c/",
        [
          [3, 3],
          [5, 5],
          [6, 6],
        ],
        6,
      ],
      ["https://example.net/a/b/c/", [], -1],
    ],
  );
  // Multiple regular expressions
  testExecAndTest(
    r`@3 /example\.com/
@2 u/example\.net/
@1 url/www\.example\.com/
@ t/example/
title/domain/i`,
    [
      [
        { url: "https://www.example.com", title: "Example Domain" },
        [
          [0, 4],
          [2, 2],
          [4, 0],
        ],
        4,
      ],
      [
        { url: "ftp://ftp.example.net", title: "ftp example" },
        [
          [1, 3],
          [3, 1],
        ],
        3,
      ],
    ],
  );
  // Empty, comment and invalid rules
  testExecAndTest(
    r`  *://*.example.com/*bar*
t/quux$/

# Invalid rule
example\.(net|org)

@2 /^HTTP:\/\//i
@https://example.com/*

# IPv4 address
/^https?:\/\/(\d{1,3}\.){3}\d{1,3}\//`,
    [
      [
        { url: "https://example.com/foobar" },
        [
          [0, 0],
          [7, 1],
        ],
        1,
      ],
      [
        { url: "http://www.example.com/hogefuga", title: "qux quux" },
        [
          [1, 0],
          [6, 3],
        ],
        3,
      ],
      [
        { url: "https://127.0.0.1/hoge/fuga/", title: "qux quux" },
        [
          [1, 0],
          [10, 0],
        ],
        0,
      ],
      [{ url: "ftp://127.0.0.1/", title: "quux qux" }, [], -1],
    ],
  );
});

describe("Add and remove rules", () => {
  const ruleset = new Ruleset(
    Ruleset.compile(
      r`*://example.com/*
@https://example.net/*
  @1 /example\.edu/
*://*.net/*`,
    ),
  );

  const props1 = { url: new AltURL("https://example.net/path"), title: null };
  assert.strictEqual(ruleset.test(props1), 1);
  ruleset.add(r`title/example/i
@2*://*.example.net/path*`);
  assert.strictEqual(ruleset.test(props1), 3);
  for (const [, value, remove] of ruleset.exec(props1)) {
    if (value > 0) {
      remove();
    }
  }
  assert.strictEqual(ruleset.test(props1), 0);

  const props2 = {
    url: new AltURL("https://example.com/"),
    title: "**EXAMPLE**",
  };
  assert.strictEqual(ruleset.test(props2), 0);
  for (const [, value, remove] of ruleset.exec(props2)) {
    if (!value) {
      remove();
    }
  }
  assert.strictEqual(ruleset.test(props2), -1);

  ruleset.add(r`@*://*/*`);
  assert.strictEqual(ruleset.test(props1), 1);
  assert.strictEqual(ruleset.test(props2), 1);
});
