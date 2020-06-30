import Joi from '@hapi/joi';
import { apis } from '../apis';
import { HTTPError } from '../utilities';

export function validate<T>(value: unknown, schema: Joi.Schema): asserts value is T {
  const result = schema.validate(value, { allowUnknown: true });
  if (result.error) {
    throw result.error;
  }
}

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
      validate<{ code: string }>(redirectParams, Joi.object({ code: Joi.string() }));
      return { authorizationCode: redirectParams.code };
    } catch {
      validate<{ error: string }>(redirectParams, Joi.object({ error: Joi.string() }));
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
      validate<{ access_token: string; expires_in: number; refresh_token: string }>(
        responseBody,
        Joi.object({
          access_token: Joi.string().required(),
          expires_in: Joi.number().required(),
          refresh_token: Joi.string().required(),
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
      validate<{ access_token: string; expires_in: number }>(
        responseBody,
        Joi.object({ access_token: Joi.string().required(), expires_in: Joi.number().required() }),
      );
      return { accessToken: responseBody.access_token, expiresIn: responseBody.expires_in };
    } else {
      throw new HTTPError(response.status, response.statusText);
    }
  };
}
