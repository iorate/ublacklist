import dayjs from "dayjs";
import { browserSync } from "../clouds/browser-sync.ts";
import { gitRepo } from "../clouds/git-repo.ts";
import { webdav } from "../clouds/webdav.ts";
import { translate } from "../locales.ts";
import { supportedClouds } from "../supported-clouds.ts";
import type {
  Cloud,
  CloudId,
  CloudToken,
  GitRepoParams,
  SyncBackendId,
  WebDAVParams,
} from "../types.ts";
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
    console.error("Connect to cloud error:", e);
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
    console.error("Connect to WebDAV error:", e);
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
    console.error("Connect to browser sync error:", e);
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function connectToGitRepo(
  params: GitRepoParams,
): Promise<{ message: string } | null> {
  try {
    await mutex.lock(async () => {
      const { syncCloudId: oldId } = await loadFromRawStorage(["syncCloudId"]);
      if (oldId) {
        if (oldId !== "gitRepo") {
          throw new Error("Already connected to another backend");
        }
      }
      await gitRepo.verifyConnection(params);
      await saveToRawStorage({
        syncCloudId: "gitRepo",
        syncCloudToken: params,
        syncGitRepoFileHashes: {},
      });
    });
    void sync();
    return null;
  } catch (e) {
    console.error("Connect to Git repo error:", e);
    return { message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export function disconnect(): Promise<void> {
  return mutex.lock(async () => {
    const { syncCloudId: id } = await loadFromRawStorage(["syncCloudId"]);
    if (!id) {
      return;
    }
    await saveToRawStorage({
      syncCloudId: false,
      syncCloudToken: false,
      syncGitRepoFileHashes: {},
    });
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
  listFileHashes?(filenames: string[]): Promise<Record<string, string>>;
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

function createGitRepoClient(params: GitRepoParams): Client {
  return {
    createFile: async (
      filename: string,
      content: string,
      modifiedTime: dayjs.Dayjs,
    ) => {
      await gitRepo.writeFile(params, filename, content, modifiedTime);
    },
    findFile: (filename: string) => gitRepo.findFile(params, filename),
    readFile: (id: string) => gitRepo.readFile(params, id),
    updateFile: (id: string, content: string, modifiedTime: dayjs.Dayjs) =>
      gitRepo.writeFile(params, id, content, modifiedTime),
    listFileHashes: (filenames: string[]) =>
      gitRepo.listFileHashes(params, filenames),
    modifiedTimePrecision: "second",
  };
}

function createClient(
  syncCloudId: SyncBackendId,
  syncCloudToken: unknown,
): Client {
  return syncCloudId === "webdav"
    ? createWebDAVClient(syncCloudToken as WebDAVParams)
    : syncCloudId === "browserSync"
      ? createBrowserSyncClient()
      : syncCloudId === "gitRepo"
        ? createGitRepoClient(syncCloudToken as GitRepoParams)
        : createCloudClient(
            supportedClouds[syncCloudId],
            syncCloudToken as CloudToken,
          );
}

type SyncFileInput = {
  filename: string;
  content: string;
  modifiedTime: dayjs.Dayjs;
};

type SyncFileResult = {
  filename: string;
  cloudFile: { content: string; modifiedTime: dayjs.Dayjs } | null;
};

type GitRepoFileHashState = Record<
  string,
  {
    remoteSha: string | null;
    localHash: string;
  }
>;

async function hashContent(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function syncFileByTimestamp(
  client: Client,
  file: SyncFileInput,
): Promise<SyncFileResult> {
  const cloudFile = await client.findFile(file.filename);

  if (!cloudFile) {
    await client.createFile(file.filename, file.content, file.modifiedTime);
    return {
      filename: file.filename,
      cloudFile: null,
    };
  }

  if (
    file.modifiedTime.isBefore(
      cloudFile.modifiedTime,
      client.modifiedTimePrecision,
    )
  ) {
    const { content: cloudContent } = await client.readFile(cloudFile.id);
    return {
      filename: file.filename,
      cloudFile: {
        content: cloudContent,
        modifiedTime: cloudFile.modifiedTime,
      },
    };
  }

  if (
    file.modifiedTime.isSame(
      cloudFile.modifiedTime,
      client.modifiedTimePrecision,
    )
  ) {
    return {
      filename: file.filename,
      cloudFile: null,
    };
  }

  await client.updateFile(cloudFile.id, file.content, file.modifiedTime);
  return {
    filename: file.filename,
    cloudFile: null,
  };
}

type HashSyncRuntime = {
  remoteHashes: Record<string, string> | undefined;
  nextHashState: GitRepoFileHashState;
  localHashes: Map<string, string>;
  wroteToCloud: boolean;
};

async function syncFileByGitRepoHash(
  client: Client,
  file: SyncFileInput,
  runtime: HashSyncRuntime,
): Promise<SyncFileResult> {
  const localHash = await hashContent(file.content);
  runtime.localHashes.set(file.filename, localHash);

  const savedState = runtime.nextHashState[file.filename];
  const remoteSha = runtime.remoteHashes?.[file.filename] ?? null;
  const hasSavedState = savedState != null;
  const remoteChanged = hasSavedState
    ? savedState.remoteSha !== remoteSha
    : true;
  const localChanged = hasSavedState
    ? savedState.localHash !== localHash
    : true;

  if (hasSavedState && !remoteChanged && !localChanged) {
    return { filename: file.filename, cloudFile: null };
  }

  if (hasSavedState && remoteChanged && !localChanged) {
    if (remoteSha == null) {
      // Keep local as source of truth: if remote file was deleted while local
      // is unchanged, recreate it so synced files remain present remotely.
      await client.createFile(file.filename, file.content, file.modifiedTime);
      runtime.wroteToCloud = true;
      return { filename: file.filename, cloudFile: null };
    }

    const { content: cloudContent } = await client.readFile(file.filename);
    const cloudHash = await hashContent(cloudContent);
    runtime.nextHashState[file.filename] = {
      remoteSha,
      localHash: cloudHash,
    };
    return {
      filename: file.filename,
      cloudFile: {
        content: cloudContent,
        modifiedTime: dayjs.utc(),
      },
    };
  }

  if (remoteSha != null) {
    await client.updateFile(file.filename, file.content, file.modifiedTime);
  } else {
    await client.createFile(file.filename, file.content, file.modifiedTime);
  }
  runtime.wroteToCloud = true;
  return { filename: file.filename, cloudFile: null };
}

async function saveGitRepoHashState(
  client: Client,
  files: SyncFileInput[],
  results: SyncFileResult[],
  runtime: HashSyncRuntime,
): Promise<void> {
  const refreshedRemoteHashes =
    runtime.wroteToCloud || !runtime.remoteHashes
      ? await client.listFileHashes?.(files.map((file) => file.filename))
      : runtime.remoteHashes;

  for (const file of files) {
    const result = results.find((r) => r.filename === file.filename);
    const finalLocalHash = result?.cloudFile
      ? await hashContent(result.cloudFile.content)
      : (runtime.localHashes.get(file.filename) ??
        (await hashContent(file.content)));
    runtime.nextHashState[file.filename] = {
      remoteSha: refreshedRemoteHashes?.[file.filename] ?? null,
      localHash: finalLocalHash,
    };
  }

  await saveToRawStorage({ syncGitRepoFileHashes: runtime.nextHashState });
}

export function syncFiles(files: SyncFileInput[]): Promise<SyncFileResult[]> {
  return mutex.lock(async () => {
    const { syncCloudId, syncCloudToken, syncGitRepoFileHashes } =
      await loadFromRawStorage([
        "syncCloudId",
        "syncCloudToken",
        "syncGitRepoFileHashes",
      ]);
    if (!syncCloudId) {
      throw new Error("Not connected");
    }
    if (!syncCloudToken) {
      throw new Error(translate("unauthorizedError"));
    }

    const client = createClient(syncCloudId, syncCloudToken);

    const shouldUseGitRepoHashCompare =
      syncCloudId === "gitRepo" && !!client.listFileHashes;

    if (syncCloudId === "gitRepo" && !shouldUseGitRepoHashCompare) {
      throw new Error("Git repo sync requires hash-based sync");
    }

    if (!shouldUseGitRepoHashCompare) {
      return Promise.all(
        files.map((file) => syncFileByTimestamp(client, file)),
      );
    }

    const results: SyncFileResult[] = [];
    const runtime: HashSyncRuntime = {
      remoteHashes: shouldUseGitRepoHashCompare
        ? await client.listFileHashes?.(files.map((file) => file.filename))
        : undefined,
      nextHashState: {
        ...(syncGitRepoFileHashes as GitRepoFileHashState),
      },
      localHashes: new Map<string, string>(),
      wroteToCloud: false,
    };

    for (const file of files) {
      if (shouldUseGitRepoHashCompare) {
        results.push(await syncFileByGitRepoHash(client, file, runtime));
      } else {
        results.push(await syncFileByTimestamp(client, file));
      }
    }

    if (shouldUseGitRepoHashCompare) {
      await saveGitRepoHashState(client, files, results, runtime);
    }

    return results;
  });
}
