import assert from "node:assert";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import type { RemoteSerpInfo, SerpInfoSettings } from "./serpinfo-settings.ts";

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".yml")) {
      return {
        format: "module",
        source: `export default ${JSON.stringify(readFileSync(new URL(url), "utf8"))};`,
        shortCircuit: true,
      };
    }
    return nextLoad(url, context);
  },
});

const { parse } = await import("@ublacklist/serpinfo");
const { BUILTINS, GOOGLE_SERPINFO_URL } = await import("./builtin-serpinfo.ts");
const { getDefault, mergeBuiltins } = await import("./serpinfo-settings.ts");

const maybeBuiltin = BUILTINS.find((b) => b.url !== GOOGLE_SERPINFO_URL);
assert.ok(maybeBuiltin);
const builtin = maybeBuiltin;
const builtinParseResult = parse(builtin.content);
assert.ok(builtinParseResult.success);
const builtinLastModified = builtinParseResult.data.lastModified;
assert.ok(builtinLastModified != null);

const olderContent = `name: Older
lastModified: 2000-01-01T00:00:00Z
pages: []
`;
const newerContent = `name: Newer
lastModified: 9999-01-01T00:00:00Z
pages: []
`;

function withStored(
  modify: (stored: RemoteSerpInfo) => RemoteSerpInfo,
): SerpInfoSettings {
  const settings = getDefault();
  return {
    ...settings,
    remote: settings.remote.map((r) => (r.url === builtin.url ? modify(r) : r)),
  };
}

function findMerged(settings: Readonly<SerpInfoSettings>): RemoteSerpInfo {
  const merged = mergeBuiltins(settings).remote.find(
    (r) => r.url === builtin.url,
  );
  assert.ok(merged);
  return merged;
}

function parsedOf(content: string) {
  const parseResult = parse(content);
  assert.ok(parseResult.success);
  return parseResult.data;
}

test("mergeBuiltins", async (t) => {
  await t.test("creates missing entries from the builtin content", () => {
    const settings = getDefault();
    assert.strictEqual(settings.remote.length, BUILTINS.length);
    for (const b of BUILTINS) {
      const entry = settings.remote.find((r) => r.url === b.url);
      assert.ok(entry);
      assert.strictEqual(entry.custom, false);
      assert.strictEqual(entry.enabled, b.url === GOOGLE_SERPINFO_URL);
      assert.strictEqual(entry.content, b.content);
      assert.notStrictEqual(entry.parsed, null);
    }
  });

  await t.test("keeps enabled entries as is", () => {
    const merged = findMerged(
      withStored((stored) => ({
        ...stored,
        enabled: true,
        content: olderContent,
        parsed: parsedOf(olderContent),
      })),
    );
    assert.strictEqual(merged.content, olderContent);
  });

  await t.test(
    "updates disabled entries older than the builtin content",
    () => {
      const merged = findMerged(
        withStored((stored) => ({
          ...stored,
          enabled: false,
          content: olderContent,
          parsed: parsedOf(olderContent),
          downloadError: "Failed to fetch",
        })),
      );
      assert.strictEqual(merged.content, builtin.content);
      assert.strictEqual(merged.parsed?.lastModified, builtinLastModified);
      assert.strictEqual(merged.downloadError, null);
    },
  );

  await t.test("keeps disabled entries newer than the builtin content", () => {
    const merged = findMerged(
      withStored((stored) => ({
        ...stored,
        enabled: false,
        content: newerContent,
        parsed: parsedOf(newerContent),
      })),
    );
    assert.strictEqual(merged.content, newerContent);
  });

  await t.test("updates disabled entries without content", () => {
    const merged = findMerged(
      withStored((stored) => ({
        ...stored,
        enabled: false,
        content: null,
        parsed: null,
      })),
    );
    assert.strictEqual(merged.content, builtin.content);
  });

  await t.test("updates disabled entries with unparsable content", () => {
    const merged = findMerged(
      withStored((stored) => ({
        ...stored,
        enabled: false,
        content: "invalid: [",
        parsed: null,
        parseError: "Parse error",
      })),
    );
    assert.strictEqual(merged.content, builtin.content);
    assert.strictEqual(merged.parseError, null);
  });
});
