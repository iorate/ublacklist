// #if BROWSER === 'firefox'
import dialogPolyfill from 'dialog-polyfill';
// #endif
import { apis } from './apis';
import { Blacklist } from './blacklist';
import { BlockForm } from './block-form';
import './content-handlers';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { AltURL } from './utilities';

let blacklist: Blacklist | null = null;
let blockForm: BlockForm | null = null;
let blockedEntryCount = 0;
const queuedEntries: HTMLElement[] = [];

function $(id: 'ub-control'): HTMLElement | null;
function $(id: 'ub-block-dialog'): HTMLDialogElement | null;
function $(id: 'ub-block-form'): HTMLDivElement | null;
function $(id: string): Element | null {
  return document.getElementById(id);
}

function judgeEntry(entry: HTMLElement): void {
  if (blacklist!.test(new AltURL(entry.dataset.ubUrl!))) {
    ++blockedEntryCount;
    entry.classList.add('ub-is-blocked');
  }
}

function onDOMContentLoaded(): void {
  for (const controlHandler of window.ubContentHandlers!.controlHandlers) {
    const control = controlHandler.createControl();
    if (!control) {
      continue;
    }
    control.id = 'ub-control';
    control.classList.add('ub-control');
    control.innerHTML = `
<span class="ub-stats"></span>
<button type="button" class="ub-button ub-show-button">
  ${apis.i18n.getMessage('content_showBlockedSitesLink')}
</button>
<button type="button" class="ub-button ub-hide-button">
  ${apis.i18n.getMessage('content_hideBlockedSitesLink')}
</button>`;
    control.querySelector('.ub-show-button')!.addEventListener('click', () => {
      document.documentElement.classList.remove('ub-hide');
    });
    control.querySelector('.ub-hide-button')!.addEventListener('click', () => {
      document.documentElement.classList.add('ub-hide');
    });
    if (controlHandler.adjustControl) {
      controlHandler.adjustControl(control);
    }
    updateControl();
    break;
  }
  document.body.insertAdjacentHTML(
    'beforeend',
    `
<dialog id="ub-block-dialog" class="ub-block-dialog">
  <div id="ub-block-form"></div>
</dialog>`,
  );
  const blockDialog = $('ub-block-dialog')!;
  // #if BROWSER === 'firefox'
  dialogPolyfill.registerDialog(blockDialog);
  // #endif
  blockDialog.addEventListener('click', e => {
    if (e.target === blockDialog) {
      blockDialog.close();
    }
  });
  blockForm = new BlockForm($('ub-block-form')!, () => {
    blockDialog.close();
  });
}

function onElementAdded(addedElement: HTMLElement): void {
  // #if ENV === 'development'
  console.log(addedElement.cloneNode(true));
  // #endif
  for (const entryHandler of window.ubContentHandlers!.entryHandlers) {
    const entry = entryHandler.getEntry(addedElement);
    if (!entry || entry.hasAttribute('data-ub-url')) {
      continue;
    }
    const url = entryHandler.getURL(entry);
    if (url == null) {
      continue;
    }
    const action = entryHandler.createAction(entry);
    if (!action) {
      continue;
    }
    entry.setAttribute('data-ub-url', url);
    action.classList.add('ub-action');
    action.innerHTML = `
<button type="button" class="ub-button ub-block-button">
  ${apis.i18n.getMessage('content_blockSiteLink')}
</button>
<button type="button" class="ub-button ub-unblock-button">
  ${apis.i18n.getMessage('content_unblockSiteLink')}
</button>`;
    const onClick = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      if (!blacklist) {
        return;
      }
      blockForm!.initialize(blacklist!, new AltURL(url), () => {
        sendMessage('set-blacklist', blacklist!.toString());
        blockedEntryCount = 0;
        for (const entry of document.querySelectorAll<HTMLElement>('[data-ub-url]')) {
          entry.classList.remove('ub-is-blocked');
          judgeEntry(entry);
        }
        if (!blockedEntryCount) {
          document.documentElement.classList.add('ub-hide');
        }
        updateControl();
      });
      $('ub-block-dialog')!.showModal();
    };
    action.querySelector('.ub-block-button')!.addEventListener('click', onClick);
    action.querySelector('.ub-unblock-button')!.addEventListener('click', onClick);
    if (entryHandler.adjustEntry) {
      entryHandler.adjustEntry(entry);
    }
    if (blacklist) {
      judgeEntry(entry);
      updateControl();
    } else {
      queuedEntries.push(entry);
    }
    return;
  }
  if (window.ubContentHandlers!.dynamicElementHandlers) {
    for (const dynamicElementHandler of window.ubContentHandlers!.dynamicElementHandlers) {
      const dynamicElements = dynamicElementHandler.getDynamicElements(addedElement);
      if (!dynamicElements) {
        continue;
      }
      dynamicElements.forEach(onElementAdded);
      break;
    }
  }
}

function onOptionsLoaded(
  options: Pick<LocalStorage.Items, 'blacklist' | 'subscriptions' | 'hideBlockLinks'>,
): void {
  blacklist = new Blacklist(
    options.blacklist,
    Object.values(options.subscriptions).map(subscription => subscription.blacklist),
  );
  for (const entry of queuedEntries) {
    judgeEntry(entry);
  }
  queuedEntries.length = 0;
  updateControl();
  if (options.hideBlockLinks) {
    document.documentElement.classList.add('ub-hide-actions');
  }
}

function updateControl(): void {
  const control = $('ub-control');
  if (!control) {
    return;
  }
  if (blockedEntryCount) {
    control.classList.remove('ub-is-hidden');
    control.querySelector('.ub-stats')!.textContent =
      blockedEntryCount === 1
        ? apis.i18n.getMessage('content_singleSiteBlocked')
        : apis.i18n.getMessage('content_multipleSitesBlocked', String(blockedEntryCount));
  } else {
    control.classList.add('ub-is-hidden');
  }
}

function main(): void {
  if (!window.ubContentHandlers) {
    return;
  }

  (async () => {
    const options = await LocalStorage.load('blacklist', 'subscriptions', 'hideBlockLinks');
    onOptionsLoaded(options);
  })();

  document.documentElement.classList.add('ub-hide');
  if (window.ubContentHandlers!.staticElementHandler) {
    const staticElements = window.ubContentHandlers!.staticElementHandler.getStaticElements();
    staticElements.forEach(onElementAdded);
  }
  new MutationObserver(records => {
    for (const record of records) {
      for (const addedNode of record.addedNodes) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          onElementAdded(addedNode as HTMLElement);
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState !== 'loading') {
    onDOMContentLoaded();
  } else {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  }
}

main();
