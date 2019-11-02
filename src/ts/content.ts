// #if BROWSER === 'firefox'
import dialogPolyfill from 'dialog-polyfill';
// #endif
import { getOptions } from './common';
import { AltURL, BlacklistAggregation, loadBlacklists, BlacklistUpdate } from './blacklist';
import { InspectResult, inspectEntry } from './inspector';

function $(id: 'ubShowStyle'): HTMLStyleElement | null;
function $(id: 'ubControl'): HTMLSpanElement | null;
function $(id: 'ubStats'): HTMLSpanElement | null;
function $(id: 'ubBlacklistUpdateDialog'): HTMLDialogElement | null;
function $(id: string): HTMLElement | null;
function $(id: string): HTMLElement | null {
  return document.getElementById(id) as HTMLElement | null;
}

const CONTROL_INFO = [
  {
    site: /^www.google/,
    insert: [
      (control: HTMLElement): boolean => {
        const resultStats = $('resultStats') as HTMLDivElement | null;
        if (!resultStats) {
          return false;
        }
        resultStats.appendChild(control);
        return true;
      },
      (control: HTMLElement): boolean => {
        const abCtls = $('ab_ctls') as HTMLOListElement | null;
        if (!abCtls) {
          return false;
        }
        const li = document.createElement('li');
        li.className = 'ab_ctl';
        li.id = 'ubImageSearchControl';
        li.appendChild(control);
        abCtls.appendChild(li);
        return true;
      },
    ],
  },
  {
    site: /^www.startpage/,
    insert: [
      (control: HTMLElement): boolean => {
        const searchFilter = document.querySelector('.search-filters-toolbar__container');
        if (!searchFilter) {
          return false;
        }
        const div = document.createElement('div');
        div.className = 'search-filters-toolbar__advanced';
        div.appendChild(control);
        searchFilter.appendChild(div);
        return true;
      },
      (control: HTMLElement): boolean => {
        const imageFilter = document.querySelector('.images-filters-toolbar__container');
        if (!imageFilter) {
          return false;
        }
        const div = document.createElement('div');
        div.appendChild(control);
        imageFilter.appendChild(div);
        return true;
      },
    ],
  },
];

class Main {
  blacklists: BlacklistAggregation | null = null;
  blacklistUpdate: BlacklistUpdate | null = null;
  blockedEntryCount: number = 0;
  queuedEntries: HTMLElement[] = [];

  constructor() {
    (async () => {
      this.blacklists = await loadBlacklists();
      for (const entry of this.queuedEntries) {
        this.judgeEntry(entry);
      }
      this.queuedEntries.length = 0;
    })();

    new MutationObserver(records => {
      if (!$('ubShowStyle') && document.head) {
        this.setupStyleSheets();
      }
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.onElementAdded(node as HTMLElement);
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('AutoPagerize_DOMNodeInserted', e => {
      for (const element of (e.target as HTMLElement).querySelectorAll<HTMLElement>('.g')) {
        this.onElementAdded(element);
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      this.setupControl();
      this.setupBlacklistUpdateDialog();
    });
  }

  onElementAdded(element: HTMLElement): void {
    const entryInfo = inspectEntry(element);
    if (entryInfo) {
      this.setupEntry(entryInfo);
      if (this.blacklists) {
        this.judgeEntry(entryInfo.base);
      } else {
        this.queuedEntries.push(entryInfo.base);
      }
    }
  }

  setupStyleSheets(): void {
    const insertRules = (sheet: CSSStyleSheet, rulesString: string): void => {
      const rules = rulesString.match(/[^}]+\}/g)!;
      for (let i = 0; i < rules.length; ++i) {
        sheet.insertRule(rules[i], i);
      }
    };

    const hideStyle = document.createElement('style');
    document.head.appendChild(hideStyle);
    insertRules(
      hideStyle.sheet as CSSStyleSheet,
      String.raw`
        #ubHideButton {
          display: none;
        }
        .ubBlockedEntry[data-ub-display="default"] {
          display: none !important;
        }
        .ubBlockedEntry[data-ub-display="imageSearch"] {
          visibility: hidden;
        }
        .ubUnblockButton {
          display: none;
        }
      `,
    );

    const showStyle = document.createElement('style');
    document.head.appendChild(showStyle);
    insertRules(
      showStyle.sheet as CSSStyleSheet,
      String.raw`
        #ubShowButton {
          display: none;
        }
        #ubHideButton {
          display: inline;
        }
        .ubBlockedEntry[data-ub-display="default"] {
          display: block !important;
        }
        .ubBlockedEntry[data-ub-display="imageSearch"] {
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
      `,
    );
    showStyle.id = 'ubShowStyle';
    showStyle.sheet!.disabled = true;

    (async () => {
      const { hideBlockLinks } = await getOptions('hideBlockLinks');
      if (hideBlockLinks) {
        const hideBlockLinksStyle = document.createElement('style');
        document.head.appendChild(hideBlockLinksStyle);
        insertRules(
          hideBlockLinksStyle.sheet as CSSStyleSheet,
          String.raw`
            .ubBlockButton {
              display: none;
            }
            .ubBlockedEntry .ubUnblockButton {
              display: none;
            }
            .ubMobileAction {
              display: none;
            }
          `,
        );
      }
    })();
  }

  setupEntry({ base, pageUrl, actionParent, actionClass, display }: InspectResult): void {
    if (base.hasAttribute('data-ub-page-url')) {
      return;
    }

    base.setAttribute('data-ub-page-url', pageUrl);
    base.setAttribute('data-ub-display', display);

    const action = document.createElement('span');
    action.className = actionClass;

    const onButtonClicked = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (this.blacklists) {
        this.blacklistUpdate!.start(this.blacklists, new AltURL(pageUrl), () => {
          this.rejudgeAllEntries();
        });
        $('ubBlacklistUpdateDialog')!.showModal();
      }
    };

    const blockButton = document.createElement('span');
    blockButton.className = 'ubBlockButton';
    blockButton.textContent = chrome.i18n.getMessage('content_blockSiteLink');
    blockButton.addEventListener('click', onButtonClicked);

    const unblockButton = document.createElement('span');
    unblockButton.className = 'ubUnblockButton';
    unblockButton.textContent = chrome.i18n.getMessage('content_unblockSiteLink');
    unblockButton.addEventListener('click', onButtonClicked);

    action.appendChild(blockButton);
    action.appendChild(unblockButton);

    actionParent.appendChild(action);
  }

