/* eslint-disable @typescript-eslint/no-namespace */

// #if CHROME
export namespace _manifest {
  export type WebExtensionManifest = chrome.runtime.Manifest;
}

export namespace apis {
  export namespace alarms {
    export type Alarm = chrome.alarms.Alarm;
    export type _CreateAlarmInfo = chrome.alarms.AlarmCreateInfo;

    export function clear(name: string): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        chrome.alarms.clear(name, wasCleared => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(wasCleared);
          }
        });
      });
    }

    export function create(name: string, alarmInfo: _CreateAlarmInfo): void {
      chrome.alarms.create(name, alarmInfo);
    }

    export function get(name: string): Promise<Alarm | undefined> {
      return new Promise<Alarm | undefined>((resolve, reject) => {
        chrome.alarms.get(name, alarm => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(alarm);
          }
        });
      });
    }

    export const onAlarm = {
      addListener(callback: (alarm: Alarm) => void): void {
        chrome.alarms.onAlarm.addListener(callback);
      },
    };
  }

  export namespace extensionTypes {
    export type InjectDetails = chrome.tabs.InjectDetails;
  }

  export namespace i18n {
    export function getMessage(messageName: string, substitutions?: unknown): string {
      return chrome.i18n.getMessage(messageName, substitutions as string | string[] | undefined);
    }
  }

  export namespace identity {
    export type _LaunchWebAuthFlowDetails = chrome.identity.WebAuthFlowOptions;

    export function getRedirectURL(path?: string): string {
      return chrome.identity.getRedirectURL(path);
    }

    export function launchWebAuthFlow(details: _LaunchWebAuthFlowDetails): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(details, responseUrl => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolve(responseUrl!);
          }
        });
      });
    }
  }

  export namespace permissions {
    export type AnyPermissions = chrome.permissions.Permissions;
    export type Permissions = chrome.permissions.Permissions;

    export function contains(permissions: AnyPermissions): Promise<boolean> {
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

    export function remove(permissions: Permissions): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        chrome.permissions.remove(permissions, removed => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(removed);
          }
        });
      });
    }
  }

  export namespace runtime {
    export type MessageSender = chrome.runtime.MessageSender;
    export type PlatformInfo = chrome.runtime.PlatformInfo;
    export type _OnInstalledDetails = chrome.runtime.InstalledDetails;

    export function getManifest(): _manifest.WebExtensionManifest {
      return chrome.runtime.getManifest();
    }

    export function getPlatformInfo(): Promise<PlatformInfo> {
      return new Promise<PlatformInfo>((resolve, reject) => {
        chrome.runtime.getPlatformInfo(platformInfo => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(platformInfo);
          }
        });
      });
    }

    export function getURL(path: string): string {
      return chrome.runtime.getURL(path);
    }

    export function openOptionsPage(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        chrome.runtime.openOptionsPage(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }

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
      addListener(callback: (details: _OnInstalledDetails) => void): void {
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
  }

  export namespace tabs {
    export type Tab = chrome.tabs.Tab;
    export type _CreateCreateProperties = chrome.tabs.CreateProperties;
    export type _QueryQueryInfo = chrome.tabs.QueryInfo;
    export type _UpdateUpdateProperties = chrome.tabs.UpdateProperties;
    export type _OnRemovedRemoveInfo = chrome.tabs.TabRemoveInfo;
    export type _OnUpdatedChangeInfo = chrome.tabs.TabChangeInfo;

    export function create(createProperties: _CreateCreateProperties): Promise<Tab> {
      return new Promise<Tab>((resolve, reject) => {
        chrome.tabs.create(createProperties, tab => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(tab);
          }
        });
      });
    }

    export function executeScript(
      tabId: number,
      details: extensionTypes.InjectDetails,
    ): Promise<unknown[]> {
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

    export function insertCSS(tabId: number, details: extensionTypes.InjectDetails): Promise<void> {
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

    export function query(queryInfo: _QueryQueryInfo): Promise<Tab[]> {
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

    export function remove(tabIds: number | number[]): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        chrome.tabs.remove(tabIds as number, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }

    export function update(tabId: number, updateProperties: _UpdateUpdateProperties): Promise<Tab> {
      return new Promise<Tab>((resolve, reject) => {
        chrome.tabs.update(tabId, updateProperties, tab => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolve(tab!);
          }
        });
      });
    }

    export const onRemoved = {
      addListener(callback: (tabId: number, removeInfo: _OnRemovedRemoveInfo) => void): void {
        chrome.tabs.onRemoved.addListener(callback);
      },

      removeListener(callback: (tabId: number, removeInfo: _OnRemovedRemoveInfo) => void): void {
        chrome.tabs.onRemoved.removeListener(callback);
      },
    };

    export const onUpdated = {
      addListener(
        callback: (tabId: number, changeInfo: _OnUpdatedChangeInfo, tab: Tab) => void,
      ): void {
        chrome.tabs.onUpdated.addListener(callback);
      },

      removeListener(
        callback: (tabId: number, changeInfo: _OnUpdatedChangeInfo, tab: Tab) => void,
      ): void {
        chrome.tabs.onUpdated.removeListener(callback);
      },
    };
  }

  export namespace windows {
    export const WINDOW_ID_NONE = -1; // chrome.windows.WINDOW_ID_NONE

    export const onFocusChanged = {
      addListener(callback: (windowId: number) => void): void {
        chrome.windows.onFocusChanged.addListener(callback);
      },
    };
  }
}
/* #else
export import apis = browser;
*/
// #endif
