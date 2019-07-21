import dayjs from 'dayjs';

// #region Utilities

export function lines(s: string) {
  return s ? s.split('\n') : [];
}

export function unlines(ss: string[]) {
  return ss.join('\n');
}

// #endregion Utilities

// #region Options

export type ISOString = string;

// Result
export interface NullResult {
  type: 'null';
}

export interface ErrorResult {
  type: 'error';
  message: string;
}

export interface SuccessResult {
  type: 'success';
  timestamp: ISOString;
}

export type Result = NullResult | ErrorResult | SuccessResult;

export function nullResult(): NullResult {
  return { type: 'null' };
}

export function errorResult(message: string): ErrorResult {
  return {
    type: 'error',
    message,
  };
}

export function successResult(): SuccessResult {
  return {
    type: 'success',
    timestamp: dayjs().toISOString(),
  };
}

export function isNullResult(result: Result): result is NullResult {
  return result.type === 'null';
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
  updateResult: Result;
}

export type Subscriptions = { [id: number]: Subscription };

// Options
export type Minutes = number;

export interface Options {
  blacklist: string;
  timestamp: ISOString;
  sync: boolean;
  syncResult: Result;
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
  timestamp: dayjs().toISOString(),
  sync: false,
  syncResult: nullResult(),
  subscriptions: {},
  nextSubscriptionId: 0,
  hideBlockLinks: false,
  syncInterval: 5,
  syncFilename: 'uBlacklist.txt',
  updateInterval: 60,
};

export function getOptions<T extends (keyof Options)[]>(...keys: T): Promise<OptionsFor<T>> {
  return new Promise<OptionsFor<T>>((resolve, reject) => {
    const defaultItems: { [key: string]: any } = {};
    for (const key of keys) {
      defaultItems[key] = defaultOptions[key];
    }
    chrome.storage.local.get(defaultItems, items => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(items as OptionsFor<T>);
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

export function sendMessage(type: 'setBlacklist', args: SetBlacklistMessageArgs): Promise<void>;
export function sendMessage(type: string, args: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage({ type, args }, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// #endregion Messages

// #region Events

export interface SyncStartEventArgs {
}

export interface SyncEndEventArgs {
  result: Result;
}

export interface UpdateStartEventArgs {
  id: SubscriptionId;
}

export interface UpdateEndEventArgs {
  id: SubscriptionId;
  result: Result;
}

// #endregion Events

// #region BackgroundPage

export interface BackgroundPage extends Window {
  // Events
  addEventHandler(type: 'syncStart', handler: (args: SyncStartEventArgs) => void): void;
  addEventHandler(type: 'syncEnd', handler: (args: SyncEndEventArgs) => void): void;
  addEventHandler(type: 'updateStart', handler: (args: UpdateStartEventArgs) => void): void;
  addEventHandler(type: 'updateEnd', handler: (args: UpdateEndEventArgs) => void): void;
  clearEventHandlers(): void;

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
  removeCachedAuthToken(accessToken: string): Promise<void>;
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
