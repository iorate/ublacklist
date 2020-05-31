import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { apis } from './apis';
import './dayjs-locales';
import { ENGINES } from './engines';
import * as LocalStorage from './local-storage';
import { addMessageListeners, sendMessage } from './messages';
import { Engine, Result, Subscription, SubscriptionId, Subscriptions } from './types';
import { AltURL, escapeHTML, isErrorResult, lines, unlines } from './utilities';

function resultToString(result: Result): string {
  if (isErrorResult(result)) {
    return chrome.i18n.getMessage('error', result.message);
  } else {
    return dayjs(result.timestamp).fromNow();
  }
}

// #region Elements

function $(id: 'blacklist'): HTMLTextAreaElement;
function $(id: 'importBlacklist'): HTMLButtonElement;
function $(id: 'saveBlacklist'): HTMLButtonElement;
function $(id: 'engines'): HTMLUListElement;
function $(id: 'hideBlockSiteLinks'): HTMLInputElement;
function $(id: 'hideControl'): HTMLInputElement;
function $(id: 'skipBlockDialog'): HTMLInputElement;
function $(id: 'syncSection'): HTMLElement;
function $(id: 'turnOnSync'): HTMLButtonElement;
function $(id: 'turnOffSync'): HTMLButtonElement;
function $(id: 'syncResult'): HTMLSpanElement;
function $(id: 'syncNow'): HTMLButtonElement;
function $(id: 'subscriptions'): HTMLTableElement;
function $(id: 'noSubscriptionAdded'): HTMLParagraphElement;
function $(id: 'updateAllSubscriptions'): HTMLButtonElement;
function $(id: 'addSubscription'): HTMLButtonElement;
function $(id: 'importBlacklistDialog'): HTMLDivElement;
function $(id: 'importBlacklistDialog_background'): HTMLDivElement;
function $(id: 'importBlacklistDialog_blacklist'): HTMLTextAreaElement;
function $(id: 'importBlacklistDialog_cancel'): HTMLButtonElement;
function $(id: 'importBlacklistDialog_import'): HTMLButtonElement;
function $(id: 'addSubscriptionDialog'): HTMLDivElement;
function $(id: 'addSubscriptionDialog_background'): HTMLDivElement;
function $(id: 'addSubscriptionDialog_name'): HTMLInputElement;
function $(id: 'addSubscriptionDialog_url'): HTMLInputElement;
function $(id: 'addSubscriptionDialog_cancel'): HTMLButtonElement;
function $(id: 'addSubscriptionDialog_add'): HTMLButtonElement;
function $(id: 'showSubscriptionDialog'): HTMLDivElement;
function $(id: 'showSubscriptionDialog_background'): HTMLDivElement;
function $(id: 'showSubscriptionDialog_name'): HTMLParagraphElement;
function $(id: 'showSubscriptionDialog_blacklist'): HTMLTextAreaElement;
function $(id: 'showSubscriptionDialog_ok'): HTMLButtonElement;
function $(id: string): HTMLElement | null;
function $(id: string): HTMLElement | null {
  return document.getElementById(id) as HTMLElement | null;
}

const $blacklist = $('blacklist');

// #endregion Elements

// #region General

