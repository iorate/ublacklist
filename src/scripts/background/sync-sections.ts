import dayjs from "dayjs";
import { omit } from "es-toolkit";
import { z } from "zod";
import { postMessage } from "../shared/messages.ts";
import * as SerpInfoSettings from "../shared/serpinfo-settings.ts";
import type { Subscriptions } from "../shared/types.ts";
import { numberKeys, parseJSON, toPlainRuleset } from "../shared/utilities.ts";
import type { RawStorageItems } from "./raw-storage.ts";
import { updateAllRemote as updateAllRemoteSerpInfo } from "./serpinfo.ts";
import { updateAll as updateAllSubscriptions } from "./subscriptions.ts";

const SYNC_BLOCKLIST_FILENAME = "uBlacklist.txt";
const SYNC_GENERAL_FILENAME = "general.json";
const SYNC_APPEARANCE_FILENAME = "appearance.json";
const SYNC_SUBSCRIPTIONS_FILENAME = "subscriptions.json";
const SYNC_SERPINFO_FILENAME = "serpinfo.json";

export type SyncDirtyFlags = {
  blocklist: boolean;
  general: boolean;
  appearance: boolean;
  subscriptions: boolean;
  serpInfo: boolean;
};

type SyncEnabledKey =
  | "syncBlocklist"
  | "syncGeneral"
  | "syncAppearance"
  | "syncSubscriptions"
  | "syncSerpInfo";

export type SyncSectionConfig = {
  enabledKey: SyncEnabledKey;
  dirtyFlagKey: keyof SyncDirtyFlags;
  filename: string;
  getModifiedTime(items: Readonly<RawStorageItems>): string;
  serialize(localItems: Readonly<RawStorageItems>): string;
  deserialize(
    content: string,
    cloudModifiedTime: string,
    localItems: Readonly<RawStorageItems>,
  ): Partial<RawStorageItems>;
  affectedKeys: readonly (keyof RawStorageItems)[];
  afterSync?(cloudItems: Readonly<Partial<RawStorageItems>>): void;
};

export type SyncSection = {
  beforeSync(
    items: Readonly<RawStorageItems>,
    dirtyFlags: Readonly<SyncDirtyFlags>,
  ): { shouldUpload: boolean };
  beforeUpload(localItems: Readonly<RawStorageItems>): {
    filename: string;
    content: string;
    modifiedTime: dayjs.Dayjs;
  };
  afterDownload(
    cloudItems: Readonly<Partial<RawStorageItems>>,
    cloudContent: string,
    cloudModifiedTime: dayjs.Dayjs,
    localItems: Readonly<RawStorageItems>,
  ): Partial<RawStorageItems>;
  afterDownloadAll(
    cloudItems: Readonly<Partial<RawStorageItems>>,
    localItems: Readonly<RawStorageItems>,
    latestLocalItems: Readonly<RawStorageItems>,
  ): Partial<RawStorageItems>;
  afterSync?(cloudItems: Readonly<Partial<RawStorageItems>>): void;
};

function createSyncSection(config: SyncSectionConfig): SyncSection {
  return {
    beforeSync(items, dirtyFlags) {
      return {
        shouldUpload:
          items[config.enabledKey] && dirtyFlags[config.dirtyFlagKey],
      };
    },
    beforeUpload(localItems) {
      return {
        filename: config.filename,
        content: config.serialize(localItems),
        modifiedTime: dayjs(config.getModifiedTime(localItems)),
      };
    },
    afterDownload(cloudItems, cloudContent, cloudModifiedTime, localItems) {
      return {
        ...cloudItems,
        ...config.deserialize(
          cloudContent,
          cloudModifiedTime.toISOString(),
          localItems,
        ),
      };
    },
    afterDownloadAll(cloudItems, localItems, latestLocalItems) {
      if (
        config.getModifiedTime(localItems) !==
        config.getModifiedTime(latestLocalItems)
      ) {
        return omit(cloudItems, [...config.affectedKeys]);
      }
      return { ...cloudItems };
    },
    ...(config.afterSync ? { afterSync: config.afterSync } : {}),
  };
}

export const syncSectionConfigs: Readonly<
  Record<keyof SyncDirtyFlags, SyncSectionConfig>
