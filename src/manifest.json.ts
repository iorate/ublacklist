/* #if SAFARI
import { parseMatchPattern } from './common/match-pattern';
*/
// #endif
import { SEARCH_ENGINES } from './common/search-engines';

exportAsJSON('manifest.json', {
  // #if CHROME_MV3
  action: {
    /* #else
  browser_action: {
    */
    // #endif
    default_icon: {
      // #if !SAFARI
      32: 'icons/icon-32.png',
      /* #else
      32: 'icons/template-icon-32.png',
      */
      // #endif
    },
    default_popup: 'pages/popup.html',
  },

  background: {
    /* #if !CHROME_MV3
    // #if !FIREFOX
    persistent: false,
    // #endif
    scripts: ['scripts/background.js'],
    */
    // #else
    service_worker: 'scripts/background.js',
    // #endif
  },

  /* #if FIREFOX
  browser_specific_settings: {
    gecko: {
      id: '@ublacklist',
    },
  },
  */
  // #endif

  // #if !SAFARI
  content_scripts: SEARCH_ENGINES.google.contentScripts.map(({ matches, runAt }) => ({
    js: ['scripts/content-script.js'],
    matches,
    run_at: runAt,
  })),
  /* #else
  content_scripts: Object.values(SEARCH_ENGINES).flatMap(({ contentScripts }) =>
    contentScripts.map(({ matches, runAt }) => ({
      js: ['scripts/content-script.js'],
      matches: [
        ...new Set(
          matches.map(match => {
            const parsed = parseMatchPattern(match);
            if (!parsed) {
              throw new Error(`Invalid match pattern: ${match}`);
            }
            return `${parsed.scheme}://${parsed.host}/*`;
          }),
        ),
      ],
      run_at: runAt,
    })),
  ),
  */
  // #endif

  /* #if !CHROME_MV3 && DEVELOPMENT
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self';",
  */
  // #endif

  default_locale: 'en',

  description: '__MSG_extensionDescription__',

  icons: {
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },

  // #if CHROME
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm+2y1Q2VH/S9rGxa/2kzRRspyxcA8R5QBa49JK/wca2kqyfpI/traqNnNY8SfRzOugtVP+8/WbyOY44wgr427VYws6thZ//cV2NDadEMqUF5dba9LR26QHXPFUWdbUyCtNHNVP4keG/OeGJ6thOrKUlxYorK9JAmdG1szucyOKt8+k8HNVfZFTi2UHGLn1ANLAsu6f4ykb6Z0QNNCysWuNHqtFEy4j0B4T+h5VZ+Il2l3yf8uGk/zAbJE7x0C7SIscBrWQ9jcliS/e25C6mEr5lrMhQ+VpVVsRVGg7PwY7xLywKHZM8z1nzLdpMs7egEqV25HiA/PEcaQRWwDKDqwQIDAQAB',
  // #endif

  // #if CHROME_MV3
  manifest_version: 3,
  /* #else
  manifest_version: 2,
  */
  // #endif

  // #if CHROME_MV3
  minimum_chrome_version: '102',
  // #endif

  name: '__MSG_extensionName__',

  // #if CHROME_MV3
  optional_host_permissions: ['*://*/*'],
  /* #else
  optional_permissions: ['*://*\/*'],
  */
  // #endif

  options_ui: {
    /* #if FIREFOX
    browser_style: false,
    */
    /* #elif CHROME && !CHROME_MV3
    chrome_style: false,
    */
    // #endif
    // #if !SAFARI
    open_in_tab: true,
    // #endif
    page: 'pages/options.html',
  },

  permissions: [
    'activeTab',
    'alarms',
    // #if !SAFARI
    'identity',
    // #endif
    // #if CHROME_MV3
    'scripting',
    // #endif
    'storage',
    'unlimitedStorage',
  ],

  version: '0.1.0',

  // #if CHROME
  web_accessible_resources: [
    // #if CHROME_MV3
    {
      matches: ['https://iorate.github.io/*'],
      resources: ['pages/options.html'],
    },
    /* #else
    'pages/options.html',
    */
    // #endif
  ],
  // #endif
});
