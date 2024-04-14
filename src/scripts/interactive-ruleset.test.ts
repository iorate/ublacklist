import assert from "node:assert";
import { describe, test } from "node:test";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { Ruleset } from "./ruleset.ts";
import type { SerpEntryProps } from "./types.ts";
import { AltURL, r } from "./utilities.ts";

function makeInteractiveRuleset(
  user: string,
  subscriptions: readonly string[] = [],
): InteractiveRuleset {
  return new InteractiveRuleset(
    user,
    Ruleset.compile(user),
    subscriptions.map((subscription) => Ruleset.compile(subscription)),
  );
}

function makeProps(url: string, title?: string): SerpEntryProps {
  return {
    url: new AltURL(url),
    title: title ?? null,
  };
}

describe("psl", () => {
  test("patch", () => {
    const rs1 = makeInteractiveRuleset("");
    const p11 = rs1.createPatch(
      makeProps("https://www.library.city.chuo.tokyo.jp"),
      true,
    );
    assert.strictEqual(p11.unblock, false);
    assert.strictEqual(p11.rulesToAdd, r`*://*.city.chuo.tokyo.jp/*`);
    assert.strictEqual(p11.rulesToRemove, "");
    rs1.applyPatch();
    assert.strictEqual(rs1.toString(), r`*://*.city.chuo.tokyo.jp/*`);

    const rs2 = makeInteractiveRuleset("", [r`*://*.example.com/*`]);
    const p21 = rs2.createPatch(makeProps("https://www.example.com/"), true);
    assert.strictEqual(p21.unblock, true);
    assert.strictEqual(p21.rulesToAdd, r`@*://*.example.com/*`);
    assert.strictEqual(p21.rulesToRemove, "");
    rs2.applyPatch();
    assert.strictEqual(rs2.toString(), r`@*://*.example.com/*`);
  });
});

describe("title", () => {
  test("test", () => {
    const rs1 = makeInteractiveRuleset(
      r`*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`,
    );
    assert.strictEqual(rs1.test(makeProps("http://example.net", "Net")), 0);
    assert.strictEqual(
      rs1.test(makeProps("https://example.edu", "Example Domain")),
      0,
    );
    assert.strictEqual(rs1.test(makeProps("http://example.com", "Allowed")), 1);

    const rs2 = makeInteractiveRuleset(
      r`/example\.net/
u/example\.org/
t/Example/
@t/allowed/i`,
    );
    assert.strictEqual(rs2.test(makeProps("http://example.net", "Net")), 0);
    assert.strictEqual(
      rs2.test(makeProps("https://example.edu", "Example Domain")),
      0,
    );
    assert.strictEqual(rs2.test(makeProps("http://example.com", "Allowed")), 1);
  });
});

describe("highlight", () => {
  test("test", () => {
    const rs1 = makeInteractiveRuleset(
      r`*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`,
    );
    assert.strictEqual(rs1.test(makeProps("https://example.com/")), 11);
    assert.strictEqual(rs1.test(makeProps("https://example.net/")), 1);
    assert.strictEqual(rs1.test(makeProps("https://example.org/")), 2);
    assert.strictEqual(rs1.test(makeProps("https://example.edu/")), 3);
    assert.strictEqual(rs1.test(makeProps("https://example.co.jp")), -1);

    const rs2 = makeInteractiveRuleset(r`  @2  https://*.example.com/*  `);
    assert.strictEqual(
      rs2.test(makeProps("https://subdomain.example.com/")),
      3,
    );
    assert.strictEqual(rs2.test(makeProps("https://example.net/")), -1);

    const rs3 = makeInteractiveRuleset(
      r`*://example.com/*
@*://example.net/*`,
      [
        r`@100 *://*.example.com/*
*://example.net/*`,
      ],
    );
    assert.strictEqual(rs3.test(makeProps("https://example.com/")), 0);
    assert.strictEqual(
      rs3.test(makeProps("https://subdomain.example.com/")),
      101,
    );
    assert.strictEqual(rs3.test(makeProps("https://example.net/")), 1);
  });

  test("patch", () => {
    const rs1 = makeInteractiveRuleset(r`@1*://example.com/*`);
    const p11 = rs1.createPatch(makeProps("https://example.com/"), false);
    assert.strictEqual(p11.unblock, false);
    assert.strictEqual(p11.rulesToAdd, r`*://example.com/*`);
    assert.strictEqual(p11.rulesToRemove, r`@1*://example.com/*`);
    const p12 = rs1.modifyPatch({
      rulesToAdd: r`*://example.com/*
@2/example/`,
    });
    assert.strictEqual(p12, null);
    rs1.applyPatch();
    assert.strictEqual(rs1.toString(), r`*://example.com/*`);

    const rs2 = makeInteractiveRuleset(r`*://example.com/*`, [
      r`*://example.com/*`,
    ]);
    const p21 = rs2.createPatch(makeProps("https://example.com"), false);
    assert.strictEqual(p21.unblock, true);
    assert.strictEqual(p21.rulesToAdd, r`@*://example.com/*`);
    assert.strictEqual(p21.rulesToRemove, r`*://example.com/*`);
    const p22 = rs2.modifyPatch({ rulesToAdd: r`@42*://*.example.com/*` });
    assert.notStrictEqual(p22, null);
    rs2.applyPatch();
    assert.strictEqual(rs2.toString(), r`@42*://*.example.com/*`);
  });
});

