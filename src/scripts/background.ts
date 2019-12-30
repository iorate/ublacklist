import dayjs from 'dayjs';
import { BackgroundPage, addMessageListener, sendMessage } from './common';
import { apis } from './apis';
import * as LocalStorage from './local-storage';
import { Engine, ISOString, Subscription, SubscriptionId } from './types';
import { AltURL, MatchPattern, Mutex, errorResult, successResult } from './utilities';
import { ENGINES } from './engines';

const backgroundPage = (window as Window) as BackgroundPage;

// #region Blacklist

const blacklistMutex = new Mutex();

backgroundPage.setBlacklist = async function(blacklist: string): Promise<void> {
  await blacklistMutex.lock(async () => {
    await LocalStorage.store({ blacklist, timestamp: dayjs().toISOString() });
  });
  // Request sync, but don't await it.
  backgroundPage.syncBlacklist();
};

backgroundPage.setSync = async function(sync: boolean): Promise<void> {
  await LocalStorage.store({ sync });
  backgroundPage.syncBlacklist();
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
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    // #if BROWSER === 'chrome'
    Error.captureStackTrace(this, RequestError);
    // #endif
  }
}

class Client {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async request(args: RequestArgs): Promise<unknown> {
    const response = await this.doRequest(args);
    return await response.json();
  }

  async requestText(args: RequestArgs): Promise<string> {
    const response = await this.doRequest(args);
    return await response.text();
  }

  private async doRequest(args: RequestArgs): Promise<Response> {
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
        error: { code, message },
      } = (await response.json()) as { error: { code: number; message: string } };
      throw new RequestError(code, message);
    }
    return response;
  }
}

interface File {
  id: string;
  modifiedTime: ISOString;
}

