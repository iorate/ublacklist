import dayjs from 'dayjs';
import * as LocalStorage from '../local-storage';
import { SetBlacklistSource, postMessage } from '../messages';
import { Mutex, errorResult, successResult } from '../utilities';
import { syncFile } from './clouds';

const mutex = new Mutex();

export async function set(blacklist: string, source: SetBlacklistSource): Promise<void> {
  await mutex.lock(async () => {
    await LocalStorage.store({ blacklist, timestamp: dayjs().toISOString() });
    postMessage('blacklist-set', blacklist, source);
  });
}

export async function sync(): Promise<{ interval: number | null }> {
  return await mutex.lock(async () => {
    const { blacklist, timestamp, syncCloudId, syncInterval } = await LocalStorage.load([
      'blacklist',
      'timestamp',
      'syncCloudId',
      'syncInterval',
    ]);
    if (syncCloudId == null) {
      return { interval: null };
    }
    postMessage('blacklist-syncing');
    try {
      const cloudFile = await syncFile(blacklist, dayjs(timestamp));
      const result = successResult();
      if (cloudFile) {
        await LocalStorage.store({
          blacklist: cloudFile.content,
          timestamp: cloudFile.modifiedTime.toISOString(),
          syncResult: result,
        });
        postMessage('blacklist-set', cloudFile.content, 'background');
      } else {
        await LocalStorage.store({ syncResult: result });
      }
      postMessage('blacklist-synced', result);
    } catch (e) {
      const result = errorResult(e instanceof Error ? e.message : 'Unknown error');
      await LocalStorage.store({ syncResult: result });
      postMessage('blacklist-synced', result);
    }
    return { interval: syncInterval };
  });
}
