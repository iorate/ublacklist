import { escapeRegExp } from "es-toolkit/string";
import {
  loadFromRawStorage,
  modifyInRawStorage,
} from "../background/raw-storage.ts";
import { syncDelayed } from "../background/sync.ts";
import { browser } from "../browser.ts";
import {
  rulesetSubscriptionURL,
  serpinfoSubscriptionURL,
} from "../constants.ts";
import {
  addMessageFromTabListeners,
  addMessageListeners,
} from "../messages.ts";
import { HTTPError } from "../utilities.ts";
import {
  addRemote,
  mergeBuiltins,
  removeRemote,
  type SerpInfoSettings,
  setRemoteDownloaded,
  setRemoteEnabled,
  setUser,
} from "./settings.ts";

const UPDATE_ALARM_NAME = "update-all-remote-serpinfo";
const UPDATE_INTERVAL_IN_MINUTES = 60 * 24; // 1 day

function modifySettings(
  modify: (settings: Readonly<SerpInfoSettings>) => SerpInfoSettings,
): Promise<void> {
  return modifyInRawStorage(["serpInfoSettings"], ({ serpInfoSettings }) => ({
    serpInfoSettings: modify(serpInfoSettings),
  }));
}

async function updateRemote(url: string) {
  let textOrError: string | Error;
  try {
    const response = await fetch(url);
    textOrError = response.ok
      ? await response.text()
      : new HTTPError(response.status, response.statusText);
  } catch (e) {
    textOrError = e instanceof Error ? e : new Error("Unknown error");
  }
  await modifySettings((settings) =>
    typeof textOrError === "string"
      ? setRemoteDownloaded(settings, url, textOrError, null)
      : setRemoteDownloaded(settings, url, null, textOrError.message),
  );
}

// Update remote SERPINFO that is enabled or not yet downloaded
export async function updateAllRemote() {
  const { serpInfoSettings } = await loadFromRawStorage(["serpInfoSettings"]);
  const urls = serpInfoSettings.remote.flatMap((r) =>
    r.enabled || r.content == null ? r.url : [],
  );
  await Promise.all(urls.map(updateRemote));
}

async function setupUpdateAlarm() {
  if (await browser.alarms.get(UPDATE_ALARM_NAME)) {
    return;
  }
  void updateAllRemote();
  await (browser.alarms.create(UPDATE_ALARM_NAME, {
    periodInMinutes: UPDATE_INTERVAL_IN_MINUTES,
  }) as unknown as Promise<void>);
}

function setupSubscriptionURL(): Promise<void> {
  if (process.env.BROWSER !== "safari") {
    return browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              regexSubstitution: `${browser.runtime.getURL("pages/options.html")}\\1`,
            },
          },
          condition: {
            regexFilter: `^${escapeRegExp(rulesetSubscriptionURL)}(\\?.*)`,
            resourceTypes: ["main_frame"],
          },
        },
        {
          id: 2,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              regexSubstitution: `${browser.runtime.getURL("pages/serpinfo/options.html")}\\1`,
            },
          },
          condition: {
            regexFilter: `^${escapeRegExp(serpinfoSubscriptionURL)}(\\?.*)`,
            resourceTypes: ["main_frame"],
          },
        },
      ],
    });
  }
  return Promise.resolve();
}

export function onStartup() {
  void modifySettings(mergeBuiltins).then(() => setupUpdateAlarm());
  void setupSubscriptionURL();
}

export function main() {
  addMessageFromTabListeners({
    "notify-blocked-result-count"(tabId: number, count: number) {
      browser.action.setBadgeText({
        tabId,
        text: count ? String(count) : "",
      });
    },
  });
  addMessageListeners({
    async "set-user-serpinfo"(userInput: string) {
      await modifySettings((settings) =>
        setUser(settings, userInput, new Date()),
      );
      syncDelayed({ serpInfo: true });
    },
    async "add-remote-serpinfo"(url: string) {
      await modifySettings((settings) => addRemote(settings, url, new Date()));
      syncDelayed({ serpInfo: true });
      void updateRemote(url);
    },
    async "remove-remote-serpinfo"(url: string) {
      await modifySettings((settings) =>
        removeRemote(settings, url, new Date()),
      );
      syncDelayed({ serpInfo: true });
    },
    async "enable-remote-serpinfo"(url: string, enabled: boolean) {
      await modifySettings((settings) =>
        setRemoteEnabled(settings, url, enabled, new Date()),
      );
      syncDelayed({ serpInfo: true });
      if (enabled) {
        void updateRemote(url);
      }
    },
    "update-all-remote-serpinfo"() {
      return updateAllRemote();
    },
  });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === UPDATE_ALARM_NAME) {
      void updateAllRemote();
    }
  });
}
