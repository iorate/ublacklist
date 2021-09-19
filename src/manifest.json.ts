import { searchEngineMatches } from './common/search-engines';

exportAsJSON('manifest.json', {
  background: {
    /* #if CHROME_MV3
    service_worker: 'background.js',
    */
    // #else
    // #if CHROME || SAFARI
    persistent: false,
    // #endif
    scripts: ['scripts/background.js'],
    // #endif
  },

  /* #if CHROME_MV3
  action: {
  */
  // #else
  browser_action: {
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

  content_scripts: [
    {
      js: ['scripts/content-script.js'],
      /* #if CHROME_MV3
      matches: Object.values(searchEngineMatches).flat(),
      */
      // #elif !SAFARI
      matches: searchEngineMatches.google,
      /* #else
      matches: [
        ...new Set(
          Object.values(searchEngineMatches)
            .flat()
            .map((match: string) => {
              const m = /^(\*|https?|ftp):\/\/(\*|(?:\*\.)?[^/*]+)(\/.*)$/.exec(match);
              if (!m) {
                throw new Error(`Invalid match pattern: ${match}`);
              }
              const [, scheme, host] = m;
              return `${scheme}://${host}/*`;
            }),
        ),
      ],
      */
      // #endif
      run_at: 'document_start',
    },
  ],

  // #if !CHROME_MV3 && DEVELOPMENT
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self';",
  // #endif

  default_locale: 'en',

  description: '__MSG_extensionDescription__',

  icons: {
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },

  // #if CHROME
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm+2y1Q2VH/S9rGxa/2kzRRspyxcA8R5QBa49JK/wca2kqyfpI/traqNnNY8SfRzOugtVP+8/WbyOY44wgr427VYws6thZ//cV2NDadEMqUF5dba9LR26QHXPFUWdbUyCtNHNVP4keG/OeGJ6thOrKUlxYorK9JAmdG1szucyOKt8+k8HNVfZFTi2UHGLn1ANLAsu6f4ykb6Z0QNNCysWuNHqtFEy4j0B4T+h5VZ+Il2l3yf8uGk/zAbJE7x0C7SIscBrWQ9jcliS/e25C6mEr5lrMhQ+VpVVsRVGg7PwY7xLywKHZM8z1nzLdpMs7egEqV25HiA/PEcaQRWwDKDqwQIDAQAB',
  /* #elif FIREFOX && DEVELOPMENT
  browser_specific_settings: {
    gecko: {
      id: '@ublacklist',
    },
  },
  */
  // #endif

  /* #if CHROME_MV3
  manifest_version: 3,
  */
  // #else
  manifest_version: 2,
  // #endif

  name: '__MSG_extensionName__',

  /* #if CHROME_MV3
  host_permissions: ['*://*\/*'],
  */
  // #else
  optional_permissions: ['*://*/*'],
  // #endif

  options_ui: {
    // #if CHROME_MV3
    // #elif CHROME
    chrome_style: false,
    /* #elif FIREFOX
    browser_style: false,
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
    'storage',
  ],

  version: '4.10.0',
});
