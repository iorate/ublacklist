const _ = s => chrome.i18n.getMessage(s);

class UBlacklist {
  constructor() {
    this.blockRules = [];
    this.blockedEntryCount = 0;
    this.showsBlockedEntries = false;
    chrome.storage.sync.get({
      blacklist: ''
    }, options => {
      this.options = options;
      this.main();
    });
  }

  main() {
    this.setupBlockRules();
    this.setupStyleSheets();
    this.setupObserver();
    document.addEventListener('DOMContentLoaded', () => {
      this.setupControl();
      this.setupBlockDialog();
    });
  }

  setupBlockRules() {
    for (let line of this.options.blacklist.split(/\n/)) {
      const rule = UBlacklist.createBlockRule(line.trim());
      if (rule) {
        this.blockRules.push(rule);
      }
    }
  }

  setupStyleSheets() {
    const redden = document.createElement('style');
    document.head.appendChild(redden);
    redden.sheet.insertRule('.uBlacklistBlocked { background-color: #ffe0e0; }');

    const hide = document.createElement('style');
    hide.id = 'uBlacklistHide';
    document.head.appendChild(hide);
    hide.sheet.insertRule('.uBlacklistBlocked { display: none; }');
  }

  setupObserver() {
    const observer = new MutationObserver(records => {
      for (let record of records) {
        for (let node of record.addedNodes) {
          if (node.matches && node.matches('.g')) {
            this.blockIf(node, url => this.blockRules.some(rule => rule.test(url)));
            this.addBlockLink(node);
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
      stats.textContent = _('nSitesBlocked').replace('%d', this.blockedEntryCount);

      const toggle = document.createElement('a');
      toggle.href = 'javascript:void(0)';
      toggle.textContent = _('show');
      toggle.addEventListener('click', () => {
        this.showsBlockedEntries = !this.showsBlockedEntries;
        document.getElementById('uBlacklistHide').sheet.disabled = this.showsBlockedEntries;
        toggle.textContent = _(this.showsBlockedEntries ? 'hide' : 'show');
      });

      const control = document.createElement('span');
      control.id = 'uBlacklistControl';
      control.style.display = this.blockedEntryCount ? 'inline' : 'none';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(toggle);

      resultStats.appendChild(control);
    }
  }

  setupBlockDialog() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="uBlacklistBlockDialog" style="padding:0">
        <form id="uBlacklistBlockForm" style="padding:1em">
          <label>
            ${_('blockThisSite')}:
            <input id="uBlacklistLine" type="text" size="40" style="margin:0.5em">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
    `);
    const blockDialog = document.getElementById('uBlacklistBlockDialog');
    document.getElementById('uBlacklistBlockForm').addEventListener('submit', event => {
      event.preventDefault();
      const line = document.getElementById('uBlacklistLine').value;
      const rule = UBlacklist.createBlockRule(line);
      if (rule) {
        for (let node of document.querySelectorAll('.g')) {
          this.blockIf(node, url => rule.test(url));
        }
        this.blockRules.push(rule);
        if (this.options.blacklist && this.options.blacklist.slice(-1) != '\n') {
          this.options.blacklist += '\n';
        }
        this.options.blacklist += line + '\n';
        chrome.storage.sync.set(this.options);
      }
      blockDialog.close();
    });
    blockDialog.addEventListener('click', event => {
      if (event.target == blockDialog) {
        blockDialog.close();
      }
    });
  }

  blockIf(entry, pred) {
    if (!entry.classList.contains('uBlacklistBlocked')) {
      const pageLink = entry.querySelector('a');
      if (pageLink && pageLink.href && pred(pageLink.href)) {
        entry.classList.add('uBlacklistBlocked');
        ++this.blockedEntryCount;
        const control = document.getElementById('uBlacklistControl');
        if (control) {
          const stats = document.getElementById('uBlacklistStats');
          stats.textContent = _('nSitesBlocked').replace('%d', this.blockedEntryCount);
          control.style.display = 'inline';
        }
      }
    }
  }

  addBlockLink(entry) {
    const f = entry.querySelector('.f');
    const pageLink = entry.querySelector('a');
    if (f && pageLink && pageLink.href) {
      const blockLink = document.createElement('a');
      blockLink.className = 'fl';
      blockLink.href = 'javascript:void(0)';
      blockLink.textContent = _('blockThisSite');
      blockLink.addEventListener('click', () => {
        document.getElementById('uBlacklistLine').value = new URL(pageLink.href).origin + '/*';
        document.getElementById('uBlacklistBlockDialog').showModal();
      });
      f.appendChild(document.createTextNode('\u00a0'));
      f.appendChild(blockLink);
    }
  }

  static createBlockRule(line) {
    const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
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
        return null;
      }
    }
    return null;
  }
}

new UBlacklist();
