import assert from "node:assert/strict";
import { test } from "node:test";
import type { Cloud, CloudToken } from "../shared/types.ts";
import type { CloudClientHooks } from "./cloud.ts";

globalThis.browser = { i18n: { getMessage: (name: string) => name } };

const { HTTPError } = await import("../shared/utilities.ts");
const { createClient } = await import("./cloud.ts");

function makeCloud(overrides: Partial<Cloud>): Cloud {
  return {
    hostPermissions: [],
    modifiedTimePrecision: "second",
    shouldUseAltFlow: () => false,
    authorize: () => Promise.reject(new Error("not implemented")),
    getAccessToken: () => Promise.reject(new Error("not implemented")),
    refreshAccessToken: () => Promise.reject(new Error("not implemented")),
    createFile: () => Promise.reject(new Error("not implemented")),
    findFile: () => Promise.reject(new Error("not implemented")),
    readFile: () => Promise.reject(new Error("not implemented")),
    updateFile: () => Promise.reject(new Error("not implemented")),
    ...overrides,
  };
}

function makeHooks(): {
  hooks: CloudClientHooks;
  persisted: CloudToken[];
  unauthorized: () => number;
} {
  const persisted: CloudToken[] = [];
  let unauthorizedCount = 0;
  return {
    hooks: {
      async persistToken(token) {
        persisted.push(token);
      },
      async onUnauthorized() {
        unauthorizedCount++;
      },
    },
    persisted,
    unauthorized: () => unauthorizedCount,
  };
}

function makeToken(expired: boolean): CloudToken {
  return {
    accessToken: "access-1",
    expiresAt: new Date(
      Date.now() + (expired ? -3600_000 : 3600_000),
    ).toISOString(),
    refreshToken: "refresh-1",
  };
}