async function findFile(client: Client, filename: string): Promise<File | null> {
  const { files } = (await client.request({
    method: 'GET',
    path: '/drive/v3/files',
    params: {
      corpora: 'user',
      q: `name = '${filename}' and 'root' in parents and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, modifiedTime)',
    },
  })) as { files: File[] };
  return files.length ? files[0] : null;
}

async function downloadFile(client: Client, file: File): Promise<string> {
  return await client.requestText({
    method: 'GET',
    path: `/drive/v3/files/${file.id}`,
    params: {
      alt: 'media',
    },
  });
}

async function uploadFile(
  client: Client,
  file: File,
  localBlacklist: string,
  localTimestamp: ISOString,
): Promise<void> {
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
  return (await client.request({
    method: 'POST',
    path: '/drive/v3/files',
    body: {
      name: filename,
    },
  })) as File;
}

let syncRunning: boolean = false;

const SYNC_FILENAME = 'uBlacklist.txt';

backgroundPage.syncBlacklist = async function(): Promise<void> {
  if (syncRunning) {
    return;
  }
  syncRunning = true;
  try {
    await blacklistMutex.lock(async () => {
      const {
        blacklist: localBlacklist,
        timestamp: localTimestamp,
        sync,
      } = await LocalStorage.load('blacklist', 'timestamp', 'sync');
      if (!sync) {
        return;
      }
      sendMessage('syncStart', {});
      try {
        const items: Partial<LocalStorage.Items> = {};
        try {
          const token = await backgroundPage.getAuthToken(false);
          const client = new Client(token);
          const file = await findFile(client, SYNC_FILENAME);
          if (file) {
            const cloudTimestamp = file.modifiedTime;
            const timestampDiff = dayjs(localTimestamp).diff(cloudTimestamp, 'millisecond');
            if (timestampDiff < 0) {
              const cloudBlacklist = await downloadFile(client, file);
              items.blacklist = cloudBlacklist;
              items.timestamp = cloudTimestamp;
            } else if (timestampDiff > 0) {
              await uploadFile(client, file, localBlacklist, localTimestamp);
            }
          } else {
            const newFile = await createFile(client, SYNC_FILENAME);
            await uploadFile(client, newFile, localBlacklist, localTimestamp);
          }
          items.syncResult = successResult();
        } catch (e) {
          if (e instanceof RequestError && e.code === 401) {
            await backgroundPage.removeCachedAuthToken();
          }
          items.syncResult = errorResult(e.message);
        }
        LocalStorage.store(items);
        sendMessage('syncEnd', { result: items.syncResult });
      } catch (e) {
        sendMessage('syncEnd', { result: errorResult(e.message) });
      }
    });
  } finally {
    syncRunning = false;
  }
};

// #endregion Blacklist

// #region Subscriptions

const subscriptionsMutex = new Mutex();

backgroundPage.addSubscription = async function(
  subscription: Subscription,
): Promise<SubscriptionId> {
  return await subscriptionsMutex.lock(async () => {
    const { subscriptions, nextSubscriptionId: id } = await LocalStorage.load(
      'subscriptions',
      'nextSubscriptionId',
    );
    subscriptions[id] = subscription;
    await LocalStorage.store({ subscriptions, nextSubscriptionId: id + 1 });
    return id;
  });
};

backgroundPage.removeSubscription = async function(id: SubscriptionId): Promise<void> {
  await subscriptionsMutex.lock(async () => {
    const { subscriptions } = await LocalStorage.load('subscriptions');
    delete subscriptions[id];
    await LocalStorage.store({ subscriptions });
  });
};

const updateRunning = new Set<SubscriptionId>();

backgroundPage.updateSubscription = async function(id: SubscriptionId): Promise<void> {
  if (updateRunning.has(id)) {
    return;
  }
  updateRunning.add(id);
  try {
    // Use optimistic lock for 'subscriptions'.
    // Don't lock now.
    const {
      subscriptions: { [id]: subscription },
    } = await LocalStorage.load('subscriptions');
    if (!subscription) {
      return;
    }
    sendMessage('updateStart', { id });
    try {
      try {
        const response = await fetch(subscription.url);
        if (response.ok) {
          subscription.blacklist = await response.text();
          subscription.updateResult = successResult();
        } else {
          subscription.updateResult = errorResult(response.statusText);
        }
      } catch (e) {
        subscription.updateResult = errorResult(e.message);
      }
      // Lock now.
      await subscriptionsMutex.lock(async () => {
        const { subscriptions } = await LocalStorage.load('subscriptions');
        // 'subscriptions[id]' may be already removed.
        if (subscriptions[id]) {
          subscriptions[id] = subscription;
          await LocalStorage.store({ subscriptions });
        }
      });
      sendMessage('updateEnd', { id, result: subscription.updateResult });
    } catch (e) {
      sendMessage('updateEnd', { id, result: errorResult(e.message) });
      throw e;
    }
  } finally {
    updateRunning.delete(id);
  }
};

backgroundPage.updateAllSubscriptions = async function(): Promise<void> {
  // Don't lock now.
  const { subscriptions } = await LocalStorage.load('subscriptions');
  const promises = Object.keys(subscriptions).map(id =>
    backgroundPage.updateSubscription(Number(id)),
  );
  await Promise.all(promises);
};

// #endregion Subscriptions

// #region Auth

// #if BROWSER === 'chrome'
const OAUTH2_CLIENT_ID = '304167046827-aqukv3fe891j0f9cu94i5aljhsecgpen.apps.googleusercontent.com';
// #elif BROWSER === 'firefox'
const OAUTH2_CLIENT_ID = '304167046827-a53p7d9jopn9nvbo7e183t966rfcp9d1.apps.googleusercontent.com';
// #endif
const OAUTH2_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const tokenCacheMutex = new Mutex();

backgroundPage.getAuthToken = async function(interactive: boolean): Promise<string> {
  // #if BROWSER === 'chrome'
  try {
    // #endif
    return await tokenCacheMutex.lock(async () => {
      const { tokenCache } = await LocalStorage.load('tokenCache');
      if (tokenCache && dayjs().isBefore(dayjs(tokenCache.expirationDate))) {
        return tokenCache.token;
      }
      const authURL =
        'https://accounts.google.com/o/oauth2/auth' +
        `?client_id=${OAUTH2_CLIENT_ID}` +
        '&response_type=token' +
        `&redirect_uri=${encodeURIComponent(apis.identity.getRedirectURL())}` +
        `&scope=${encodeURIComponent(OAUTH2_SCOPE)}`;
      const redirectURL = await apis.identity.launchWebAuthFlow({ interactive, url: authURL });
      const params = new URLSearchParams(new URL(redirectURL).hash.slice(1));
      if (params.has('error')) {
        throw new Error(params.get('error')!);
      }
      const token = params.get('access_token')!;
      const expirationDate = dayjs()
        .add(Number(params.get('expires_in')!), 'second')
        .toISOString();
      await LocalStorage.store({ tokenCache: { token, expirationDate } });
      return token;
    });
    // #if BROWSER === 'chrome'
  } catch (e) {
    if (interactive) {
      throw e;
    }
    return await apis.identity.getAuthToken({ interactive: false });
  }
  // #endif
};

backgroundPage.removeCachedAuthToken = async function(): Promise<void> {
  await tokenCacheMutex.lock(async () => {
    await LocalStorage.store({ tokenCache: null });
  });
};

// #endregion Auth

// #region Engines

// #if BROWSER === 'chrome'
interface ContentScript {
  css: string[];
  js: string[];
  matches: MatchPattern[];
}

const contentScripts: ContentScript[] = ENGINES.map(engine => ({
  css: [`/styles/engines/${engine.id}.css`, '/styles/content.css'],
  js: [`/scripts/engines/${engine.id}.js`, '/scripts/content.js'],
  matches: engine.matches.map(match => new MatchPattern(match)),
}));

async function onTabUpdated(tabId: number, changeInfo: apis.tabs.TabChangeInfo): Promise<void> {
  if (changeInfo.status !== 'loading') {
    return;
  }
  const url = changeInfo.url ?? (await apis.tabs.get(tabId)).url;
  if (url == undefined) {
    return;
  }
  const altURL = new AltURL(url);
  const contentScript = contentScripts.find(contentScript =>
    contentScript.matches.some(match => match.test(altURL)),
  );
  if (!contentScript) {
    return;
  }
  const result = await apis.tabs.executeScript(tabId, {
    file: '/scripts/has-content-handlers.js',
    runAt: 'document_start',
  });
  if (!result || result[0]) {
    return;
  }
  for (const css of contentScript.css) {
    apis.tabs.insertCSS(tabId, {
      file: css,
      runAt: 'document_start',
    });
  }
  for (const js of contentScript.js) {
    apis.tabs.executeScript(tabId, {
      file: js,
      runAt: 'document_start',
    });
  }
}
// #endif

// #if BROWSER === 'firefox'
backgroundPage.enableEngine = async function(engine: Engine): Promise<void> {
  await browser.contentScripts.register({
    css: [{ file: `/styles/engines/${engine.id}.css` }, { file: '/styles/content.css' }],
    js: [{ file: `/scripts/engines/${engine.id}.js` }, { file: '/scripts/content.js' }],
    matches: engine.matches,
    runAt: 'document_start',
  });
};
// #endif

// #endregion Engines

async function main(): Promise<void> {
  addMessageListener('setBlacklist', ({ blacklist }) => {
    backgroundPage.setBlacklist(blacklist);
  });

  // #if BROWSER === 'chrome'
  apis.tabs.onUpdated.addListener(onTabUpdated);
  // #endif
  // #if BROWSER === 'firefox'
  for (const engine of ENGINES) {
    if (await apis.permissions.contains({ origins: engine.matches })) {
      await backgroundPage.enableEngine(engine);
    }
  }
  // #endif

  const { syncInterval, updateInterval } = await LocalStorage.load(
    'syncInterval',
    'updateInterval',
  );
  backgroundPage.syncBlacklist();
  setInterval(() => {
    backgroundPage.syncBlacklist();
  }, syncInterval * 60 * 1000);
  backgroundPage.updateAllSubscriptions();
  setInterval(() => {
    backgroundPage.updateAllSubscriptions();
  }, updateInterval * 60 * 1000);
}

main();
