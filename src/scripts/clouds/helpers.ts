import * as Poi from 'poi-ts';
import { apis } from '../apis';
import { HTTPError } from '../utilities';

export type AuthorizeParams = {
  client_id: string;
  [key: string]: string;
};

export function authorize(
  url: string,
  params: Readonly<AuthorizeParams>,
): () => Promise<{ authorizationCode: string }> {
  return async () => {
    const authorizationURL = new URL(url);
    authorizationURL.search = new URLSearchParams({
      response_type: 'code',
      redirect_uri: apis.identity.getRedirectURL(),
      ...params,
    }).toString();
    const redirectURL = await apis.identity.launchWebAuthFlow({
      url: authorizationURL.toString(),
      interactive: true,
    });
    const redirectParams = Object.fromEntries(new URL(redirectURL).searchParams.entries());
    try {
      Poi.validate(redirectParams, Poi.object({ code: Poi.string() }));
      return { authorizationCode: redirectParams.code };
    } catch {
      Poi.validate(redirectParams, Poi.object({ error: Poi.string() }));
      throw new Error(redirectParams.error);
    }
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
) => Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
  return async authorizationCode => {
    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: apis.identity.getRedirectURL(),
        ...params,
      }),
    });
    if (response.ok) {
      const responseBody = await response.json();
      Poi.validate(
        responseBody,
        Poi.object({
          access_token: Poi.string(),
          expires_in: Poi.number(),
          refresh_token: Poi.string(),
        }),
      );
      return {
        accessToken: responseBody.access_token,
        expiresIn: responseBody.expires_in,
        refreshToken: responseBody.refresh_token,
      };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
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
): (refreshToken: string) => Promise<{ accessToken: string; expiresIn: number }> {
  return async refreshToken => {
    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        ...params,
      }),
    });
    if (response.ok) {
      const responseBody = await response.json();
      Poi.validate(
        responseBody,
        Poi.object({ access_token: Poi.string(), expires_in: Poi.number() }),
      );
      return { accessToken: responseBody.access_token, expiresIn: responseBody.expires_in };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  };
}