describe("block and unblock", () => {
  const RULESET1 = r`*://*.example.com/*
# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`;
  const RULESET2 = r`ftp://example.org/*`;
  const RULESET3 = r`/^https?:\/\/www\.qinterest\./
@https://example.edu/path/to/*`;

  test("toString", () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    assert.strictEqual(rs1.toString(), RULESET1);

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    assert.strictEqual(rs123.toString(), RULESET1);
  });

  test("test", () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    assert.strictEqual(rs1.test(makeProps("http://example.com/")), 0);
    assert.strictEqual(rs1.test(makeProps("https://www.example.com/path")), 0);
    assert.strictEqual(rs1.test(makeProps("ftp://example.net/")), 0);
    assert.strictEqual(rs1.test(makeProps("http://example.edu/")), -1);

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    assert.strictEqual(rs123.test(makeProps("http://example.com/")), 0);
    assert.strictEqual(rs123.test(makeProps("http://example.net/")), 1);
    assert.strictEqual(rs123.test(makeProps("https://example.edu/")), -1);
    assert.strictEqual(
      rs123.test(makeProps("https://example.edu/path/to/example")),
      1,
    );
    assert.strictEqual(rs123.test(makeProps("https://www.qinterest.com/")), 0);
  });

  test("patch", () => {
    const rs1 = makeInteractiveRuleset(RULESET1);
    const p1a = rs1.createPatch(makeProps("https://www.example.edu/"), false);
    assert.strictEqual(p1a.unblock, false);
    assert.strictEqual(p1a.props.url.toString(), "https://www.example.edu/");
    assert.strictEqual(p1a.rulesToAdd, "*://www.example.edu/*");
    assert.strictEqual(p1a.rulesToRemove, "");
    const p1b = rs1.modifyPatch({ rulesToAdd: "*://example.edu/*" });
    assert.strictEqual(p1b, null);
    const p1c = rs1.modifyPatch({ rulesToAdd: "https://*.example.edu/" });
    assert.strictEqual(p1c?.rulesToAdd, "https://*.example.edu/");
    rs1.applyPatch();
    assert.strictEqual(
      rs1.toString(),
      r`${RULESET1}
https://*.example.edu/`,
    );

    const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
    const p123a = rs123.createPatch(
      makeProps("http://www.example.com/path"),
      false,
    );
    assert.strictEqual(p123a.unblock, true);
    assert.strictEqual(
      p123a.props.url.toString(),
      "http://www.example.com/path",
    );
    assert.strictEqual(p123a.rulesToAdd, "");
    assert.strictEqual(p123a.rulesToRemove, "*://*.example.com/*");
    rs123.applyPatch();
    assert.strictEqual(
      rs123.toString(),
      r`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
    );

    const p123b = rs123.createPatch(makeProps("https://example.net/"), false);
    assert.strictEqual(p123b.unblock, false);
    assert.strictEqual(p123b.props.url.toString(), "https://example.net/");
    assert.strictEqual(p123b.rulesToAdd, "");
    assert.strictEqual(p123b.rulesToRemove, "@*://example.net/*");
    const p123c = rs123.modifyPatch({ rulesToAdd: "@/net/" });
    assert.strictEqual(p123c, null);
    const p123d = rs123.modifyPatch({ rulesToAdd: "Only comment" });
    assert.strictEqual(p123d?.rulesToAdd, "Only comment");
    rs123.deletePatch();
    assert.throws(() => {
      rs123.applyPatch();
    });
    assert.strictEqual(
      rs123.toString(),
      r`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
    );

    const p123e = rs123.createPatch(
      makeProps("ftp://example.org/dir/file"),
      false,
    );
    assert.strictEqual(p123e.unblock, true);
    assert.strictEqual(
      p123e.props.url.toString(),
      "ftp://example.org/dir/file",
    );
    assert.strictEqual(p123e.rulesToAdd, "@ftp://example.org/*");
    assert.strictEqual(p123e.rulesToRemove, r`/example\.(net|org)/`);
    rs123.applyPatch();
    assert.strictEqual(
      rs123.toString(),
      r`# Block 'example.net' and 'example.org'
# But unblock 'example.net'
@*://example.net/*
@ftp://example.org/*`,
    );

    rs123.createPatch(makeProps("http://www.example.edu/foo/bar"), false);
    const p123f = rs123.modifyPatch({
      rulesToAdd: r`*://www.example.edu/*
@/edu/`,
    });
    assert.strictEqual(p123f, null);
  });
});
