// Selector policy:
// - Primary selectors are `data-testid`: storage item keys for SetBooleanItem /
//   SetIntervalItem, kebab-case "place-part" names otherwise. When replacing a
//   component implementation, keep every existing data-testid.
// - Section ids (#general etc.) and CodeMirror's .cm-content are also allowed.
// - Do NOT select by translated texts (getByLabel, getByRole with name),
//   implementation classes, or ARIA roles; they are unstable across UI rewrites.
import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "../fixtures/extension.ts";

const MOCK_SUBSCRIPTION_URL =
  "https://raw.githubusercontent.com/example/ruleset/main/uBlacklist.txt";

async function setupRoutes(context: BrowserContext): Promise<void> {
  await context.route(/^https?:\/\//, (route) => route.abort());
  await context.route(MOCK_SUBSCRIPTION_URL, (route) =>
    route.fulfill({ contentType: "text/plain", body: "*://example.com/*\n" }),
  );
}

async function openPage(
  context: BrowserContext,
  extensionId: string,
  pagePath: string,
): Promise<{ page: Page; pageErrors: Error[] }> {
  const page = await context.newPage();
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto(`chrome-extension://${extensionId}/${pagePath}`);
  return { page, pageErrors };
}

function readLocalStorage(
  page: Page,
  keys: readonly string[],
): Promise<Record<string, unknown>> {
  return page.evaluate((keys) => chrome.storage.local.get(keys), [...keys]);
}

async function addSubscription(page: Page): Promise<void> {
  await page.getByTestId("add-subscription-button").click();
  await expect(page.getByTestId("add-subscription-dialog")).toBeVisible();
  await page
    .getByTestId("add-subscription-dialog-url-input")
    .fill(MOCK_SUBSCRIPTION_URL);
  await page
    .getByTestId("add-subscription-dialog-name-input")
    .fill("Example Ruleset");
  await page.getByTestId("add-subscription-dialog-add-button").click();
  await expect(page.getByTestId("add-subscription-dialog")).toBeHidden();
  await expect(page.getByTestId("subscription-row")).toHaveCount(1);
}

test("options page renders all sections", async ({ context, extensionId }) => {
  await setupRoutes(context);
  const { page, pageErrors } = await openPage(
    context,
    extensionId,
    "pages/options.html",
  );
  for (const section of [
    "#general",
    "#appearance",
    "#sync",
    "#subscription",
    "#backup-restore",
    "#about",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }
  expect(pageErrors).toEqual([]);
});

test("serpinfo options page renders all sections", async ({
  context,
  extensionId,
}) => {
  await setupRoutes(context);
  const { page, pageErrors } = await openPage(
    context,
    extensionId,
    "pages/serpinfo-options.html",
  );
  for (const section of [
    "#basic-settings",
    "#remote-serpinfo",
    "#user-serpinfo",
  ]) {
    await expect(page.locator(section)).toBeVisible();
  }
  await expect(page.locator("#user-serpinfo .cm-content")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("switch toggles and persists", async ({ context, extensionId }) => {
  await setupRoutes(context);
  const { page } = await openPage(context, extensionId, "pages/options.html");
  const switchControl = page.getByTestId("skipBlockDialog");
  await expect(switchControl).not.toBeChecked();
  await switchControl.click();
  await expect(switchControl).toBeChecked();
  await expect
    .poll(
      async () =>
        (await readLocalStorage(page, ["skipBlockDialog"])).skipBlockDialog,
    )
    .toBe(true);
  await page.reload();
  await expect(page.getByTestId("skipBlockDialog")).toBeChecked();
});

test("blacklist is edited and saved", async ({ context, extensionId }) => {
  await setupRoutes(context);
  const { page } = await openPage(context, extensionId, "pages/options.html");
  const editor = page.locator("#general .cm-content");
  await editor.click();
  await page.keyboard.type("*://example.net/*");
  const saveButton = page.getByTestId("save-blacklist-button");
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect
    .poll(async () => (await readLocalStorage(page, ["blacklist"])).blacklist)
    .toBe("*://example.net/*");
  await page.reload();
  await expect(page.locator("#general .cm-content")).toContainText(
    "*://example.net/*",
  );
});

test("add subscription dialog opens, closes, and adds", async ({
  context,
  extensionId,
}) => {
  await setupRoutes(context);
  const { page } = await openPage(context, extensionId, "pages/options.html");

  await page.getByTestId("add-subscription-button").click();
  const dialog = page.getByTestId("add-subscription-dialog");
  await expect(dialog).toBeVisible();
  await page
    .getByTestId("add-subscription-dialog-url-input")
    .fill(MOCK_SUBSCRIPTION_URL);
  await page.getByTestId("add-subscription-dialog-cancel-button").click();
  await expect(dialog).toBeHidden();

  await page.getByTestId("add-subscription-button").click();
  await expect(dialog).toBeVisible();
  await expect(
    page.getByTestId("add-subscription-dialog-url-input"),
  ).toHaveValue("");
  await page
    .getByTestId("add-subscription-dialog-url-input")
    .fill(MOCK_SUBSCRIPTION_URL);
  await page
    .getByTestId("add-subscription-dialog-name-input")
    .fill("Example Ruleset");
  await page.getByTestId("add-subscription-dialog-add-button").click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("subscription-row")).toHaveCount(1);

  await page.reload();
  await expect(page.getByTestId("subscription-row")).toHaveCount(1);
});

test("subscription is removed from the menu", async ({
  context,
  extensionId,
}) => {
  await setupRoutes(context);
  const { page } = await openPage(context, extensionId, "pages/options.html");
  await addSubscription(page);
  await page.getByTestId("subscription-menu-button").click();
  await page.getByTestId("subscription-menu-remove").click();
  await expect(page.getByTestId("subscription-row")).toHaveCount(0);
});

test("select changes and persists", async ({ context, extensionId }) => {
  await setupRoutes(context);
  const { page } = await openPage(context, extensionId, "pages/options.html");
  await addSubscription(page);
  const select = page.getByTestId("updateInterval");
  await expect(select).toBeEnabled();
  await select.click();
  await page.getByTestId("updateInterval-120").click();
  await expect
    .poll(
      async () =>
        (await readLocalStorage(page, ["updateInterval"])).updateInterval,
    )
    .toBe(120);
  await page.reload();
  await expect
    .poll(
      async () =>
        (await readLocalStorage(page, ["updateInterval"])).updateInterval,
    )
    .toBe(120);
});
