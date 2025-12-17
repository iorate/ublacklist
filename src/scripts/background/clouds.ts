import dayjs from "dayjs";
import { browserSync } from "../clouds/browser-sync.ts";
import { webdav } from "../clouds/webdav.ts";
import { translate } from "../locales.ts";
import { supportedClouds } from "../supported-clouds.ts";
import type { Cloud, CloudId, CloudToken, WebDAVParams } from "../types.ts";
import { HTTPError, Mutex } from "../utilities.ts";
import { loadFromRawStorage, saveToRawStorage } from "./raw-storage.ts";
import { sync } from "./sync.ts";

const mutex = new Mutex();

export async function connect(
  id: CloudId,
  authorizationCode: string,
  useAltFlow: boolean,
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
      const token = await cloud.getAccessToken(authorizationCode, useAltFlow);
      await saveToRawStorage({
        syncCloudId: id,
        syncCloudToken: {
          accessToken: token.accessToken,
          expiresAt: dayjs().add(token.expiresIn, "second").toISOString(),
          refreshToken: token.refreshToken,
        },
      });
    });
    void sync();
    return null;
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function connectToWebDAV(
  params: WebDAVParams,
): Promise<{ message: string } | null> {
  try {
    await mutex.lock(async () => {
      const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
      if (oldId) {
        if (oldId !== "webdav") {
          throw new Error("Already connected to another backend");
        }
      }
      await webdav.ensureWebDAVFolder(params);
      await saveToRawStorage({
        syncCloudId: "webdav",
        syncCloudToken: params,
      });
    });
    void sync();
    return null;
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function connectToBrowserSync(): Promise<{
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
    void sync();
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

type Client = {
  createFile(
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
  findFile(
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null>;
  readFile(id: string): Promise<{ content: string }>;
  updateFile(
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void>;
  modifiedTimePrecision: "second" | "millisecond";
};

function createCloudClient(cloud: Cloud, initialToken: CloudToken): Client {
  let token = { ...initialToken };
  const refresh = async (): Promise<void> => {
    try {
      const newToken = await cloud.refreshAccessToken(token.refreshToken);
      token = {
        accessToken: newToken.accessToken,
        expiresAt: dayjs().add(newToken.expiresIn, "second").toISOString(),
        refreshToken: token.refreshToken,
      };
      await saveToRawStorage({ syncCloudToken: token });
    } catch (e: unknown) {
      if (e instanceof HTTPError && e.status === 400) {
        await saveToRawStorage({ syncCloudToken: false });
        throw new Error(translate("unauthorizedError"));
      }
      throw e;
    }
  };
  const handleRefresh = async <T>(f: () => Promise<T>): Promise<T> => {
    if (dayjs().isAfter(dayjs(token.expiresAt))) {
      await refresh();
    }
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
  return {
    createFile: (
      filename: string,
      content: string,
      modifiedTime: dayjs.Dayjs,
    ) =>
      handleRefresh(() =>
        cloud.createFile(token.accessToken, filename, content, modifiedTime),
      ),
    findFile: (filename: string) =>
      handleRefresh(() => cloud.findFile(token.accessToken, filename)),
    readFile: (id: string) =>
      handleRefresh(() => cloud.readFile(token.accessToken, id)),
    updateFile: (id: string, content: string, modifiedTime: dayjs.Dayjs) =>
      handleRefresh(() =>
        cloud.updateFile(token.accessToken, id, content, modifiedTime),
      ),
    modifiedTimePrecision: cloud.modifiedTimePrecision,
  };
}

function createWebDAVClient(params: WebDAVParams): Client {
  return {
    createFile: async (
      filename: string,
      content: string,
      modifiedTime: dayjs.Dayjs,
    ) => {
      // Ensure folder exists in case it was deleted externally
      await webdav.ensureWebDAVFolder(params);
      await webdav.writeFile(params, filename, content, modifiedTime);
    },
    findFile: (filename: string) => webdav.findFile(params, filename),
    readFile: (id: string) => webdav.readFile(params, id),
    updateFile: (id: string, content: string, modifiedTime: dayjs.Dayjs) =>
      webdav.writeFile(params, id, content, modifiedTime),
    modifiedTimePrecision: "second",
  };
}

function createBrowserSyncClient(): Client {
  return {
    createFile: browserSync.createFile,
    findFile: browserSync.findFile,
    readFile: browserSync.readFile,
    updateFile: browserSync.writeFile,
    modifiedTimePrecision: "millisecond",
  };
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
            );
    const cloudFile = await client.findFile(filename);
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
