import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";
import {
  createClient as createWebDAVClient,
  type FileStat,
  type WebDAVClientError,
} from "webdav";
import type { WebDAV, WebDAVParams } from "../types.ts";
import { UnexpectedResponse } from "../utilities.ts";

dayjs.extend(dayjsUTC);

function createClient(params: WebDAVParams) {
  return createWebDAVClient(params.url, {
    username: params.username,
    password: params.password,
  });
}

function getFullPath(basePath: string, filename: string): string {
  return `${basePath.replace(/\/+$/u, "")}/${filename}`;
}

function isWebDAVClientError(error: unknown): error is WebDAVClientError {
  return (
    error instanceof Error &&
    typeof (error as WebDAVClientError).status === "number" &&
    (error as WebDAVClientError).response !== undefined
  );
}

export const webdav: WebDAV = {
  async ensureWebDAVFolder(params: WebDAVParams): Promise<void> {
    const client = createClient(params);
    let dirExists = false;
    try {
      dirExists = await client.exists(params.path);
    } catch (e) {
      // Some WebDAV server returns HTTP 409 if parent directory does not exist.
      // Here we silently ignore this error.
      if (!isWebDAVClientError(e)) throw e;
    }
    if (!dirExists) {
      await client.createDirectory(params.path, { recursive: true });
    }
  },

  async writeFile(
    params: WebDAVParams,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const client = createClient(params);
    await client.putFileContents(getFullPath(params.path, id), content, {
      headers: {
        // these are all non-standard headers used by some WebDAV servers. ref: https://docs.nextcloud.com/server/stable/developer_manual/client_apis/WebDAV/basic.html#request-headers
        "X-OC-Mtime": modifiedTime.unix().toString(),
        // format: HTTP header: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
        "X-Last-Modified": modifiedTime.toString(),
        "Last-Modified": modifiedTime.toString(),
      },
    });
  },

  async findFile(
    params: WebDAVParams,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const client = createClient(params);
    const fullPath = getFullPath(params.path, filename);
    try {
      const stat = (await client.stat(fullPath, {
        details: false,
      })) as FileStat;
      if (!stat || !stat.lastmod) {
        throw new UnexpectedResponse("No lastmod in WebDAV stat response");
      }
      return { id: filename, modifiedTime: dayjs.utc(stat.lastmod) };
    } catch (e) {
      // WebDAVClientError
      if (isWebDAVClientError(e) && e.status === 404) {
        return null;
      }
      throw e;
    }
  },

  async readFile(
    params: WebDAVParams,
    id: string,
  ): Promise<{ content: string }> {
    const client = createClient(params);
    const fullPath = getFullPath(params.path, id);
    const content = await client.getFileContents(fullPath, { format: "text" });
    return { content: content as string };
  },
};
