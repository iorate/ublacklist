import path from "node:path";
import { type BrowserContext, test as base, chromium } from "@playwright/test";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: playwright test fixtures require the object destructuring pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(
      import.meta.dirname,
      "../../dist/chrome-e2e",
    );
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }
    // Service worker URL looks like chrome-extension://<id>/scripts/background.js
    const extensionId = new URL(serviceWorker.url()).hostname;
    await use(extensionId);
  },
});

export const expect = test.expect;
