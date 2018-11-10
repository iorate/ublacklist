const $ = s => document.getElementById(s);

const _ = s => chrome.i18n.getMessage(s);

const lines = s => s ? s.split('\n') : [];
const unlines = ss => ss.join('\n');

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
        console.warn('uBlacklist: unsupported regular expression flag: ' + raw);
        return null;
      }
      return compiled;
    } catch (e) {
      console.warn('uBlacklist: invalid regular expression: ' + raw);
      return null;
    }
  }
  return null;
};

const loadBlockRules = onBlockRulesLoaded => {
  chrome.storage.local.get({ blacklist: '' }, items => {
    if (chrome.runtime.lastError) {
      console.error('uBlacklist: storage error: ' + chrome.runtime.lastError.message);
      onBlockRulesLoaded([]);
      return;
    }
    const blockRules = lines(items.blacklist).map(raw => ({ raw, compiled: compileBlockRule(raw) }));
    onBlockRulesLoaded(blockRules);
  });
};

const saveBlockRules = blockRules => {
  const blacklist = unlines(blockRules.map(rule => rule.raw));
  chrome.storage.local.set({ blacklist, timestamp: new Date().toISOString() }, () => {
    if (chrome.runtime.lastError) {
      console.error('uBlacklist: storage error: ' + chrome.runtime.lastError.message);
      return;
    }
    chrome.runtime.sendMessage({ immediate: true });
  });
}

const makeMatchPattern = url => {
  const u = new URL(url);
  const s = u.protocol.match(/^((https?)|ftp):$/);
  return s ? (s[2] ? '*' : s[1]) + '://' + u.hostname + '/*' : null;
};

/* Async APIs */

const getLocalStorage = keys => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, items => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(items);
    });
  });
}

const setLocalStorage = items => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

const getAuthToken = details => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(details, token => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(token);
    });
  });
};
