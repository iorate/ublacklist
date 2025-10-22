import dayjs from "dayjs";
import { translate } from "../locales.ts";
import { supportedClouds } from "../supported-clouds.ts";
import type {
  BaseTokenCloudParams,
  CloudId,
  OAuthCloudToken,
} from "../types.ts";
import { HTTPError, Mutex } from "../utilities.ts";
import { loadFromRawStorage, saveToRawStorage } from "./raw-storage.ts";
import { sync } from "./sync.ts";

const mutex = new Mutex();

export async function connect(
  id: CloudId,
  authorizationCode: string,
  useAltFlow: boolean,
): Promise<boolean> {
  const connected = await mutex.lock(async () => {
    const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
    if (oldId) {
      return oldId === id;
    }
    const cloud = supportedClouds[id];
    try {
      if (cloud.type === "token") {
        // For token/credential providers, credentials are passed as a JSON string
        const credentials = JSON.parse(authorizationCode);
        await saveToRawStorage({
          syncCloudId: id,
          syncCloudToken: credentials,
        });
      } else if (cloud.type === "oauth") {
        const token = await cloud.getAccessToken(authorizationCode, useAltFlow);
        await saveToRawStorage({
          syncCloudId: id,
          syncCloudToken: {
            accessToken: token.accessToken,
            expiresAt: dayjs().add(token.expiresIn, "second").toISOString(),
            refreshToken: token.refreshToken,
          },
        });
      } else {
        throw new Error("Unknown cloud provider type");
      }
      return true;
    } catch (err) {
      console.error("[connect] Error:", err);
      return false;
    }
  });
  if (connected) {
    void sync();
  }
  return connected;
}

export function disconnect(): Promise<void> {
  return mutex.lock(async () => {
    const { syncCloudId: id } = await loadFromRawStorage(["syncCloudId"]);
    if (!id) {
      return;
    }
    await saveToRawStorage({ syncCloudId: false, syncCloudToken: false });
  });
}

export function syncFile(
  filename: string,
  content: string,
  modifiedTime: dayjs.Dayjs,
): Promise<{ content: string; modifiedTime: dayjs.Dayjs } | null> {
  return mutex.lock(async () => {
    const { syncCloudId, syncCloudToken } = await loadFromRawStorage([
      "syncCloudId",
      "syncCloudToken",
    ]);
    if (!syncCloudId) {
      throw new Error("Not connected");
    }
    const cloud = supportedClouds[syncCloudId];
    if (!syncCloudToken) {
      throw new Error(translate("unauthorizedError"));
    }

    if (cloud.type === "token") {
      // Use credentials for token/credential providers
      const credentials = syncCloudToken as BaseTokenCloudParams;

      // TODO: this code is duplicated as oauth clouds, consider refactoring
      const cloudFile = await cloud.findFile(credentials, filename);
      if (cloudFile) {
        if (
          modifiedTime.isBefore(
            cloudFile.modifiedTime,
            cloud.modifiedTimePrecision,
          )
        ) {
          const { content: cloudContent } = await cloud.readFile(
            credentials,
            cloudFile.id,
          );
          return {
            content: cloudContent,
            modifiedTime: cloudFile.modifiedTime,
          };
        }
        if (
          modifiedTime.isSame(
            cloudFile.modifiedTime,
            cloud.modifiedTimePrecision,
          )
        ) {
          return null;
        }
        await cloud.writeFile(credentials, cloudFile.id, content, modifiedTime);
        return null;
      }
      await cloud.createFile(credentials, filename, content, modifiedTime);
      return null;
    } else if (cloud.type === "oauth") {
      const credentials = syncCloudToken as OAuthCloudToken;
      let accessToken = credentials.accessToken;
      let expiresAt = dayjs(credentials.expiresAt);
      const refreshToken = credentials.refreshToken;
      const refresh = async (): Promise<void> => {
        try {
          const newToken = await cloud.refreshAccessToken(refreshToken);
          accessToken = newToken.accessToken;
          expiresAt = dayjs().add(newToken.expiresIn, "second");
          await saveToRawStorage({
            syncCloudToken: {
              accessToken,
              expiresAt: expiresAt.toISOString(),
              refreshToken,
            },
          });
        } catch (e: unknown) {
          if (e instanceof HTTPError && e.status === 400) {
            await saveToRawStorage({ syncCloudToken: false });
            throw new Error(translate("unauthorizedError"));
          }
          throw e;
        }
      };

      if (dayjs().isAfter(expiresAt)) {
        await refresh();
      }
      const refreshOnUnauthorized = async <T>(
        f: () => Promise<T>,
      ): Promise<T> => {
        try {
          return await f();
        } catch (e: unknown) {
          if (e instanceof HTTPError && e.status === 401) {
            await refresh();
            return await f();
          }
          throw e;
        }
      };
      const cloudFile = await refreshOnUnauthorized(() =>
        cloud.findFile(accessToken, filename),
      );
      if (cloudFile) {
        if (
          modifiedTime.isBefore(
            cloudFile.modifiedTime,
            cloud.modifiedTimePrecision,
          )
        ) {
          const { content: cloudContent } = await refreshOnUnauthorized(() =>
            cloud.readFile(accessToken, cloudFile.id),
          );
          return {
            content: cloudContent,
            modifiedTime: cloudFile.modifiedTime,
          };
        }
        if (
          modifiedTime.isSame(
            cloudFile.modifiedTime,
            cloud.modifiedTimePrecision,
          )
        ) {
          return null;
        }
        await refreshOnUnauthorized(() =>
          cloud.writeFile(accessToken, cloudFile.id, content, modifiedTime),
        );
        return null;
      }
      await refreshOnUnauthorized(() =>
        cloud.createFile(accessToken, filename, content, modifiedTime),
      );
      return null;
    } else {
      throw new Error("Unknown cloud provider type");
    }
  });
}
