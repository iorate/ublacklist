import assert from "node:assert";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import type { RawStorageItems } from "./raw-storage.ts";

globalThis.browser = { i18n: { getMessage: () => "" } };

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("dayjs/plugin/") && !specifier.endsWith(".js")) {
      return nextResolve(`${specifier}.js`, context);
    }
    return nextResolve(specifier, context);
  },
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

const { syncSectionConfigs } = await import("./sync-sections.ts");
const { defaultLocalStorageItems } = await import("../shared/local-storage.ts");

const timeZero = new Date(0).toISOString();
const cloudModifiedTime = "2026-01-02T03:04:05.678Z";

const customRemote = {
  url: "https://example.com/serpinfo.yml",
  custom: true,
  enabled: true,
  content: null,
  parsed: null,
  downloadError: null,
  parseError: null,
};

const localItems: RawStorageItems = {
  ...defaultLocalStorageItems,
  blacklist: "*://example.com/*",
  skipBlockDialog: true,
  hideControl: true,
  blockWholeSite: true,
  linkColor: "#1a0dab",
  highlightColors: ["#ddeeff"],
  dialogTheme: "dark",
  subscriptions: {
    0: {
      name: "Example",
      url: "https://example.com/uBlacklist.txt",
      type: "ruleset",
      blacklist: "",
      updateResult: null,
      enabled: true,
    },
    1: {
      name: "Domains",
      url: "https://example.com/domains.txt",
      type: "domains",
      blacklist: "",
      updateResult: null,
      enabled: false,
    },
    2: {
      name: "Legacy",
      url: "https://example.com/legacy.txt",
      blacklist: "",
      updateResult: null,
    },
  },
  serpInfoSettings: {
    ...defaultLocalStorageItems.serpInfoSettings,
    remote: [...defaultLocalStorageItems.serpInfoSettings.remote, customRemote],
  },
  timestamp: timeZero,
  generalLastModified: timeZero,
  appearanceLastModified: timeZero,
  syncCloudToken: false,
  nextSubscriptionId: 3,
  subscriptionsLastModified: timeZero,
};

test("syncSectionConfigs", async (t) => {
  await t.test("round-trips serialize and deserialize", () => {
    for (const config of Object.values(syncSectionConfigs)) {
      const content = config.serialize(localItems);
      const updated = {
        ...localItems,
        ...config.deserialize(content, cloudModifiedTime, localItems),
      };
      assert.strictEqual(config.serialize(updated), content, config.filename);
      assert.strictEqual(
        config.getModifiedTime(updated),
        cloudModifiedTime,
        config.filename,
      );
    }
  });

  await t.test("serializes to the current file formats", () => {
    assert.strictEqual(
      syncSectionConfigs.blocklist.serialize(localItems),
      "*://example.com/*",
    );
    assert.strictEqual(
      syncSectionConfigs.general.serialize(localItems),
      '{"skipBlockDialog":true,"hideBlockLinks":false,"hideControl":true,"enableMatchingRules":false,"blockWholeSite":true}',
    );
    assert.strictEqual(
      syncSectionConfigs.appearance.serialize(localItems),
      '{"linkColor":"#1a0dab","blockColor":"default","highlightColors":["#ddeeff"],"dialogTheme":"dark"}',
    );
    assert.strictEqual(
      syncSectionConfigs.subscriptions.serialize(localItems),
      '[{"name":"Example","url":"https://example.com/uBlacklist.txt","type":"ruleset","enabled":true},{"name":"Domains","url":"https://example.com/domains.txt","type":"domains","enabled":false},{"name":"Legacy","url":"https://example.com/legacy.txt","type":"ruleset","enabled":true}]',
    );
    assert.strictEqual(
      syncSectionConfigs.serpInfo.serialize({
        ...localItems,
        serpInfoSettings: {
          user: { content: "name: My SERPINFO\npages: []\n", parsed: null },
          remote: [customRemote],
          serpIndexMap: defaultLocalStorageItems.serpInfoSettings.serpIndexMap,
          lastModified: timeZero,
        },
      }),
      '{"user":{"content":"name: My SERPINFO\\npages: []\\n"},"remote":[{"url":"https://example.com/serpinfo.yml","custom":true,"enabled":true}]}',
    );
  });

  await t.test(
    "keeps optional general fields absent from the cloud file",
    () => {
      assert.deepStrictEqual(
        syncSectionConfigs.general.deserialize(
          '{"skipBlockDialog":false,"hideBlockLinks":true,"hideControl":false}',
          cloudModifiedTime,
          localItems,
        ),
        {
          skipBlockDialog: false,
          hideBlockLinks: true,
          hideControl: false,
          generalLastModified: cloudModifiedTime,
        },
      );
      assert.deepStrictEqual(
        syncSectionConfigs.general.deserialize(
          '{"skipBlockDialog":false,"hideBlockLinks":true,"hideControl":false,"enableMatchingRules":true,"blockWholeSite":false}',
          cloudModifiedTime,
          localItems,
        ),
        {
          skipBlockDialog: false,
          hideBlockLinks: true,
          hideControl: false,
          enableMatchingRules: true,
          blockWholeSite: false,
          generalLastModified: cloudModifiedTime,
        },
      );
    },
  );

  await t.test("throws on corrupted content", () => {
    for (const key of [
      "general",
      "appearance",
      "subscriptions",
      "serpInfo",
    ] as const) {
      const config = syncSectionConfigs[key];
      for (const content of ["broken", "{}"]) {
        assert.throws(
          () => config.deserialize(content, cloudModifiedTime, localItems),
          new Error(`File corrupted: ${config.filename}`),
        );
      }
    }
  });
});
