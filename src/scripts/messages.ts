import { apis } from './apis';
import { Engine, Result, Subscription, SubscriptionId } from './types';

interface MessageSignatures {
  // Options/Popup -> Background
  'auth-to-sync-blacklist': () => boolean;
  'set-blacklist': (blacklist: string) => void;
  'sync-blacklist': () => void;
  'add-subscription': (subscription: Subscription) => SubscriptionId;
  'remove-subscription': (id: SubscriptionId) => void;
  'update-subscription': (id: SubscriptionId) => void;
  'update-subscriptions': () => void;
  'enable-on-engine': (engine: Engine) => void;
  // Background -> Options
  'blacklist-syncing': () => void;
  'blacklist-synced': (result: Result) => void;
  'subscription-updating': (id: SubscriptionId) => void;
  'subscription-updated': (id: SubscriptionId, result: Result) => void;
}

export type MessageTypes = keyof MessageSignatures;
export type MessageParameters<Type extends MessageTypes> = Parameters<MessageSignatures[Type]>;
export type MessageReturnType<Type extends MessageTypes> = ReturnType<MessageSignatures[Type]>;

export function postMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): void {
  (async () => {
    try {
      await apis.runtime.sendMessage({ type, args });
    } catch (e) {
      if (e.message !== 'Could not establish connection. Receiving end does not exist.') {
        throw e;
      }
    }
  })();
}

export async function sendMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): Promise<MessageReturnType<Type>> {
  return (await apis.runtime.sendMessage({ type, args })) as MessageReturnType<Type>;
}

export type MessageListeners = {
  [Type in MessageTypes]?: (
    ...args: MessageParameters<Type>
  ) => MessageReturnType<Type> | Promise<MessageReturnType<Type>>;
};

function invokeListener(
  listener: (...args: unknown[]) => unknown,
  args: unknown[],
  sendResponse: (response: unknown) => void,
): void | boolean {
  const response = listener(...args);
  if (response instanceof Promise) {
    (async () => {
      sendResponse(await response);
    })();
    return true;
  } else {
    sendResponse(response);
  }
}

export function addMessageListeners(listeners: MessageListeners): void {
  apis.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, args } = message as { type: MessageTypes; args: unknown[] };
    if (listeners[type]) {
      return invokeListener(listeners[type] as (...args: unknown[]) => unknown, args, sendResponse);
    }
  });
}
