import { browser } from "../browser.ts";

export async function watch() {
  await browser.tabs.create({
    url: browser.runtime.getURL("pages/watch.html"),
    active: false,
    pinned: true,
  });
}
