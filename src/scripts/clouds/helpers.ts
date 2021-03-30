import * as S from 'microstruct';
import { apis } from '../apis';
import { HTTPError, UnexpectedResponse } from '../utilities';

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
    const redirectParams: Record<string, string> = {};
    for (const [key, value] of new URL(redirectURL).searchParams.entries()) {
      redirectParams[key] = value;
    }
    if (S.is(redirectParams, S.object({ code: S.string() }))) {
      return { authorizationCode: redirectParams.code };
    } else if (S.is(redirectParams, S.object({ error: S.string() }))) {
      throw new Error(redirectParams.error);
    } else {
      throw new UnexpectedResponse(redirectParams);
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
      const responseBody: unknown = await response.json();
      if (
        !S.is(
          responseBody,
          S.object({
            access_token: S.string(),
            expires_in: S.number(),
            refresh_token: S.string(),
          }),
        )
      ) {
        throw new UnexpectedResponse(responseBody);
      }
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
      const responseBody: unknown = await response.json();
      if (!S.is(responseBody, S.object({ access_token: S.string(), expires_in: S.number() }))) {
        throw new UnexpectedResponse(responseBody);
      }
      return { accessToken: responseBody.access_token, expiresIn: responseBody.expires_in };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  };
}
