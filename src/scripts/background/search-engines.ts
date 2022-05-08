import { SEARCH_ENGINES } from '../../common/search-engines';
import { apis } from '../apis';
import { AltURL, MatchPattern, stringEntries } from '../utilities';

export async function injectContentScript(tabId: number, url: string): Promise<void> {
  // #if CHROME && !CHROME_MV3
  const granted = await apis.permissions.contains({ origins: [url] });
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
  const [active] = await apis.tabs.executeScript(tabId, {
    file: '/scripts/active.js',
    runAt: contentScript.runAt,
  });
  if (!active) {
    await apis.tabs.executeScript(tabId, {
      file: '/scripts/content-script.js',
      runAt: contentScript.runAt,
    });
  }
  // #endif
}

/* #if FIREFOX
let registeredContentScripts: browser.contentScripts.RegisteredContentScript[] = [];
*/
// #endif

export async function registerContentScript(): Promise<void> {
  /* #if FIREFOX
  await Promise.all(registeredContentScripts.map(contentScript => contentScript.unregister()));
  registeredContentScripts = [];
  await Promise.all(
    stringEntries(SEARCH_ENGINES)
      .flatMap(([id, { contentScripts }]) => (id === 'google' ? [] : contentScripts))
      .map(async ({ matches, runAt }) => {
        const grantedMatches = await Promise.all(
          matches.map(match =>
            apis.permissions
              .contains({ origins: [match] })
              .then(granted => (granted ? match : null)),
          ),
        ).then(matches => matches.filter((match): match is string => match != null));
        if (!grantedMatches.length) {
          return;
        }
        registeredContentScripts.push(
          await browser.contentScripts.register({
            js: [{ file: '/scripts/content-script.js' }],
            matches: grantedMatches,
            runAt,
          }),
        );
      }),
  );
  */
  // #endif
}
