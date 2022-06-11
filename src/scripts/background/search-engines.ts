import { SEARCH_ENGINES } from '../../common/search-engines';
import { browser } from '../browser';
import { AltURL, MatchPattern, stringEntries } from '../utilities';

export async function injectContentScript(tabId: number, url: string): Promise<void> {
  // #if CHROME
  const granted = await browser.permissions.contains({ origins: [url] });
  if (!granted) {
    return;
  }
  const altURL = new AltURL(url);
  const contentScript = stringEntries(SEARCH_ENGINES)
    .flatMap(([id, { contentScripts }]) => (id === 'google' ? [] : contentScripts))
    .find(({ matches }) => matches.some(match => new MatchPattern(match).test(altURL)));
  if (!contentScript) {
    return;
  }
  // #if CHROME_MV3
  const [{ result: active }] = await browser.scripting.executeScript({
    target: { tabId },
    files: ['/scripts/active.js'],
  });
  /* #else
  const [active] = await browser.tabs.executeScript(tabId, {
    file: '/scripts/active.js',
    runAt: contentScript.runAt,
  });
  */
  // #endif
  if (!active) {
    // #if CHROME_MV3
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['/scripts/content-script.js'],
    });
    /* #else
    await browser.tabs.executeScript(tabId, {
      file: '/scripts/content-script.js',
      runAt: contentScript.runAt,
    });
    */
    // #endif
  }
  // #endif
}

// #if CHROME_MV3 || FIREFOX
async function getRegisterableContentScripts(): Promise<
  { id: string; matches: string[]; runAt: 'document_start' | 'document_end' | 'document_idle' }[]
> {
  return (
    await Promise.all(
      stringEntries(SEARCH_ENGINES)
        .flatMap(([id, { contentScripts }]) =>
          id !== 'google'
            ? contentScripts.map((contentScript, index) => ({
                id: id + String(index),
                ...contentScript,
              }))
            : [],
        )
        .map(async ({ id, matches, runAt }) => {
          const grantedMatches = (
            await Promise.all(
              matches.map(async match =>
                (await browser.permissions.contains({ origins: [match] })) ? [match] : [],
              ),
            )
          ).flat();
          return grantedMatches.length ? [{ id, matches: grantedMatches, runAt }] : [];
        }),
    )
  ).flat();
}
// #endif

/* #if FIREFOX
let registeredContentScripts: browser.contentScripts.RegisteredContentScript[] = [];
*/
// #endif

export async function registerContentScripts(): Promise<void> {
  // #if CHROME_MV3
  await browser.scripting.unregisterContentScripts();
  await browser.scripting.registerContentScripts(
    (
      await getRegisterableContentScripts()
    ).map(contentScript => ({ ...contentScript, js: ['scripts/content-script.js'] })),
  );
  /* #elif FIREFOX
  await Promise.all(registeredContentScripts.map(contentScript => contentScript.unregister()));
  registeredContentScripts = await Promise.all(
    (
      await getRegisterableContentScripts()
    ).map(({ matches, runAt }) =>
      browser.contentScripts.register({
        js: [{ file: '/scripts/content-script.js' }],
        matches,
        runAt,
      }),
    ),
  );
  */
  // #endif
}
