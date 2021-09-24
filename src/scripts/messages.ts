import { apis } from './apis';
import {
  CloudId,
  LocalStorageItemsSavable,
  Result,
  SaveSource,
  SearchEngineId,
  Subscription,
  SubscriptionId,
} from './types';

type MessageSignatures = {
  'connect-to-cloud': (id: CloudId, authorizationCode: string, useAltFlow: boolean) => boolean;
  'disconnect-from-cloud': () => void;
  'register-search-engine': (id: SearchEngineId) => void;
  'open-options-page': () => void;

  'save-to-local-storage': (
    items: Readonly<Partial<LocalStorageItemsSavable>>,
    source: SaveSource,
  ) => void;
  'blocklist-saved': (blacklist: string, source: SaveSource) => void;
  'add-subscription': (subscription: Subscription) => SubscriptionId;
  'remove-subscription': (id: SubscriptionId) => void;

  sync: () => void;
  syncing: () => void;
  synced: (result: Result, updated: boolean) => void;

  'update-subscription': (id: SubscriptionId) => void;
  'update-all-subscriptions': () => void;
  'subscription-updating': (id: SubscriptionId) => void;
  'subscription-updated': (id: SubscriptionId, subscription: Subscription) => void;
};

export type MessageTypes = keyof MessageSignatures;
export type MessageParameters<Type extends MessageTypes> = Parameters<MessageSignatures[Type]>;
export type MessageReturnType<Type extends MessageTypes> = ReturnType<MessageSignatures[Type]>;

export function postMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): void {
  void (async () => {
    try {
      await apis.runtime.sendMessage({ type, args });
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        e.message === 'Could not establish connection. Receiving end does not exist.'
      ) {
        return;
      } else {
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
    void response.then(sendResponse);
    return true;
  } else {
    sendResponse(response);
  }
}

export function addMessageListeners(listeners: Readonly<MessageListeners>): () => void {
  const listener = (
    message: unknown,
    sender: apis.runtime.MessageSender,
    sendResponse: (response: unknown) => void | boolean,
  ) => {
    const { type, args } = message as { type: MessageTypes; args: unknown[] };
    if (listeners[type]) {
      return invokeListener(listeners[type] as (...args: unknown[]) => unknown, args, sendResponse);
    }
  };
  apis.runtime.onMessage.addListener(listener);
  return () => {
    apis.runtime.onMessage.removeListener(listener);
  };
}
