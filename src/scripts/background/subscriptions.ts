import { browser } from '../browser';
import { postMessage } from '../messages';
import { Ruleset } from '../ruleset';
import { SubscriptionId } from '../types';
import { HTTPError, errorResult, numberKeys, successResult } from '../utilities';
import { loadFromRawStorage, modifyInRawStorage } from './raw-storage';

export const UPDATE_ALL_ALARM_NAME = 'update-all-subscriptions';

const updating = new Set<SubscriptionId>();

async function tryLock(id: SubscriptionId, callback: () => Promise<void>): Promise<void> {
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
    const {
      subscriptions: { [id]: subscription },
    } = await loadFromRawStorage(['subscriptions']);
    if (!subscription || !(subscription.enabled ?? true)) {
      return;
    }

    postMessage('subscription-updating', id);

    try {
      const response = await fetch(subscription.url);
      if (response.ok) {
        subscription.blacklist = await response.text();
        subscription.compiledRules = Ruleset.compile(subscription.blacklist);
        subscription.updateResult = successResult();
      } else {
        subscription.updateResult = errorResult(
          new HTTPError(response.status, response.statusText).message,
        );
      }
    } catch (e: unknown) {
      subscription.updateResult = errorResult(e instanceof Error ? e.message : 'Unknown error');
    }
    await modifyInRawStorage(['subscriptions'], ({ subscriptions }) => {
      if (!subscriptions[id]) {
        return {};
      }
      return { subscriptions: { ...subscriptions, [id]: subscription } };
    });

    postMessage('subscription-updated', id, subscription);
  });
}

export async function updateAll(): Promise<void> {
  const { subscriptions, updateInterval } = await loadFromRawStorage([
    'subscriptions',
    'updateInterval',
  ]);

  if (!numberKeys(subscriptions).length) {
    await browser.alarms.clear(UPDATE_ALL_ALARM_NAME);
    return;
  }
  // `chrome.alarms.create` returns `Promise` in Chrome >=111.
  void browser.alarms.create(UPDATE_ALL_ALARM_NAME, { periodInMinutes: updateInterval });

  await Promise.all(numberKeys(subscriptions).map(update));
}
