import { type Browser, browser } from "./browser.ts";
import type {
  CloudId,
  LocalStorageItemsBackupRestore,
  LocalStorageItemsSavable,
  Result,
  SaveSource,
  Subscription,
  SubscriptionId,
} from "./types.ts";

type MessageSignatures = {
  "connect-to-cloud": (
    id: CloudId,
    authorizationCode: string,
    useAltFlow: boolean,
  ) => boolean;
  "disconnect-from-cloud": () => void;

  "save-to-local-storage": (
    items: Readonly<Partial<LocalStorageItemsSavable>>,
    source: SaveSource,
  ) => void;
  "blocklist-saved": (blacklist: string, source: SaveSource) => void;
  "add-subscription": (subscription: Subscription) => SubscriptionId;
  "remove-subscription": (id: SubscriptionId) => void;
  "enable-subscription": (id: SubscriptionId, enabled: boolean) => void;

  "register-content-scripts": () => void;

  sync: () => void;
  syncing: (id: CloudId) => void;
  synced: (id: CloudId, result: Result, updated: boolean) => void;

  "update-subscription": (id: SubscriptionId) => void;
  "update-all-subscriptions": () => void;
  "subscription-updating": (id: SubscriptionId) => void;
  "subscription-updated": (
    id: SubscriptionId,
    subscription: Subscription,
  ) => void;

  "open-options-page": () => void;

  "backup-settings": () => LocalStorageItemsBackupRestore;
  "restore-settings": (
    items: Readonly<Partial<LocalStorageItemsBackupRestore>>,
  ) => void;
  "initialize-settings": () => void;
};

export type MessageTypes = keyof MessageSignatures;
export type MessageParameters<Type extends MessageTypes> = Parameters<
  MessageSignatures[Type]
>;
export type MessageReturnType<Type extends MessageTypes> = ReturnType<
  MessageSignatures[Type]
>;

export function postMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): void {
  void (async () => {
    try {
      await browser.runtime.sendMessage({ type, args });
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        e.message ===
          "Could not establish connection. Receiving end does not exist."
      ) {
        return;
      }
      throw e;
    }
  })();
}

export async function sendMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): Promise<MessageReturnType<Type>> {
  return await browser.runtime.sendMessage({ type, args });
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
): boolean | undefined {
  const response = listener(...args);
  if (response instanceof Promise) {
    void response.then(sendResponse);
    return true;
  }
  sendResponse(response);
}

export function addMessageListeners(
  listeners: Readonly<MessageListeners>,
): () => void {
  const listener = ((
    message: unknown,
    _sender: Browser.Runtime.MessageSender,
    sendResponse: (response: unknown) => boolean | undefined,
  ) => {
    const { type, args } = message as { type: MessageTypes; args: unknown[] };
    if (listeners[type]) {
      return invokeListener(
        listeners[type] as (...args: unknown[]) => unknown,
        args,
        sendResponse,
      );
    }
  }) as (
    message: unknown,
    sender: Browser.Runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => undefined;
  browser.runtime.onMessage.addListener(listener);
  return () => {
    browser.runtime.onMessage.removeListener(listener);
  };
}
