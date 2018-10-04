class UBlacklist {
  constructor() {
    this.blockRules = null;
    this.blockedSiteCount = 0;
    this.queuedSites = [];

    loadBlockRules(blockRules => {
      this.onBlockRulesLoaded(blockRules);
    });

    new MutationObserver(records => {
      this.onDOMContentMutated(records);
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('DOMContentLoaded', () => {
      this.onDOMContentLoaded();
    });
  }

  onBlockRulesLoaded(blockRules) {
    this.blockRules = blockRules;
    for (const site of this.queuedSites) {
      this.judgeSite(site);
    }
    this.queuedSites = [];
  }

  onDOMContentMutated(records) {
    if (!document.getElementById('uBlacklistShowStyle') && document.head) {
      this.setupStyleSheets();
    }
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.matches && node.matches('.g') && !node.matches('.g .g')) {
          this.setupBlockLinks(node);
          if (this.blockRules) {
            this.judgeSite(node);
          } else {
            this.queuedSites.push(node);
          }
        }
      }
    }
    this.updateControl();
  }

  onDOMContentLoaded() {
    this.setupControl();
    this.setupBlockDialogs();
  }

  setupStyleSheets() {
    const hideStyle = document.createElement('style');
    document.head.appendChild(hideStyle);
    hideStyle.sheet.insertRule('#uBlacklistHideLink { display: none; }');
    hideStyle.sheet.insertRule('.uBlacklistBlocked { display: none; }');
    hideStyle.sheet.insertRule('.uBlacklistUnblockLink { display: none; }');

    const showStyle = document.createElement('style');
    document.head.appendChild(showStyle);
    showStyle.sheet.insertRule('#uBlacklistShowLink { display: none; }');
    showStyle.sheet.insertRule('#uBlacklistHideLink { display: inline; }');
    showStyle.sheet.insertRule('.uBlacklistBlocked { background-color: #ffe0e0; display: block; }');
    showStyle.sheet.insertRule('.uBlacklistBlocked .uBlacklistBlockLink { display: none; }');
    showStyle.sheet.insertRule('.uBlacklistBlocked .uBlacklistUnblockLink { display: inline; }');
    showStyle.id = 'uBlacklistShowStyle';
    showStyle.sheet.disabled = true;
  }

  setupBlockLinks(site) {
    const siteLink = this.getSiteLink(site);
    const blockLinksParent = this.getBlockLinksParent(site);
    if (siteLink && blockLinksParent) {
      const blockLink = document.createElement('a');
      blockLink.className = 'fl uBlacklistBlockLink';
      blockLink.href = 'javascript:void(0)';
      blockLink.textContent = _('blockThisSite');
      blockLink.addEventListener('click', () => {
        if (this.blockRules) {
          document.getElementById('uBlacklistBlockInput').value = siteLink.origin + '/*';
          document.getElementById('uBlacklistBlockDialog').showModal();
        }
      });

      const unblockLink = document.createElement('a');
      unblockLink.className = 'fl uBlacklistUnblockLink';
      unblockLink.href = 'javascript:void(0)';
      unblockLink.textContent = _('unblockThisSite');
      unblockLink.addEventListener('click', () => {
        if (this.blockRules) {
          const unblockSelect = document.getElementById('uBlacklistUnblockSelect');
          while (unblockSelect.firstChild) {
            unblockSelect.removeChild(unblockSelect.firstChild);
          }
          this.blockRules.forEach((rule, index) => {
            if (rule.compiled && rule.compiled.test(siteLink.href)) {
              const option = document.createElement('option');
              option.textContent = rule.raw;
              option.value = String(index);
              unblockSelect.appendChild(option);
            }
          });
          document.getElementById('uBlacklistUnblockDialog').showModal();
        }
      });

      blockLinksParent.appendChild(document.createTextNode('\u00a0'));
      blockLinksParent.appendChild(blockLink);
      blockLinksParent.appendChild(unblockLink);
    }
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

  setupBlockDialogs() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="uBlacklistBlockDialog" style="padding:0">
        <form id="uBlacklistBlockForm" style="padding:1em">
          <label>
            ${_('blockThisSite')}:
            <input id="uBlacklistBlockInput" type="text" size="40" spellcheck="false" style="margin:0.5em">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
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

    const blockDialog = document.getElementById('uBlacklistBlockDialog');
    document.getElementById('uBlacklistBlockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = document.getElementById('uBlacklistBlockInput').value;
      const compiled = compileBlockRule(raw);
      if (compiled) {
        this.blockRules.push({ raw, compiled });
        this.rejudgeAllSites();
        saveBlockRules(this.blockRules);
      }
      blockDialog.close();
    });
    blockDialog.addEventListener('click', event => {
      if (event.target == blockDialog) {
        blockDialog.close();
      }
    });

    const unblockDialog = document.getElementById('uBlacklistUnblockDialog');
    document.getElementById('uBlacklistUnblockForm').addEventListener('submit', event => {
      event.preventDefault();
      this.blockRules.splice(Number(document.getElementById('uBlacklistUnblockSelect').value), 1);
      this.rejudgeAllSites();
      saveBlockRules(this.blockRules);
      unblockDialog.close();
    });
    unblockDialog.addEventListener('click', event => {
      if (event.target == unblockDialog) {
        unblockDialog.close();
      }
    });
  }

  // I have found 2 patterns of DOM tree (Sep 30, 2018)
  // -------------------------------------------------------------------------
  // div.g
  //  |-h2 *
  //  |-div
  //     |-link *
  //     |-div.rc
  //        |-h3.r
  //           |-a                   <- site link
  //        |-div.s
  //           |-div *
  //           |-div
  //              |-div.f
  //                 |-cite
  //                 |-div *
  //                 |-              <- where to add block/unblock links
  //              |-div.slp.f *
  //              |-span.st
  //              |-div.osl *
  //              |-div *
  //           |-div *
  //        |-div
  //     |-table.nrgt *
  // -------------------------------------------------------------------------
  // div.g
  //  |-h2 *
  //  |-div
  //     |-link *
  //     |-div.rc
  //        |-div.r
  //           |-a                   <- site link
  //              |-h3
  //              |-br
  //              |-div
  //                 |-cite
  //           |-span *
  //           |-a.fl *
  //           |-                    <- where to add block/unblock links
  //        |-div.s
  //           |-div *
  //           |-div
  //              |-div.slp.f *
  //              |-span.st
  //                 |-span.f
  //              |-div.osl *
  //              |-div *
  //           |-div *
  //        |-div
  //     |-table.nrgt *
  // -------------------------------------------------------------------------
  // * optional

  getSiteLink(site) {
    return site.querySelector('a[ping]');
  }

  getBlockLinksParent(site) {
    return site.querySelector('div.r') || site.querySelector('div.f');
  }

  judgeSite(site) {
    const siteLink = this.getSiteLink(site);
    if (siteLink && this.blockRules.some(rule => rule.compiled && rule.compiled.test(siteLink.href))) {
      site.classList.add('uBlacklistBlocked');
      ++this.blockedSiteCount;
    }
  }

  rejudgeAllSites() {
    this.blockedSiteCount = 0;
    for (const site of document.querySelectorAll('.g')) {
      if (!site.matches('.g .g')) {
        site.classList.remove('uBlacklistBlocked');
        this.judgeSite(site);
      }
    }
    this.updateControl();
  }

  updateControl() {
    const control = document.getElementById('uBlacklistControl');
    if (control) {
      if (this.blockedSiteCount) {
        const stats = document.getElementById('uBlacklistStats');
        stats.textContent = _('nSitesBlocked').replace('%d', String(this.blockedSiteCount));
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
        document.getElementById('uBlacklistShowStyle').sheet.disabled = true;
      }
    }
  }
}

new UBlacklist();
