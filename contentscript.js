const _ = s => chrome.i18n.getMessage(s);

class UBlacklist {
  constructor() {
    this.blockRules = [];
    this.blockedSiteCount = 0;
    chrome.storage.sync.get({ blacklist: '' }, options => {
      this.setupBlockRules(options.blacklist);
      this.setupStyleSheets();
      this.setupObserver();
      document.addEventListener('DOMContentLoaded', () => {
        this.setupControl();
        this.setupBlockDialog();
        this.setupUnblockDialog();
      });
    });
  }

  setupBlockRules(blacklist) {
    for (const raw of blacklist.split(/\n/)) {
      const compiled = UBlacklist.compileBlockRule(raw.trim());
      this.blockRules.push({ raw, compiled });
    }
  }

  setupStyleSheets() {
    const baseStyle = document.createElement('style');
    document.head.appendChild(baseStyle);
    baseStyle.sheet.insertRule('#uBlacklistHideLink { display: none; }');
    baseStyle.sheet.insertRule('.uBlacklistBlocked { display: none; }');
    baseStyle.sheet.insertRule('.uBlacklistBlocked .uBlacklistBlockLink { display: none; }');
    baseStyle.sheet.insertRule('.uBlacklistUnblockLink { display: none; }');
    baseStyle.sheet.insertRule('.uBlacklistBlocked .uBlacklistUnblockLink { display: inline; }');

    const showStyle = document.createElement('style');
    showStyle.id = 'uBlacklistShowStyle';
    document.head.appendChild(showStyle);
    showStyle.sheet.disabled = true;
    showStyle.sheet.insertRule('#uBlacklistShowLink { display: none; }');
    showStyle.sheet.insertRule('#uBlacklistHideLink { display: inline; }');
    showStyle.sheet.insertRule('.uBlacklistBlocked { background-color: #ffe0e0; display: block; }');
  }

