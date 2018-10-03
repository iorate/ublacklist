const _ = s => chrome.i18n.getMessage(s);

const compileBlockRule = raw => {
  const trimmed = raw.trim();
  const mp = trimmed.match(/^((\*)|http|https|ftp):\/\/(?:(\*)|(\*\.)?([^\/*]+))(\/.*)$/);
  if (mp) {
    const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
    return new RegExp(
      '^' +
      (mp[2] ? '(http|https)' : mp[1]) +
      '://' +
      (mp[3] ? '[^/]+' : (mp[4] ? '([^/]+\\.)?' : '') + escapeRegExp(mp[5])) +
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

const loadOptions = onOptionsLoaded => {
  chrome.storage.local.get({ blacklist: '' }, items => {
    const blockRules = items.blacklist ?
      items.blacklist.split(/\n/).map(raw => ({ raw, compiled: compileBlockRule(raw) })) :
      [];
    onOptionsLoaded({ blockRules });
  });
};

const saveOptions = options => {
  const blacklist = options.blockRules.map(rule => rule.raw).join('\n');
  chrome.storage.local.set({ blacklist });
};