> = {
  blocklist: {
    enabledKey: "syncBlocklist",
    dirtyFlagKey: "blocklist",
    filename: SYNC_BLOCKLIST_FILENAME,
    getModifiedTime(items) {
      return items.timestamp;
    },
    serialize(localItems) {
      return localItems.blacklist;
    },
    deserialize(content, cloudModifiedTime) {
      return {
        ruleset: toPlainRuleset(content),
        blacklist: content,
        timestamp: cloudModifiedTime,
      };
    },
    affectedKeys: ["ruleset", "blacklist", "timestamp"],
    afterSync(cloudItems) {
      if (cloudItems.blacklist != null) {
        postMessage("blocklist-saved", cloudItems.blacklist, "background");
      }
    },
  },
  general: {
    enabledKey: "syncGeneral",
    dirtyFlagKey: "general",
    filename: SYNC_GENERAL_FILENAME,
    getModifiedTime(items) {
      return items.generalLastModified;
    },
    serialize(localItems) {
      return JSON.stringify({
        skipBlockDialog: localItems.skipBlockDialog,
        hideBlockLinks: localItems.hideBlockLinks,
        hideControl: localItems.hideControl,
        enableMatchingRules: localItems.enableMatchingRules,
        blockWholeSite: localItems.blockWholeSite,
      });
    },
    deserialize(content, cloudModifiedTime) {
      const parseResult = z
        .object({
          skipBlockDialog: z.boolean(),
          hideBlockLinks: z.boolean(),
          hideControl: z.boolean(),
          enableMatchingRules: z.boolean().optional(),
          blockWholeSite: z.boolean().optional(),
        })
        .safeParse(parseJSON(content));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_GENERAL_FILENAME}`);
      }
      const items = parseResult.data;
      return {
        skipBlockDialog: items.skipBlockDialog,
        hideBlockLinks: items.hideBlockLinks,
        hideControl: items.hideControl,
        ...(items.enableMatchingRules != null
          ? { enableMatchingRules: items.enableMatchingRules }
          : {}),
        ...(items.blockWholeSite != null
          ? { blockWholeSite: items.blockWholeSite }
          : {}),
        generalLastModified: cloudModifiedTime,
      };
    },
    affectedKeys: [
      "skipBlockDialog",
      "hideBlockLinks",
      "hideControl",
      "enableMatchingRules",
      "blockWholeSite",
      "generalLastModified",
    ],
  },
  appearance: {
    enabledKey: "syncAppearance",
    dirtyFlagKey: "appearance",
    filename: SYNC_APPEARANCE_FILENAME,
    getModifiedTime(items) {
      return items.appearanceLastModified;
    },
    serialize(localItems) {
      return JSON.stringify({
        linkColor: localItems.linkColor,
        blockColor: localItems.blockColor,
        highlightColors: localItems.highlightColors,
        dialogTheme: localItems.dialogTheme,
      });
    },
    deserialize(content, cloudModifiedTime) {
      const parseResult = z
        .object({
          linkColor: z.string(),
          blockColor: z.string(),
          highlightColors: z.string().array(),
          dialogTheme: z.enum(["light", "dark", "default"]),
        })
        .safeParse(parseJSON(content));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_APPEARANCE_FILENAME}`);
      }
      const items = parseResult.data;
      return {
        linkColor: items.linkColor,
        blockColor: items.blockColor,
        highlightColors: items.highlightColors,
        dialogTheme: items.dialogTheme,
        appearanceLastModified: cloudModifiedTime,
      };
    },
    affectedKeys: [
      "linkColor",
      "blockColor",
      "highlightColors",
      "dialogTheme",
      "appearanceLastModified",
    ],
  },
  subscriptions: {
    enabledKey: "syncSubscriptions",
    dirtyFlagKey: "subscriptions",
    filename: SYNC_SUBSCRIPTIONS_FILENAME,
    getModifiedTime(items) {
      return items.subscriptionsLastModified;
    },
    serialize(localItems) {
      return JSON.stringify(
        Object.values(localItems.subscriptions).map((s) => ({
          name: s.name,
          url: s.url,
          type: s.type ?? "ruleset",
          enabled: s.enabled ?? true,
        })),
      );
    },
    deserialize(content, cloudModifiedTime, localItems) {
      const parseResult = z
        .object({
          name: z.string(),
          url: z.string(),
          type: z.enum(["ruleset", "domains"]).optional(),
          enabled: z.boolean().optional(),
        })
        .array()
        .safeParse(parseJSON(content));
      if (!parseResult.success) {
        throw new Error(`File corrupted: ${SYNC_SUBSCRIPTIONS_FILENAME}`);
      }
      const items = parseResult.data;
      const subscriptions: Subscriptions = {};
      let nextSubscriptionId = localItems.nextSubscriptionId;
      for (const { name, url, type, enabled } of items) {
        subscriptions[nextSubscriptionId++] = {
          name,
          url,
          type: type ?? "ruleset",
          blacklist: "",
          updateResult: null,
          enabled: enabled ?? true,
        };
      }
      return {
        subscriptions,
        nextSubscriptionId,
        subscriptionsLastModified: cloudModifiedTime,
      };
    },
    affectedKeys: [
      "subscriptions",
      "nextSubscriptionId",
      "subscriptionsLastModified",
    ],
    afterSync(cloudItems) {
      if (
        cloudItems.subscriptions &&
        numberKeys(cloudItems.subscriptions).length
      ) {
        void updateAllSubscriptions();
      }
    },
  },
  serpInfo: {
    enabledKey: "syncSerpInfo",
    dirtyFlagKey: "serpInfo",
    filename: SYNC_SERPINFO_FILENAME,
    getModifiedTime(items) {
      return items.serpInfoSettings.lastModified;
    },
    serialize(localItems) {
      return SerpInfoSettings.serialize(localItems.serpInfoSettings);
    },
    deserialize(content, cloudModifiedTime) {
      const settings = SerpInfoSettings.deserialize(content);
      if (!settings) {
        throw new Error(`File corrupted: ${SYNC_SERPINFO_FILENAME}`);
      }
      return {
        serpInfoSettings: { ...settings, lastModified: cloudModifiedTime },
      };
    },
    affectedKeys: ["serpInfoSettings"],
    afterSync(cloudItems) {
      if (cloudItems.serpInfoSettings) {
        void updateAllRemoteSerpInfo();
      }
    },
  },
};

export const syncSections: readonly SyncSection[] =
  Object.values(syncSectionConfigs).map(createSyncSection);