function setupGeneralSection(
  blacklist: string,
  hideBlockLinks: boolean,
  hideControl: boolean,
  skipBlockDialog: boolean,
): void {
  $blacklist.value = blacklist;
  $blacklist.addEventListener('input', () => {
    $('saveBlacklist').disabled = false;
  });
  $('importBlacklist').addEventListener('click', () => {
    $('importBlacklistDialog').classList.add('is-active');
    $('importBlacklistDialog_blacklist').focus();
    $('importBlacklistDialog_blacklist').value = '';
  });
  $('saveBlacklist').addEventListener('click', () => {
    $('saveBlacklist').disabled = true;
    sendMessage('set-blacklist', $blacklist.value);
  });

  $('importBlacklistDialog_background').addEventListener('click', () => {
    $('importBlacklistDialog').classList.remove('is-active');
  });
  $('importBlacklistDialog_cancel').addEventListener('click', () => {
    $('importBlacklistDialog').classList.remove('is-active');
  });
  $('importBlacklistDialog_import').addEventListener('click', () => {
    const rules: string[] = [];
    for (const domain of lines($('importBlacklistDialog_blacklist').value)) {
      if (/^[^/*]+$/.test(domain)) {
        rules.push(`*://*.${domain}/*`);
      }
    }
    if (rules.length) {
      $blacklist.value = unlines([...lines($blacklist.value), ...rules]);
      $blacklist.scrollTop = $blacklist.scrollHeight;
      $('saveBlacklist').disabled = false;
    }
    $('importBlacklistDialog').classList.remove('is-active');
  });

  $('hideBlockSiteLinks').checked = hideBlockLinks;
  $('hideBlockSiteLinks').addEventListener('change', () => {
    LocalStorage.store({ hideBlockLinks: $('hideBlockSiteLinks').checked });
  });

  $('hideControl').checked = hideControl;
  $('hideControl').addEventListener('change', () => {
    LocalStorage.store({ hideControl: $('hideControl').checked });
  });

  $('skipBlockDialog').checked = skipBlockDialog;
  $('skipBlockDialog').addEventListener('change', () => {
    LocalStorage.store({ skipBlockDialog: $('skipBlockDialog').checked });
  });
}

// #endregion General

// #region Engines

function onEngineEnabled(engine: Engine): void {
  $(`enable${engine.id}`)!.classList.add('is-hidden');
  $(`is${engine.id}Enabled`)!.classList.remove('is-hidden');
}

async function setupEnginesSection(): Promise<void> {
  for (const engine of ENGINES) {
    $('engines').insertAdjacentHTML(
      'beforeend',
      `
<li class="list-item">
  <div class="columns is-vcentered">
    <div class="column">
      <label for="enable${engine.id}">
        <span>${engine.name}</span>
      </label>
    </div>
    <div class="column is-narrow">
      <button id="enable${engine.id}" class="button is-primary">
        <span>${chrome.i18n.getMessage('options_enableOnSearchEngine')}</span>
      </button>
      <button id="is${
        engine.id
      }Enabled" disabled class="button has-text-primary is-disabled is-hidden">
        <span>${chrome.i18n.getMessage('options_enabledOnSearchEngine')}</span>
      </button>
    </div>
  </div>
</li>`,
    );
    if (await apis.permissions.contains({ origins: engine.matches })) {
      onEngineEnabled(engine);
    }
    $(`enable${engine.id}`)!.addEventListener('click', async () => {
      if (await apis.permissions.request({ origins: engine.matches })) {
        onEngineEnabled(engine);
        sendMessage('enable-on-engine', engine);
      }
    });
  }
}

// #endregion Engines

// #region Sync

function onSyncChanged(sync: boolean): void {
  for (const element of document.getElementsByClassName('is-hidden-sync-on')) {
    element.classList.toggle('is-hidden', sync);
  }
  for (const element of document.getElementsByClassName('is-hidden-sync-off')) {
    element.classList.toggle('is-hidden', !sync);
  }
  $('syncNow').disabled = !sync;
}

function onSyncResultChanged(syncResult: Result | null): void {
  $('syncResult').textContent = syncResult
    ? resultToString(syncResult)
    : chrome.i18n.getMessage('options_syncNever');
}

function setupSyncSection(sync: boolean, syncResult: Result | null): void {
  onSyncChanged(sync);
  onSyncResultChanged(syncResult);
  $('turnOnSync').addEventListener('click', async () => {
    // #if CHROMIUM
    /*
    // #else
    const granted = await apis.permissions.request({ origins: ['https://www.googleapis.com/*'] });
    if (!granted) {
      return;
    }
    // #endif
    // #if CHROMIUM
    */
    // #endif
    const authed = await sendMessage('auth-to-sync-blacklist');
    if (!authed) {
      return;
    }
    onSyncChanged(true);
    await LocalStorage.store({ sync: true });
    sendMessage('sync-blacklist');
  });
  $('turnOffSync').addEventListener('click', async () => {
    onSyncChanged(false);
    await LocalStorage.store({ sync: false });
  });
  $('syncNow').addEventListener('click', () => {
    sendMessage('sync-blacklist');
  });

  addMessageListeners({
    'blacklist-syncing': () => {
      $('syncResult').textContent = chrome.i18n.getMessage('options_syncRunning');
    },
    'blacklist-synced': result => {
      onSyncResultChanged(result);
    },
  });
}

// #endregion Sync

// #region Subscription

function onSubscriptionAdded(id: SubscriptionId, subscription: Subscription): void {
  const row = $('subscriptions').tBodies[0].insertRow();
  row.id = `subscription${id}`;
  row.innerHTML = `
<td class="subscription-name">
  ${escapeHTML(subscription.name)}
</td>
<td class="subscription-url">
  ${escapeHTML(subscription.url)}
</td>
<td class="subscription-update-result">
  ${subscription.updateResult ? resultToString(subscription.updateResult) : ''}
</td>
<td class="subscription-menu">
  <div class="dropdown is-right">
    <div class="dropdown-trigger">
      <button class="button subscription-menu-button is-white is-rounded"></button>
    </div>
    <div class="dropdown-menu">
      <div class="dropdown-content">
        <a class="dropdown-item show-subscription-menu">
          ${chrome.i18n.getMessage('options_showSubscriptionMenu')}
        </a>
        <a class="dropdown-item update-subscription-now-menu">
          ${chrome.i18n.getMessage('options_updateSubscriptionNowMenu')}
        </a>
        <a class="dropdown-item remove-subscription-menu">
          ${chrome.i18n.getMessage('options_removeSubscriptionMenu')}
        </a>
      </div>
    </div>
  </div>
</td>`;
  row.querySelector('.subscription-menu-button')!.addEventListener('click', () => {
    row.querySelector('.dropdown')!.classList.toggle('is-active');
  });
  row.querySelector('.subscription-menu-button')!.addEventListener('blur', () => {
    row.querySelector('.dropdown')!.classList.remove('is-active');
  });
  row.querySelector('.show-subscription-menu')!.addEventListener('mousedown', async () => {
    const {
      subscriptions: { [id]: subscription },
    } = await LocalStorage.load('subscriptions');
    if (!subscription) {
      return;
    }
    $('showSubscriptionDialog').classList.add('is-active');
    $('showSubscriptionDialog_name').textContent = subscription.name;
    $('showSubscriptionDialog_blacklist').value = subscription.blacklist;
    $('showSubscriptionDialog_ok').focus();
  });
  row.querySelector('.update-subscription-now-menu')!.addEventListener('mousedown', async () => {
    sendMessage('update-subscription', id);
  });
  row.querySelector('.remove-subscription-menu')!.addEventListener('mousedown', async () => {
    $('subscriptions').deleteRow(row.rowIndex);
    if (!$('subscriptions').tBodies[0].rows.length) {
      $('noSubscriptionAdded').classList.remove('is-hidden');
      $('updateAllSubscriptions').disabled = true;
    }
    sendMessage('remove-subscription', id);
  });

  $('noSubscriptionAdded').classList.add('is-hidden');
  $('updateAllSubscriptions').disabled = false;
}

function setupSubscriptionSection(subscriptions: Subscriptions): void {
  for (const id of Object.keys(subscriptions).map(Number)) {
    onSubscriptionAdded(id, subscriptions[id]);
  }
  $('addSubscription').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.add('is-active');
    $('addSubscriptionDialog_name').focus();
    $('addSubscriptionDialog_name').value = '';
    $('addSubscriptionDialog_url').value = '';
    $('addSubscriptionDialog_add').disabled = true;
  });
  $('updateAllSubscriptions').addEventListener('click', () => {
    sendMessage('update-subscriptions');
  });

  $('addSubscriptionDialog').addEventListener('input', () => {
    $('addSubscriptionDialog_add').disabled =
      !$('addSubscriptionDialog_name').checkValidity() ||
      !$('addSubscriptionDialog_url').checkValidity();
  });
  $('addSubscriptionDialog_background').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_cancel').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_add').addEventListener('click', async () => {
    const url = $('addSubscriptionDialog_url').value;
    const granted = await apis.permissions.request({ origins: [new AltURL(url).toString()] });
    if (!granted) {
      return;
    }
    $('addSubscriptionDialog').classList.remove('is-active');
    const subscription = {
      name: $('addSubscriptionDialog_name').value,
      url,
      blacklist: '',
      updateResult: null,
    };
    const id = await sendMessage('add-subscription', subscription);
    onSubscriptionAdded(id, subscription);
    sendMessage('update-subscriptions');
  });
  $('showSubscriptionDialog_background').addEventListener('click', () => {
    $('showSubscriptionDialog').classList.remove('is-active');
  });
  $('showSubscriptionDialog_ok').addEventListener('click', () => {
    $('showSubscriptionDialog').classList.remove('is-active');
  });

  addMessageListeners({
    'subscription-updating': id => {
      const row = document.getElementById(`subscription${id}`);
      if (!row) {
        return;
      }
      row.querySelector('.subscription-update-result')!.textContent = chrome.i18n.getMessage(
        'options_subscriptionUpdateRunning',
      );
    },
    'subscription-updated': (id, result) => {
      const row = document.getElementById(`subscription${id}`);
      if (!row) {
        return;
      }
      row.querySelector('.subscription-update-result')!.textContent = resultToString(result);
    },
  });
}

// #endregion Subscription

async function main(): Promise<void> {
  dayjs.locale(chrome.i18n.getMessage('dayjsLocale'));
  dayjs.extend(relativeTime);

  for (const element of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    element.innerHTML = chrome.i18n.getMessage(element.dataset.i18n!);
  }

  const {
    blacklist,
    hideBlockLinks,
    hideControl,
    skipBlockDialog,
    sync,
    syncResult,
    subscriptions,
  } = await LocalStorage.load(
    'blacklist',
    'hideBlockLinks',
    'hideControl',
    'skipBlockDialog',
    'sync',
    'syncResult',
    'subscriptions',
  );
  setupGeneralSection(blacklist, hideBlockLinks, hideControl, skipBlockDialog);
  await setupEnginesSection();
  setupSyncSection(sync, syncResult);
  // #if CHROMIUM
  /*
  // #else
  const { os } = await browser.runtime.getPlatformInfo();
  if (os === 'android') {
    $('syncSection').classList.add('is-hidden');
  }
  // #endif
  // #if CHROMIUM
  */
  // #endif
  setupSubscriptionSection(subscriptions);
}

main();
