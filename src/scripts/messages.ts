import { type Browser, browser } from "./browser.ts";
import type {
  CloudId,
  LocalStorageItemsBackupRestore,
  LocalStorageItemsSavable,
  Result,
  SaveSource,
  Subscription,
  SubscriptionId,
  SyncBackendId,
} from "./types.ts";

type MessageSignatures = {
  "connect-to-cloud": (
    id: CloudId,
    authorizationCode: string,
    useAltFlow: boolean,
  ) => { message: string } | null;
  "connect-to-webdav": (params: {
    url: string;
    username: string;
    password: string;
    path: string;
  }) => { message: string } | null;
  "connect-to-browser-sync": () => { message: string } | null;
  "disconnect-from-cloud": () => void;

  "save-to-local-storage": (
    items: Readonly<Partial<LocalStorageItemsSavable>>,
    source: SaveSource,
  ) => void;
  "blocklist-saved": (blacklist: string, source: SaveSource) => void;
  "add-subscription": (subscription: Subscription) => SubscriptionId;
  "remove-subscription": (id: SubscriptionId) => void;
  "enable-subscription": (id: SubscriptionId, enabled: boolean) => void;

  sync: () => void;
  syncing: (id: SyncBackendId) => void;
  synced: (id: SyncBackendId, result: Result, updated: boolean) => void;

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
  "reset-settings": () => void;

  "notify-blocked-result-count": (count: number) => void;
  "get-hide-blocked-results": () => boolean;
  "set-hide-blocked-results": (show: boolean) => void;

  "set-user-serpinfo": (userInput: string) => void;
  "add-remote-serpinfo": (url: string) => void;
  "remove-remote-serpinfo": (url: string) => void;
  "enable-remote-serpinfo": (url: string, enabled: boolean) => void;
  "update-all-remote-serpinfo": () => void;
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
      console.error(e);
    }
  })();
}

export async function sendMessage<Type extends MessageTypes>(
  type: Type,
  ...args: MessageParameters<Type>
): Promise<MessageReturnType<Type>> {
  const response: unknown = await browser.runtime.sendMessage({ type, args });
  return fromResponse(response) as MessageReturnType<Type>;
}

export async function sendMessageToTab<Type extends MessageTypes>(
  tabId: number,
  type: Type,
  ...args: MessageParameters<Type>
): Promise<MessageReturnType<Type>> {
  const response = await browser.tabs.sendMessage(tabId, { type, args });
  return fromResponse(response) as MessageReturnType<Type>;
}

export type MessageListeners = {
  [Type in MessageTypes]?: (
    ...args: MessageParameters<Type>
  ) => MessageReturnType<Type> | Promise<MessageReturnType<Type>>;
};

export type MessageFromTabListeners = {
  [Type in MessageTypes]?: (
    tabId: number,
    ...args: MessageParameters<Type>
  ) => MessageReturnType<Type> | Promise<MessageReturnType<Type>>;
};

function invokeListener(
  listener: (...args: unknown[]) => unknown,
  args: unknown[],
  sendResponse: (response: unknown) => void,
): true | undefined {
  const value = listener(...args);
  if (value instanceof Promise) {
    void value.then((value) => sendResponse(toResponse(value)));
    return true;
  }
  sendResponse(toResponse(value));
}

export function addMessageListeners(
  listeners: Readonly<MessageListeners>,
): () => void {
  const listener = ((
    message: unknown,
    _sender: Browser.Runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    const { type, args } = message as { type: MessageTypes; args: unknown[] };
    if (listeners[type]) {
      return invokeListener(
        listeners[type] as (...args: unknown[]) => unknown,
        args,
        sendResponse,
      );
    }
  }) as Browser.Runtime.OnMessageListener;
  browser.runtime.onMessage.addListener(listener);
  return () => {
    browser.runtime.onMessage.removeListener(listener);
  };
}

export function addMessageFromTabListeners(
  listeners: Readonly<MessageFromTabListeners>,
): () => void {
  const listener = ((
    message: unknown,
    sender: Browser.Runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    const { type, args } = message as { type: MessageTypes; args: unknown[] };
    if (listeners[type]) {
      const tabId = sender.tab?.id;
      if (tabId == null) {
        return;
      }
      return invokeListener(
        listeners[type] as (...args: unknown[]) => unknown,
        [tabId, ...args],
        sendResponse,
      );
    }
  }) as Browser.Runtime.OnMessageListener;
  browser.runtime.onMessage.addListener(listener);
  return () => {
    browser.runtime.onMessage.removeListener(listener);
  };
}

function fromResponse(response: unknown): unknown {
  if (response === undefined) {
    throw new Error("No response");
  }
  if (response === null || typeof response !== "object") {
    throw new Error("Invalid response");
  }
  return (response as { value?: unknown }).value;
}

function toResponse(value: unknown): { value?: unknown } {
  return value !== undefined ? { value } : {};
}
