import { translate } from "../shared/locales.ts";
import type { Cloud, CloudToken, SyncBackendClient } from "../shared/types.ts";
import { HTTPError } from "../shared/utilities.ts";

export function createClient(
  cloud: Cloud,
  token: CloudToken,
  setToken: (token: CloudToken | null) => Promise<void>,
): SyncBackendClient {
  const refresh = async (): Promise<void> => {
    try {
      const newToken = await cloud.refreshAccessToken(
        token.refreshToken,
        token.pkce ?? false,
      );
      token = {
        accessToken: newToken.accessToken,
        expiresAt:
          newToken.expiresIn != null
            ? new Date(Date.now() + newToken.expiresIn * 1000).toISOString()
            : null,
        refreshToken: newToken.refreshToken ?? token.refreshToken,
        pkce: token.pkce ?? false,
      };
      await setToken(token);
    } catch (e: unknown) {
      if (e instanceof HTTPError && e.status === 400) {
        await setToken(null);
        throw new Error(translate("unauthorizedError"));
      }
      throw e;
    }
  };
  const handleRefresh = async <T>(f: () => Promise<T>): Promise<T> => {
    if (
      token.expiresAt != null &&
      Date.now() > new Date(token.expiresAt).getTime() - 60 * 1000
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
    createFile: (filename: string, content: string, modifiedTime: Date) =>
      handleRefresh(() =>
        cloud.createFile(token.accessToken, filename, content, modifiedTime),
      ),
    findFile: (filename: string) =>
      handleRefresh(() => cloud.findFile(token.accessToken, filename)),
    readFile: (id: string) =>
      handleRefresh(() => cloud.readFile(token.accessToken, id)),
    updateFile: (id: string, content: string, modifiedTime: Date) =>
      handleRefresh(() =>
        cloud.updateFile(token.accessToken, id, content, modifiedTime),
      ),
    modifiedTimePrecision: cloud.modifiedTimePrecision,
  };
}
