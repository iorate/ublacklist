import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserContext } from "@playwright/test";
import { expect, test } from "../fixtures/extension.ts";

const GOOGLE_SERP_URL = "https://www.google.com/search?q=test";
const GOOGLE_SERPINFO_URL =
  "https://raw.githubusercontent.com/ublacklist/builtin/refs/heads/dist/serpinfo/google.yml";

test("blocking happy path", async ({ context, extensionId }) => {
  await setupRoutes(context);
  await loadMockSerpInfo(context, extensionId);

  // Visit a Google SERP; five results are shown, two of which are from example.com.
  const serp = await context.newPage();
  await serp.goto(GOOGLE_SERP_URL);
  const exampleComResults = serp.locator(
    '.result:has(a[href^="https://example.com"])',
  );
  await expect(exampleComResults).toHaveCount(2);
  const otherResults = serp.locator(
    '.result:not(:has(a[href^="https://example.com"]))',
  );
  await expect(otherResults).toHaveCount(3);

  // No blocking rules are applied yet.
  await expect(serp.locator(".result[data-ub-block]")).toHaveCount(0);

  // Click the block button of the first example.com result.
  await exampleComResults.first().locator(".ub-button button").click();

  // Click the block dialog's action button.
  await serp.getByTestId("block-dialog-action-button").click();

  const expectOnlyExampleComBlocked = async () => {
    // Both example.com results are hidden.
    await expect(exampleComResults).toHaveCount(2);
    for (const result of await exampleComResults.all()) {
      await expect(result).toHaveAttribute("data-ub-block");
      await expect(result).toBeHidden();
    }

    // The other results remain visible.
    await expect(otherResults).toHaveCount(3);
    for (const result of await otherResults.all()) {
      await expect(result).not.toHaveAttribute("data-ub-block");
      await expect(result).toBeVisible();
    }
  };
  await expectOnlyExampleComBlocked();

  // Click the control; the blocked results are visible.
  await serp.locator(".ub-control button").click();
  for (const result of await exampleComResults.all()) {
    await expect(result).toHaveAttribute("data-ub-block");
    await expect(result).toBeVisible();
  }

  // Reload the SERP; the blocked results are hidden again.
  await serp.reload();
  await expectOnlyExampleComBlocked();

  // Open the options page; the blocking rule is shown.
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/pages/options.html`);
  await expect(options.locator("#general .cm-content")).toContainText(
    "*://example.com/*",
  );

  // Reveal the blocked results and unblock example.com via the dialog.
  await serp.locator(".ub-control button").click();
  await exampleComResults.first().locator(".ub-button button").click();
  await serp.getByTestId("block-dialog-action-button").click();

  // The results are no longer blocked.
  await expect(serp.locator(".result[data-ub-block]")).toHaveCount(0);
  for (const result of await exampleComResults.all()) {
    await expect(result).toBeVisible();
  }

  // The rule is removed from the options page.
  await options.reload();
  await expect(options.locator("#general .cm-content")).not.toContainText(
    "example.com",
  );
});

async function setupRoutes(context: BrowserContext): Promise<void> {
  const mocksDir = path.join(import.meta.dirname, "../mocks");
  const [mockSerp, mockSerpInfo] = await Promise.all([
    fs.readFile(path.join(mocksDir, "google-serp.html"), "utf8"),
    fs.readFile(path.join(mocksDir, "google-serpinfo.yml"), "utf8"),
  ]);
  // Block all external requests to keep the test offline and deterministic.
  await context.route(/^https?:\/\//, (route) => route.abort());
  await context.route(GOOGLE_SERP_URL, (route) =>
    route.fulfill({ contentType: "text/html", body: mockSerp }),
  );
  await context.route(GOOGLE_SERPINFO_URL, (route) =>
    route.fulfill({ contentType: "text/plain", body: mockSerpInfo }),
  );
}

// Relies on setupRoutes mocking the SERPINFO URL.
async function loadMockSerpInfo(
  context: BrowserContext,
  extensionId: string,
): Promise<void> {
  const serpInfoOptions = await context.newPage();
  await serpInfoOptions.goto(
    `chrome-extension://${extensionId}/pages/serpinfo-options.html`,
  );
  await serpInfoOptions.evaluate(() =>
    chrome.runtime.sendMessage({
      type: "update-all-remote-serpinfo",
      args: [],
    }),
  );
  await serpInfoOptions.close();
}
