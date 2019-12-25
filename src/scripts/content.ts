// #if BROWSER === 'firefox'
import dialogPolyfill from 'dialog-polyfill';
// #endif
import { getOptions } from './common';
import { AltURL } from './utilities';
import { BlacklistAggregation, BlacklistUpdate, loadBlacklists } from './blacklist';
import './content-handlers';

function $(id: 'ubHideStyle'): HTMLStyleElement | null;
function $(id: 'ubControl'): HTMLSpanElement | null;
function $(id: 'ubStats'): HTMLSpanElement | null;
function $(id: 'ubBlacklistUpdateDialog'): HTMLDialogElement | null;
function $(id: string): HTMLElement | null;
function $(id: string): HTMLElement | null {
  return document.getElementById(id) as HTMLElement | null;
}

class Main {
  blacklists: BlacklistAggregation | null = null;
  blacklistUpdate: BlacklistUpdate | null = null;
  blockedEntryCount: number = 0;
  queuedEntries: HTMLElement[] = [];

  constructor() {
    if (!window.ubContentHandlers) {
      return;
    }

    (async () => {
      this.blacklists = await loadBlacklists();
      for (const entry of this.queuedEntries) {
        this.judgeEntry(entry);
      }
      this.queuedEntries.length = 0;
    })();

    new MutationObserver(records => {
      if (!$('ubHideStyle') && document.head) {
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

    if (window.ubContentHandlers!.autoPagerizeHandlers) {
      document.addEventListener('AutoPagerize_DOMNodeInserted', e => {
        for (const autoPagerizeHandler of window.ubContentHandlers!.autoPagerizeHandlers!) {
          const elements = autoPagerizeHandler.getAddedElements(e.target as HTMLElement);
          if (!elements) {
            continue;
          }
          for (const element of elements) {
            this.onElementAdded(element);
          }
          break;
        }
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      this.setupControl();
      this.setupBlacklistUpdateDialog();
    });
  }

  onElementAdded(element: HTMLElement): void {
    for (const entryHandler of window.ubContentHandlers!.entryHandlers) {
      const base = entryHandler.getBase(element);
      if (!base || base.hasAttribute('data-ub-page-url')) {
        continue;
      }
      const url = entryHandler.getURL(base);
      if (!url) {
        continue;
      }
      const action = entryHandler.createAction(base);
      if (!action) {
        continue;
      }
      action.classList.add('ub-action');
      if (entryHandler.modifyDOM) {
        entryHandler.modifyDOM(base);
      }
      this.setupEntry(base, url, action);
      if (this.blacklists) {
        this.judgeEntry(base);
      } else {
        this.queuedEntries.push(base);
      }
      break;
    }
  }

  setupStyleSheets(): void {
    document.head.insertAdjacentHTML(
      'beforeend',
      `<style>
  #ubShowButton {
    display: none;
  }
  .ubUnblockButton {
    display: none;
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
</style>
<style id="ubHideStyle">
  #ubShowButton {
    display: inline;
  }
  #ubHideButton {
    display: none;
  }
  .ubBlockedEntry {
    display: none !important;
  }
</style>`,
    );

    (async () => {
      const { hideBlockLinks } = await getOptions('hideBlockLinks');
      if (hideBlockLinks) {
        document.head.insertAdjacentHTML(
          'beforeend',
          `<style>
  .ub-action {
    display: none;
  }
</style>`,
        );
      }
    })();
  }

  setupEntry(base: HTMLElement, url: string, action: HTMLElement): void {
    base.setAttribute('data-ub-page-url', url);

    const onButtonClicked = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (this.blacklists) {
        this.blacklistUpdate!.start(this.blacklists, new AltURL(url), () => {
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
  }

  setupControl(): void {
    for (const controlHandler of window.ubContentHandlers!.controlHandlers) {
      const control = controlHandler.createControl();
      if (!control) {
        continue;
      }

      const stats = document.createElement('span');
      stats.id = 'ubStats';

      const showButton = document.createElement('span');
      showButton.id = 'ubShowButton';
      showButton.textContent = chrome.i18n.getMessage('content_showBlockedSitesLink');
      showButton.addEventListener('click', () => {
        $('ubHideStyle')!.sheet!.disabled = true;
      });

      const hideButton = document.createElement('span');
      hideButton.id = 'ubHideButton';
      hideButton.textContent = chrome.i18n.getMessage('content_hideBlockedSitesLink');
      hideButton.addEventListener('click', () => {
        $('ubHideStyle')!.sheet!.disabled = false;
      });

      control.id = 'ubControl';
      control.appendChild(stats);
      control.appendChild(document.createTextNode('\u00a0'));
      control.appendChild(showButton);
      control.appendChild(hideButton);

      this.updateControl();

      break;
    }
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
      $('ubHideStyle')!.sheet!.disabled = false;
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
