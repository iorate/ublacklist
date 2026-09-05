import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";

import type { SyncBackendClient, WebDAVParams } from "../shared/types.ts";
import { HTTPError } from "../shared/utilities.ts";

dayjs.extend(dayjsUTC);

function encodeBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function basicAuthorization(username: string, password: string): string {
  return `Basic ${encodeBase64(new TextEncoder().encode(`${username}:${password}`))}`;
}

function folderURL(params: WebDAVParams): string {
  const { origin, pathname } = new URL(params.url);
  let url = origin + (pathname.endsWith("/") ? pathname : `${pathname}/`);
  const segments = params.path.split("/").filter(Boolean);
  if (segments.length > 0) {
    url += `${segments.map(encodeURIComponent).join("/")}/`;
  }
  return url;
}

function fileURL(params: WebDAVParams, filename: string): string {
  return folderURL(params) + encodeURIComponent(filename);
}

function request(
  params: WebDAVParams,
  method: string,
  url: string,
  init?: { headers?: Record<string, string>; body?: string },
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      Authorization: basicAuthorization(params.username, params.password),
      ...init?.headers,
    },
    body: init?.body ?? null,
    // Never send the browser's cookies for the host; Nextcloud prefers a
    // logged-in session over the Authorization header and returns 401/403 (#836)
    credentials: "omit",
    // Bypass the HTTP cache. A cached GET/HEAD would otherwise be served without
    // hitting the server (missing remote updates), or revalidated with
    // If-None-Match, which Sabre DAV (Nextcloud) rejects with 412 for HEAD
    cache: "no-store",
  });
}

function discardBody(response: Response): void {
  void response.body?.cancel();
}

export async function checkWebDAVFolder(params: WebDAVParams): Promise<void> {
  const response = await request(params, "PROPFIND", folderURL(params), {
    headers: { Depth: "0" },
  });
  discardBody(response);
  if (response.status !== 207) {
    throw new HTTPError(response.status, response.statusText);
  }
}

async function findFile(
  params: WebDAVParams,
  filename: string,
): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
  const response = await request(params, "HEAD", fileURL(params, filename));
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }
  const lastModified = response.headers.get("Last-Modified");
  if (lastModified == null) {
    throw new Error("Missing Last-Modified header in WebDAV HEAD response");
  }
  const modifiedTime = dayjs.utc(lastModified);
  if (!modifiedTime.isValid()) {
    throw new Error(
      `Invalid Last-Modified header in WebDAV HEAD response: ${lastModified}`,
    );
  }
  return { id: filename, modifiedTime };
}

async function readFile(
  params: WebDAVParams,
  id: string,
): Promise<{ content: string }> {
  const response = await request(params, "GET", fileURL(params, id), {
    headers: { Accept: "text/plain" },
  });
  if (!response.ok) {
    discardBody(response);
    throw new HTTPError(response.status, response.statusText);
  }
  return { content: await response.text() };
}

async function writeFile(
  params: WebDAVParams,
  id: string,
  content: string,
  modifiedTime: dayjs.Dayjs,
): Promise<void> {
  const response = await request(params, "PUT", fileURL(params, id), {
    headers: {
      "Content-Type": "application/octet-stream",
      "X-OC-Mtime": modifiedTime.unix().toString(),
      "X-Last-Modified": modifiedTime.toString(),
      "Last-Modified": modifiedTime.toString(),
    },
    body: content,
  });
  discardBody(response);
  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }
}

export function createClient(params: WebDAVParams): SyncBackendClient {
  return {
    createFile: (
      filename: string,
      content: string,
      modifiedTime: dayjs.Dayjs,
    ) => writeFile(params, filename, content, modifiedTime),
    findFile: (filename: string) => findFile(params, filename),
    readFile: (id: string) => readFile(params, id),
    updateFile: (id: string, content: string, modifiedTime: dayjs.Dayjs) =>
      writeFile(params, id, content, modifiedTime),
    modifiedTimePrecision: "second",
  };
}
