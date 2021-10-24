import { searchEngineMatches } from '../../common/search-engines';
import { apis } from '../apis';
import { AltURL, MatchPattern, stringEntries } from '../utilities';

export async function injectContentScript(tabId: number, url: string): Promise<void> {
  // #if CHROME && !CHROME_MV3
  const altURL = new AltURL(url);
  const matched = stringEntries(searchEngineMatches)
    .flatMap(([id, matches]) => (id === 'google' ? [] : matches))
    .some(match => new MatchPattern(match).test(altURL));
  if (!matched) {
    return;
  }
  const [active] = await apis.tabs.executeScript(tabId, {
    file: '/scripts/active.js',
    runAt: 'document_start',
  });
  if (!active) {
    await apis.tabs.executeScript(tabId, {
      file: '/scripts/content-script.js',
      runAt: 'document_start',
    });
  }
  // #endif
}

/* #if FIREFOX
let registered: browser.contentScripts.RegisteredContentScript | null = null;
*/
// #endif

// eslint-disable-next-line @typescript-eslint/require-await
export async function registerContentScript(): Promise<void> {
  /* #if FIREFOX
  if (registered) {
    await registered.unregister();
    registered = null;
  }
  const grantedMatches = await Promise.all(
    stringEntries(searchEngineMatches)
      .flatMap(([id, matches]) => (id === 'google' ? [] : matches))
      .map(match =>
        apis.permissions.contains({ origins: [match] }).then(granted => (granted ? match : null)),
      ),
  ).then(matches => matches.filter((match): match is string => match != null));
  if (!grantedMatches.length) {
    return;
  }
  registered = await browser.contentScripts.register({
    js: [{ file: '/scripts/content-script.js' }],
    matches: grantedMatches,
    runAt: 'document_start',
  });
  */
  // #endif
}
