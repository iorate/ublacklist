import dayjs from "dayjs";
import * as z from "zod";

import { browser } from "../shared/browser.ts";
import type { Cloud } from "../shared/types.ts";
import { HTTPError, UnexpectedResponse } from "../shared/utilities.ts";
import * as CloudUtils from "./cloud-utils.ts";

const CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID;
const SCOPE = "Files.ReadWrite.AppFolder offline_access";
const AUTHORIZE_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_URL = "https://graph.microsoft.com/v1.0";
const REMOVE_ORIGIN_RULE_ID = 3;

async function withoutOriginHeader<T>(f: () => Promise<T>): Promise<T> {
  await browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [REMOVE_ORIGIN_RULE_ID],
    addRules: [
      {
        id: REMOVE_ORIGIN_RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{ header: "origin", operation: "remove" }],
        },
        condition: {
          urlFilter: `|${TOKEN_URL}`,
          resourceTypes: ["xmlhttprequest"],
          tabIds: [-1],
        },
      },
    ],
  });
  try {
    return await f();
  } finally {
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [REMOVE_ORIGIN_RULE_ID],
    });
  }
}

async function setModifiedTime(
  accessToken: string,
  id: string,
  modifiedTime: dayjs.Dayjs,
): Promise<void> {
  const response = await fetch(`${GRAPH_URL}/me/drive/items/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileSystemInfo: {
        lastModifiedDateTime: CloudUtils.toISOStringSecond(modifiedTime),
      },
    }),
  });
  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }
}

async function uploadContent(
  accessToken: string,
  url: string,
  content: string,
): Promise<string> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain; charset=UTF-8",
    },
    body: content,
  });
  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }
  const responseBody: unknown = await response.json();
  const parseResult = z.object({ id: z.string() }).safeParse(responseBody);
  if (!parseResult.success) {
    throw new UnexpectedResponse(responseBody);
  }
  return parseResult.data.id;
}

export const oneDrive: Cloud = {
  hostPermissions: ["https://login.microsoftonline.com/*"],

  modifiedTimePrecision: "second",

  shouldUseAltFlow: CloudUtils.shouldUseAltFlow(),

  authorize: (useAltFlow: boolean, codeVerifier: string) =>
    CloudUtils.authorize(AUTHORIZE_URL, {
      client_id: CLIENT_ID,
      scope: SCOPE,
      prompt: "select_account",
    })(useAltFlow, codeVerifier),

  getAccessToken: (
    authorizationCode: string,
    useAltFlow: boolean,
    codeVerifier: string,
  ) =>
    withoutOriginHeader(() =>
      CloudUtils.getAccessToken(TOKEN_URL, {
        client_id: CLIENT_ID,
        scope: SCOPE,
      })(authorizationCode, useAltFlow, codeVerifier),
    ),

  refreshAccessToken: (refreshToken: string) =>
    withoutOriginHeader(() =>
      CloudUtils.refreshAccessToken(TOKEN_URL, {
        client_id: CLIENT_ID,
        scope: SCOPE,
      })(refreshToken),
    ),

  async createFile(
    accessToken: string,
    filename: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    const id = await uploadContent(
      accessToken,
      `${GRAPH_URL}/me/drive/special/approot:/${encodeURIComponent(filename)}:/content`,
      content,
    );
    await setModifiedTime(accessToken, id, modifiedTime);
  },

  async findFile(
    accessToken: string,
    filename: string,
  ): Promise<{ id: string; modifiedTime: dayjs.Dayjs } | null> {
    const response = await fetch(
      `${GRAPH_URL}/me/drive/special/approot:/${encodeURIComponent(filename)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }
    const responseBody: unknown = await response.json();
    const parseResult = z
      .object({
        id: z.string(),
        fileSystemInfo: z.object({ lastModifiedDateTime: z.string() }),
      })
      .safeParse(responseBody);
    if (!parseResult.success) {
      throw new UnexpectedResponse(responseBody);
    }
    return {
      id: parseResult.data.id,
      modifiedTime: dayjs(parseResult.data.fileSystemInfo.lastModifiedDateTime),
    };
  },

  async readFile(
    accessToken: string,
    id: string,
  ): Promise<{ content: string }> {
    const response = await fetch(`${GRAPH_URL}/me/drive/items/${id}/content`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }
    return { content: await response.text() };
  },

  async updateFile(
    accessToken: string,
    id: string,
    content: string,
    modifiedTime: dayjs.Dayjs,
  ): Promise<void> {
    await uploadContent(
      accessToken,
      `${GRAPH_URL}/me/drive/items/${id}/content`,
      content,
    );
    await setModifiedTime(accessToken, id, modifiedTime);
  },
};
