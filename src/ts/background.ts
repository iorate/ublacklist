import AsyncLock from 'async-lock';
import dayjs, { Dayjs } from 'dayjs';
import {
  ISOString, Result, errorResult, successResult, SubscriptionId, Subscription, getOptions, setOptions,
  SetBlacklistMessageArgs,
  SyncStartEventArgs, SyncEndEventArgs, UpdateStartEventArgs, UpdateEndEventArgs,
  BackgroundPage,
} from './common';

const backgroundPage = window as BackgroundPage;

// #region Utilities

// Use AsyncLock to prevent data race.
// Keys: 'blacklist', 'subscriptions'
const lock = new AsyncLock();

// Use SingleTask to prevent concurrent tasks.
// Keys: 'sync', `update${id}`
class SingleTask {
  running: { [key: string]: boolean } = {};

  async run(key: string, task: () => void | Promise<void>): Promise<void> {
    if (this.running[key]) {
      return;
    }
    this.running[key] = true;
    try {
      await Promise.resolve(task());
    } finally {
      this.running[key] = false;
    }
  }
}

const singleTask = new SingleTask();

// #endregion Utilities

// #region Messages

function addMessageListener(type: 'setBlacklist', listener: (args: SetBlacklistMessageArgs) => void | Promise<void>): void;
function addMessageListener(type: string, listener: (args: any) => any) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === type) {
      Promise.resolve(listener(message.args)).then(sendResponse);
      return true;
    }
  });
}

// #endregion Messages

// #region Events

function invokeEvent(type: 'syncStart', args: SyncStartEventArgs): void;
function invokeEvent(type: 'syncEnd', args: SyncEndEventArgs): void;
function invokeEvent(type: 'updateStart', args: UpdateStartEventArgs): void;
function invokeEvent(type: 'updateEnd', args: UpdateEndEventArgs): void;
function invokeEvent(type: string, args: any): void {
  const event = new CustomEvent(type, { detail: args });
  backgroundPage.dispatchEvent(event);
}

backgroundPage.addEventHandler = function (type: string, handler: (args: any) => void): void {
  backgroundPage.addEventListener(type, e => {
    handler((e as CustomEvent).detail);
  });
};

// #endregion Events

// #region Blacklist

backgroundPage.setBlacklist = async function (blacklist: string): Promise<void> {
  await lock.acquire('blacklist', async () => {
    await setOptions({
      blacklist,
      timestamp: dayjs().toISOString(),
    });
  });
  // Request sync, but don't await it.
  backgroundPage.syncBlacklist();
};

backgroundPage.setSync = async function (sync: boolean): Promise<void> {
  await setOptions({ sync });
  if (sync) {
    backgroundPage.syncBlacklist();
  }
};

interface RequestArgs {
  method: 'GET' | 'PATCH' | 'POST';
  path: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string | object;
}

// #if BROWSER === 'chrome'
declare global {
  interface ErrorConstructor {
    captureStackTrace(targetObj: object, constructorOpt?: Function): void;
  }
}
// #endif

class RequestError extends Error {
  constructor(public code: number, message: string) {
    super(message);
// #if BROWSER === 'chrome'
    Error.captureStackTrace(this, RequestError);
// #endif
  }
}

class Client {
  constructor(public token: string) {
  }

  async request(args: RequestArgs, downloadType: 'text'): Promise<string>;
  async request(args: RequestArgs): Promise<any>;
  async request(args: RequestArgs, downloadType?: string): Promise<any> {
    const input = new URL('https://www.googleapis.com/');
    input.pathname = args.path;
    if (args.params) {
      input.search = new URLSearchParams(args.params).toString();
    }
    const init: RequestInit & { headers: Record<string, string> } = {
      method: args.method,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      mode: 'cors',
    };
    if (args.body != null) {
      if (typeof args.body === 'string') {
        init.headers['Content-Type'] = 'text/plain';
        init.body = args.body;
      } else {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(args.body);
      }
    }
    const response = await fetch(input.toString(), init);
    if (!response.ok) {
      const {
        error: {
          code,
          message
        }
      } = await response.json() as { error: { code: number, message: string } };
      throw new RequestError(code, message);
    }
    if (downloadType === 'text') {
      return await response.text();
    } else {
      return await response.json();
    }
  }
}

