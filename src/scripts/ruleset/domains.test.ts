import assert from "node:assert";
import { test } from "node:test";
import { domainsToRuleset, parseDomainLine } from "./domains.ts";
import { Ruleset } from "./ruleset.ts";

test("parseDomainLine", async (t) => {
  await t.test("accepts valid domains", () => {
    assert.strictEqual(parseDomainLine("example.com"), "example.com");
    assert.strictEqual(parseDomainLine("sub.example.com"), "sub.example.com");
    assert.strictEqual(
      parseDomainLine("a.b.c.example.com"),
      "a.b.c.example.com",
    );
    assert.strictEqual(
      parseDomainLine("xn--fsq.xn--zckzah"),
      "xn--fsq.xn--zckzah",
    );
    assert.strictEqual(
      parseDomainLine("label-with-hyphens.example.com"),
      "label-with-hyphens.example.com",
    );
  });

  await t.test("trims surrounding whitespace", () => {
    assert.strictEqual(parseDomainLine("  example.com  "), "example.com");
    assert.strictEqual(parseDomainLine("\texample.com\t"), "example.com");
  });

  await t.test("ignores empty and comment lines", () => {
    assert.strictEqual(parseDomainLine(""), null);
    assert.strictEqual(parseDomainLine("   "), null);
    assert.strictEqual(parseDomainLine("# comment"), null);
    assert.strictEqual(parseDomainLine("  # indented comment"), null);
    assert.strictEqual(parseDomainLine("#"), null);
  });

  await t.test("rejects invalid domains", () => {
    assert.strictEqual(parseDomainLine("no-dot"), null);
    assert.strictEqual(parseDomainLine(".leading.dot"), null);
    assert.strictEqual(parseDomainLine("trailing.dot."), null);
    assert.strictEqual(parseDomainLine("-leading.hyphen.com"), null);
    assert.strictEqual(parseDomainLine("trailing.hyphen-.com"), null);
    assert.strictEqual(parseDomainLine("double..dot.com"), null);
    assert.strictEqual(parseDomainLine("under_score.com"), null);
    assert.strictEqual(parseDomainLine("space here.com"), null);
    assert.strictEqual(parseDomainLine("0.0.0.0 example.com"), null);
    assert.strictEqual(parseDomainLine("example.com extra"), null);
    // Unicode is not accepted; callers must supply Punycode
    assert.strictEqual(parseDomainLine("例.テスト"), null);
  });

  await t.test("rejects overly long labels and domains", () => {
    const longLabel = "a".repeat(64);
    assert.strictEqual(parseDomainLine(`${longLabel}.com`), null);
    const longDomain = `${"a".repeat(60)}.${"b".repeat(60)}.${"c".repeat(60)}.${"d".repeat(60)}.${"e".repeat(60)}.com`;
    assert.ok(longDomain.length > 253);
    assert.strictEqual(parseDomainLine(longDomain), null);
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
      assert.strictEqual(
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
    assert.strictEqual(output, ["*://*.example.com/*", "", ""].join("\n"));
  });

  await t.test("preserves trailing newline behavior of split/join", () => {
    const input = "example.com\n";
    const output = domainsToRuleset(input);
    assert.strictEqual(output, "*://*.example.com/*\n");
  });

  await t.test("produces a ruleset that matches the expected URLs", () => {
    const output = domainsToRuleset("example.com");
    const ruleset = new Ruleset(output);
    assert.ok(ruleset.test({ url: "https://example.com/" }));
    assert.ok(ruleset.test({ url: "https://sub.example.com/path" }));
    assert.ok(!ruleset.test({ url: "https://example.net/" }));
  });
});
