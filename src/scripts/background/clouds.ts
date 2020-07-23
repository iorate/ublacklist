import dayjs from 'dayjs';
import { supportedClouds } from '../supported-clouds';
import * as LocalStorage from '../local-storage';
import { CloudId } from '../types';
import { HTTPError, Mutex, translate } from '../utilities';

const mutex = new Mutex();

export async function connect(id: CloudId): Promise<boolean> {
  return mutex.lock(async () => {
    const { syncCloudId: oldId } = await LocalStorage.load(['syncCloudId']);
    if (oldId != null) {
      return oldId === id;
    }
    const cloud = supportedClouds[id];
    try {
      const { authorizationCode } = await cloud.authorize();
      const token = await cloud.getAccessToken(authorizationCode);
      await LocalStorage.store({
        syncCloudId: id,
        syncCloudToken: {
          accessToken: token.accessToken,
          expiresAt: dayjs().add(token.expiresIn, 'second').toISOString(),
          refreshToken: token.refreshToken,
        },
      });
      return true;
    } catch {
      return false;
    }
  });
}

export async function disconnect(): Promise<void> {
  return mutex.lock(async () => {
    const { syncCloudId: id } = await LocalStorage.load(['syncCloudId']);
    if (id == null) {
      return;
    }
    await LocalStorage.store({ syncCloudId: null, syncCloudToken: null });
  });
}

export async function syncFile(
  content: string,
  modifiedTime: dayjs.Dayjs,
): Promise<{ content: string; modifiedTime: dayjs.Dayjs } | null> {
  return await mutex.lock(async () => {
    const { syncCloudId, syncCloudToken } = await LocalStorage.load([
      'syncCloudId',
      'syncCloudToken',
    ]);
    if (syncCloudId == null) {
      throw new Error('Not connected');
    }
    const cloud = supportedClouds[syncCloudId];
    if (syncCloudToken == null) {
      throw new Error(translate('unauthorizedError'));
    }
    let accessToken = syncCloudToken.accessToken;
    let expiresAt = dayjs(syncCloudToken.expiresAt);
    const refreshToken = syncCloudToken.refreshToken;
    const refresh = async (): Promise<void> => {
      try {
        const newToken = await cloud.refreshAccessToken(refreshToken);
        accessToken = newToken.accessToken;
        expiresAt = dayjs().add(newToken.expiresIn, 'second');
        await LocalStorage.store({
          syncCloudToken: { accessToken, expiresAt: expiresAt.toISOString(), refreshToken },
        });
      } catch (e) {
        if (e instanceof HTTPError && e.status === 400) {
          await LocalStorage.store({ syncCloudToken: null });
          throw new Error(translate('unauthorizedError'));
        } else {
          throw e;
        }
      }
    };
    if (dayjs().isAfter(expiresAt)) {
      await refresh();
    }
    const refreshOnUnauthorized = async <T>(f: () => Promise<T>): Promise<T> => {
      try {
        return await f();
      } catch (e) {
        if (e instanceof HTTPError && e.status === 401) {
          await refresh();
          return await f();
        } else {
          throw e;
        }
      }
    };
    const cloudFile = await refreshOnUnauthorized(() => cloud.findFile(accessToken));
    if (cloudFile) {
      if (modifiedTime.isBefore(cloudFile.modifiedTime, cloud.modifiedTimePrecision)) {
        const { content: cloudContent } = await refreshOnUnauthorized(() =>
          cloud.readFile(accessToken, cloudFile.id),
        );
        return {
          content: cloudContent,
          modifiedTime: cloudFile.modifiedTime,
        };
      } else if (modifiedTime.isSame(cloudFile.modifiedTime, cloud.modifiedTimePrecision)) {
        return null;
      } else {
        await refreshOnUnauthorized(() =>
          cloud.writeFile(accessToken, cloudFile.id, content, modifiedTime),
        );
        return null;
      }
    } else {
      await refreshOnUnauthorized(() => cloud.createFile(accessToken, content, modifiedTime));
      return null;
    }
  });
}
