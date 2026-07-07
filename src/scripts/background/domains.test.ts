import assert from "node:assert/strict";
import { test } from "node:test";
import { Ruleset } from "@ublacklist/ruleset";
import { domainsToRuleset, parseDomainLine } from "./domains.ts";

test("parseDomainLine", async (t) => {
  await t.test("accepts valid domains", () => {
    assert.equal(parseDomainLine("example.com"), "example.com");
    assert.equal(parseDomainLine("sub.example.com"), "sub.example.com");
    assert.equal(parseDomainLine("a.b.c.example.com"), "a.b.c.example.com");
    assert.equal(parseDomainLine("xn--fsq.xn--zckzah"), "xn--fsq.xn--zckzah");
    assert.equal(
      parseDomainLine("label-with-hyphens.example.com"),
      "label-with-hyphens.example.com",
    );
  });

  await t.test("trims surrounding whitespace", () => {
    assert.equal(parseDomainLine("  example.com  "), "example.com");
    assert.equal(parseDomainLine("\texample.com\t"), "example.com");
  });

  await t.test("ignores empty and comment lines", () => {
    assert.equal(parseDomainLine(""), null);
    assert.equal(parseDomainLine("   "), null);
    assert.equal(parseDomainLine("# comment"), null);
    assert.equal(parseDomainLine("  # indented comment"), null);
    assert.equal(parseDomainLine("#"), null);
  });

  await t.test("rejects invalid domains", () => {
    assert.equal(parseDomainLine("no-dot"), null);
    assert.equal(parseDomainLine(".leading.dot"), null);
    assert.equal(parseDomainLine("trailing.dot."), null);
    assert.equal(parseDomainLine("-leading.hyphen.com"), null);
    assert.equal(parseDomainLine("trailing.hyphen-.com"), null);
    assert.equal(parseDomainLine("double..dot.com"), null);
    assert.equal(parseDomainLine("under_score.com"), null);
    assert.equal(parseDomainLine("space here.com"), null);
    assert.equal(parseDomainLine("0.0.0.0 example.com"), null);
    assert.equal(parseDomainLine("example.com extra"), null);
    // Unicode is not accepted; callers must supply Punycode
    assert.equal(parseDomainLine("例.テスト"), null);
  });

  await t.test("rejects overly long labels and domains", () => {
    const longLabel = "a".repeat(64);
    assert.equal(parseDomainLine(`${longLabel}.com`), null);
    const longDomain = `${"a".repeat(60)}.${"b".repeat(60)}.${"c".repeat(60)}.${"d".repeat(60)}.${"e".repeat(60)}.com`;
    assert.ok(longDomain.length > 253);
    assert.equal(parseDomainLine(longDomain), null);
  });
});

test("domainsToRuleset", async (t) => {
  await t.test(
    "converts domains to match patterns preserving line numbers",
    () => {
      const input = ["example.com", "", "# comment", "sub.example.net"].join(
        "\n",
      );
      const output = domainsToRuleset(input);
      assert.equal(
        output,
        ["*://*.example.com/*", "", "", "*://*.sub.example.net/*"].join("\n"),
      );
    },
  );

  await t.test("replaces invalid lines with empty lines", () => {
    const input = ["example.com", "invalid_line", "1.2.3.4 host.com"].join(
      "\n",
    );
    const output = domainsToRuleset(input);
    assert.equal(output, ["*://*.example.com/*", "", ""].join("\n"));
  });

  await t.test("preserves trailing newline behavior of split/join", () => {
    const input = "example.com\n";
    const output = domainsToRuleset(input);
    assert.equal(output, "*://*.example.com/*\n");
  });

  await t.test("produces a ruleset that matches the expected URLs", () => {
    const output = domainsToRuleset("example.com");
    const ruleset = new Ruleset(output);
    assert.ok(ruleset.test({ url: "https://example.com/" }));
    assert.ok(ruleset.test({ url: "https://sub.example.com/path" }));
    assert.ok(!ruleset.test({ url: "https://example.net/" }));
  });
});
