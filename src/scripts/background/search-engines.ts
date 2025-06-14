import { GOOGLE_MATCHES } from "../../common/google-matches.ts";
import { browser } from "../browser.ts";

export async function registerContentScripts(): Promise<void> {
  await browser.scripting.unregisterContentScripts();
  return browser.scripting.registerContentScripts([
    {
      id: "serpinfo",
      matches: ["*://*/*"],
      excludeMatches: GOOGLE_MATCHES,
      js: [
        process.env.BROWSER === "safari"
          ? "scripts/import-content-script.js"
          : "scripts/serpinfo/content-script.js",
      ],
      runAt: "document_start",
    },
  ]);
}
