/* eslint-disable @typescript-eslint/no-namespace */

// #if CHROMIUM
export namespace apis {
  export namespace alarms {
    export type Alarm = chrome.alarms.Alarm;
    export type AlarmCreateInfo = chrome.alarms.AlarmCreateInfo;

    export function create(name: string, alarmInfo: AlarmCreateInfo): void {
      chrome.alarms.create(name, alarmInfo);
    }

    export const onAlarm = {
      addListener(callback: (alarm: Alarm) => void): void {
        chrome.alarms.onAlarm.addListener(callback);
      },
    };
  }

  export namespace i18n {
    export function getMessage(messageName: string, substitutions?: unknown): string {
      return chrome.i18n.getMessage(messageName, substitutions);
    }
  }

  export namespace identity {
    export type WebAuthFlowOptions = chrome.identity.WebAuthFlowOptions;

    export function getRedirectURL(path?: string): string {
      return chrome.identity.getRedirectURL(path);
    }

    export function launchWebAuthFlow(details: WebAuthFlowOptions): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(details, responseUrl => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(responseUrl!);
          }
        });
      });
    }
  }

  export namespace permissions {
    export type Permissions = chrome.permissions.Permissions;

    export function contains(permissions: Permissions): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        chrome.permissions.contains(permissions, result => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    }

    export function request(permissions: Permissions): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        chrome.permissions.request(permissions, granted => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(granted);
          }
        });
      });
    }
  }

  export namespace runtime {
    export type InstalledDetails = chrome.runtime.InstalledDetails;
    export type MessageSender = chrome.runtime.MessageSender;

    export function sendMessage(message: unknown): Promise<unknown> {
      return new Promise<unknown>((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    }

    export const onInstalled = {
      addListener(callback: (details: InstalledDetails) => void): void {
        chrome.runtime.onInstalled.addListener(callback);
      },
    };

    export const onMessage = {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response: unknown) => void | boolean,
        ) => void,
      ): void {
        chrome.runtime.onMessage.addListener(callback);
      },

      removeListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response: unknown) => void | boolean,
        ) => void,
      ): void {
        chrome.runtime.onMessage.removeListener(callback);
      },
    };

    export const onStartup = {
      addListener(callback: () => void): void {
        chrome.runtime.onStartup.addListener(callback);
      },
    };
  }

  export namespace storage {
    export type StorageChange = chrome.storage.StorageChange;

    export const local = {
      get(
        keys: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, unknown>> {
        return new Promise<Record<string, unknown>>((resolve, reject) => {
          chrome.storage.local.get(keys, items => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(items);
            }
          });
        });
      },

      set(items: Record<string, unknown>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      },
    };

    export const onChanged = {
      addListener(
        listener: (changes: Record<string, StorageChange>, areaName: string) => void,
      ): void {
        chrome.storage.onChanged.addListener(listener);
      },

      removeListener(
        listener: (changes: Record<string, StorageChange>, areaName: string) => void,
      ): void {
        chrome.storage.onChanged.removeListener(listener);
      },
    };
  }

  export namespace tabs {
    export type InjectDetails = chrome.tabs.InjectDetails;
    export type QueryInfo = chrome.tabs.QueryInfo;
    export type Tab = chrome.tabs.Tab;
    export type TabChangeInfo = chrome.tabs.TabChangeInfo;

    export function executeScript(tabId: number, details: InjectDetails): Promise<unknown[]> {
      return new Promise<unknown[]>((resolve, reject) => {
        chrome.tabs.executeScript(tabId, details, result => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    }

    export function get(tabId: number): Promise<Tab> {
      return new Promise<Tab>((resolve, reject) => {
        chrome.tabs.get(tabId, tab => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(tab);
          }
        });
      });
    }

    export function insertCSS(tabId: number, details: InjectDetails): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        chrome.tabs.insertCSS(tabId, details, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }

    export function query(queryInfo: QueryInfo): Promise<Tab[]> {
      return new Promise<Tab[]>((resolve, reject) => {
        chrome.tabs.query(queryInfo, result => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    }

    export const onUpdated = {
      addListener(callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void): void {
        chrome.tabs.onUpdated.addListener(callback);
      },
    };
  }
}
/*
// #else
export import apis = browser;
// #endif
// #if CHROMIUM
*/
// #endif
