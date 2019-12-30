// #if BROWSER === 'chrome'
export namespace apis {
  export namespace i18n {
    export function getMessage(messageName: string, substitutions?: unknown): string {
      return chrome.i18n.getMessage(messageName, substitutions);
    }
  }

  export namespace identity {
    export type TokenDetails = chrome.identity.TokenDetails;
    export type WebAuthFlowOptions = chrome.identity.WebAuthFlowOptions;

    // NOTE: Chromium-based browsers other than Chrome may not implement 'chrome.i18n.getAuthToken'.
    export function getAuthToken(details: TokenDetails): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken(details, token => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });
    }

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

    export const onMessage = {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response: unknown) => void,
        ) => void,
      ): void {
        chrome.runtime.onMessage.addListener(callback);
      },
    };
  }

  export namespace storage {
    export const local = {
      get(keys: string | string[] | object | null): Promise<Record<string, unknown>> {
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

      set(items: object): Promise<void> {
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
// #else
export import apis = browser;
// #endif
