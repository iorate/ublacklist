import assert from "node:assert/strict";
import { test } from "node:test";
import { Ruleset } from "@ublacklist/ruleset";
import { InteractiveRuleset } from "./interactive-ruleset.ts";

function createInteractiveRuleset(
  user: string,
  subscriptions: readonly string[] = [],
): InteractiveRuleset {
  return new InteractiveRuleset(
    { name: "user", ruleset: new Ruleset(user) },
    subscriptions.map((subscription, index) => ({
      name: String(index),
      ruleset: new Ruleset(subscription),
    })),
  );
}

test("InteractiveRuleset", async (t) => {
  await t.test("Title / URL matchers (long and short forms)", () => {
    // Both `title/.../` and `t/.../` (and the URL counterparts) must be
    // recognized as title/URL matchers, not as the default match-pattern
    // syntax.
    for (const source of [
      String.raw`*://example.com/*
url/example\.(net|org)/
title/Example/
@title/allowed/i`,
      String.raw`/example\.net/
u/example\.org/
t/Example/
@t/allowed/i`,
    ]) {
      const ruleset = createInteractiveRuleset(source);
      assert.deepEqual(
        ruleset.query({ url: "http://example.net", props: { title: "Net" } }),
        { type: "block" },
      );
      assert.deepEqual(
        ruleset.query({
          url: "https://example.edu",
          props: { title: "Example Domain" },
        }),
        { type: "block" },
      );
      assert.deepEqual(
        ruleset.query({
          url: "http://example.com",
          props: { title: "Allowed" },
        }),
        { type: "unblock" },
      );
    }
  });

  await t.test("Highlight precedence", () => {
    // Highlight color numbers act as priorities: a higher color number
    // wins over a lower one, and both win over plain block. Unblock (`@`
    // with no number) sits between block and highlight.
    {
      const ruleset = createInteractiveRuleset(String.raw`*://example.com/*
 @ *://example.net/*
@1*://example.org/*
  @2 *://example.edu/*
@10/example\.com/`);
      // @10 beats the plain block on example.com.
      assert.deepEqual(ruleset.query({ url: "https://example.com/" }), {
        type: "highlight",
        colorNumber: 10,
      });
      assert.deepEqual(ruleset.query({ url: "https://example.net/" }), {
        type: "unblock",
      });
      assert.deepEqual(ruleset.query({ url: "https://example.org/" }), {
        type: "highlight",
        colorNumber: 1,
      });
      assert.deepEqual(ruleset.query({ url: "https://example.edu/" }), {
        type: "highlight",
        colorNumber: 2,
      });
      assert.equal(ruleset.query({ url: "https://example.co.jp" }), null);
    }
    // Subscription highlight overrides a user block on a subdomain that
    // the user rule does not cover.
    {
      const ruleset = createInteractiveRuleset(
        `*://example.com/*
@*://example.net/*`,
        [
          `@100 *://*.example.com/*
*://example.net/*`,
        ],
      );
      assert.deepEqual(ruleset.query({ url: "https://example.com/" }), {
        type: "block",
      });
      assert.deepEqual(
        ruleset.query({ url: "https://subdomain.example.com/" }),
        { type: "highlight", colorNumber: 100 },
      );
      // User unblock wins over subscription block.
      assert.deepEqual(ruleset.query({ url: "https://example.net/" }), {
        type: "unblock",
      });
    }
  });

  await t.test("Patch (auto-detected mode)", () => {
    // URL is highlighted by a user rule. Auto-detected mode is
    // "unhighlight". The user highlight rule is removed; no new rule
    // needs to be suggested because the URL becomes unmatched.
    {
      const ruleset = createInteractiveRuleset("@1*://example.com/*");
      const patch = ruleset.createPatch(null, { url: "https://example.com/" });
      assert.equal(patch.mode, "unhighlight");
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "@1*://example.com/*");
      // An empty rulesToAdd is valid: removing the highlight rule alone
      // already satisfies "unhighlight".
      assert.equal(ruleset.validateRulesToAdd(patch, ""), true);
      // Re-introducing a highlight rule reverses the unhighlight; rejected.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@2*://example.com/*"),
        false,
      );
      assert.equal(ruleset.applyPatch(patch), "");
    }
    // URL is blocked by both user and a subscription. Auto-detected mode
    // is "unblock". The user block rule is removed; an unblock rule is
    // suggested to neutralize the subscription block.
    {
      const ruleset = createInteractiveRuleset("*://example.com/*", [
        "*://example.com/*",
      ]);
      const patch = ruleset.createPatch(null, { url: "https://example.com" });
      assert.equal(patch.mode, "unblock");
      assert.equal(patch.rulesToAdd, "@*://example.com/*");
      assert.equal(patch.rulesToRemove, "*://example.com/*");
      // The user can substitute a different unblock pattern that still
      // matches; applyPatch uses what they typed.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@*://*.example.com/*"),
        true,
      );
      assert.equal(
        ruleset.applyPatch(patch, "@*://*.example.com/*"),
        "@*://*.example.com/*",
      );
    }
    // URL is highlighted by a subscription. Auto-detected mode is
    // "unhighlight"; an unblock rule is suggested to override the
    // subscription highlight (no user rule to remove).
    {
      const ruleset = createInteractiveRuleset("", ["@1*://example.com/*"]);
      const patch = ruleset.createPatch(null, { url: "https://example.com/" });
      assert.equal(patch.mode, "unhighlight");
      assert.equal(patch.rulesToAdd, "@*://example.com/*");
      assert.equal(patch.rulesToRemove, "");
    }
  });

  await t.test("Patch (explicit highlight mode)", () => {
    // Nothing matches yet: explicit highlight produces an `@1` rule.
    {
      const ruleset = createInteractiveRuleset("");
      const patch = ruleset.createPatch("highlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.mode, "highlight");
      assert.equal(patch.rulesToAdd, "@1*://example.com/*");
      assert.equal(patch.rulesToRemove, "");
      assert.equal(patch.lineNumbersToRemove.length, 0);
      assert.equal(ruleset.applyPatch(patch), "@1*://example.com/*");
    }
    // URL is already highlighted by a user rule (any color).
    // Re-highlighting is a no-op: the existing rule is preserved.
    {
      const ruleset = createInteractiveRuleset("@2*://example.com/*");
      const patch = ruleset.createPatch("highlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "");
      assert.equal(ruleset.applyPatch(patch), "@2*://example.com/*");
    }
    // URL is unblocked by a user rule. Switching to highlight mode
    // removes the user's unblock rule and adds a highlight rule.
    {
      const ruleset = createInteractiveRuleset("@*://example.com/*");
      const patch = ruleset.createPatch("highlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.rulesToAdd, "@1*://example.com/*");
      assert.equal(patch.rulesToRemove, "@*://example.com/*");
    }
    // validateRulesToAdd enforces the mode against the effective action
    // of user-typed rulesToAdd.
    {
      const ruleset = createInteractiveRuleset("");
      const patch = ruleset.createPatch("highlight", {
        url: "https://example.com/",
      });
      // A plain block rule would not produce a highlight effective
      // result.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "*://example.com/*"),
        false,
      );
      // A user-chosen color number is accepted.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@5*://example.com/*"),
        true,
      );
    }
  });

  await t.test("Patch (explicit block / unblock mode)", () => {
    // Explicit "unblock" on a URL that is not blocked: rulesToAdd is ""
    // because the URL is already not blocked, and an empty rulesToAdd
    // is valid (effective result null satisfies "unblock").
    {
      const ruleset = createInteractiveRuleset("");
      const patch = ruleset.createPatch("unblock", {
        url: "https://example.com/",
      });
      assert.equal(patch.mode, "unblock");
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "");
      assert.equal(ruleset.validateRulesToAdd(patch, ""), true);
    }
    // Unblock mode requires an effective result of null or "unblock";
    // a highlight rule does not satisfy it.
    {
      const ruleset = createInteractiveRuleset("*://example.com/*");
      const patch = ruleset.createPatch("unblock", {
        url: "https://example.com/",
      });
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@1*://example.com/*"),
        false,
      );
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@*://example.com/*"),
        true,
      );
    }
  });

  await t.test("Patch (explicit unhighlight mode)", () => {
    // Nothing matches yet: explicit unhighlight is a no-op (no rule to
    // remove, nothing needs to be added because the URL is already not
    // highlighted).
    {
      const ruleset = createInteractiveRuleset("");
      const patch = ruleset.createPatch("unhighlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.mode, "unhighlight");
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "");
      assert.equal(ruleset.applyPatch(patch), "");
    }
    // URL is highlighted by a user rule. The rule is removed; no new
    // rule is needed.
    {
      const ruleset = createInteractiveRuleset("@2*://example.com/*");
      const patch = ruleset.createPatch("unhighlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "@2*://example.com/*");
      assert.equal(ruleset.applyPatch(patch), "");
    }
    // URL is highlighted by a subscription. An unblock rule is
    // suggested to override the subscription highlight.
    {
      const ruleset = createInteractiveRuleset("", ["@1*://example.com/*"]);
      const patch = ruleset.createPatch("unhighlight", {
        url: "https://example.com/",
      });
      assert.equal(patch.rulesToAdd, "@*://example.com/*");
      assert.equal(patch.rulesToRemove, "");
      // A user-typed plain unblock rule is accepted.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@*://example.com/*"),
        true,
      );
      // A higher-color highlight rule overrides the subscription
      // highlight but does not satisfy unhighlight mode.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "@99*://example.com/*"),
        false,
      );
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
    // Subscription rules combine with user rules; user unblock wins
    // over subscription block, and subscription unblock takes effect
    // when the user rule does not cover the URL.
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      assert.deepEqual(ruleset.query({ url: "http://example.net/" }), {
        type: "unblock",
      });
      assert.equal(ruleset.query({ url: "https://example.edu/" }), null);
      assert.deepEqual(
        ruleset.query({ url: "https://example.edu/path/to/example" }),
        { type: "unblock" },
      );
      assert.deepEqual(ruleset.query({ url: "https://www.qinterest.com/" }), {
        type: "block",
      });
    }
    // Patch suggests a more specific block rule when needed.
    {
      const ruleset = createInteractiveRuleset(user);
      const patch = ruleset.createPatch(null, {
        url: "https://www.example.edu/",
      });
      assert.equal(patch.mode, "block");
      assert.equal(patch.searchResult.url, "https://www.example.edu/");
      assert.equal(patch.rulesToAdd, "*://www.example.edu/*");
      assert.equal(patch.rulesToRemove, "");
      // A pattern that does not match the URL is rejected.
      assert.equal(
        ruleset.validateRulesToAdd(patch, "*://example.edu/*"),
        false,
      );
      // A different pattern that does match is accepted, and applyPatch
      // appends it to the existing user ruleset (preserving comments).
      assert.equal(
        ruleset.validateRulesToAdd(patch, "https://*.example.edu/"),
        true,
      );
      assert.equal(
        ruleset.applyPatch(patch, "https://*.example.edu/"),
        `${user}\nhttps://*.example.edu/`,
      );
    }
    // Removing the user block rule alone is enough to unblock when no
    // subscription blocks the URL. applyPatch drops just the matching
    // line and leaves comments intact.
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      const patch = ruleset.createPatch(null, {
        url: "http://www.example.com/path",
      });
      assert.equal(patch.mode, "unblock");
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "*://*.example.com/*");
      assert.equal(
        ruleset.applyPatch(patch),
        String.raw`# Block 'example.net' and 'example.org'
/example\.(net|org)/
# But unblock 'example.net'
@*://example.net/*`,
      );
    }
    // The user has both a block rule (via regex) and an unblock rule
    // for example.net. Auto-detect picks "block", removing the unblock
    // rule. The remaining regex block keeps the URL blocked, so no new
    // rule is needed.
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      const patch = ruleset.createPatch(null, { url: "https://example.net/" });
      assert.equal(patch.mode, "block");
      assert.equal(patch.rulesToAdd, "");
      assert.equal(patch.rulesToRemove, "@*://example.net/*");
      // Re-introducing an unblock rule reverses the block; rejected.
      assert.equal(ruleset.validateRulesToAdd(patch, "@/net/"), false);
      // A comment-only rulesToAdd is accepted because the existing
      // regex still produces a "block" effective result.
      assert.equal(ruleset.validateRulesToAdd(patch, "Only comment"), true);
    }
    // A user-typed rulesToAdd that contains both the suggested block
    // and an extra unblock fails validation: the unblock dominates.
    {
      const ruleset = createInteractiveRuleset(user, subscriptions);
      const patch = ruleset.createPatch(null, {
        url: "http://www.example.edu/foo/bar",
      });
      assert.equal(patch.mode, "block");
      assert.equal(
        ruleset.validateRulesToAdd(
          patch,
          `*://www.example.edu/*
@/edu/`,
        ),
        false,
      );
    }
  });

  await t.test("Matching rules collection", () => {
    // Without `collectMatchingRules`, the field is null.
    {
      const ruleset = createInteractiveRuleset("*://example.com/*");
      const patch = ruleset.createPatch(null, { url: "https://example.com/" });
      assert.equal(patch.matchingRules, null);
    }
    // With `collectMatchingRules: true`, matches across user and
    // subscription rulesets are grouped by action type and rendered as
    // `# <rulesetName>` headers followed by `<lineNumber>: <rule>`
    // lines, with rulesets separated by a blank line. Line numbers
    // within one action group share a width that fits the largest line
    // number in that group across all rulesets. Rulesets with no
    // matches in a given group are omitted entirely (no header).
    //
    // The user ruleset below places block-action rules at lines 1 and
    // 12 so the block group's width is 2 (exercising padStart). It also
    // includes an unblock and a highlight rule that do NOT match the
    // target URL, so we can confirm that empty groups produce an empty
    // string rather than bare headers.
    {
      const user = `*://example.com/*
# filler
# filler
# filler
# filler
# filler
# filler
# filler
# filler
# filler
# filler
*://*.example.com/*
@*://other.example.com/*
@1*://other.example.com/*`;
      const subscriptions = [`*://example.com/*`];
      const ruleset = createInteractiveRuleset(user, subscriptions);
      const patch = ruleset.createPatch(
        null,
        { url: "https://example.com/" },
        { collectMatchingRules: true },
      );
      if (patch.matchingRules == null) {
        assert.fail("matchingRules should be populated");
      }
      const { block, unblock, highlight } = patch.matchingRules;
      // Block group: user matches at lines 1 and 12 → width 2; the
      // subscription's line 1 is padded to the same width.
      assert.equal(
        block,
        `# user
 1: *://example.com/*
12: *://*.example.com/*

# 0
 1: *://example.com/*`,
      );
      // Unblock/highlight rules don't match https://example.com/, so
      // both groups are empty and produce no output at all.
      assert.equal(unblock, "");
      assert.equal(highlight, "");
    }
    // When only some rulesets have matches in a group, only those
    // rulesets emit a header. Here the subscription has no block match,
    // so only the user header appears in the block group.
    {
      const user = `*://example.com/*`;
      const subscriptions = [`*://other.example.com/*`];
      const ruleset = createInteractiveRuleset(user, subscriptions);
      const patch = ruleset.createPatch(
        null,
        { url: "https://example.com/" },
        { collectMatchingRules: true },
      );
      if (patch.matchingRules == null) {
        assert.fail("matchingRules should be populated");
      }
      assert.equal(
        patch.matchingRules.block,
        `# user
1: *://example.com/*`,
      );
    }
  });

  await t.test("PSL (useRegistrableDomain)", () => {
    // chuo.tokyo.jp is a public suffix, so the registrable domain is
    // city.chuo.tokyo.jp; the suggestion wildcards `*.` on top of it
    // rather than walking up to tokyo.jp.
    {
      const ruleset = createInteractiveRuleset("");
      const patch = ruleset.createPatch(
        null,
        { url: "https://www.library.city.chuo.tokyo.jp" },
        { useRegistrableDomain: true },
      );
      assert.equal(patch.rulesToAdd, "*://*.city.chuo.tokyo.jp/*");
      assert.equal(ruleset.applyPatch(patch), "*://*.city.chuo.tokyo.jp/*");
    }
    // With a subscription block, useRegistrableDomain widens the
    // unblock pattern to cover the whole registrable domain.
    {
      const ruleset = createInteractiveRuleset("", ["*://*.example.com/*"]);
      const patch = ruleset.createPatch(
        null,
        { url: "https://www.example.com/" },
        { useRegistrableDomain: true },
      );
      assert.equal(patch.mode, "unblock");
      assert.equal(patch.rulesToAdd, "@*://*.example.com/*");
      assert.equal(ruleset.applyPatch(patch), "@*://*.example.com/*");
    }
  });
});
