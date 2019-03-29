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

class BlockRule {
  constructor(raw) {
    this.raw = raw;
    const trimmed = raw.trim();
    const mp = trimmed.match(/^(\*|https?|ftp):\/\/(\*|(?:\*\.)?[^/*]+)(\/.*)$/);
    if (mp) {
      this.matchPattern = {
        scheme: mp[1],
        host: mp[2],
        path: new RegExp(`^${mp[3].replace(/[$^\\.+?()[\]{}|]/g, '\\$&').replace(/\*/g, '.*')}$`)
      };
      return;
    }
    const re = trimmed.match(/^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/);
    if (re) {
      try {
        let regExp = new RegExp(re[1], re[2]);
        if (regExp.global || regExp.sticky) {
          regExp = new RegExp(regExp, re[2].replace(/[gy]/g, ''));
        }
        this.regExp = regExp;
      } catch (e) {
        console.warn(`Invalid regular expression: ${trimmed}`);
      }
    }
  }

  get isValid() {
    return Boolean(this.matchPattern || this.regExp);
  }

  test(url) {
    if (this.matchPattern) {
      const mp = this.matchPattern;
      if (mp.host == '*') {
      } else if (mp.host.startsWith('*.')) {
        if (url.hostname != mp.host.slice(2) && !url.hostname.endsWith(mp.host.slice(1))) {
          return false;
        }
      } else if (url.hostname != mp.host) {
        return false;
      }
      if (mp.scheme == '*') {
        if (url.protocol != 'http:' && url.protocol != 'https:') {
          return false;
        }
      } else if (url.protocol != `${mp.scheme}:`) {
        return false;
      }
      return mp.path.test(`${url.pathname}${url.search}`);
    } else if (this.regExp) {
      return this.regExp.test(String(url));
    } else {
      return false;
    }
  }
};

const loadBlockRules = async () => {
  const {blacklist} = await getLocalStorage({blacklist: ''});
  return lines(blacklist).map(raw => new BlockRule(raw));
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
