import { searchEngineMatches } from '../../common/search-engines';
import { apis } from '../apis';
import { SearchEngineId } from '../types';
import { AltURL, MatchPattern, stringEntries } from '../utilities';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function register(id: SearchEngineId): Promise<void> {
  /* #if FIREFOX
  await browser.contentScripts.register({
    js: [{ file: '/scripts/content-script.js' }],
    matches: searchEngineMatches[id],
    runAt: 'document_start',
  });
  */
  // #endif
}

// eslint-disable-next-line @typescript-eslint/require-await
export function registerAll(): void {
  // #if CHROME_MV3
  // #elif CHROME
  apis.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    void (async () => {
      if (changeInfo.status !== 'loading' || tab.url == null) {
        return;
      }
      const url = new AltURL(tab.url);
      for (const [id, matches] of stringEntries(searchEngineMatches)) {
        if (id !== 'google' && matches.some(match => new MatchPattern(match).test(url))) {
          const [injected] = await apis.tabs.executeScript(tabId, {
            file: '/scripts/content-script-injected.js',
            runAt: 'document_start',
          });
          if (injected === false) {
            await apis.tabs.executeScript(tabId, {
              file: '/scripts/content-script.js',
              runAt: 'document_start',
            });
          }
          break;
        }
      }
    })();
  });
  /* #elif FIREFOX
  for (const [id, matches] of stringEntries(searchEngineMatches)) {
    if (id === 'google') {
      continue;
    }
    void (async () => {
      if (await apis.permissions.contains({ origins: matches })) {
        await register(id);
      }
    })();
  }
  */
  // #endif
}
