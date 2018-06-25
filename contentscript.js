chrome.storage.sync.get({
  blacklist: ''
}, items => {
  const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
  const blacklist = [];
  for (let line of items.blacklist.split(/\n/)) {
    // Wildcards
    const wc = line.match(/^((\*)|http|https|file|ftp):\/\/(?:(\*)|(\*\.)?([^\/*]+))(\/.*)$/);
    if (wc) {
      blacklist.push(new RegExp(
        '^' +
        (wc[2] ? '(http|https)' : wc[1]) +
        '://' +
        (wc[3] ? '[^/]+' : (wc[4] ? '([^/]+\\.)?' + escapeRegExp(wc[5]) : escapeRegExp(wc[5]))) +
        escapeRegExp(wc[6]).replace('\\*', '.*') +
        '$'
      ));
      continue;
    }
    // RegExp Literals
    const re = line.match(/\/((?:\\\/|[^\/])*)\/(.*)/);
    if (re) {
      try {
        blacklist.push(new RegExp(re[1].replace('\\/', '/'), re[2]));
      } catch (e) {
        console.warning('uBlacklist: invalid regular expression: ' + line);
      }
    }
  }
  if (!blacklist.length) {
    return;
  }

  const observer = new MutationObserver(records => {
    for (let record of records) {
      for (let node of record.addedNodes) {
        if (node.matches && node.matches('div.g')) {
          const a = node.querySelector('a');
          if (a && a.href && blacklist.some(black => black.test(a.href))) {
            node.style.display = 'none';
          }
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
});
