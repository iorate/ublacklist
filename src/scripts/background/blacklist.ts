import dayjs from 'dayjs';
import { apis } from '../apis';
import * as LocalStorage from '../local-storage';
import { postMessage } from '../messages';
import { ISOString } from '../types';
import { Mutex, errorResult, successResult } from '../utilities';
import { clearTokenCache, requestToken } from './token';

const SYNC_FILENAME = 'uBlacklist.txt';

const mutex = new Mutex();
let syncing = false;

export async function authToSyncBlacklist(): Promise<boolean> {
  try {
    await requestToken(true);
    return true;
  } catch {
    return false;
  }
}

interface File {
  id: string;
  modifiedTime: ISOString;
}

interface RequestArgs {
  method: 'GET' | 'PATCH' | 'POST';
  path: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string | object;
}

class RequestError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

class Client {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async createFile(filename: string): Promise<File> {
    const response = await this.request({
      method: 'POST',
      path: '/drive/v3/files',
      body: {
        name: filename,
      },
    });
    return (await response.json()) as File;
  }

  async downloadFile(file: File): Promise<string> {
    const response = await this.request({
      method: 'GET',
      path: `/drive/v3/files/${file.id}`,
      params: {
        alt: 'media',
      },
    });
    return await response.text();
  }

  async findFile(filename: string): Promise<File | null> {
    const response = await this.request({
      method: 'GET',
      path: '/drive/v3/files',
      params: {
        corpora: 'user',
        q: `name = '${filename}' and 'root' in parents and trashed = false`,
        spaces: 'drive',
        fields: 'files(id, modifiedTime)',
      },
    });
    const { files } = (await response.json()) as { files: File[] };
    return files[0] ?? null;
  }

  async uploadFile(file: File, localBlacklist: string, localTimestamp: ISOString): Promise<void> {
    await this.request({
      method: 'PATCH',
      path: `/upload/drive/v3/files/${file.id}`,
      params: {
        uploadType: 'media',
      },
      body: localBlacklist,
    });
    await this.request({
      method: 'PATCH',
      path: `/drive/v3/files/${file.id}`,
      body: {
        modifiedTime: localTimestamp,
      },
    });
  }

  private async request(args: RequestArgs): Promise<Response> {
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
    if (args.body !== undefined) {
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
      throw new RequestError(message, code);
    }
    return response;
  }
}

export async function syncBlacklist(): Promise<void> {
  if (syncing) {
    return;
  }
  syncing = true;
  try {
    await mutex.lock(async () => {
      const {
        blacklist: localBlacklist,
        timestamp: localTimestamp,
        sync,
        syncInterval,
      } = await LocalStorage.load('blacklist', 'timestamp', 'sync', 'syncInterval');
      if (!sync) {
        return;
      }
      postMessage('blacklist-syncing');
      const items: Partial<LocalStorage.Items> = {};
      try {
        const token = await requestToken(false);
        const client = new Client(token);
        const file = await client.findFile(SYNC_FILENAME);
        if (file) {
          const cloudTimestamp = file.modifiedTime;
          const timestampDiff = dayjs(localTimestamp).diff(cloudTimestamp, 'millisecond');
          if (timestampDiff < 0) {
            const cloudBlacklist = await client.downloadFile(file);
            items.blacklist = cloudBlacklist;
            items.timestamp = cloudTimestamp;
          } else if (timestampDiff > 0) {
            await client.uploadFile(file, localBlacklist, localTimestamp);
          }
        } else {
          const newFile = await client.createFile(SYNC_FILENAME);
          await client.uploadFile(newFile, localBlacklist, localTimestamp);
        }
        items.syncResult = successResult();
      } catch (e) {
        if (e instanceof RequestError && e.code === 401) {
          await clearTokenCache();
        }
        items.syncResult = errorResult(e.message);
      }
      await LocalStorage.store(items);
      postMessage('blacklist-synced', items.syncResult!);
      apis.alarms.create('sync-blacklist', { delayInMinutes: syncInterval });
    });
  } finally {
    syncing = false;
  }
}

export async function setBlacklist(blacklist: string): Promise<void> {
  await mutex.lock(async () => {
    await LocalStorage.store({ blacklist, timestamp: dayjs().toISOString() });
  });
  // Request sync, but don't await it.
  syncBlacklist();
}
