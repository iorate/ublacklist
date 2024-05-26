import assert from "node:assert";
import { test } from "node:test";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { Ruleset } from "./ruleset/ruleset.ts";

function makeInteractiveRuleset(
  user: string,
  subscriptions: readonly string[] = [],
): InteractiveRuleset {
  return new InteractiveRuleset(
    new Ruleset(user),
    subscriptions.map((subscription) => new Ruleset(subscription)),
  );
}

test("InteractiveRuleset", async (t) => {
  await t.test("Title", () => {
    const rs1 = makeInteractiveRuleset(
      `*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`,
    );
    assert.deepStrictEqual(
      rs1.query({ url: "http://example.net", title: "Net" }),
      {
        type: "block",
      },
    );
    assert.deepStrictEqual(
      rs1.query({ url: "https://example.edu", title: "Example Domain" }),
      { type: "block" },
    );
    assert.deepStrictEqual(
      rs1.query({ url: "http://example.com", title: "Allowed" }),
      { type: "unblock" },
    );

    const rs2 = makeInteractiveRuleset(
      `/example\.net/
u/example\.org/
t/Example/
@t/allowed/i`,
    );
    assert.deepStrictEqual(
      rs2.query({ url: "http://example.net", title: "Net" }),
      {
        type: "block",
      },
    );
    assert.deepStrictEqual(
      rs2.query({ url: "https://example.edu", title: "Example Domain" }),
      { type: "block" },
    );
    assert.deepStrictEqual(
      rs2.query({ url: "http://example.com", title: "Allowed" }),
      { type: "unblock" },
    );
  });

  await t.test("Highlight", () => {
    const rs1 = makeInteractiveRuleset(
      `*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`,
    );
    assert.deepStrictEqual(rs1.query({ url: "https://example.com/" }), {
      type: "highlight",
      colorNumber: 10,
    });
    assert.deepStrictEqual(rs1.query({ url: "https://example.net/" }), {
      type: "unblock",
    });
    assert.deepStrictEqual(rs1.query({ url: "https://example.org/" }), {
      type: "highlight",
      colorNumber: 1,
    });
    assert.deepStrictEqual(rs1.query({ url: "https://example.edu/" }), {
      type: "highlight",
      colorNumber: 2,
    });
    assert.strictEqual(rs1.query({ url: "https://example.co.jp" }), null);

    const rs2 = makeInteractiveRuleset("  @2  https://*.example.com/*  ");
    assert.deepStrictEqual(
      rs2.query({ url: "https://subdomain.example.com/" }),
      {
        type: "highlight",
        colorNumber: 2,
      },
    );
    assert.strictEqual(rs2.query({ url: "https://example.net/" }), null);

    const rs3 = makeInteractiveRuleset(
      `*://example.com/*
@*://example.net/*`,
      [
        `@100 *://*.example.com/*
*://example.net/*`,
      ],
    );
    assert.deepStrictEqual(rs3.query({ url: "https://example.com/" }), {
      type: "block",
    });
    assert.deepStrictEqual(
      rs3.query({ url: "https://subdomain.example.com/" }),
      {
        type: "highlight",
        colorNumber: 100,
      },
    );
    assert.deepStrictEqual(rs3.query({ url: "https://example.net/" }), {
      type: "unblock",
    });
  });

  test("Patch", () => {
    const rs1 = makeInteractiveRuleset("@1*://example.com/*");
    const p11 = rs1.createPatch({ url: "https://example.com/" }, false);
    assert.strictEqual(p11.unblock, false);
    assert.strictEqual(p11.rulesToAdd, "*://example.com/*");
    assert.strictEqual(p11.rulesToRemove, "@1*://example.com/*");
    const p12 = rs1.modifyPatch({
      rulesToAdd: `*://example.com/*
@2/example/`,
    });
    assert.strictEqual(p12, null);
    rs1.applyPatch();
    assert.strictEqual(rs1.toString(), "*://example.com/*");

    const rs2 = makeInteractiveRuleset("*://example.com/*", [
      "*://example.com/*",
    ]);
    const p21 = rs2.createPatch({ url: "https://example.com" }, false);
    assert.strictEqual(p21.unblock, true);
    assert.strictEqual(p21.rulesToAdd, "@*://example.com/*");
    assert.strictEqual(p21.rulesToRemove, "*://example.com/*");
    const p22 = rs2.modifyPatch({ rulesToAdd: "@42*://*.example.com/*" });
    assert.notStrictEqual(p22, null);
    rs2.applyPatch();
    assert.strictEqual(rs2.toString(), "@42*://*.example.com/*");
  });

  await t.test("Subscriptions", () => {
    const RULESET1 = String.raw`*://*.example.com/*
# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`;
    const RULESET2 = "ftp://example.org/*";
    const RULESET3 = String.raw`/^https?:\/\/www\.qinterest\./
@https://example.edu/path/to/*`;

    {
      const rs1 = makeInteractiveRuleset(RULESET1);
      assert.strictEqual(rs1.toString(), RULESET1);

      const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
      assert.strictEqual(rs123.toString(), RULESET1);
    }

    {
      const rs1 = makeInteractiveRuleset(RULESET1);
      assert.deepStrictEqual(rs1.query({ url: "http://example.com/" }), {
        type: "block",
      });
      assert.deepStrictEqual(
        rs1.query({ url: "https://www.example.com/path" }),
        {
          type: "block",
        },
      );
      assert.strictEqual(rs1.query({ url: "ftp://example.net/" }), null);
      assert.strictEqual(rs1.query({ url: "http://example.edu/" }), null);

      const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
      assert.deepStrictEqual(rs123.query({ url: "http://example.com/" }), {
        type: "block",
      });
      assert.deepStrictEqual(rs123.query({ url: "http://example.net/" }), {
        type: "unblock",
      });
      assert.strictEqual(rs123.query({ url: "https://example.edu/" }), null);
      assert.deepStrictEqual(
        rs123.query({ url: "https://example.edu/path/to/example" }),
        { type: "unblock" },
      );
      assert.deepStrictEqual(
        rs123.query({ url: "https://www.qinterest.com/" }),
        {
          type: "block",
        },
      );
    }

    {
      const rs1 = makeInteractiveRuleset(RULESET1);
      const p1a = rs1.createPatch({ url: "https://www.example.edu/" }, false);
      assert.strictEqual(p1a.unblock, false);
      assert.strictEqual(p1a.props.url, "https://www.example.edu/");
      assert.strictEqual(p1a.rulesToAdd, "*://www.example.edu/*");
      assert.strictEqual(p1a.rulesToRemove, "");
      const p1b = rs1.modifyPatch({ rulesToAdd: "*://example.edu/*" });
      assert.strictEqual(p1b, null);
      const p1c = rs1.modifyPatch({ rulesToAdd: "https://*.example.edu/" });
      assert.strictEqual(p1c?.rulesToAdd, "https://*.example.edu/");
      rs1.applyPatch();
      assert.strictEqual(
        rs1.toString(),
        `${RULESET1}
https://*.example.edu/`,
      );

      const rs123 = makeInteractiveRuleset(RULESET1, [RULESET2, RULESET3]);
      const p123a = rs123.createPatch(
        { url: "http://www.example.com/path" },
        false,
      );
      assert.strictEqual(p123a.unblock, true);
      assert.strictEqual(p123a.props.url, "http://www.example.com/path");
      assert.strictEqual(p123a.rulesToAdd, "");
      assert.strictEqual(p123a.rulesToRemove, "*://*.example.com/*");
      rs123.applyPatch();
      assert.strictEqual(
        rs123.toString(),
        String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
      );

      const p123b = rs123.createPatch({ url: "https://example.net/" }, false);
      assert.strictEqual(p123b.unblock, false);
      assert.strictEqual(p123b.props.url, "https://example.net/");
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
        String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
      );

      rs123.createPatch({ url: "http://www.example.edu/foo/bar" }, false);
      const p123e = rs123.modifyPatch({
        rulesToAdd: `*://www.example.edu/*
@/edu/`,
      });
      assert.strictEqual(p123e, null);
    }
  });

  await t.test("PSL", () => {
    const rs1 = makeInteractiveRuleset("");
    const p11 = rs1.createPatch(
      { url: "https://www.library.city.chuo.tokyo.jp" },
      true,
    );
    assert.strictEqual(p11.unblock, false);
    assert.strictEqual(p11.rulesToAdd, "*://*.city.chuo.tokyo.jp/*");
    assert.strictEqual(p11.rulesToRemove, "");
    rs1.applyPatch();
    assert.strictEqual(rs1.toString(), "*://*.city.chuo.tokyo.jp/*");

    const rs2 = makeInteractiveRuleset("", ["*://*.example.com/*"]);
    const p21 = rs2.createPatch({ url: "https://www.example.com/" }, true);
    assert.strictEqual(p21.unblock, true);
    assert.strictEqual(p21.rulesToAdd, "@*://*.example.com/*");
    assert.strictEqual(p21.rulesToRemove, "");
    rs2.applyPatch();
    assert.strictEqual(rs2.toString(), "@*://*.example.com/*");
  });
});
