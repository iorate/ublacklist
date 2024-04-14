import { z } from "zod";
import { type Browser, browser } from "../browser.ts";
import { getWebsiteURL } from "../locales.ts";
import { HTTPError, UnexpectedResponse } from "../utilities.ts";

export type AuthorizeParams = {
  client_id: string;
  [key: string]: string;
};

export function shouldUseAltFlow(): (os: string) => boolean {
  return (os) => {
    if (process.env.BROWSER === "chrome") {
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
  const [{ id: openerTabId }] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
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
): (useAltFlow: boolean) => Promise<{ authorizationCode: string }> {
  return async (useAltFlow: boolean) => {
    const authorizationURL = new URL(url);
    authorizationURL.search = new URLSearchParams({
      response_type: "code",
      redirect_uri: useAltFlow
        ? altFlowRedirectURL
        : browser.identity.getRedirectURL(),
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
  client_secret: string;
  [key: string]: string;
};

export function getAccessToken(
  url: string,
  params: Readonly<GetAccessTokenParams>,
): (
  authorizationCode: string,
  useAltFlow: boolean,
) => Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
  return async (authorizationCode, useAltFlow) => {
    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: useAltFlow
          ? altFlowRedirectURL
          : browser.identity.getRedirectURL(),
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
  client_secret: string;
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
