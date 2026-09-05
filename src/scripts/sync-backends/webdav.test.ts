import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { type TestContext, test } from "node:test";

import dayjs from "dayjs";

import type { WebDAVParams } from "../shared/types.ts";

globalThis.browser = { i18n: { getMessage: (name: string) => name } };

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("dayjs/plugin/") && !specifier.endsWith(".js")) {
      return nextResolve(`${specifier}.js`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { HTTPError } = await import("../shared/utilities.ts");
const { createClient, ensureWebDAVFolder } = await import("./webdav.ts");

function mockFetch(
  t: TestContext,
  respond: (url: string, init: RequestInit) => Response,
): { calls: { url: string; init: RequestInit }[] } {
  const calls: { url: string; init: RequestInit }[] = [];
  t.mock.method(globalThis, "fetch", (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(respond(url, init));
  });
  return { calls };
}

function params(overrides?: Partial<WebDAVParams>): WebDAVParams {
  return {
    url: "https://example.com/dav/",
    username: "user",
    password: "pass",
    path: "",
    ...overrides,
  };
}

function header(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

function mockCollections(
  t: TestContext,
  existing: string[],
  mkcolStatus = 201,
): { calls: { url: string; init: RequestInit }[] } {
  return mockFetch(t, (url, init) => {
    if (init.method === "PROPFIND") {
      return new Response(null, { status: existing.includes(url) ? 207 : 404 });
    }
    if (init.method === "MKCOL") {
      if (mkcolStatus < 400) {
        existing.push(url);
      }
      return new Response(null, { status: mkcolStatus });
    }
    throw new Error(`Unexpected method: ${init.method}`);
  });
}

function summarize(calls: { url: string; init: RequestInit }[]): string[] {
  return calls.map((call) => `${call.init.method} ${call.url}`);
}

test("ensureWebDAVFolder", async (t) => {
  await t.test("resolves on 207 and sends PROPFIND with Depth 0", async () => {
    const { calls } = mockFetch(t, () => new Response(null, { status: 207 }));
    await ensureWebDAVFolder(params());
    assert.equal(calls.length, 1);
    const [call] = calls;
    assert.ok(call);
    assert.equal(call.url, "https://example.com/dav/");
    assert.equal(call.init.method, "PROPFIND");
    assert.equal(call.init.credentials, "omit");
    assert.equal(call.init.cache, "no-store");
    assert.equal(header(call.init, "Depth"), "0");
    assert.equal(header(call.init, "Authorization"), "Basic dXNlcjpwYXNz");
    assert.equal(call.init.body, null);
  });

  await t.test("normalizes the URL", async () => {
    for (const [url, expected] of [
      ["https://example.com/dav", "https://example.com/dav/"],
      ["https://example.com/dav/?x=1#frag", "https://example.com/dav/"],
      ["https://u:p@example.com/dav/", "https://example.com/dav/"],
    ] as const) {
      const { calls } = mockFetch(t, () => new Response(null, { status: 207 }));
      await ensureWebDAVFolder(params({ url }));
      assert.equal(calls[0]?.url, expected);
    }
  });

  await t.test("appends the legacy path", async () => {
    const { calls } = mockFetch(t, () => new Response(null, { status: 207 }));
    await ensureWebDAVFolder(params({ path: "/sub//dir 1/" }));
    assert.equal(calls[0]?.url, "https://example.com/dav/sub/dir%201/");
  });

  await t.test("encodes non-ASCII credentials as UTF-8", async () => {
    const { calls } = mockFetch(t, () => new Response(null, { status: 207 }));
    await ensureWebDAVFolder(
      params({ username: "ユーザー", password: "ファイヤーウォーキング" }),
    );
    assert.ok(calls[0]);
    assert.equal(
      header(calls[0].init, "Authorization"),
      `Basic ${Buffer.from("ユーザー:ファイヤーウォーキング").toString("base64")}`,
    );
  });

  await t.test("creates the folder when the parent exists", async () => {
    const { calls } = mockCollections(t, ["https://example.com/dav/"]);
    await ensureWebDAVFolder(params({ url: "https://example.com/dav/new/" }));
    assert.deepEqual(summarize(calls), [
      "PROPFIND https://example.com/dav/new/",
      "PROPFIND https://example.com/dav/",
      "MKCOL https://example.com/dav/new/",
    ]);
    const mkcol = calls[2];
    assert.ok(mkcol);
    assert.equal(mkcol.init.credentials, "omit");
    assert.equal(mkcol.init.cache, "no-store");
    assert.equal(header(mkcol.init, "Authorization"), "Basic dXNlcjpwYXNz");
    assert.equal(header(mkcol.init, "Depth"), null);
    assert.equal(mkcol.init.body, null);
  });

  await t.test("creates missing ancestors from the top down", async () => {
    const { calls } = mockCollections(t, ["https://example.com/dav/"]);
    await ensureWebDAVFolder(params({ url: "https://example.com/dav/a/b/c/" }));
    assert.deepEqual(summarize(calls), [
      "PROPFIND https://example.com/dav/a/b/c/",
      "PROPFIND https://example.com/dav/a/b/",
      "PROPFIND https://example.com/dav/a/",
      "PROPFIND https://example.com/dav/",
      "MKCOL https://example.com/dav/a/",
      "MKCOL https://example.com/dav/a/b/",
      "MKCOL https://example.com/dav/a/b/c/",
    ]);
  });

  await t.test("keeps the encoding of the URL in ancestors", async () => {
    const { calls } = mockCollections(t, ["https://example.com/dav/my%20dir/"]);
    await ensureWebDAVFolder(
      params({ url: "https://example.com/dav/my dir/a%2Fb/new/" }),
    );
    assert.deepEqual(summarize(calls), [
      "PROPFIND https://example.com/dav/my%20dir/a%2Fb/new/",
      "PROPFIND https://example.com/dav/my%20dir/a%2Fb/",
      "PROPFIND https://example.com/dav/my%20dir/",
      "MKCOL https://example.com/dav/my%20dir/a%2Fb/",
      "MKCOL https://example.com/dav/my%20dir/a%2Fb/new/",
    ]);
  });

  await t.test(
    "keeps the encoding of the legacy path in ancestors",
    async () => {
      const { calls } = mockCollections(t, ["https://example.com/dav/"]);
      await ensureWebDAVFolder(params({ path: "/a b/c" }));
      assert.deepEqual(summarize(calls), [
        "PROPFIND https://example.com/dav/a%20b/c/",
        "PROPFIND https://example.com/dav/a%20b/",
        "PROPFIND https://example.com/dav/",
        "MKCOL https://example.com/dav/a%20b/",
        "MKCOL https://example.com/dav/a%20b/c/",
      ]);
    },
  );

  await t.test("rejects with HTTPError when MKCOL fails", async () => {
    for (const status of [403, 405, 409]) {
      const { calls } = mockCollections(
        t,
        ["https://example.com/dav/"],
        status,
      );
      await assert.rejects(
        ensureWebDAVFolder(params({ url: "https://example.com/dav/new/" })),
        (e: unknown) => e instanceof HTTPError && e.status === status,
      );
      assert.equal(calls.length, 3);
    }
  });

  await t.test(
    "rejects with HTTPError on non-404 PROPFIND failures",
    async () => {
      for (const status of [401, 403, 405]) {
        const { calls } = mockFetch(t, () => new Response(null, { status }));
        await assert.rejects(
          ensureWebDAVFolder(params({ url: "https://example.com/dav/new/" })),
          (e: unknown) => e instanceof HTTPError && e.status === status,
        );
        assert.equal(calls.length, 1);
      }
    },
  );

  await t.test(
    "rejects with a plain Error on 2xx non-207 PROPFIND",
    async () => {
      for (const status of [200, 204]) {
        const { calls } = mockFetch(t, () => new Response(null, { status }));
        await assert.rejects(
          ensureWebDAVFolder(params({ url: "https://example.com/dav/new/" })),
          (e: unknown) =>
            e instanceof Error &&
            !(e instanceof HTTPError) &&
            e.message.includes(String(status)),
        );
        assert.equal(calls.length, 1);
      }
    },
  );

  await t.test(
    "rejects with HTTPError 404 when no ancestor exists",
    async () => {
      const { calls } = mockCollections(t, []);
      await assert.rejects(
        ensureWebDAVFolder(params({ url: "https://example.com/dav/new/" })),
        (e: unknown) => e instanceof HTTPError && e.status === 404,
      );
      assert.deepEqual(summarize(calls), [
        "PROPFIND https://example.com/dav/new/",
        "PROPFIND https://example.com/dav/",
        "PROPFIND https://example.com/",
      ]);
    },
  );
});

test("createClient (webdav)", async (t) => {
  const client = createClient(params());

  await t.test("findFile", async (t) => {
    await t.test("returns the id and Last-Modified on 200", async () => {
      const { calls } = mockFetch(
        t,
        () =>
          new Response(null, {
            status: 200,
            headers: { "Last-Modified": "Thu, 02 Jan 2020 03:04:05 GMT" },
          }),
      );
      const file = await client.findFile("uBlacklist.txt");
      assert.ok(file);
      assert.equal(file.id, "uBlacklist.txt");
      assert.equal(file.modifiedTime.unix(), 1577934245);
      assert.equal(calls[0]?.url, "https://example.com/dav/uBlacklist.txt");
      assert.equal(calls[0]?.init.method, "HEAD");
    });

    await t.test("returns null on 404", async () => {
      mockFetch(t, () => new Response(null, { status: 404 }));
      assert.equal(await client.findFile("uBlacklist.txt"), null);
    });

    await t.test("rejects with HTTPError on 500", async () => {
      mockFetch(
        t,
        () =>
          new Response(null, {
            status: 500,
            statusText: "Internal Server Error",
          }),
      );
      await assert.rejects(
        client.findFile("uBlacklist.txt"),
        (e: unknown) => e instanceof HTTPError && e.status === 500,
      );
    });

    await t.test("rejects when Last-Modified is missing", async () => {
      mockFetch(t, () => new Response(null, { status: 200 }));
      await assert.rejects(client.findFile("uBlacklist.txt"), /Last-Modified/);
    });

    await t.test("rejects when Last-Modified is invalid", async () => {
      mockFetch(
        t,
        () =>
          new Response(null, {
            status: 200,
            headers: { "Last-Modified": "not a date" },
          }),
      );
      await assert.rejects(client.findFile("uBlacklist.txt"), /Last-Modified/);
    });
  });

  await t.test("readFile", async (t) => {
    await t.test("returns the content on 200", async () => {
      const { calls } = mockFetch(
        t,
        () => new Response("example.com", { status: 200 }),
      );
      assert.deepEqual(await client.readFile("uBlacklist.txt"), {
        content: "example.com",
      });
      assert.ok(calls[0]);
      assert.equal(calls[0].url, "https://example.com/dav/uBlacklist.txt");
      assert.equal(calls[0].init.method, "GET");
      assert.equal(header(calls[0].init, "Accept"), "text/plain");
    });

    await t.test("rejects with HTTPError on 404", async () => {
      mockFetch(t, () => new Response(null, { status: 404 }));
      await assert.rejects(
        client.readFile("uBlacklist.txt"),
        (e: unknown) => e instanceof HTTPError && e.status === 404,
      );
    });
  });

  for (const [name, write] of [
    [
      "createFile",
      (content: string, modifiedTime: dayjs.Dayjs) =>
        client.createFile("uBlacklist.txt", content, modifiedTime),
    ],
    [
      "updateFile",
      (content: string, modifiedTime: dayjs.Dayjs) =>
        client.updateFile("uBlacklist.txt", content, modifiedTime),
    ],
  ] as const) {
    await t.test(name, async (t) => {
      const modifiedTime = dayjs.unix(1577934245);

      for (const status of [201, 204]) {
        await t.test(`sends PUT and resolves on ${status}`, async () => {
          const { calls } = mockFetch(t, () => new Response(null, { status }));
          await write("example.com", modifiedTime);
          assert.equal(calls.length, 1);
          const [call] = calls;
          assert.ok(call);
          assert.equal(call.url, "https://example.com/dav/uBlacklist.txt");
          assert.equal(call.init.method, "PUT");
          assert.equal(call.init.body, "example.com");
          assert.equal(
            header(call.init, "Content-Type"),
            "application/octet-stream",
          );
          assert.equal(header(call.init, "X-OC-Mtime"), "1577934245");
          assert.equal(
            header(call.init, "X-Last-Modified"),
            modifiedTime.toString(),
          );
          assert.equal(
            header(call.init, "Last-Modified"),
            modifiedTime.toString(),
          );
        });
      }

      await t.test("rejects with HTTPError on 403", async () => {
        mockFetch(t, () => new Response(null, { status: 403 }));
        await assert.rejects(
          write("example.com", modifiedTime),
          (e: unknown) => e instanceof HTTPError && e.status === 403,
        );
      });
    });
  }
});
