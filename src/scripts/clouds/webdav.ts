import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";
import type { TokenCloud } from "../types.ts";
import { HTTPError, UnexpectedResponse } from "../utilities.ts";

dayjs.extend(dayjsUTC);

function toISOStringSecond(time: dayjs.Dayjs): string {
  return time.utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
}

function createWebDAVAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

async function ensureWebDAVFolder(
  url: string,
  username: string,
  password: string,
): Promise<void> {
  // TODO: creating folders recursively if needed
  // Check if folder exists
  const res = await fetch(url, {
    method: "PROPFIND",
    headers: {
      Authorization: createWebDAVAuthHeader(username, password),
      Depth: "0",
    },
  });
  if (res.status === 404) {
    // Folder does not exist, create it
    const mkcolRes = await fetch(url, {
      method: "MKCOL",
      headers: {
        Authorization: createWebDAVAuthHeader(username, password),
      },
    });
    if (!mkcolRes.ok) {
      throw new HTTPError(mkcolRes.status, await mkcolRes.text());
    }
    return;
  }
  if (!res.ok) throw new HTTPError(res.status, await res.text());
  const xml = await res.text();
  // Check if it's a file (not a collection)
  if (xml.includes("<d:collection/>")) {
    // It's a folder, success
    return;
  }
  // If not a collection, it's a file
  throw new UnexpectedResponse(
    "The specified folder URL is a file, not a folder.",
  );
}

export const webdav: TokenCloud = {
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
      type: "text",
      required: true,
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
  ],

  // WebDAV does not require OAuth authorization, so this is a no-op
  authorize: async (params) => {
    // params: { url, username, password }
    await ensureWebDAVFolder(params.url, params.username, params.password);
    return { authorizationCode: "" };
  },

  async createFile(
    credentials: { url: string; username: string; password: string },
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const { url, username, password } = credentials;
    const fileUrl = url.endsWith("/") ? url + filename : `${url}/${filename}`;
    const res = await fetch(fileUrl, {
      method: "PUT",
      headers: {
        Authorization: createWebDAVAuthHeader(username, password),
        "Content-Type": "text/plain",
        "If-Unmodified-Since": toISOStringSecond(modifiedTime),
      },
      body: content,
    });
    if (!res.ok) {
      throw new HTTPError(res.status, await res.text());
    }
  },

  async findFile(
    credentials: { url: string; username: string; password: string },
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const { url, username, password } = credentials;
    const fileUrl = url.endsWith("/")
      ? `${url}${filename}`
      : `${url}/${filename}`;
    const res = await fetch(fileUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: createWebDAVAuthHeader(username, password),
        Depth: "0",
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new HTTPError(res.status, await res.text());
    const xml = await res.text();
    // Parse last modified from XML response
    const match = xml.match(/<d:getlastmodified>([^<]+)<\/d:getlastmodified>/);
    if (!match) throw new UnexpectedResponse("Missing last modified");
    const modifiedTime = dayjs(match[1]);
    return { id: fileUrl, modifiedTime };
  },

  async readFile(
    credentials: { url: string; username: string; password: string },
    id: string,
  ): Promise<{ content: string }> {
    const { username, password } = credentials;
    const res = await fetch(id, {
      method: "GET",
      headers: {
        Authorization: createWebDAVAuthHeader(username, password),
      },
    });
    if (!res.ok) throw new HTTPError(res.status, await res.text());
    const content = await res.text();
    return { content };
  },

  async writeFile(
    credentials: { url: string; username: string; password: string },
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const { username, password } = credentials;
    const res = await fetch(id, {
      method: "PUT",
      headers: {
        Authorization: createWebDAVAuthHeader(username, password),
        "Content-Type": "text/plain",
        "If-Unmodified-Since": toISOStringSecond(modifiedTime),
      },
      body: content,
    });
    if (!res.ok) throw new HTTPError(res.status, await res.text());
  },
};
