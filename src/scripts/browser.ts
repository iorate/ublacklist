/* eslint-disable @typescript-eslint/no-namespace, unused-imports/no-unused-vars */

// #if CHROME
declare global {
  namespace chrome {
    // #if CHROME_MV3
    namespace extensionTypes {
      type RunAt = 'document_start' | 'document_end' | 'document_idle';
    }

    namespace permissions {
      function contains(permisions: Permissions): Promise<boolean>;
      function remove(permissions: Permissions): Promise<boolean>;
      function request(permissions: Permissions): Promise<boolean>;
    }

    namespace scripting {
      interface ContentScriptFilter {
        ids?: string[];
      }

      interface RegisteredContentScript {
        allFrames?: boolean;
        css?: string[];
        excludeMatches?: string[];
        id: string;
        js?: string[];
        matches?: string[];
        persistAcrossSessions?: boolean;
        runAt?: extensionTypes.RunAt;
        world?: ExecutionWorld;
      }

      function registerContentScripts(scripts: RegisteredContentScript[]): Promise<void>;
      function unregisterContentScripts(filter?: ContentScriptFilter): Promise<void>;
    }
    /* #else
    namespace alarms {
      function clear(name?: string): Promise<boolean>;
    }

    namespace runtime {
      function openOptionsPage(): Promise<void>;
      function sendMessage(message: unknown): Promise<unknown>;
    }

    namespace tabs {
      function executeScript(tabId: number, details: InjectDetails): Promise<unknown[]>;
      function insertCSS(tabId: number, details: InjectDetails): Promise<void>;
    }
    */
    // #endif

    namespace identity {
      // Not yet implemented. For typing only.
      function launchWebAuthFlow(details: WebAuthFlowOptions): Promise<string | undefined>;
    }
  }
}

function promisify<A extends unknown[], R>(f: (...a: A) => Promise<R>): (...a: A) => Promise<R> {
  if (!f) {
    return undefined as unknown as (...a: A) => Promise<R>;
  }
  return (...a) =>
    new Promise<R>((resolve, reject) => {
      (f as unknown as (...a: unknown[]) => void)(...a, (r: R) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(r);
        }
      });
    });
}

export namespace browser {
  // #if CHROME_MV3
  export import alarms = chrome.alarms;
  export import i18n = chrome.i18n;
  export import permissions = chrome.permissions;
  export import scripting = chrome.scripting;
  export import storage = chrome.storage;
  export import runtime = chrome.runtime;
  export import tabs = chrome.tabs;
  /* #else
  export namespace alarms {
    export const clear = promisify(chrome.alarms?.clear);
    export const create = chrome.alarms?.create;
    export const get = promisify(chrome.alarms?.get);

    export const onAlarm = chrome.alarms?.onAlarm;
  }

  export namespace i18n {
    export const getMessage = chrome.i18n.getMessage;
  }

  export namespace permissions {
    export const contains = promisify(chrome.permissions?.contains);
    export const remove = promisify(chrome.permissions?.remove);
    export const request = promisify(chrome.permissions?.request);
  }

  export namespace runtime {
    export type MessageSender = chrome.runtime.MessageSender;
    export type PlatformInfo = chrome.runtime.PlatformInfo;

    export const getManifest = chrome.runtime.getManifest;
    export const getPlatformInfo = promisify(chrome.runtime.getPlatformInfo);
    export const getURL = chrome.runtime.getURL;
    export const openOptionsPage = promisify(chrome.runtime.openOptionsPage);
    export const sendMessage = promisify(chrome.runtime.sendMessage);

    export const onInstalled = chrome.runtime.onInstalled;
    export const onMessage = chrome.runtime.onMessage;
    export const onStartup = chrome.runtime.onStartup;
  }

  export namespace storage {
    export const local = {
      get: promisify(chrome.storage.local.get.bind(chrome.storage.local)),
      set: promisify(chrome.storage.local.set.bind(chrome.storage.local)),
    };
  }

  export namespace tabs {
    export const create = promisify(chrome.tabs?.create);
    export const executeScript = promisify(chrome.tabs?.executeScript);
    export const get = promisify(chrome.tabs?.get);
    export const insertCSS = promisify(chrome.tabs?.insertCSS);
    export const query = promisify(chrome.tabs?.query);
    export const remove = promisify(chrome.tabs?.remove);
    export const update = promisify(chrome.tabs?.update);

    export const onRemoved = chrome.tabs?.onRemoved;
    export const onUpdated = chrome.tabs?.onUpdated;
  }
  */
  // #endif

  export namespace identity {
    export const getRedirectURL = chrome.identity?.getRedirectURL;
    export const launchWebAuthFlow = promisify(chrome.identity?.launchWebAuthFlow);
  }
}
/* #else
export const browser = globalThis.browser;
*/
// #endif
