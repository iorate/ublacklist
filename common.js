const _ = s => chrome.i18n.getMessage(s);

const compileBlockRule = raw => {
  raw = raw.trim();
  const mp = raw.match(/^((\*)|http|https|ftp):\/\/(?:(\*)|(\*\.)?([^\/*]+))(\/.*)$/);
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
  const re = raw.match(/^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/);
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

const compileBlockRules = blacklist => {
  blockRules = [];
  if (blacklist) {
    for (const raw of blacklist.split(/\n/)) {
      const compiled = compileBlockRule(raw);
      blockRules.push({ raw, compiled });
    }
  }
  return blockRules;
};

const decompileBlockRules = blockRules => {
  return blockRules.map(rule => rule.raw).join('\n');
};
