import dayjs from "dayjs";
import { translate } from "../shared/locales.ts";
import type { Cloud, CloudToken, SyncBackendClient } from "../shared/types.ts";
import { HTTPError } from "../shared/utilities.ts";

export type CloudClientHooks = {
  persistToken(token: CloudToken): Promise<void>;
  onUnauthorized(): Promise<void>;
};

export function createClient(
  cloud: Cloud,
  initialToken: CloudToken,
  hooks: CloudClientHooks,
): SyncBackendClient {
  let token = { ...initialToken };
  const refresh = async (): Promise<void> => {
    try {
      const newToken = await cloud.refreshAccessToken(
        token.refreshToken,
        token.pkce,
      );
      token = {
        accessToken: newToken.accessToken,
        expiresAt:
          newToken.expiresIn != null
            ? dayjs().add(newToken.expiresIn, "second").toISOString()
            : null,
        refreshToken: newToken.refreshToken ?? token.refreshToken,
        pkce: token.pkce ?? false,
      };
      await hooks.persistToken(token);
    } catch (e: unknown) {
      if (e instanceof HTTPError && e.status === 400) {
        await hooks.onUnauthorized();
        throw new Error(translate("unauthorizedError"));
      }
      throw e;
    }
  };
  const handleRefresh = async <T>(f: () => Promise<T>): Promise<T> => {
    if (
      token.expiresAt != null &&
      dayjs().isAfter(dayjs(token.expiresAt).subtract(60, "second"))
    ) {
      await refresh();
    }
    try {
      return await f();
    } catch (e: unknown) {
      if (e instanceof HTTPError && e.status === 401) {
        await refresh();
        return await f();
      }
      throw e;
    }
  };
  return {
    createFile: (
      filename: string,
      content: string,
      modifiedTime: dayjs.Dayjs,
    ) =>
      handleRefresh(() =>
        cloud.createFile(token.accessToken, filename, content, modifiedTime),
      ),
    findFile: (filename: string) =>
      handleRefresh(() => cloud.findFile(token.accessToken, filename)),
    readFile: (id: string) =>
      handleRefresh(() => cloud.readFile(token.accessToken, id)),
    updateFile: (id: string, content: string, modifiedTime: dayjs.Dayjs) =>
      handleRefresh(() =>
        cloud.updateFile(token.accessToken, id, content, modifiedTime),
      ),
    modifiedTimePrecision: cloud.modifiedTimePrecision,
  };
}
