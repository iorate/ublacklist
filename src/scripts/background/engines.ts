import { apis } from '../apis';
import { ENGINES } from '../engines';
import { Engine } from '../types';
import { AltURL, MatchPattern } from '../utilities';

// #if BROWSER === 'chrome'
const contentScripts = ENGINES.map(engine => ({
  css: [`/styles/engines/${engine.id}.css`, '/styles/content.css'],
  js: [`/scripts/engines/${engine.id}.js`, '/scripts/content.js'],
  matches: engine.matches.map(match => new MatchPattern(match)),
}));
// #endif

export async function enableOnEngine(engine: Engine): Promise<void> {
  // #if BROWSER === 'firefox'
  await browser.contentScripts.register({
    css: [{ file: `/styles/engines/${engine.id}.css` }, { file: '/styles/content.css' }],
    js: [{ file: `/scripts/engines/${engine.id}.js` }, { file: '/scripts/content.js' }],
    matches: engine.matches,
    runAt: 'document_start',
  });
  // #endif
}

export async function enableOnEngines(): Promise<void> {
  // #if BROWSER === 'chrome'
  apis.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status !== 'loading') {
      return;
    }
    const url = changeInfo.url ?? (await apis.tabs.get(tabId)).url;
    if (url == undefined) {
      return;
    }
    const altURL = new AltURL(url);
    const contentScript = contentScripts.find(contentScript =>
      contentScript.matches.some(match => match.test(altURL)),
    );
    if (!contentScript) {
      return;
    }
    const result = await apis.tabs.executeScript(tabId, {
      file: '/scripts/has-content-handlers.js',
      runAt: 'document_start',
    });
    if (result[0]) {
      return;
    }
    for (const css of contentScript.css) {
      apis.tabs.insertCSS(tabId, {
        file: css,
        runAt: 'document_start',
      });
    }
    for (const js of contentScript.js) {
      apis.tabs.executeScript(tabId, {
        file: js,
        runAt: 'document_start',
      });
    }
  });
  // #else
  for (const engine of ENGINES) {
    if (await apis.permissions.contains({ origins: engine.matches })) {
      await enableOnEngine(engine);
    }
  }
  // #endif
}
