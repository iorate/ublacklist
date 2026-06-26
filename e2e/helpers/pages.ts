import type { BrowserContext, Page } from "@playwright/test";

export async function openOptions(
  context: BrowserContext,
  extensionId: string,
): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/pages/options.html`);
  return page;
}
