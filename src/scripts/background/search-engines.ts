import { apis } from '../apis';
import { supportedSearchEngines } from '../supported-search-engines';
import { SearchEngine, SearchEngineId } from '../types';
// #if CHROMIUM
import { AltURL, MatchPattern } from '../utilities';
// #endif

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function register(searchEngine: SearchEngine): Promise<void> {
  // #if CHROMIUM
  /*
  // #else
  await browser.contentScripts.register({
    js: [{ file: '/scripts/content-script.js' }],
    matches: searchEngine.matches,
    runAt: 'document_start',
  });
  // #endif
  // #if CHROMIUM
  */
  // #endif
}

export async function registerAll(): Promise<void> {
  // #if CHROMIUM
  apis.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'loading' || tab.url == null) {
      return;
    }
    const url = new AltURL(tab.url);
    for (const id of Object.keys(supportedSearchEngines) as SearchEngineId[]) {
      if (id === 'google') {
        continue;
      }
      if (supportedSearchEngines[id].matches.some(match => new MatchPattern(match).test(url))) {
        const [required] = await apis.tabs.executeScript(tabId, {
          file: '/scripts/content-script-required.js',
          runAt: 'document_start',
        });
        if (!required) {
          return;
        }
        await apis.tabs.executeScript(tabId, {
          file: '/scripts/content-script.js',
          runAt: 'document_start',
        });
        break;
      }
    }
  });
  /*
  // #else
  for (const id of Object.keys(supportedSearchEngines) as SearchEngineId[]) {
    if (id === 'google') {
      continue;
    }
    if (await apis.permissions.contains({ origins: supportedSearchEngines[id].matches })) {
      await register(supportedSearchEngines[id]);
    }
  }
  // #endif
  // #if CHROMIUM
  */
  // #endif
}
