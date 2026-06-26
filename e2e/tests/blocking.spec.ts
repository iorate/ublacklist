import { expect, test } from "../fixtures/extension.ts";
import { sendMessage } from "../helpers/messaging.ts";
import { openOptions } from "../helpers/pages.ts";
import { GOOGLE_SEARCH_URL, setupRoutes } from "../helpers/routes.ts";

test("blocks results via the block button, shows them via the control, and persists the rule", async ({
  context,
  extensionId,
}) => {
  await setupRoutes(context);

  // Swap the built-in Google SERPINFO for the mock.
  const options = await openOptions(context, extensionId);
  await sendMessage(options, "update-all-remote-serpinfo");

  // Visit a Google SERP, which is mocked to contain 5 results, 2 of which are example.com.
  const serp = await context.newPage();
  await serp.goto(GOOGLE_SEARCH_URL);
  await expect(serp.locator(".result")).toHaveCount(5);
  await expect(serp.locator(".result[data-ub-block]")).toHaveCount(0);

  // Click the block button of the first example.com result, which opens a block dialog.
  const exampleComResults = serp.locator(
    '.result:has(a[href^="https://example.com"])',
  );
  await exampleComResults.first().locator(".ub-button button").click();

  // Click the block dialog's action button.
  await serp.getByTestId("block-dialog-action-button").click();

  // Both example.com results are now hidden.
  await expect(exampleComResults).toHaveCount(2);
  for (const result of await exampleComResults.all()) {
    await expect(result).toHaveAttribute("data-ub-block");
    await expect(result).toBeHidden();
  }

  // The other results remain visible.
  const otherResults = serp.locator(
    '.result:not(:has(a[href^="https://example.com"]))',
  );
  await expect(otherResults).toHaveCount(3);
  for (const result of await otherResults.all()) {
    await expect(result).not.toHaveAttribute("data-ub-block");
    await expect(result).toBeVisible();
  }

  // Click the control to show the example.com results.
  await serp.locator(".ub-control button").click();
  for (const result of await exampleComResults.all()) {
    await expect(result).toHaveAttribute("data-ub-block");
    await expect(result).toBeVisible();
  }

  // Reload the options page and verify that the rule is persisted.
  await options.reload();
  await expect(options.locator("#general .cm-content")).toContainText(
    "*://example.com/*",
  );
});