  setupControl(): void {
    const stats = document.createElement('span');
    stats.id = 'ubStats';

    const showButton = document.createElement('span');
    showButton.id = 'ubShowButton';
    showButton.textContent = chrome.i18n.getMessage('content_showBlockedSitesLink');
    showButton.addEventListener('click', () => {
      $('ubShowStyle')!.sheet!.disabled = false;
    });

    const hideButton = document.createElement('span');
    hideButton.id = 'ubHideButton';
    hideButton.textContent = chrome.i18n.getMessage('content_hideBlockedSitesLink');
    hideButton.addEventListener('click', () => {
      $('ubShowStyle')!.sheet!.disabled = true;
    });

    const control = document.createElement('span');
    control.id = 'ubControl';
    control.appendChild(stats);
    control.appendChild(document.createTextNode('\u00a0'));
    control.appendChild(showButton);
    control.appendChild(hideButton);

    for (const info of CONTROL_INFO) {
      if (info.site.exec(window.location.hostname)) {
        if (!info.insert.some((insert): boolean => insert(control))) {
          return;
        }
      }
    }
    this.updateControl();
  }

  setupBlacklistUpdateDialog(): void {
    const blacklistUpdateDialog = document.createElement('dialog');
    // #if BROWSER === 'firefox'
    dialogPolyfill.registerDialog(blacklistUpdateDialog);
    // #endif
    blacklistUpdateDialog.id = 'ubBlacklistUpdateDialog';
    blacklistUpdateDialog.addEventListener('click', e => {
      if (e.target === blacklistUpdateDialog) {
        blacklistUpdateDialog.close();
      }
    });
    document.body.appendChild(blacklistUpdateDialog);

    const blacklistUpdateHost = document.createElement('div');
    this.blacklistUpdate = new BlacklistUpdate(blacklistUpdateHost, () => {
      blacklistUpdateDialog.close();
    });
    blacklistUpdateDialog.appendChild(blacklistUpdateHost);
  }

  judgeEntry(entry: HTMLElement): void {
    const url = new AltURL(entry.dataset.ubPageUrl!);
    if (this.blacklists!.test(url)) {
      entry.classList.add('ubBlockedEntry');
      ++this.blockedEntryCount;
      this.updateControl();
    }
  }

  rejudgeAllEntries(): void {
    this.blockedEntryCount = 0;
    this.updateControl();
    for (const entry of document.querySelectorAll<HTMLElement>('[data-ub-page-url]')) {
      entry.classList.remove('ubBlockedEntry');
      this.judgeEntry(entry);
    }
    if (!this.blockedEntryCount) {
      $('ubShowStyle')!.sheet!.disabled = true;
    }
  }

  updateControl(): void {
    const control = $('ubControl');
    if (control) {
      if (this.blockedEntryCount) {
        $('ubStats')!.textContent =
          this.blockedEntryCount === 1
            ? chrome.i18n.getMessage('content_singleSiteBlocked')
            : chrome.i18n.getMessage(
                'content_multipleSitesBlocked',
                String(this.blockedEntryCount),
              );
        control.style.display = 'inline';
      } else {
        control.style.display = 'none';
      }
    }
  }
}

new Main();
