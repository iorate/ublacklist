import { SEARCH_ENGINES } from "../../common/search-engines.ts";
import { type Browser, browser } from "../browser.ts";
import { Mutex, stringEntries } from "../utilities.ts";

const mutex = new Mutex();
let registeredContentScripts: Browser.ContentScripts.RegisteredContentScript[] =
  [];

async function getRegisterableContentScripts(): Promise<
  {
    id: string;
    matches: string[];
    runAt: "document_start" | "document_end" | "document_idle";
  }[]
> {
  return (
    await Promise.all(
      stringEntries(SEARCH_ENGINES)
        .flatMap(([id, { contentScripts }]) =>
          id !== "google"
            ? contentScripts.map((contentScript, index) => ({
                id: id + String(index),
                ...contentScript,
              }))
            : [],
        )
        .map(async ({ id, matches, runAt }) => {
          const grantedMatches = (
            await Promise.all(
              matches.map(async (match) =>
                (await browser.permissions.contains({ origins: [match] }))
                  ? [match]
                  : [],
              ),
            )
          ).flat();
          return grantedMatches.length
            ? [{ id, matches: grantedMatches, runAt }]
            : [];
        }),
    )
  ).flat();
}

export async function registerContentScripts(): Promise<void> {
  if (process.env.BROWSER === "chrome") {
    return mutex.lock(async () => {
      await browser.scripting.unregisterContentScripts();
      await browser.scripting.registerContentScripts(
        (await getRegisterableContentScripts()).map((contentScript) => ({
          ...contentScript,
          js: ["scripts/content-script.js"],
        })),
      );
    });
  }
  if (process.env.BROWSER === "firefox") {
    return mutex.lock(async () => {
      await Promise.all(
        registeredContentScripts.map((contentScript) =>
          contentScript.unregister(),
        ),
      );
      registeredContentScripts = await Promise.all(
        (await getRegisterableContentScripts()).map(({ matches, runAt }) =>
          browser.contentScripts.register({
            js: [{ file: "/scripts/content-script.js" }],
            matches,
            runAt,
          }),
        ),
      );
    });
  }
}
