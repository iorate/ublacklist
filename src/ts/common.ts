// #region Utilities

export function lines(s: string): string[] {
  return s ? s.split('\n') : [];
}

export function unlines(ss: string[]): string {
  return ss.join('\n');
}

// #endregion Utilities

// #region Options

export type ISOString = string;

// Result
export interface ErrorResult {
  type: 'error';
  message: string;
}

export interface SuccessResult {
  type: 'success';
  timestamp: ISOString;
}

export type Result = ErrorResult | SuccessResult;

export function errorResult(message: string): ErrorResult {
  return {
    type: 'error',
    message,
  };
}

export function successResult(): SuccessResult {
  return {
    type: 'success',
    timestamp: new Date().toISOString(),
  };
}

export function isErrorResult(result: Result): result is ErrorResult {
  return result.type === 'error';
}

export function isSuccessResult(result: Result): result is SuccessResult {
  return result.type === 'success';
}

// Subscription
export type SubscriptionId = number;

export interface Subscription {
  name: string;
  url: string;
  blacklist: string;
  updateResult: Result | null;
}

export type Subscriptions = Record<SubscriptionId, Subscription>;

// Options
export type Minutes = number;

export interface Options {
  blacklist: string;
  timestamp: ISOString;
  sync: boolean;
  syncResult: Result | null;
  subscriptions: Subscriptions;
  nextSubscriptionId: SubscriptionId;
  hideBlockLinks: boolean;
  // Hidden options
  syncInterval: Minutes;
  syncFilename: string;
  updateInterval: Minutes;
}

export type OptionsFor<T extends (keyof Options)[]> = { [Key in T[number]]: Options[Key] };

const defaultOptions: Options = {
  blacklist: '',
  timestamp: new Date(0).toISOString(),
  sync: false,
  syncResult: null,
  subscriptions: {},
  nextSubscriptionId: 0,
  hideBlockLinks: false,
  syncInterval: 5,
  syncFilename: 'uBlacklist.txt',
  updateInterval: 60,
};

export function getOptions<T extends (keyof Options)[]>(...keys: T): Promise<OptionsFor<T>> {
  return new Promise<OptionsFor<T>>((resolve, reject) => {
    const defaultOptionsForKeys = {} as Record<keyof Options, unknown>;
    for (const key of keys) {
      defaultOptionsForKeys[key] = defaultOptions[key];
    }
    chrome.storage.local.get(defaultOptionsForKeys, optionsForKeys => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(optionsForKeys as OptionsFor<T>);
      }
    });
  });
}

export function setOptions<T extends Partial<Options>>(options: T): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set(options, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// #endregion Options

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

  // Auth
  getAuthToken(interactive: boolean): Promise<string>;
  removeCachedAuthToken(token: string): Promise<void>;
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
