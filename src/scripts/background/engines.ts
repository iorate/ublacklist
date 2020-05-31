import { apis } from '../apis';
import { ENGINES } from '../engines';
import { Engine } from '../types';
import { AltURL, MatchPattern } from '../utilities';

// #if CHROMIUM
const contentScripts = ENGINES.map(engine => ({
  css: [`/styles/engines/${engine.id}.css`, '/styles/content.css'],
  js: [`/scripts/engines/${engine.id}.js`, '/scripts/content.js'],
  matches: engine.matches.map(match => new MatchPattern(match)),
}));
// #endif

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function enableOnEngine(engine: Engine): Promise<void> {
  // #if CHROMIUM
  /*
  // #else
  await browser.contentScripts.register({
    css: [{ file: `/styles/engines/${engine.id}.css` }, { file: '/styles/content.css' }],
    js: [{ file: `/scripts/engines/${engine.id}.js` }, { file: '/scripts/content.js' }],
    matches: engine.matches,
    runAt: 'document_start',
  });
  // #endif
  // #if CHROMIUM
  */
  // #endif
}

export async function enableOnEngines(): Promise<void> {
  // #if CHROMIUM
  apis.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'loading' || tab.url == null) {
      return;
    }
    const altURL = new AltURL(tab.url);
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
  /*
  // #else
  for (const engine of ENGINES) {
    if (await apis.permissions.contains({ origins: engine.matches })) {
      await enableOnEngine(engine);
    }
  }
  // #endif
  // #if CHROMIUM
  */
  // #endif
}
