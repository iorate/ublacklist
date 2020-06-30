import * as LocalStorage from '../local-storage';
import { postMessage } from '../messages';
import { Subscription, SubscriptionId } from '../types';
import { HTTPError, Mutex, errorResult, successResult } from '../utilities';

const mutex = new Mutex();
const updating = new Set<SubscriptionId>();

export async function add(
  subscription: Subscription,
): Promise<{ id: SubscriptionId; single: boolean }> {
  return await mutex.lock(async () => {
    const { subscriptions, nextSubscriptionId: id } = await LocalStorage.load([
      'subscriptions',
      'nextSubscriptionId',
    ]);
    subscriptions[id] = subscription;
    await LocalStorage.store({ subscriptions, nextSubscriptionId: id + 1 });
    return { id, single: Object.keys(subscriptions).length === 1 };
  });
}

export async function remove(id: SubscriptionId): Promise<void> {
  await mutex.lock(async () => {
    const { subscriptions } = await LocalStorage.load(['subscriptions']);
    delete subscriptions[id];
    await LocalStorage.store({ subscriptions });
  });
}

export async function update(id: SubscriptionId): Promise<void> {
  if (updating.has(id)) {
    return;
  }
  updating.add(id);
  try {
    // Use optimistic lock for 'subscriptions'.
    // Don't lock now.
    const {
      subscriptions: { [id]: subscription },
    } = await LocalStorage.load(['subscriptions']);
    if (!subscription) {
      return;
    }
    postMessage('subscription-updating', id);
    try {
      const response = await fetch(subscription.url);
      if (response.ok) {
        subscription.blacklist = await response.text();
        subscription.updateResult = successResult();
      } else {
        subscription.updateResult = errorResult(
          new HTTPError(response.status, response.statusText).message,
        );
      }
    } catch (e) {
      subscription.updateResult = errorResult(e.message);
    }
    // Lock now.
    await mutex.lock(async () => {
      const { subscriptions } = await LocalStorage.load(['subscriptions']);
      // 'subscriptions[id]' may be already removed.
      if (subscriptions[id]) {
        subscriptions[id] = subscription;
        await LocalStorage.store({ subscriptions });
      }
    });
    postMessage('subscription-updated', id, subscription.updateResult);
  } finally {
    updating.delete(id);
  }
}

export async function updateAll(): Promise<{ interval: number | null }> {
  // Don't lock now.
  const { subscriptions, updateInterval } = await LocalStorage.load([
    'subscriptions',
    'updateInterval',
  ]);
  const ids = Object.keys(subscriptions).map(Number);
  await Promise.all(ids.map(update));
  return { interval: ids.length ? updateInterval : null };
}
