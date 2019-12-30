import { Engine, Result, Subscription, SubscriptionId } from './types';

// #region Messages

export interface SetBlacklistMessageArgs {
  blacklist: string;
}

export interface SyncStartMessageArgs {}

export interface SyncEndMessageArgs {
  result: Result;
}

export interface UpdateStartMessageArgs {
  id: SubscriptionId;
}

export interface UpdateEndMessageArgs {
  id: SubscriptionId;
  result: Result;
}

export function sendMessage(type: 'setBlacklist', args: SetBlacklistMessageArgs): void;
export function sendMessage(type: 'syncStart', args: SyncStartMessageArgs): void;
export function sendMessage(type: 'syncEnd', args: SyncEndMessageArgs): void;
export function sendMessage(type: 'updateStart', args: UpdateStartMessageArgs): void;
export function sendMessage(type: 'updateEnd', args: UpdateEndMessageArgs): void;
export function sendMessage<T>(type: string, args: T): void {
  chrome.runtime.sendMessage({ type, args });
}

export function addMessageListener(
  type: 'setBlacklist',
  listener: (args: SetBlacklistMessageArgs) => void,
): void;
export function addMessageListener(
  type: 'syncStart',
  listener: (args: SyncStartMessageArgs) => void,
): void;
export function addMessageListener(
  type: 'syncEnd',
  listener: (args: SyncEndMessageArgs) => void,
): void;
export function addMessageListener(
  type: 'updateStart',
  listener: (args: UpdateStartMessageArgs) => void,
): void;
export function addMessageListener(
  type: 'updateEnd',
  listener: (args: UpdateEndMessageArgs) => void,
): void;
export function addMessageListener<T>(type: string, listener: (args: T) => void): void {
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === type) {
      listener(message.args);
    }
  });
}

// #endregion Messages

// #region BackgroundPage

export interface BackgroundPage extends Window {
  // Blacklist
  setBlacklist(blacklist: string): Promise<void>;
  setSync(sync: boolean): Promise<void>;
  syncBlacklist(): Promise<void>;

  // Subscriptions
  addSubscription(subscription: Subscription): Promise<SubscriptionId>;
  removeSubscription(id: SubscriptionId): Promise<void>;
  updateSubscription(id: SubscriptionId): Promise<void>;
  updateAllSubscriptions(): Promise<void>;

  // Engines
  // #if BROWSER === 'firefox'
  enableEngine(engine: Engine): Promise<void>;
  // #endif

  // Auth
  getAuthToken(interactive: boolean): Promise<string>;
  removeCachedAuthToken(): Promise<void>;
}

export function getBackgroundPage(): Promise<BackgroundPage> {
  return new Promise<BackgroundPage>((resolve, reject) => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(backgroundPage as BackgroundPage);
      }
    });
  });
}

// #endregion BackgroundPage
