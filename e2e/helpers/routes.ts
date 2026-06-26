import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserContext } from "@playwright/test";

export const GOOGLE_SEARCH_URL = "https://www.google.com/search?q=test";
export const GOOGLE_SERPINFO_URL =
  "https://raw.githubusercontent.com/ublacklist/builtin/refs/heads/dist/serpinfo/google.yml";

export async function setupRoutes(context: BrowserContext): Promise<void> {
  const mocksDir = path.join(import.meta.dirname, "../mocks");
  const [mockSerp, mockSerpInfo] = await Promise.all([
    fs.readFile(path.join(mocksDir, "mock-serp.html"), "utf8"),
    fs.readFile(path.join(mocksDir, "mock-serpinfo.yml"), "utf8"),
  ]);
  // Block all external requests to keep the test offline and deterministic.
  await context.route(/^https?:\/\//, (route) => route.abort());
  await context.route(GOOGLE_SEARCH_URL, (route) =>
    route.fulfill({ contentType: "text/html", body: mockSerp }),
  );
  await context.route(GOOGLE_SERPINFO_URL, (route) =>
    route.fulfill({ contentType: "text/plain", body: mockSerpInfo }),
  );
}
