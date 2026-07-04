import { GOOGLE_MATCHES } from "../../shared/google-matches.ts";
import { browser } from "../shared/browser.ts";

export async function registerContentScripts(): Promise<void> {
  if (process.env.BROWSER !== "safari") {
    await browser.scripting.unregisterContentScripts();
    return browser.scripting.registerContentScripts([
      {
        id: "serpinfo",
        matches: ["*://*/*"],
        excludeMatches: GOOGLE_MATCHES,
        js: ["scripts/content-script.js"],
        runAt: "document_start",
      },
    ]);
  }
}
