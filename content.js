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
    if (!document.getElementById('ubShowStyle') && document.head) {
      this.setupStyleSheets();
    }
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType == Node.ELEMENT_NODE) {
          const { site, pageUrl, blockContainerParent, blockContainerSelector } = querySite(node);
          if (site) {
            this.setupSite(site, pageUrl, blockContainerParent, blockContainerSelector);
            if (this.blockRules) {
              this.judgeSite(site);
            } else {
              this.queuedSites.push(site);
            }
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
    hideStyle.sheet.insertRule('#ubHideLink { display: none; }');
    hideStyle.sheet.insertRule('.ubBlockedSite{ display: none !important; }');
    hideStyle.sheet.insertRule('.ubUnblockLink { display: none; }');

    const showStyle = document.createElement('style');
    document.head.appendChild(showStyle);
    showStyle.sheet.insertRule('#ubShowLink { display: none; }');
    showStyle.sheet.insertRule('#ubHideLink { display: inline; }');
    showStyle.sheet.insertRule('.ubBlockedSite { display: block !important; }');
    showStyle.sheet.insertRule('.ubBlockedSite, .ubBlockedSite * { background-color: #ffe0e0; }');
    showStyle.sheet.insertRule('.ubBlockedSite .ubBlockLink { display: none; }');
    showStyle.sheet.insertRule('.ubBlockedSite .ubUnblockLink { display: inline; }');

    showStyle.id = 'ubShowStyle';
    showStyle.sheet.disabled = true;
  }

  setupSite(site, pageUrl, blockContainerParent, blockContainerSelector) {
    site.classList.add('ubSite');
    site.setAttribute('data-ub-page-url', pageUrl);

    const [blockContainerTag, blockContainerClass] = blockContainerSelector.split('.');
    const blockContainer = document.createElement(blockContainerTag);
    blockContainer.className = blockContainerClass;

    const blockLink = document.createElement('a');
    blockLink.className = 'ubBlockLink';
    blockLink.href = 'javascript:void(0)';
    blockLink.textContent = _('blockThisSite');
    blockLink.addEventListener('click', () => {
      if (this.blockRules) {
        document.getElementById('ubBlockInput').value = makeMatchPattern(pageUrl);
        document.getElementById('ubBlockDialog').showModal();
      }
    });

    const unblockLink = document.createElement('a');
    unblockLink.className = 'ubUnblockLink';
    unblockLink.href = 'javascript:void(0)';
    unblockLink.textContent = _('unblockThisSite');
    unblockLink.addEventListener('click', () => {
      if (this.blockRules) {
        const unblockSelect = document.getElementById('ubUnblockSelect');
        while (unblockSelect.firstChild) {
          unblockSelect.removeChild(unblockSelect.firstChild);
        }
        this.blockRules.forEach((rule, index) => {
          if (rule.compiled && rule.compiled.test(pageUrl)) {
            const option = document.createElement('option');
            option.textContent = rule.raw;
            option.value = String(index);
            unblockSelect.appendChild(option);
          }
        });
        document.getElementById('ubUnblockDialog').showModal();
      }
    });

    blockContainer.appendChild(blockLink);
    blockContainer.appendChild(unblockLink);

    blockContainerParent.appendChild(blockContainer);
  }

  setupControl() {
    const resultStats = document.getElementById('resultStats');
    if (resultStats) {
      const stats = document.createElement('span');
      stats.id = 'ubStats';

      const showLink = document.createElement('a');
      showLink.id = 'ubShowLink';
      showLink.href = 'javascript:void(0)';
      showLink.textContent = _('show');
      showLink.addEventListener('click', () => {
        document.getElementById('ubShowStyle').sheet.disabled = false;
      });

      const hideLink = document.createElement('a');
      hideLink.id = 'ubHideLink';
      hideLink.href = 'javascript:void(0)';
      hideLink.textContent = _('hide');
      hideLink.addEventListener('click', () => {
        document.getElementById('ubShowStyle').sheet.disabled = true;
      });

      const control = document.createElement('span');
      control.id = 'ubControl';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(showLink);
      control.appendChild(hideLink);

      resultStats.appendChild(control);

      this.updateControl();
    }
  }

  setupBlockDialogs() {
    document.body.insertAdjacentHTML('beforeend', String.raw`
      <dialog id="ubBlockDialog">
        <form id="ubBlockForm">
          <label>
            ${_('blockThisSite')}:
            <input id="ubBlockInput" type="text" spellcheck="false">
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
      <dialog id="ubUnblockDialog">
        <form id="ubUnblockForm">
          <label>
            ${_('unblockThisSite')}:
            <select id="ubUnblockSelect">
            </select>
          </label>
          <button type="submit">${_('ok')}</button>
        </form>
      </dialog>
    `);

    const blockDialog = document.getElementById('ubBlockDialog');
    document.getElementById('ubBlockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = document.getElementById('ubBlockInput').value;
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

    const unblockDialog = document.getElementById('ubUnblockDialog');
    document.getElementById('ubUnblockForm').addEventListener('submit', event => {
      event.preventDefault();
      this.blockRules.splice(Number(document.getElementById('ubUnblockSelect').value), 1);
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

  judgeSite(site) {
    if (this.blockRules.some(rule => rule.compiled && rule.compiled.test(site.dataset.ubPageUrl))) {
      site.classList.add('ubBlockedSite');
      ++this.blockedSiteCount;
    }
  }

  rejudgeAllSites() {
    this.blockedSiteCount = 0;
    for (const site of document.querySelectorAll('.ubSite')) {
      site.classList.remove('ubBlockedSite');
      this.judgeSite(site);
    }
    this.updateControl();
  }

  updateControl() {
    const control = document.getElementById('ubControl');
    if (control) {
      if (this.blockedSiteCount) {
        const stats = document.getElementById('ubStats');
        stats.textContent = chrome.i18n.getMessage('nSitesBlocked', String(this.blockedSiteCount));
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
        document.getElementById('ubShowStyle').sheet.disabled = true;
      }
    }
  }
}

new UBlacklist();
