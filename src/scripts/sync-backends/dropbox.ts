import dayjs from "dayjs";
import { z } from "zod";
import type { Cloud } from "../shared/types.ts";
import { HTTPError, UnexpectedResponse } from "../shared/utilities.ts";
import * as CloudUtils from "./cloud-utils.ts";

const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;

export const dropbox: Cloud = {
  hostPermissions: [],

  modifiedTimePrecision: "second",

  shouldUseAltFlow: CloudUtils.shouldUseAltFlow(),

  // https://www.dropbox.com/developers/documentation/http/documentation
  authorize: (useAltFlow: boolean, codeVerifier: string) =>
    CloudUtils.authorize("https://www.dropbox.com/oauth2/authorize", {
      client_id: APP_KEY,
      token_access_type: "offline",
      force_reapprove: "true",
    })(useAltFlow, codeVerifier),

  getAccessToken: CloudUtils.getAccessToken(
    "https://api.dropboxapi.com/oauth2/token",
    {
      client_id: APP_KEY,
    },
  ),

  refreshAccessToken: (refreshToken: string, pkce?: boolean) =>
    CloudUtils.refreshAccessToken(
      "https://api.dropboxapi.com/oauth2/token",
      pkce
        ? { client_id: APP_KEY }
        : { client_id: APP_KEY, client_secret: APP_SECRET },
    )(refreshToken),

  // https://www.dropbox.com/developers/documentation/http/documentation#files-upload
  async createFile(
    accessToken: string,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const urlBuilder = new URL("https://content.dropboxapi.com/2/files/upload");
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: `/${filename}`,
        mode: "add",
        autorename: false,
        client_modified: CloudUtils.toISOStringSecond(modifiedTime),
        mute: true,
        strict_conflict: false,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=dropbox-cors-hack",
      },
      body: content,
    });
    if (response.ok) {
      return;
    }
    throw new HTTPError(response.status, response.statusText);
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-get_metadata
  async findFile(
    accessToken: string,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const urlBuilder = new URL(
      "https://api.dropboxapi.com/2/files/get_metadata",
    );
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=dropbox-cors-hack",
      },
      body: JSON.stringify({
        path: `/${filename}`,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
      }),
    });
    if (response.ok) {
      const responseBody: unknown = await response.json();
      const parseResult = z
        .object({ id: z.string(), client_modified: z.string() })
        .safeParse(responseBody);
      if (!parseResult.success) {
        throw new UnexpectedResponse(responseBody);
      }
      return {
        id: parseResult.data.id,
        modifiedTime: dayjs(parseResult.data.client_modified),
      };
    }
    if (response.status === 409) {
      const responseBody: unknown = await response.json();
      const parseResult = z
        .object({
          error: z.object({
            ".tag": z.literal("path"),
            path: z.object({ ".tag": z.string() }),
          }),
        })
        .safeParse(responseBody);
      if (!parseResult.success) {
        throw new UnexpectedResponse(responseBody);
      }
      if (parseResult.data.error.path[".tag"] === "not_found") {
        return null;
      }
      throw new Error(parseResult.data.error[".tag"]);
    }
    throw new HTTPError(response.status, response.statusText);
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-download
  async readFile(
    accessToken: string,
    id: string,
  ): Promise<{ content: string }> {
    const urlBuilder = new URL(
      "https://content.dropboxapi.com/2/files/download",
    );
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: id,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: "POST",
    });
    if (response.ok) {
      const responseBody = await response.text();
      return { content: responseBody };
    }
    throw new HTTPError(response.status, response.statusText);
  },

  // https://www.dropbox.com/developers/documentation/http/documentation#files-upload
  async updateFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const urlBuilder = new URL("https://content.dropboxapi.com/2/files/upload");
    urlBuilder.search = new URLSearchParams({
      authorization: `Bearer ${accessToken}`,
      arg: JSON.stringify({
        path: id,
        mode: "overwrite",
        autorename: false,
        client_modified: CloudUtils.toISOStringSecond(modifiedTime),
        mute: true,
        strict_conflict: false,
      }),
    }).toString();
    const response = await fetch(urlBuilder.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=dropbox-cors-hack",
      },
      body: content,
    });
    if (response.ok) {
      return;
    }
    throw new HTTPError(response.status, response.statusText);
  },
};
