import dayjs from "dayjs";
import { omit } from "es-toolkit";
import { browser } from "../shared/browser.ts";
import { clampUpdateInterval } from "../shared/intervals.ts";
import { postMessage } from "../shared/messages.ts";
import type { SubscriptionId } from "../shared/types.ts";
import {
  errorResult,
  HTTPError,
  numberKeys,
  successResult,
  toPlainRuleset,
} from "../shared/utilities.ts";
import { domainsToRuleset } from "./domains.ts";
import { loadFromRawStorage, modifyInRawStorage } from "./raw-storage.ts";

export const UPDATE_ALL_ALARM_NAME = "update-all-subscriptions";

const updating = new Set<SubscriptionId>();

async function tryLock(
  id: SubscriptionId,
  callback: () => Promise<void>,
): Promise<void> {
  if (updating.has(id)) {
    return;
  }
  updating.add(id);
  try {
    await callback();
  } finally {
    updating.delete(id);
  }
}

export function update(id: SubscriptionId): Promise<void> {
  return tryLock(id, async () => {
    const { subscriptions } = await loadFromRawStorage(["subscriptions"]);
    const subscription =
      subscriptions[id] && omit(subscriptions[id], ["compiledRules"]);
    if (!subscription || !(subscription.enabled ?? true)) {
      return;
    }

    postMessage("subscription-updating", id);

    try {
      const response = await fetch(subscription.url);
      if (response.ok) {
        const source = await response.text();
        const rulesetSource =
          subscription.type === "domains" ? domainsToRuleset(source) : source;
        subscription.ruleset = toPlainRuleset(rulesetSource);
        subscription.blacklist = source;
        subscription.updateResult = successResult();
      } else {
        subscription.updateResult = errorResult(
          new HTTPError(response.status, response.statusText).message,
        );
      }
    } catch (e: unknown) {
      subscription.updateResult = errorResult(
        e instanceof Error ? e.message : "Unknown error",
      );
    }
    await modifyInRawStorage(["subscriptions"], ({ subscriptions }) => {
      if (!subscriptions[id]) {
        return {};
      }
      return { subscriptions: { ...subscriptions, [id]: subscription } };
    });

    postMessage("subscription-updated", id, subscription);
  });
}

export async function setupUpdateAllAlarm(): Promise<void> {
  const alarm = await browser.alarms.get(UPDATE_ALL_ALARM_NAME);
  if (alarm && dayjs().isBefore(alarm.scheduledTime)) {
    return;
  }
  void updateAll();
}

export async function updateAll(): Promise<void> {
  const { subscriptions, updateInterval } = await loadFromRawStorage([
    "subscriptions",
    "updateInterval",
  ]);

  if (!numberKeys(subscriptions).length) {
    await browser.alarms.clear(UPDATE_ALL_ALARM_NAME);
    return;
  }
  // `chrome.alarms.create` returns `Promise` in Chrome >=111.
  void browser.alarms.create(UPDATE_ALL_ALARM_NAME, {
    periodInMinutes: clampUpdateInterval(updateInterval),
  });

  await Promise.all(numberKeys(subscriptions).map(update));
}
