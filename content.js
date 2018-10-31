class UBlacklist {
  constructor() {
    this.blockRules = null;
    this.blockedEntryCount = 0;
    this.queuedEntries = [];

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
    for (const entry of this.queuedEntries) {
      this.judgeEntry(entry);
    }
    this.queuedEntries = [];
  }

  onDOMContentMutated(records) {
    if (!document.getElementById('ubShowStyle') && document.head) {
      this.setupStyleSheets();
    }
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType == Node.ELEMENT_NODE) {
          const entryInfo = inspectEntry(node);
          if (entryInfo) {
            this.setupEntry(entryInfo);
            if (this.blockRules) {
              this.judgeEntry(entryInfo.base);
            } else {
              this.queuedEntries.push(entryInfo.base);
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
    hideStyle.sheet.insertRule('#ubHideButton { display: none; }');
    hideStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="default"] { display: none !important; }');
    hideStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="image"] { display: none !important; }');
    hideStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="imageSearch"] { visibility: hidden; }');
    hideStyle.sheet.insertRule('.ubUnblockButton { display: none; }');

    const showStyle = document.createElement('style');
    document.head.appendChild(showStyle);
    showStyle.sheet.insertRule('#ubShowButton { display: none; }');
    showStyle.sheet.insertRule('#ubHideButton { display: inline; }');
    showStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="default"] { display: block !important; }');
    showStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="image"] { display: inline-block !important; }');
    showStyle.sheet.insertRule('.ubBlockedEntry[data-ub-display="imageSearch"] { visibility: visible; }');
    showStyle.sheet.insertRule('.ubBlockedEntry, .ubBlockedEntry * { background-color: #ffe0e0; }');
    showStyle.sheet.insertRule('.ubBlockedEntry .ubBlockButton { display: none; }');
    showStyle.sheet.insertRule('.ubBlockedEntry .ubUnblockButton { display: inline; }');

    showStyle.id = 'ubShowStyle';
    showStyle.sheet.disabled = true;
  }

  setupEntry({ base, pageUrl, actionParent, actionTag, actionClass, display }) {
    if (base.hasAttribute('data-ub-page-url')) { return; }

    base.setAttribute('data-ub-page-url', pageUrl);
    base.setAttribute('data-ub-display', display);

    const action = document.createElement(actionTag);
    action.className = actionClass;

    const blockButton = document.createElement('a');
    blockButton.className = 'ubBlockButton';
    blockButton.href = 'javascript:void(0)';
    blockButton.textContent = _('blockThisSite');
    blockButton.addEventListener('click', () => {
      if (this.blockRules) {
        document.getElementById('ubBlockInput').value = makeMatchPattern(pageUrl) || '';
        document.getElementById('ubBlockDialog').showModal();
      }
    });

    const unblockButton = document.createElement('a');
    unblockButton.className = 'ubUnblockButton';
    unblockButton.href = 'javascript:void(0)';
    unblockButton.textContent = _('unblockThisSite');
    unblockButton.addEventListener('click', () => {
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

    action.appendChild(blockButton);
    action.appendChild(unblockButton);

    actionParent.appendChild(action);
  }

  setupControl() {
    const stats = document.createElement('span');
    stats.id = 'ubStats';

    const showButton = document.createElement('a');
    showButton.id = 'ubShowButton';
    showButton.href = 'javascript:void(0)';
    showButton.textContent = _('show');
    showButton.addEventListener('click', () => {
      document.getElementById('ubShowStyle').sheet.disabled = false;
    });

    const hideButton = document.createElement('a');
    hideButton.id = 'ubHideButton';
    hideButton.href = 'javascript:void(0)';
    hideButton.textContent = _('hide');
    hideButton.addEventListener('click', () => {
      document.getElementById('ubShowStyle').sheet.disabled = true;
    });

    const control = document.createElement('span');
    control.id = 'ubControl';
    control.appendChild(stats);
    control.appendChild(document.createTextNode('\u00a0'));
    control.appendChild(showButton);
    control.appendChild(hideButton);

    const resultStats = document.getElementById('resultStats');
    if (resultStats) {
      resultStats.appendChild(control);
    } else {
      const abCtls = document.getElementById('ab_ctls');
      if (abCtls) {
        const li = document.createElement('li');
        li.className = 'ab_ctl';
        li.id = 'ubImageSearchControl';
        li.appendChild(control);
        abCtls.appendChild(li);
      } else {
        return;
      }
    }

    this.updateControl();
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
        this.rejudgeAllEntries();
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
      this.rejudgeAllEntries();
      saveBlockRules(this.blockRules);
      unblockDialog.close();
    });
    unblockDialog.addEventListener('click', event => {
      if (event.target == unblockDialog) {
        unblockDialog.close();
      }
    });
  }

  judgeEntry(entry) {
    if (this.blockRules.some(rule => rule.compiled && rule.compiled.test(entry.dataset.ubPageUrl))) {
      entry.classList.add('ubBlockedEntry');
      ++this.blockedEntryCount;
    }
  }

  rejudgeAllEntries() {
    this.blockedEntryCount = 0;
    for (const entry of document.querySelectorAll('[data-ub-page-url]')) {
      entry.classList.remove('ubBlockedEntry');
      this.judgeEntry(entry);
    }
    this.updateControl();
  }

  updateControl() {
    const control = document.getElementById('ubControl');
    if (control) {
      if (this.blockedEntryCount) {
        const stats = document.getElementById('ubStats');
        stats.textContent = chrome.i18n.getMessage('nSitesBlocked', String(this.blockedEntryCount));
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
        document.getElementById('ubShowStyle').sheet.disabled = true;
      }
    }
  }
}

new UBlacklist();
