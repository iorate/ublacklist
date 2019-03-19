const OAUTH2_CLIENT_ID = '304167046827-a53p7d9jopn9nvbo7e183t966rfcp9d1.apps.googleusercontent.com';
const OAUTH2_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const $ = s => document.getElementById(s);

const _ = s => chrome.i18n.getMessage(s);

const lines = s => s ? s.split('\n') : [];
const unlines = ss => ss.join('\n');

/* Async APIs */

const getAuthToken = async details => {
  const bgPage = await browser.runtime.getBackgroundPage();
  if (bgPage.accessTokenExpDate && new Date().getTime() < bgPage.accessTokenExpDate.getTime()) {
    return bgPage.accessToken;
  }
  const authURL = 'https://accounts.google.com/o/oauth2/auth'
    + `?client_id=${OAUTH2_CLIENT_ID}`
    + '&response_type=token'
    + `&redirect_uri=${encodeURIComponent(browser.identity.getRedirectURL())}`
    + `&scope=${encodeURIComponent(OAUTH2_SCOPES.join(' '))}`;
  const redirectURL = await browser.identity.launchWebAuthFlow({
    url: authURL,
    interactive: details.interactive || false
  });
  const params = new URLSearchParams(new URL(redirectURL).hash.slice(1));
  if (params.has('error')) {
    throw new Error(`Authentication failed: ${params.get('error')}`);
  }
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  bgPage.accessToken = accessToken;
  bgPage.accessTokenExpDate = new Date(new Date().getTime() + expiresIn * 1000);
  return accessToken;
};

const removeCachedAuthToken = async details => {
  const bgPage = await browser.runtime.getBackgroundPage();
  if (bgPage.accessToken == details.token) {
    bgPage.accessToken = null;
    bgPage.accessTokenExpDate = null;
  }
};

const makeAsyncApi = callbackApi => (...args) => new Promise((resolve, reject) => {
  callbackApi(...args, result => {
    if (chrome.runtime.lastError) {
      reject(new Error(chrome.runtime.lastError.message));
      return;
    }
    resolve(result);
  });
});

const getLocalStorage = makeAsyncApi((keys, callback) => {
  chrome.storage.local.get(keys, callback);
});

const setLocalStorage = makeAsyncApi((items, callback) => {
  chrome.storage.local.set(items, callback);
});

const queryTabs = makeAsyncApi((queryInfo, callback) => {
  chrome.tabs.query(queryInfo, callback);
});

/* Block Rules */

const compileBlockRule = raw => {
  const trimmed = raw.trim();
  const mp = trimmed.match(/^((\*)|https?|ftp):\/\/(?:(\*)|(\*\.)?([^/*]+))(\/.*)$/);
  if (mp) {
    const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
    return new RegExp(
      '^' +
      (mp[2] ? 'https?' : mp[1]) +
      '://' +
      (mp[3] ? '[^/]+' : (mp[4] ? '([^/.]+\\.)*?' : '') + escapeRegExp(mp[5])) +
      escapeRegExp(mp[6]).replace(/\\\*/g, '.*') +
      '$'
    );
  }
  const re = trimmed.match(/^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/);
  if (re) {
    try {
      const compiled = new RegExp(re[1], re[2]);
      if (compiled.global || compiled.sticky) {
        return new RegExp(re[1], re[2].replace(/[gy]/g, ''));
      }
      return compiled;
    } catch (e) {
      console.warn('Invalid regular expression: ' + raw);
      return null;
    }
  }
  return null;
};

const loadBlockRules = async () => {
  const {blacklist} = await getLocalStorage({blacklist: ''});
  return lines(blacklist).map(raw => ({raw, compiled: compileBlockRule(raw)}));
};

const saveBlockRules = async blockRules => {
  await setLocalStorage({
    blacklist: unlines(blockRules.map(rule => rule.raw)),
    timestamp: new Date().toISOString()
  });
  chrome.runtime.sendMessage({});
};

const deriveBlockRule = url => {
  const u = new URL(url);
  const s = u.protocol.match(/^((https?)|ftp):$/);
  return s ? (s[2] ? '*' : s[1]) + '://' + u.hostname + '/*' : null;
};