  setupObserver() {
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.matches && node.matches('.g')) {
            this.judgeSite(node);
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
      const stats = document.createElement('span');
      stats.id = 'uBlacklistStats';

      const showLink = document.createElement('a');
      showLink.id = 'uBlacklistShowLink';
      showLink.href = 'javascript:void(0)';
      showLink.textContent = _('show');
      showLink.addEventListener('click', () => {
        document.getElementById('uBlacklistShowStyle').sheet.disabled = false;
      });

      const hideLink = document.createElement('a');
      hideLink.id = 'uBlacklistHideLink';
      hideLink.href = 'javascript:void(0)';
      hideLink.textContent = _('hide');
      hideLink.addEventListener('click', () => {
        document.getElementById('uBlacklistShowStyle').sheet.disabled = true;
      });

      const control = document.createElement('span');
      control.id = 'uBlacklistControl';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(showLink);
      control.appendChild(hideLink);

      resultStats.appendChild(control);

      this.updateControl();
    }
  }

  setupBlockDialog() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="uBlacklistBlockDialog" style="padding:0">
        <form id="uBlacklistBlockForm" style="padding:1em">
          <label>
            ${_('blockThisSite')}:
            <input id="uBlacklistBlockInput" type="text" size="40" style="margin:0.5em">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
    `);
    const blockDialog = document.getElementById('uBlacklistBlockDialog');
    document.getElementById('uBlacklistBlockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = document.getElementById('uBlacklistBlockInput').value;
      const compiled = UBlacklist.compileBlockRule(raw);
      if (compiled) {
        this.blockRules.push({ raw, compiled });
        this.saveBlockRules();
        this.rejudgeAllSites();
      }
      blockDialog.close();
    });
    blockDialog.addEventListener('click', event => {
      if (event.target == blockDialog) {
        blockDialog.close();
      }
    });
  }

  setupUnblockDialog() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="uBlacklistUnblockDialog" style="padding:0">
        <form id="uBlacklistUnblockForm" style="padding:1em">
          <label>
            ${_('unblockThisSite')}:
            <select id="uBlacklistUnblockSelect" style="margin:0.5em;width:20em">
            </select>
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
    `);
    const unblockDialog = document.getElementById('uBlacklistUnblockDialog');
    document.getElementById('uBlacklistUnblockForm').addEventListener('submit', event => {
      event.preventDefault();
      this.blockRules.splice(document.getElementById('uBlacklistUnblockSelect').value - 0, 1);
      this.saveBlockRules();
      this.rejudgeAllSites();
      unblockDialog.close();
    });
    unblockDialog.addEventListener('click', event => {
      if (event.target == unblockDialog) {
        unblockDialog.close();
      }
    });
  }

  judgeSite(node) {
    const pageLink = node.querySelector('a');
    if (pageLink && pageLink.href &&
        this.blockRules.some(rule => rule.compiled && rule.compiled.test(pageLink.href))) {
      node.classList.add('uBlacklistBlocked');
      ++this.blockedSiteCount;
      this.updateControl();
    }
  }

  rejudgeAllSites() {
    this.blockedSiteCount = 0;
    for (const node of document.querySelectorAll('.g')) {
      node.classList.remove('uBlacklistBlocked');
      this.judgeSite(node);
    }
    this.updateControl();
  }

  updateControl() {
    const control = document.getElementById('uBlacklistControl');
    if (control) {
      if (this.blockedSiteCount) {
        const stats = document.getElementById('uBlacklistStats');
        stats.textContent = _('nSitesBlocked').replace('%d', this.blockedSiteCount);
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
      }
    }
  }

  addBlockLink(entry) {
    const f = entry.querySelector('.f');
    const pageLink = entry.querySelector('a');
    if (f && pageLink && pageLink.href) {
      const blockLink = document.createElement('a');
      blockLink.className = 'fl uBlacklistBlockLink';
      blockLink.href = 'javascript:void(0)';
      blockLink.textContent = _('blockThisSite');
      blockLink.addEventListener('click', () => {
        document.getElementById('uBlacklistBlockInput').value = new URL(pageLink.href).origin + '/*';
        document.getElementById('uBlacklistBlockDialog').showModal();
      });

      const unblockLink = document.createElement('a');
      unblockLink.className = 'fl uBlacklistUnblockLink';
      unblockLink.href = 'javascript:void(0)';
      unblockLink.textContent = _('unblockThisSite');
      unblockLink.addEventListener('click', () => {
        const unblockSelect = document.getElementById('uBlacklistUnblockSelect');
        while (unblockSelect.firstChild) {
          unblockSelect.removeChild(unblockSelect.firstChild);
        }
        this.blockRules.forEach((rule, index) => {
          if (rule.compiled && rule.compiled.test(pageLink.href)) {
            const option = document.createElement('option');
            option.textContent = rule.raw.trim();
            option.value = index + '';
            unblockSelect.appendChild(option);
          }
        });
        document.getElementById('uBlacklistUnblockDialog').showModal();
      });

      f.appendChild(document.createTextNode('\u00a0'));
      f.appendChild(blockLink);
      f.appendChild(unblockLink);
    }
  }

  saveBlockRules() {
    let blacklist = '';
    for (let rule of this.blockRules) {
      blacklist += rule.raw + '\n';
    }
    blacklist = blacklist.slice(0, -1);
    chrome.storage.sync.set({ blacklist });
  }

  static compileBlockRule(raw) {
    const escapeRegExp = s => s.replace(/[$^\\.*+?()[\]{}|]/g, '\\$&');
    const wc = raw.match(/^((\*)|http|https|file|ftp):\/\/(?:(\*)|(\*\.)?([^\/*]+))(\/.*)$/);
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
    const re = raw.match(/^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/);
    if (re) {
      try {
        return new RegExp(re[1], re[2]);
      } catch (e) {
        console.warn('uBlacklist: invalid regular expression: ' + raw);
        return null;
      }
    }
    return null;
  }
}

new UBlacklist();
