const $ = s => document.getElementById(s);

const _ = s => chrome.i18n.getMessage(s);

const lines = s => s ? s.split('\n') : [];
const unlines = ss => ss.join('\n');

/* Async APIs */

const getAuthToken = details => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(details, token => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(token);
    });
  });
};

const removeCachedAuthToken = details => {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken(details, () => {
      resolve();
    });
  });
};

const getLocalStorage = keys => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, items => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(items);
    });
  });
};

const setLocalStorage = items => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
};

const queryTabs = queryInfo => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, result => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
};

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
        console.warn('Unsupported regular expression flag: ' + raw);
        return null;
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
  const items = await getLocalStorage({ blacklist: '' });
  return lines(items.blacklist).map(raw => ({ raw, compiled: compileBlockRule(raw) }));
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

