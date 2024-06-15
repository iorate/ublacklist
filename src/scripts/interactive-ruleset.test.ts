import assert from "node:assert";
import { test } from "node:test";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { Ruleset } from "./ruleset/ruleset.ts";

function createInteractiveRuleset(
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
    {
      const ruleset = createInteractiveRuleset(`*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`);
      assert.deepStrictEqual(
        ruleset.query({ url: "http://example.net", title: "Net" }),
        {
          type: "block",
        },
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "https://example.edu", title: "Example Domain" }),
        { type: "block" },
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "http://example.com", title: "Allowed" }),
        { type: "unblock" },
      );
    }
    {
      const ruleset = createInteractiveRuleset(`/example\.net/
u/example\.org/
t/Example/
@t/allowed/i`);
      assert.deepStrictEqual(
        ruleset.query({ url: "http://example.net", title: "Net" }),
        {
          type: "block",
        },
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "https://example.edu", title: "Example Domain" }),
        { type: "block" },
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "http://example.com", title: "Allowed" }),
        { type: "unblock" },
      );
    }
  });

  await t.test("Highlight", () => {
    {
      const ruleset = createInteractiveRuleset(`*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`);
      assert.deepStrictEqual(ruleset.query({ url: "https://example.com/" }), {
        type: "highlight",
        colorNumber: 10,
      });
      assert.deepStrictEqual(ruleset.query({ url: "https://example.net/" }), {
        type: "unblock",
      });
      assert.deepStrictEqual(ruleset.query({ url: "https://example.org/" }), {
        type: "highlight",
        colorNumber: 1,
      });
      assert.deepStrictEqual(ruleset.query({ url: "https://example.edu/" }), {
        type: "highlight",
        colorNumber: 2,
      });
      assert.strictEqual(ruleset.query({ url: "https://example.co.jp" }), null);
    }
    {
      const ruleset = createInteractiveRuleset(
        "  @2  https://*.example.com/*  ",
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "https://subdomain.example.com/" }),
        {
          type: "highlight",
          colorNumber: 2,
        },
      );
      assert.strictEqual(ruleset.query({ url: "https://example.net/" }), null);
    }
    {
      const ruleset = createInteractiveRuleset(
        `*://example.com/*
@*://example.net/*`,
        [
          `@100 *://*.example.com/*
*://example.net/*`,
        ],
      );
      assert.deepStrictEqual(ruleset.query({ url: "https://example.com/" }), {
        type: "block",
      });
      assert.deepStrictEqual(
        ruleset.query({ url: "https://subdomain.example.com/" }),
        {
          type: "highlight",
          colorNumber: 100,
        },
      );
      assert.deepStrictEqual(ruleset.query({ url: "https://example.net/" }), {
        type: "unblock",
      });
    }
  });

  await t.test("Patch", () => {
    {
      const ruleset = createInteractiveRuleset("@1*://example.com/*");
      {
        const patch1 = ruleset.createPatch(
          { url: "https://example.com/" },
          false,
        );
        assert.strictEqual(patch1.unblock, false);
        assert.strictEqual(patch1.rulesToAdd, "*://example.com/*");
        assert.strictEqual(patch1.rulesToRemove, "@1*://example.com/*");
        const patch2 = ruleset.modifyPatch({
          rulesToAdd: `*://example.com/*
@2/example/`,
        });
        assert.strictEqual(patch2, null);
        ruleset.applyPatch();
      }
      assert.strictEqual(ruleset.toString(), "*://example.com/*");
    }
    {
      const ruleset = createInteractiveRuleset("*://example.com/*", [
        "*://example.com/*",
      ]);
      {
        const patch1 = ruleset.createPatch(
          { url: "https://example.com" },
          false,
        );
        assert.strictEqual(patch1.unblock, true);
        assert.strictEqual(patch1.rulesToAdd, "@*://example.com/*");
        assert.strictEqual(patch1.rulesToRemove, "*://example.com/*");
        const patch2 = ruleset.modifyPatch({
          rulesToAdd: "@42*://*.example.com/*",
        });
        assert.strictEqual(patch2?.unblock, true);
        assert.strictEqual(patch2?.rulesToAdd, "@42*://*.example.com/*");
        assert.strictEqual(patch2?.rulesToRemove, "*://example.com/*");
        ruleset.applyPatch();
      }
      assert.strictEqual(ruleset.toString(), "@42*://*.example.com/*");
    }
  });

  await t.test("Subscriptions", () => {
    const user = String.raw`*://*.example.com/*
# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`;
    const subscriptions = [
      "ftp://example.org/*",
      String.raw`/^https?:\/\/www\.qinterest\./
@https://example.edu/path/to/*`,
    ];
    {
      const ruleset = createInteractiveRuleset(user);
      assert.strictEqual(ruleset.toString(), user);
    }
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      assert.strictEqual(ruleset.toString(), user);
    }
    {
      const ruleset = createInteractiveRuleset(user);
      assert.deepStrictEqual(ruleset.query({ url: "http://example.com/" }), {
        type: "block",
      });
      assert.deepStrictEqual(
        ruleset.query({ url: "https://www.example.com/path" }),
        {
          type: "block",
        },
      );
      assert.strictEqual(ruleset.query({ url: "ftp://example.net/" }), null);
      assert.strictEqual(ruleset.query({ url: "http://example.edu/" }), null);
    }
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      assert.deepStrictEqual(ruleset.query({ url: "http://example.com/" }), {
        type: "block",
      });
      assert.deepStrictEqual(ruleset.query({ url: "http://example.net/" }), {
        type: "unblock",
      });
      assert.strictEqual(ruleset.query({ url: "https://example.edu/" }), null);
      assert.deepStrictEqual(
        ruleset.query({ url: "https://example.edu/path/to/example" }),
        { type: "unblock" },
      );
      assert.deepStrictEqual(
        ruleset.query({ url: "https://www.qinterest.com/" }),
        {
          type: "block",
        },
      );
    }
    {
      const ruleset = createInteractiveRuleset(user);
      {
        const patch1 = ruleset.createPatch(
          { url: "https://www.example.edu/" },
          false,
        );
        assert.strictEqual(patch1.unblock, false);
        assert.strictEqual(patch1.props.url, "https://www.example.edu/");
        assert.strictEqual(patch1.rulesToAdd, "*://www.example.edu/*");
        assert.strictEqual(patch1.rulesToRemove, "");
        const patch2 = ruleset.modifyPatch({ rulesToAdd: "*://example.edu/*" });
        assert.strictEqual(patch2, null);
        const patch3 = ruleset.modifyPatch({
          rulesToAdd: "https://*.example.edu/",
        });
        assert.strictEqual(patch3?.rulesToAdd, "https://*.example.edu/");
        ruleset.applyPatch();
      }
      assert.strictEqual(
        ruleset.toString(),
        `${user}
https://*.example.edu/`,
      );
    }
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      {
        const patch = ruleset.createPatch(
          { url: "http://www.example.com/path" },
          false,
        );
        assert.strictEqual(patch.unblock, true);
        assert.strictEqual(patch.props.url, "http://www.example.com/path");
        assert.strictEqual(patch.rulesToAdd, "");
        assert.strictEqual(patch.rulesToRemove, "*://*.example.com/*");
        ruleset.applyPatch();
      }
      assert.strictEqual(
        ruleset.toString(),
        String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
      );
      {
        const patch1 = ruleset.createPatch(
          { url: "https://example.net/" },
          false,
        );
        assert.strictEqual(patch1.unblock, false);
        assert.strictEqual(patch1.props.url, "https://example.net/");
        assert.strictEqual(patch1.rulesToAdd, "");
        assert.strictEqual(patch1.rulesToRemove, "@*://example.net/*");
        const patch2 = ruleset.modifyPatch({ rulesToAdd: "@/net/" });
        assert.strictEqual(patch2, null);
        const patch3 = ruleset.modifyPatch({ rulesToAdd: "Only comment" });
        assert.strictEqual(patch3?.rulesToAdd, "Only comment");
        ruleset.deletePatch();
        assert.throws(() => {
          ruleset.applyPatch();
        });
      }
      assert.strictEqual(
        ruleset.toString(),
        String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
      );
      {
        const patch1 = ruleset.createPatch(
          { url: "http://www.example.edu/foo/bar" },
          false,
        );
        assert.strictEqual(patch1.unblock, false);
        assert.strictEqual(patch1.rulesToAdd, "*://www.example.edu/*");
        assert.strictEqual(patch1.rulesToRemove, "");
        const patch2 = ruleset.modifyPatch({
          rulesToAdd: `*://www.example.edu/*
@/edu/`,
        });
        assert.strictEqual(patch2, null);
      }
    }
  });

  await t.test("PSL", () => {
    {
      const ruleset = createInteractiveRuleset("");
      {
        const patch = ruleset.createPatch(
          { url: "https://www.library.city.chuo.tokyo.jp" },
          true,
        );
        assert.strictEqual(patch.unblock, false);
        assert.strictEqual(patch.rulesToAdd, "*://*.city.chuo.tokyo.jp/*");
        assert.strictEqual(patch.rulesToRemove, "");
        ruleset.applyPatch();
      }
      assert.strictEqual(ruleset.toString(), "*://*.city.chuo.tokyo.jp/*");
    }
    {
      const ruleset = createInteractiveRuleset("", ["*://*.example.com/*"]);
      {
        const patch = ruleset.createPatch(
          { url: "https://www.example.com/" },
          true,
        );
        assert.strictEqual(patch.unblock, true);
        assert.strictEqual(patch.rulesToAdd, "@*://*.example.com/*");
        assert.strictEqual(patch.rulesToRemove, "");
        ruleset.applyPatch();
      }
      assert.strictEqual(ruleset.toString(), "@*://*.example.com/*");
    }
  });
});
