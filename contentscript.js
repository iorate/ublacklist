function _(s) {
  return chrome.i18n.getMessage(s);
}

class UBlacklist {
  constructor() {
    this.removalRules = [];
    this.removedEntryCount = 0;
    this.showsRemovedEntries = false;
    chrome.storage.sync.get({blacklist: ''}, options => {
      this.options = options;
      this.main();
    });
  }

  main() {
    this.setupRemovalRules();
    this.setupStyleSheets();
    this.setupObserver();
    document.addEventListener('DOMContentLoaded', () => {
      this.setupControl();
      this.setupRemovalDialog();
    });
  }

  setupRemovalRules() {
    for (let line of this.options.blacklist.split(/\n/)) {
      const rule = UBlacklist.createRemovalRule(line.trim());
      if (rule) {
        this.removalRules.push(rule);
      }
    }
  }

  setupStyleSheets() {
    const redden = document.createElement('style');
    document.head.appendChild(redden);
    redden.sheet.insertRule('.uBlacklistRemoved { background-color: #ffe0e0; }');

    const hide = document.createElement('style');
    hide.id = 'uBlacklistHide';
    document.head.appendChild(hide);
    hide.sheet.insertRule('.uBlacklistRemoved { display: none; }');
  }

  setupObserver() {
    const observer = new MutationObserver(records => {
      for (let record of records) {
        for (let node of record.addedNodes) {
          if (node.matches && node.matches('.g')) {
            this.removeIf(node, url => this.removalRules.some(rule => rule.test(url)));
            this.addRemovalLink(node);
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  setupControl() {
    const resultStats = document.getElementById('resultStats');
    if (resultStats) {
      const stats = document.createElement('uBlacklistStats');
      stats.id = 'uBlacklistStats';
      stats.textContent = _('nSitesRemoved').replace('%d', this.removedEntryCount);

      const toggle = document.createElement('a');
      toggle.href = 'javascript:void(0)';
      toggle.textContent = _('show');
      toggle.addEventListener('click', () => {
        this.showsRemovedEntries = !this.showsRemovedEntries;
        document.getElementById('uBlacklistHide').sheet.disabled = this.showsRemovedEntries;
        toggle.textContent = _(this.showsRemovedEntries ? 'hide' : 'show');
      });

      const control = document.createElement('span');
      control.id = 'uBlacklistControl';
      control.style.display = this.removedEntryCount ? 'inline' : 'none';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(toggle);

      resultStats.appendChild(control);
    }
  }

  setupRemovalDialog() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="uBlacklistRemovalDialog" style="padding:0">
        <form id="uBlacklistRemovalForm" style="padding:1em">
          <label>
            ${_('removeThisSite')}:
            <input id="uBlacklistLine" type="text" size="40" style="margin:0.5em">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
    `);
    const removalDialog = document.getElementById('uBlacklistRemovalDialog');
    document.getElementById('uBlacklistRemovalForm').addEventListener('submit', event => {
      event.preventDefault();
      const line = document.getElementById('uBlacklistLine').value;
      const rule = UBlacklist.createRemovalRule(line);
      if (rule) {
        for (let node of document.querySelectorAll('.g')) {
          this.removeIf(node, url => rule.test(url));
        }
        this.removalRules.push(rule);
        if (this.options.blacklist.length && this.options.blacklist.slice(-1) != '\n') {
          this.options.blacklist += '\n';
        }
        this.options.blacklist += line + '\n';
        chrome.storage.sync.set(this.options);
      }
      removalDialog.close();
    });
    removalDialog.addEventListener('click', event => {
      if (event.target == removalDialog) {
        removalDialog.close();
      }
    });
  }

  removeIf(entry, pred) {
    const pageLink = entry.querySelector('a');
    if (pageLink && pageLink.href && pred(pageLink.href)) {
      if (entry.classList.contains('uBlacklistRemoved')) {
        return;
      }
      entry.classList.add('uBlacklistRemoved');
      ++this.removedEntryCount;
      const stats = document.getElementById('uBlacklistStats');
      if (stats) {
        stats.textContent = _('nSitesRemoved').replace('%d', this.removedEntryCount);
      }
      const control = document.getElementById('uBlacklistControl');
      if (control) {
        control.style.display = 'inline';
      }
    }
  }

  addRemovalLink(entry) {
    const f = entry.querySelector('.f');
    const pageLink = entry.querySelector('a');
    if (f && pageLink && pageLink.href) {
      const removalLink = document.createElement('a');
      removalLink.className = 'fl';
      removalLink.href = 'javascript:void(0)';
      removalLink.textContent = _('removeThisSite');
      removalLink.addEventListener('click', () => {
        document.getElementById('uBlacklistLine').value = new URL(pageLink.href).origin + '/*';
        document.getElementById('uBlacklistRemovalDialog').showModal();
      });
      f.appendChild(document.createTextNode('\u00a0'));
      f.appendChild(removalLink);
    }
  }

  static createRemovalRule(line) {
    function escapeRegExp(s) {
      return s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
    }
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
    const re = line.match(/^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/);
    if (re) {
      try {
        return new RegExp(re[1], re[2]);
      } catch (e) {
        console.warn('uBlacklist: invalid regular expression: ' + line);
      }
    }
  }
}

new UBlacklist();