test("createClient (cloud)", async (t) => {
  await t.test("uses the current token while it is not expired", async () => {
    const accessTokens: string[] = [];
    const cloud = makeCloud({
      readFile(accessToken, id) {
        accessTokens.push(accessToken);
        return Promise.resolve({ content: `content of ${id}` });
      },
    });
    const { hooks, persisted } = makeHooks();
    const client = createClient(cloud, makeToken(false), hooks);
    assert.deepEqual(await client.readFile("file1"), {
      content: "content of file1",
    });
    assert.deepEqual(accessTokens, ["access-1"]);
    assert.equal(persisted.length, 0);
  });

  await t.test("refreshes an expired token before the operation", async () => {
    const refreshTokens: string[] = [];
    const accessTokens: string[] = [];
    const cloud = makeCloud({
      refreshAccessToken(refreshToken) {
        refreshTokens.push(refreshToken);
        return Promise.resolve({
          accessToken: "access-2",
          expiresIn: 3600,
          refreshToken: null,
        });
      },
      readFile(accessToken) {
        accessTokens.push(accessToken);
        return Promise.resolve({ content: "content" });
      },
    });
    const { hooks, persisted } = makeHooks();
    const client = createClient(cloud, makeToken(true), hooks);
    await client.readFile("file1");
    assert.deepEqual(refreshTokens, ["refresh-1"]);
    assert.deepEqual(accessTokens, ["access-2"]);
    const [persistedToken] = persisted;
    assert.ok(persistedToken);
    assert.equal(persistedToken.accessToken, "access-2");
    assert.equal(persistedToken.refreshToken, "refresh-1");
    assert.ok(persistedToken.expiresAt);
    assert.ok(new Date(persistedToken.expiresAt).getTime() > Date.now());
  });

  await t.test(
    "replaces the refresh token when the response includes a new one",
    async () => {
      const refreshTokens: string[] = [];
      let refreshCount = 0;
      const cloud = makeCloud({
        refreshAccessToken(refreshToken) {
          refreshTokens.push(refreshToken);
          refreshCount++;
          return Promise.resolve({
            accessToken: `access-${refreshCount + 1}`,
            expiresIn: -3600,
            refreshToken: `refresh-${refreshCount + 1}`,
          });
        },
        readFile: () => Promise.resolve({ content: "content" }),
      });
      const { hooks, persisted } = makeHooks();
      const client = createClient(cloud, makeToken(true), hooks);
      await client.readFile("file1");
      await client.readFile("file1");
      assert.deepEqual(refreshTokens, ["refresh-1", "refresh-2"]);
      assert.equal(persisted.length, 2);
      assert.equal(persisted[0]?.refreshToken, "refresh-2");
      assert.equal(persisted[1]?.refreshToken, "refresh-3");
    },
  );

  await t.test(
    "treats the expiry as unknown when the response omits expires_in",
    async () => {
      let refreshCount = 0;
      const cloud = makeCloud({
        refreshAccessToken() {
          refreshCount++;
          return Promise.resolve({
            accessToken: "access-2",
            expiresIn: null,
            refreshToken: null,
          });
        },
        readFile: () => Promise.resolve({ content: "content" }),
      });
      const { hooks, persisted } = makeHooks();
      const client = createClient(cloud, makeToken(true), hooks);
      await client.readFile("file1");
      await client.readFile("file1");
      assert.equal(refreshCount, 1);
      const [persistedToken] = persisted;
      assert.ok(persistedToken);
      assert.equal(persistedToken.expiresAt, undefined);
    },
  );

  await t.test("passes and preserves the pkce flag on refresh", async () => {
    const pkceArgs: (boolean | undefined)[] = [];
    const cloud = makeCloud({
      refreshAccessToken(_refreshToken, pkce) {
        pkceArgs.push(pkce);
        return Promise.resolve({
          accessToken: "access-2",
          expiresIn: 3600,
          refreshToken: null,
        });
      },
      readFile: () => Promise.resolve({ content: "content" }),
    });
    const { hooks, persisted } = makeHooks();
    const client = createClient(
      cloud,
      { ...makeToken(true), pkce: true },
      hooks,
    );
    await client.readFile("file1");
    assert.deepEqual(pkceArgs, [true]);
    const [persistedToken] = persisted;
    assert.ok(persistedToken);
    assert.equal(persistedToken.pkce, true);
  });

  await t.test(
    "refreshes and retries once when the operation returns 401",
    async () => {
      let readCount = 0;
      const cloud = makeCloud({
        refreshAccessToken: () =>
          Promise.resolve({
            accessToken: "access-2",
            expiresIn: 3600,
            refreshToken: null,
          }),
        readFile(accessToken) {
          readCount++;
          if (accessToken !== "access-2") {
            return Promise.reject(new HTTPError(401, "Unauthorized"));
          }
          return Promise.resolve({ content: "content" });
        },
      });
      const { hooks, persisted } = makeHooks();
      const client = createClient(cloud, makeToken(false), hooks);
      assert.deepEqual(await client.readFile("file1"), {
        content: "content",
      });
      assert.equal(readCount, 2);
      assert.equal(persisted.length, 1);
    },
  );

  await t.test("does not retry more than once", async () => {
    let readCount = 0;
    const cloud = makeCloud({
      refreshAccessToken: () =>
        Promise.resolve({
          accessToken: "access-2",
          expiresIn: 3600,
          refreshToken: null,
        }),
      readFile() {
        readCount++;
        return Promise.reject(new HTTPError(401, "Unauthorized"));
      },
    });
    const { hooks } = makeHooks();
    const client = createClient(cloud, makeToken(false), hooks);
    await assert.rejects(client.readFile("file1"), HTTPError);
    assert.equal(readCount, 2);
  });

  await t.test("disconnects when the refresh returns 400", async () => {
    const cloud = makeCloud({
      refreshAccessToken: () =>
        Promise.reject(new HTTPError(400, "Bad Request")),
    });
    const { hooks, persisted, unauthorized } = makeHooks();
    const client = createClient(cloud, makeToken(true), hooks);
    await assert.rejects(
      client.readFile("file1"),
      new Error("unauthorizedError"),
    );
    assert.equal(unauthorized(), 1);
    assert.equal(persisted.length, 0);
  });
});