interface File {
  id: string;
  modifiedTime: ISOString;
}

async function findFile(client: Client, filename: string): Promise<File | undefined> {
  const { files } = await client.request({
    method: 'GET',
    path: '/drive/v3/files',
    params: {
      corpora: 'user',
      q: `name = '${filename}' and 'root' in parents and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, modifiedTime)',
    },
  }) as { files: File[] };
  return files[0];
}

async function downloadFile(client: Client, file: File): Promise<string> {
  return await client.request({
    method: 'GET',
    path: `/drive/v3/files/${file.id}`,
    params: {
      alt: 'media',
    },
  }, 'text');
}

async function uploadFile(client: Client, file: File, localBlacklist: string, localTimestamp: ISOString): Promise<void> {
  await client.request({
    method: 'PATCH',
    path: `/upload/drive/v3/files/${file.id}`,
    params: {
      uploadType: 'media',
    },
    body: localBlacklist,
  });
  await client.request({
    method: 'PATCH',
    path: `/drive/v3/files/${file.id}`,
    body: {
      modifiedTime: localTimestamp,
    },
  });
}

async function createFile(client: Client, filename: string): Promise<File> {
  return await client.request({
    method: 'POST',
    path: '/drive/v3/files',
    body: {
      name: filename,
    },
  }) as File;
}

backgroundPage.syncBlacklist = async function (): Promise<void> {
  await singleTask.run('sync', async () => {
    await lock.acquire('blacklist', async () => {
      const {
        blacklist: localBlacklist, 
        timestamp: localTimestamp, 
        sync, 
        syncFilename: filename
      } = await getOptions('blacklist', 'timestamp', 'sync', 'syncFilename');
      if (!sync) {
        return;
      }
      invokeEvent('syncStart', {});
      let result: Result;
      try {
        const token = await backgroundPage.getAuthToken(false);
        try {
          const client = new Client(token);
          const file = await findFile(client, filename);
          if (file) {
            const cloudTimestamp = file.modifiedTime;
            const timestampDiff = dayjs(localTimestamp).diff(cloudTimestamp, 'millisecond');
            if (timestampDiff < 0) {
              const cloudBlacklist = await downloadFile(client, file);
              await setOptions({
                blacklist: cloudBlacklist,
                timestamp: cloudTimestamp,
              });
            } else if (timestampDiff > 0) {
              await uploadFile(client, file, localBlacklist, localTimestamp);
            }
          } else {
            const newFile = await createFile(client, filename);
            await uploadFile(client, newFile, localBlacklist, localTimestamp);
          }
          result = successResult();
        } catch (e) {
          if (e instanceof RequestError && e.code === 401) {
            backgroundPage.removeCachedAuthToken(token);
          }
          throw e;
        }
      } catch (e) {
        result = errorResult(e.message);
      }
      setOptions({ syncResult: result });
      invokeEvent('syncEnd', { result });
    });
  });
};

// #endregion Blacklist

// #region Subscriptions

backgroundPage.addSubscription = async function (subscription: Subscription): Promise<SubscriptionId> {
  return await lock.acquire('subscriptions', async () => {
    const {
      subscriptions,
      nextSubscriptionId: id
    } = await getOptions('subscriptions', 'nextSubscriptionId');
    subscriptions[id] = subscription;
    await setOptions({
      subscriptions,
      nextSubscriptionId: id + 1,
    });
    return id;
  });
};

backgroundPage.removeSubscription = async function (id: SubscriptionId): Promise<void> {
  await lock.acquire('subscriptions', async () => {
    const { subscriptions } = await getOptions('subscriptions');
    delete subscriptions[id];
    await setOptions({ subscriptions });
  });
};

backgroundPage.updateSubscription = async function (id: SubscriptionId): Promise<void> {
  await singleTask.run(`update${id}`, async () => {
    // Use optimistic lock for 'subscriptions'.
    // Don't lock now.
    const { subscriptions: { [id]: subscription } } = await getOptions('subscriptions');
    if (!subscription) {
      return;
    }
    invokeEvent('updateStart', { id });
    try {
      const init: RequestInit = {};
      if (subscription.timestamp != null) {
        init.headers = {
          'If-Modified-Since': subscription.timestamp,
        };
      }
      try {
        const response = await fetch(subscription.url, init);
        if (response.ok) {
          subscription.blacklist = await response.text();
          if (response.headers.has('Last-Modified')) {
            subscription.timestamp = response.headers.get('Last-Modified')!;
          }
          subscription.updateResult = successResult();
        } else if (response.status === 304) {
          subscription.updateResult = successResult();
        } else {
          subscription.updateResult = errorResult(response.statusText);
        }
      } catch (e) {
        subscription.updateResult = errorResult(e.message);
      }
      // Lock now.
      await lock.acquire('subscriptions', async () => {
        const { subscriptions } = await getOptions('subscriptions');
        // 'subscriptions[id]' may be already removed.
        if (subscriptions[id]) {
          subscriptions[id] = subscription;
          await setOptions({ subscriptions });
        }
      });
      invokeEvent('updateEnd', {
        id,
        result: subscription.updateResult,
      });
    } catch (e) {
      invokeEvent('updateEnd', {
        id,
        result: errorResult(e.message),
      });
    }
  });
};

// #endregion Subscriptions

// #region Auth
 
// #if BROWSER === 'chrome'
// For Chrome, simply use chrome.identity.getAuthToken.
backgroundPage.getAuthToken = function (interactive: boolean): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, token => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

backgroundPage.removeCachedAuthToken = function (token: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// #else
// For Firefox, use browser.identity.launchWebAuthFlow instead.
// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow
// Use AuthCache to cache tokens in the background page.
interface AuthCache {
  token: string;
  expirationDate: Dayjs;
}

let authCache: AuthCache | undefined = undefined;

const clientId = '304167046827-a53p7d9jopn9nvbo7e183t966rfcp9d1.apps.googleusercontent.com';
const scope = 'https://www.googleapis.com/auth/drive.file';

backgroundPage.getAuthToken = async function (interactive: boolean): Promise<string> {
  if (authCache && dayjs().isBefore(authCache.expirationDate)) {
    return authCache.token;
  }
  const authURL = 'https://accounts.google.com/o/oauth2/auth'
    + `?client_id=${clientId}`
    + '&response_type=token'
    + `&redirect_uri=${encodeURIComponent(browser.identity.getRedirectURL())}`
    + `&scope=${encodeURIComponent(scope)}`;
  const redirectURL = await browser.identity.launchWebAuthFlow({
    url: authURL,
    interactive,
  });
  const params = new URLSearchParams(new URL(redirectURL).hash.slice(1));
  if (params.has('error')) {
    throw new Error(params.get('error')!);
  }
  if (!params.has('access_token') || !params.has('expires_in')) {
    throw new Error(`Bad Redirect URL: ${redirectURL}`);
  }
  authCache = {
    token: params.get('access_token')!,
    expirationDate: dayjs().add(Number(params.get('expires_in')!), 'second'),
  };
  return authCache.token;
};

backgroundPage.removeCachedAuthToken = async function (token: string): Promise<void> {
  if (authCache && token === authCache.token) {
    authCache = undefined;
  }
}
// #endif

// #endregion Auth

async function updateAllSubscriptions(): Promise<void> {
  // Don't lock now.
  const { subscriptions } = await getOptions('subscriptions');
  const promises: Promise<void>[] = [];
  for (const id of Object.keys(subscriptions).map(Number)) {
    promises.push(backgroundPage.updateSubscription(id));
  }
  await Promise.all(promises);
}

async function main(): Promise<void> {
  addMessageListener('setBlacklist', async (args: SetBlacklistMessageArgs): Promise<void> => {
    await backgroundPage.setBlacklist(args.blacklist);
  });

  const {
    syncInterval,
    updateInterval
  } = await getOptions('syncInterval', 'updateInterval');
  backgroundPage.syncBlacklist();
  setInterval(() => {
    backgroundPage.syncBlacklist()
  }, syncInterval * 60 * 1000);
  updateAllSubscriptions();
  setInterval(updateAllSubscriptions, updateInterval * 60 * 1000);
}

main();
