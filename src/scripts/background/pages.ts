import { browser } from "../shared/browser.ts";

async function focusOrCreatePage(url: string): Promise<void> {
  if (browser.runtime.getContexts) {
    const [context] = await browser.runtime.getContexts({
      contextTypes: ["TAB"],
      documentUrls: [browser.runtime.getURL(url)],
    });
    if (context && context.tabId !== -1) {
      await browser.tabs.update(context.tabId, { active: true });
      if (browser.windows && context.windowId !== -1) {
        await browser.windows.update(context.windowId, { focused: true });
      }
      return;
    }
  }
  await browser.tabs.create({ url });
}

export async function openOptionsPage(): Promise<void> {
  if (
    process.env.BROWSER === "edge" &&
    (await browser.runtime.getPlatformInfo()).os === "android"
  ) {
    await focusOrCreatePage("/pages/options.html");
  } else {
    await browser.runtime.openOptionsPage();
  }
}

export function openSerpInfoOptionsPage(): Promise<void> {
  return focusOrCreatePage("/pages/serpinfo-options.html");
}
