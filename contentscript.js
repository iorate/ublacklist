chrome.storage.sync.get({
  blacklist: ''
}, items => {
  const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
  const generateBlack = line => {
    // Wildcards
    const wc = line.match(/^((\*)|http|https|file|ftp):\/\/(?:(\*)|(\*\.)?([^\/*]+))(\/.*)$/);
    if (wc) {
      return new RegExp(
        '^' +
        (wc[2] ? '(http|https)' : wc[1]) +
        '://' +
        (wc[3] ? '[^/]+' : (wc[4] ? '([^/]+\\.)?' + escapeRegExp(wc[5]) : escapeRegExp(wc[5]))) +
        escapeRegExp(wc[6]).replace('\\*', '.*') +
        '$'
      );
    }
    // RegExp Literals
    const re = line.match(/\/((?:\\\/|[^\/])*)\/(.*)/);
    if (re) {
      try {
        return new RegExp(re[1].replace('\\/', '/'), re[2]);
      } catch (e) {
        console.warning('uBlacklist: invalid regular expression: ' + line);
      }
    }
  };
  const blacklist = [];
  for (let line of items.blacklist.split(/\n/)) {
    black = generateBlack(line);
    if (black) {
      blacklist.push(black);
    }
  }
  if (!blacklist.length) {
    return;
  }

  const hideStyle = document.createElement('style');
  document.head.appendChild(hideStyle);
  hideStyle.sheet.insertRule('.uBlacklistRemoved { display: none; }');

  const showStyle = document.createElement('style');
  document.head.appendChild(showStyle);
  showStyle.sheet.insertRule('.uBlacklistRemoved { background-color: #ffe0e0 }');

  let removedSiteCount = 0;
  const observer = new MutationObserver(records => {
    for (let record of records) {
      for (let node of record.addedNodes) {
        if (node.matches && node.matches('div.g')) {
          const a = node.querySelector('a');
          if (a && a.href && blacklist.some(black => black.test(a.href))) {
            node.classList.add('uBlacklistRemoved');
            ++removedSiteCount;
            const stats = document.getElementById('uBlacklistStats');
            if (stats) {
              stats.textContent = chrome.i18n.getMessage('nSitesRemoved').replace('%d', removedSiteCount);
            }
            const control = document.getElementById('uBlacklistControl');
            if (control) {
              control.style.display = 'inline';
            }
          }
          const f = node.querySelector('div.f');
          if (f && a && a.href) {
            const removeThisSite = document.createElement('a');
            removeThisSite.href = 'javascript:void(0)';
            removeThisSite.textContent = chrome.i18n.getMessage('removeThisSite');
            removeThisSite.addEventListener('click', () => {
              document.getElementById('uBlacklistLine').value = new URL(a.href).origin + '/*';
              document.getElementById('uBlacklistRemoveDialog').showModal();
            }, false);
            f.appendChild(document.createTextNode('\u00a0'));
            f.appendChild(removeThisSite);
          }
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => {
    const resultStats = document.getElementById('resultStats');
    if (resultStats) {
      const stats = document.createElement('span');
      stats.id = 'uBlacklistStats';
      stats.textContent = chrome.i18n.getMessage('nSitesRemoved').replace('%d', removedSiteCount);

      let on = false;
      const toggle = document.createElement('a');
      toggle.href = 'javascript:void(0)';
      toggle.textContent = chrome.i18n.getMessage('showRemovedSites');
      toggle.addEventListener('click', () => {
        on = !on;
        hideStyle.sheet.disabled = on;
        toggle.textContent = chrome.i18n.getMessage(on ? 'hideRemovedSites' : 'showRemovedSites');
      }, false);

      const control = document.createElement('span');
      control.id = 'uBlacklistControl';
      control.style.display = removedSiteCount ? 'inline' : 'none';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(toggle);

      resultStats.appendChild(control);
    }

    const removeDialog = document.createElement('dialog');
    removeDialog.id = 'uBlacklistRemoveDialog';
    removeDialog.innerHTML =
      '<p>' +
      '<label>' +
      chrome.i18n.getMessage('removeThisSite') + ':' +
      '<br>' +
      '<input id="uBlacklistLine" type="text" size="40" style="font-size:large">' +
      '</label>' +
      '</p>' +
      '<p style="display:flex">' +
      '<button id="uBlacklistOK" style="display:inline-flex">' + chrome.i18n.getMessage('ok') + '</button>' +
      '<button id="uBlacklistCancel" style="display:inline-flex">' + chrome.i18n.getMessage('cancel') + '</button>' +
      '</p>';
    document.body.appendChild(removeDialog);
    document.getElementById('uBlacklistOK').addEventListener('click', () => {
      const line = document.getElementById('uBlacklistLine').value;
      const black = generateBlack(line);
      if (black) {
        for (let node of document.querySelectorAll('div.g')) {
          const a = node.querySelector('a');
          if (a && a.href && black.test(a.href)) {
            node.classList.add('uBlacklistRemoved');
            ++removedSiteCount;
            const stats = document.getElementById('uBlacklistStats');
            if (stats) {
              stats.textContent = chrome.i18n.getMessage('nSitesRemoved').replace('%d', removedSiteCount);
            }
            const control = document.getElementById('uBlacklistControl');
            if (control) {
              control.style.display = 'inline';
            }
          }
        }
      }
      chrome.storage.sync.get({
        blacklist: ''
      }, newItems => {
        chrome.storage.sync.set({
          blacklist: newItems.blacklist + '\n' + line + '\n'
        });
      });
      removeDialog.close();
    }, false);
    document.getElementById('uBlacklistCancel').addEventListener('click', () => {
      removeDialog.close();
    }, false);
  }, false);
});
