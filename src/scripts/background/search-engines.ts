import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import { browser } from "../browser.ts";
import { stringEntries } from "../utilities.ts";

export async function registerContentScripts(): Promise<void> {
  if (process.env.BROWSER !== "safari") {
    await browser.scripting.unregisterContentScripts();
    return browser.scripting.registerContentScripts([
      ...stringEntries(SEARCH_ENGINES).flatMap(([id, { contentScripts }]) =>
        id !== "google"
          ? contentScripts.map((contentScript, index) => ({
              id: id + String(index),
              js: ["scripts/content-script.js"],
              ...contentScript,
            }))
          : [],
      ),
      {
        id: "serpinfo",
        matches: ["*://*/*"],
        excludeMatches: SEARCH_ENGINES.google.contentScripts.flatMap(
          ({ matches }) => matches,
        ),
        runAt: "document_start",
        js: ["scripts/serpinfo/content-script.js"],
      },
    ]);
  }
}
