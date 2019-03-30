class UBlacklist {
  constructor() {
    this.blockRules = null;
    this.blockedEntryCount = 0;
    this.queuedEntries = [];

    (async () => {
      this.onBlockRulesLoaded(await loadBlockRules());
    })();

    new MutationObserver(records => {
      this.onDOMContentMutated(records);
    }).observe(document.documentElement, {childList: true, subtree: true});

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
    if (!$('ubShowStyle') && document.head) {
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
  }

  onDOMContentLoaded() {
    this.setupControl();
    this.setupBlockDialogs();
  }

  setupStyleSheets() {
    const insertRules = (sheet, rulesString) => {
      const rules = rulesString.match(/[^}]+\}/g);
      for (let i = 0; i < rules.length; ++i) {
        sheet.insertRule(rules[i], i);
      }
    };

    const hideStyle = document.createElement('style');
    document.head.appendChild(hideStyle);
    insertRules(hideStyle.sheet, String.raw`
      #ubHideButton {
        display: none;
      }
      .ubBlockedEntry[data-ub-display="default"] {
        display: none !important;
      }
      .ubBlockedEntry[data-ub-display="image"] {
        visibility: hidden;
      }
      .ubUnblockButton {
        display: none;
      }
    `);

    const showStyle = document.createElement('style');
    document.head.appendChild(showStyle);
    insertRules(showStyle.sheet, String.raw`
      #ubShowButton {
        display: none;
      }
      #ubHideButton {
        display: inline;
      }
      .ubBlockedEntry[data-ub-display="default"] {
        display: block !important;
      }
      .ubBlockedEntry[data-ub-display="image"] {
        visibility: visible;
      }
      .ubBlockedEntry, .ubBlockedEntry * {
        background-color: #ffe0e0;
      }
      .ubBlockedEntry .ubBlockButton {
        display: none;
      }
      .ubBlockedEntry .ubUnblockButton {
        display: inline;
      }
    `);
    showStyle.id = 'ubShowStyle';
    showStyle.sheet.disabled = true;
  }

  setupEntry({base, pageUrl, actionParent, actionClass, display}) {
    if (base.hasAttribute('data-ub-page-url')) {
      return;
    }

    base.setAttribute('data-ub-page-url', pageUrl);
    base.setAttribute('data-ub-display', display);

    const action = document.createElement('span');
    action.className = actionClass;

    const blockButton = document.createElement('span');
    blockButton.className = 'ubBlockButton';
    blockButton.textContent = _('blockThisSite');
    blockButton.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.blockRules) {
        $('ubBlockInput').value = deriveBlockRule(new SimpleURL(pageUrl));
        $('ubBlockDialog').showModal();
      }
    });

    const unblockButton = document.createElement('span');
    unblockButton.className = 'ubUnblockButton';
    unblockButton.textContent = _('unblockThisSite');
    unblockButton.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.blockRules) {
        const unblockSelect = $('ubUnblockSelect');
        while (unblockSelect.firstChild) {
          unblockSelect.removeChild(unblockSelect.firstChild);
        }
        const url = new SimpleURL(pageUrl);
        this.blockRules.forEach((rule, index) => {
          if (rule.test(url)) {
            const option = document.createElement('option');
            option.textContent = rule.raw;
            option.value = String(index);
            unblockSelect.appendChild(option);
          }
        });
        $('ubUnblockDialog').showModal();
      }
    });

    action.appendChild(blockButton);
    action.appendChild(unblockButton);

    actionParent.appendChild(action);
  }

  setupControl() {
    const stats = document.createElement('span');
    stats.id = 'ubStats';

    const showButton = document.createElement('span');
    showButton.id = 'ubShowButton';
    showButton.textContent = _('show');
    showButton.addEventListener('click', () => {
      $('ubShowStyle').sheet.disabled = false;
    });

    const hideButton = document.createElement('span');
    hideButton.id = 'ubHideButton';
    hideButton.textContent = _('hide');
    hideButton.addEventListener('click', () => {
      $('ubShowStyle').sheet.disabled = true;
    });

    const control = document.createElement('span');
    control.id = 'ubControl';
    control.appendChild(stats);
    control.appendChild(document.createTextNode('\u00a0'));
    control.appendChild(showButton);
    control.appendChild(hideButton);

    const resultStats = $('resultStats');
    if (resultStats) {
      resultStats.appendChild(control);
    } else {
      const abCtls = $('ab_ctls');
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

    const blockDialog = $('ubBlockDialog');
    dialogPolyfill.registerDialog(blockDialog);
    $('ubBlockForm').addEventListener('submit', event => {
      event.preventDefault();
      const raw = $('ubBlockInput').value;
      const rule = new BlockRule(raw);
      if (rule.isValid) {
        this.blockRules.push(rule);
        this.rejudgeAllEntries();
        (async () => {
          await saveBlockRules(this.blockRules);
          blockDialog.close();
        })();
      } else {
        blockDialog.close();
      }
    });
    blockDialog.addEventListener('click', event => {
      if (event.target == blockDialog) {
        blockDialog.close();
      }
    });

    const unblockDialog = $('ubUnblockDialog');
    dialogPolyfill.registerDialog(unblockDialog);
    $('ubUnblockForm').addEventListener('submit', event => {
      event.preventDefault();
      this.blockRules.splice(Number($('ubUnblockSelect').value), 1);
      this.rejudgeAllEntries();
      (async () => {
        await saveBlockRules(this.blockRules);
        unblockDialog.close();
      })();
    });
    unblockDialog.addEventListener('click', event => {
      if (event.target == unblockDialog) {
        unblockDialog.close();
      }
    });
  }

  judgeEntry(entry) {
    const url = new SimpleURL(entry.dataset.ubPageUrl);
    if (this.blockRules.some(rule => rule.test(url))) {
      entry.classList.add('ubBlockedEntry');
      ++this.blockedEntryCount;
      this.updateControl();
    }
  }

  rejudgeAllEntries() {
    this.blockedEntryCount = 0;
    this.updateControl();
    for (const entry of document.querySelectorAll('[data-ub-page-url]')) {
      entry.classList.remove('ubBlockedEntry');
      this.judgeEntry(entry);
    }
    if (!this.blockedEntryCount) {
      $('ubShowStyle').sheet.disabled = true;
    }
  }

  updateControl() {
    const control = $('ubControl');
    if (control) {
      if (this.blockedEntryCount) {
        $('ubStats').textContent = chrome.i18n.getMessage('nSitesBlocked', String(this.blockedEntryCount));
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
      }
    }
  }
}

new UBlacklist();
