import dayjs from "dayjs";
import dayjsUTC from "dayjs/plugin/utc";
import { z } from "zod";
import { type Browser, browser } from "../shared/browser.ts";
import { getWebsiteURL } from "../shared/locales.ts";
import { HTTPError, UnexpectedResponse } from "../shared/utilities.ts";

dayjs.extend(dayjsUTC);

export type AuthorizeParams = {
  client_id: string;
  [key: string]: string;
};

function encodeBase64URL(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return encodeBase64URL(crypto.getRandomValues(new Uint8Array(32)));
}

export async function computeCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier),
  );
  return encodeBase64URL(new Uint8Array(digest));
}

export function toISOStringSecond(time: dayjs.Dayjs): string {
  return time.utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
}

export function shouldUseAltFlow(): (os: string) => boolean {
  return (os) => {
    if (process.env.BROWSER === "chrome" || process.env.BROWSER === "edge") {
      return false;
    }
    if (process.env.BROWSER === "firefox") {
      return os === "android";
    }
    return true;
  };
}

const altFlowRedirectURL = getWebsiteURL("/callback");

async function launchAltFlow(params: { url: string }): Promise<string> {
  const { id: openerTabId } =
    // biome-ignore lint/style/noNonNullAssertion: We can expect that this query returns at least one tab.
    (await browser.tabs.query({ active: true, currentWindow: true }))[0]!;
  if (openerTabId == null) {
    throw new Error("failed to get the current tab");
  }
  const { id: authorizationTabId } = await browser.tabs.create(
    process.env.BROWSER === "firefox" &&
      (await browser.runtime.getPlatformInfo()).os === "android"
      ? { url: params.url }
      : { openerTabId, url: params.url },
  );
  if (authorizationTabId == null) {
    throw new Error("failed to open the authorization tab");
  }
  return new Promise<string>((resolve, reject) => {
    const [onUpdated, onRemoved] = [
      (tabId: number, _changeInfo: unknown, tab: Browser.Tabs.Tab) => {
        if (
          tabId === authorizationTabId &&
          tab.url?.startsWith(altFlowRedirectURL)
        ) {
          resolve(tab.url);
          browser.tabs.onUpdated.removeListener(onUpdated);
          browser.tabs.onRemoved.removeListener(onRemoved);
          void browser.tabs
            .update(openerTabId, { active: true })
            .then(() => browser.tabs.remove(tabId));
        }
      },
      (tabId: number) => {
        if (tabId === authorizationTabId) {
          reject(new Error("the authorization tab was closed"));
          browser.tabs.onUpdated.removeListener(onUpdated);
          browser.tabs.onRemoved.removeListener(onRemoved);
          void browser.tabs.update(openerTabId, { active: true });
        }
      },
    ];
    browser.tabs.onUpdated.addListener(onUpdated);
    browser.tabs.onRemoved.addListener(onRemoved);
  });
}

export function authorize(
  url: string,
  params: Readonly<AuthorizeParams>,
): (
  useAltFlow: boolean,
  codeVerifier: string,
) => Promise<{ authorizationCode: string }> {
  return async (useAltFlow, codeVerifier) => {
    const authorizationURL = new URL(url);
    authorizationURL.search = new URLSearchParams({
      response_type: "code",
      redirect_uri: useAltFlow
        ? altFlowRedirectURL
        : browser.identity.getRedirectURL(),
      code_challenge: await computeCodeChallenge(codeVerifier),
      code_challenge_method: "S256",
      ...params,
    }).toString();
    // biome-ignore lint/style/noNonNullAssertion: `launchAltFlow` does not return `undefined` as far as I know
    const redirectURL = (await (useAltFlow
      ? launchAltFlow({ url: authorizationURL.toString() })
      : browser.identity.launchWebAuthFlow({
          url: authorizationURL.toString(),
          interactive: true,
        })))!;
    const redirectParams = Object.fromEntries(
      new URL(redirectURL).searchParams.entries(),
    ) as Record<string, string>;
    if (redirectParams.code != null) {
      return { authorizationCode: redirectParams.code };
    }
    if (redirectParams.error != null) {
      throw new Error(redirectParams.error);
    }
    throw new UnexpectedResponse(redirectParams);
  };
}

export type GetAccessTokenParams = {
  client_id: string;
  [key: string]: string;
};

export function getAccessToken(
  url: string,
  params: Readonly<GetAccessTokenParams>,
): (
  authorizationCode: string,
  useAltFlow: boolean,
  codeVerifier: string,
) => Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
  return async (authorizationCode, useAltFlow, codeVerifier) => {
    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: useAltFlow
          ? altFlowRedirectURL
          : browser.identity.getRedirectURL(),
        code_verifier: codeVerifier,
        ...params,
      }),
    });
    if (response.ok) {
      const responseBody: unknown = await response.json();
      const parseResult = z
        .object({
          access_token: z.string(),
          expires_in: z.number(),
          refresh_token: z.string(),
        })
        .safeParse(responseBody);
      if (!parseResult.success) {
        throw new UnexpectedResponse(responseBody);
      }
      return {
        accessToken: parseResult.data.access_token,
        expiresIn: parseResult.data.expires_in,
        refreshToken: parseResult.data.refresh_token,
      };
    }
    throw new HTTPError(response.status, response.statusText);
  };
}

export type RefreshAccessTokenParams = {
  client_id: string;
  [key: string]: string;
};

export function refreshAccessToken(
  url: string,
  params: Readonly<RefreshAccessTokenParams>,
): (
  refreshToken: string,
) => Promise<{ accessToken: string; expiresIn: number }> {
  return async (refreshToken) => {
    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        ...params,
      }),
    });
    if (response.ok) {
      const responseBody: unknown = await response.json();
      const parseResult = z
        .object({ access_token: z.string(), expires_in: z.number() })
        .safeParse(responseBody);
      if (!parseResult.success) {
        throw new UnexpectedResponse(responseBody);
      }
      return {
        accessToken: parseResult.data.access_token,
        expiresIn: parseResult.data.expires_in,
      };
    }
    throw new HTTPError(response.status, response.statusText);
  };
}
