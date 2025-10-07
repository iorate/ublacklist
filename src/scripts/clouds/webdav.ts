import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";
import { createClient, type FileStat, type WebDAVClientError } from "webdav";
import type { TokenCloudWebDAV, TokenCloudWebDAVParams } from "../types.ts";
import { UnexpectedResponse } from "../utilities.ts";

dayjs.extend(dayjsUTC);

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

export const webdav: TokenCloudWebDAV = {
  type: "token",
  hostPermissions: [],

  messageNames: {
    sync: "clouds_webdavSync",
    syncDescription: "clouds_webdavSyncDescription",
    syncTurnedOn: "clouds_webdavSyncTurnedOn",
  },

  modifiedTimePrecision: "second",

  requiredParams: [
    {
      key: "url",
      label: "clouds_webdavUrlLabel",
      type: "url",
      required: true,
      placeholder: "https://example.com/webdav",
    },
    {
      key: "username",
      label: "clouds_webdavUsernameLabel",
      type: "text",
      required: true,
    },
    {
      key: "password",
      label: "clouds_webdavPasswordLabel",
      type: "password",
      required: true,
    },
    {
      key: "path",
      label: "clouds_webdavPathLabel",
      type: "text",
      required: true,
      placeholder: "/Apps/uBlacklist",
      default: "/Apps/uBlacklist",
    },
  ],

  getInstance: (params: TokenCloudWebDAVParams) =>
    createClient(params.url, {
      username: params.username,
      password: params.password,
    }),

  async ensureWebDAVFolder(params: TokenCloudWebDAVParams): Promise<void> {
    const client = this.getInstance(params);
    await client.createDirectory(params.path, { recursive: true });
  },

  // WebDAV does not require OAuth authorization, so this is a no-op
  async authorize(params: TokenCloudWebDAVParams): Promise<void> {
    await this.ensureWebDAVFolder(params);
    return;
  },

  async createFile(
    credentials: TokenCloudWebDAVParams,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    return await this.writeFile(credentials, filename, content, modifiedTime);
  },

  async writeFile(
    credentials: TokenCloudWebDAVParams,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const client = this.getInstance(credentials);
    await client.putFileContents(getFullPath(credentials.path, id), content, {
      headers: {
        // these are all non-standard headers used by some WebDAV servers. ref: https://docs.nextcloud.com/server/stable/developer_manual/client_apis/WebDAV/basic.html#request-headers
        "X-OC-Mtime": Math.floor(modifiedTime.unix()).toString(),
        // format: HTTP header: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
        "X-Last-Modified": modifiedTime.toString(),
        "Last-Modified": modifiedTime.toString(),
      },
    });
  },

  async findFile(
    credentials: TokenCloudWebDAVParams,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const client = this.getInstance(credentials);
    const fullPath = getFullPath(credentials.path, filename);
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
    credentials: TokenCloudWebDAVParams,
    id: string,
  ): Promise<{ content: string }> {
    const client = this.getInstance(credentials);
    const fullPath = getFullPath(credentials.path, id);
    const content = await client.getFileContents(fullPath, { format: "text" });
    return { content: content as string };
  },
};
