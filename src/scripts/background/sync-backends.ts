import dayjs from "dayjs";
import { translate } from "../shared/locales.ts";
import { supportedClouds } from "../shared/supported-clouds.ts";
import type {
  CloudId,
  CloudToken,
  SyncForce,
  WebDAVParams,
} from "../shared/types.ts";
import { Mutex } from "../shared/utilities.ts";
import { createClient as createBrowserSyncClient } from "../sync-backends/browser-sync.ts";
import { createClient as createCloudClient } from "../sync-backends/cloud.ts";
import {
  createClient as createWebDAVClient,
  ensureWebDAVFolder,
} from "../sync-backends/webdav.ts";
import { loadFromRawStorage, saveToRawStorage } from "./raw-storage.ts";
import { sync } from "./sync.ts";

const mutex = new Mutex();

export async function connectToCloud(
  id: CloudId,
  authorizationCode: string,
  useAltFlow: boolean,
  codeVerifier: string,
  initialForce: SyncForce,
): Promise<{ message: string } | null> {
  try {
    await mutex.lock(async () => {
      const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
      if (oldId) {
        if (oldId !== id) {
          throw new Error("Already connected to another backend");
        }
      }
      const cloud = supportedClouds[id];
      const token = await cloud.getAccessToken(
        authorizationCode,
        useAltFlow,
        codeVerifier,
      );
      await saveToRawStorage({
        syncCloudId: id,
        syncCloudToken: {
          accessToken: token.accessToken,
          expiresAt: dayjs().add(token.expiresIn, "second").toISOString(),
          refreshToken: token.refreshToken,
          pkce: true,
        },
      });
    });
    void sync(initialForce);
    return null;
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function connectToWebDAV(
  params: WebDAVParams,
  initialForce: SyncForce,
): Promise<{ message: string } | null> {
  try {
    await mutex.lock(async () => {
      const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
      if (oldId) {
        if (oldId !== "webdav") {
          throw new Error("Already connected to another backend");
        }
      }
      await ensureWebDAVFolder(params);
      await saveToRawStorage({
        syncCloudId: "webdav",
        syncCloudToken: params,
      });
    });
    void sync(initialForce);
    return null;
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function connectToBrowserSync(initialForce: SyncForce): Promise<{
  message: string;
} | null> {
  try {
    await mutex.lock(async () => {
      const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
      if (oldId) {
        if (oldId !== "browserSync") {
          throw new Error("Already connected to another backend");
        }
      }
      await saveToRawStorage({
        syncCloudId: "browserSync",
        syncCloudToken: {},
      });
    });
    void sync(initialForce);
    return null;
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
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
  force: SyncForce,
): Promise<{ content: string; modifiedTime: dayjs.Dayjs } | null> {
  return mutex.lock(async () => {
    const { syncCloudId, syncCloudToken } = await loadFromRawStorage([
      "syncCloudId",
      "syncCloudToken",
    ]);
    if (!syncCloudId) {
      throw new Error("Not connected");
    }
    if (!syncCloudToken) {
      throw new Error(translate("unauthorizedError"));
    }
    // `syncCloudId` and `syncCloudToken` are always consistent in storage,
    // so type assertions are safe here
    const client =
      syncCloudId === "webdav"
        ? createWebDAVClient(syncCloudToken as WebDAVParams)
        : syncCloudId === "browserSync"
          ? createBrowserSyncClient()
          : createCloudClient(
              supportedClouds[syncCloudId],
              syncCloudToken as CloudToken,
              (token) => saveToRawStorage({ syncCloudToken: token ?? false }),
            );
    const cloudFile = await client.findFile(filename);
    if (force === "upload") {
      // Use `now` so this device's version wins on other devices' next sync,
      // regardless of their existing local/cloud timestamps.
      const forcedTime = dayjs();
      if (cloudFile) {
        await client.updateFile(cloudFile.id, content, forcedTime);
      } else {
        await client.createFile(filename, content, forcedTime);
      }
      return { content, modifiedTime: forcedTime };
    }
    if (force === "download") {
      if (!cloudFile) {
        return null;
      }
      const { content: cloudContent } = await client.readFile(cloudFile.id);
      return { content: cloudContent, modifiedTime: cloudFile.modifiedTime };
    }
    if (cloudFile) {
      if (
        modifiedTime.isBefore(
          cloudFile.modifiedTime,
          client.modifiedTimePrecision,
        )
      ) {
        const { content: cloudContent } = await client.readFile(cloudFile.id);
        return {
          content: cloudContent,
          modifiedTime: cloudFile.modifiedTime,
        };
      }
      if (
        modifiedTime.isSame(
          cloudFile.modifiedTime,
          client.modifiedTimePrecision,
        )
      ) {
        return null;
      }
      await client.updateFile(cloudFile.id, content, modifiedTime);
      return null;
    }
    await client.createFile(filename, content, modifiedTime);
    return null;
  });
}
