import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/zh-tw';
dayjs.extend(relativeTime);
dayjs.locale(chrome.i18n.getMessage('dayjsLocale'));

import {
  lines, unlines,
  Result, isNullResult, isErrorResult, nullResult, SubscriptionId, Subscription, getOptions, setOptions,
  getBackgroundPage,
} from './common';

// #region Elements

function $(id: 'blacklist'): HTMLTextAreaElement;
function $(id: 'importBlacklist'): HTMLButtonElement;
function $(id: 'saveBlacklist'): HTMLButtonElement;
function $(id: 'hideBlockLinks'): HTMLInputElement;
function $(id: 'enableSync'): HTMLButtonElement;
function $(id: 'disableSync'): HTMLButtonElement;
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
function $(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

const $blacklist = $('blacklist');
const $hideBlockLinks = $('hideBlockLinks');
const $importBlacklistDialog = $('importBlacklistDialog');
const $importBlacklistDialog_blacklist = $('importBlacklistDialog_blacklist');
const $addSubscriptionDialog = $('addSubscriptionDialog');
const $showSubscriptionDialog = $('showSubscriptionDialog');

// #endregion Elements

function onSyncChanged(sync: boolean): void {
  for (const element of document.getElementsByClassName('is-hidden-sync')) {
    element.classList.toggle('is-hidden', sync);
  }
  for (const element of document.getElementsByClassName('is-hidden-not-sync')) {
    element.classList.toggle('is-hidden', !sync);
  }
  $('syncNow').disabled = !sync;
}

function onSyncResultChanged(syncResult: Result): void {
  let syncResultString: string;
  if (isNullResult(syncResult)) {
    syncResultString = chrome.i18n.getMessage('neverSynced');
  } else if (isErrorResult(syncResult)) {
    syncResultString = `${chrome.i18n.getMessage('error')}: ${syncResult.message}`;
  } else {
    syncResultString = dayjs(syncResult.timestamp).fromNow();
  }
  $('syncResult').textContent = syncResultString;
}

function updateResultToString(updateResult: Result): string {
  let updateResultString: string;
  if (isNullResult(updateResult)) {
    updateResultString = chrome.i18n.getMessage('neverUpdated');
  } else if (isErrorResult(updateResult)) {
    updateResultString = `${chrome.i18n.getMessage('error')}: ${updateResult.message}`;
  } else {
    updateResultString = dayjs(updateResult.timestamp).fromNow();
  }
  return updateResultString;
}

function onSubscriptionAdded(id: SubscriptionId, subscription: Subscription): void {
  const row = $('subscriptions').tBodies[0].insertRow();
  row.id = `subscription${id}`;
  row.innerHTML = `
    <td>
      ${subscription.name}
    </td>
    <td>
      ${subscription.url}
    </td>
    <td class="update-result">
      ${updateResultToString(subscription.updateResult)}
    </td>
    <td>
      <div class="dropdown is-right">
        <div class="dropdown-trigger">
          <button class="button more is-white is-rounded"></button>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-content">
            <a class="dropdown-item show-subscription">
              ${chrome.i18n.getMessage('show')}
            </a>
            <a class="dropdown-item update-subscription">
              ${chrome.i18n.getMessage('updateNow')}
            </a>
            <a class="dropdown-item remove-subscription">
              ${chrome.i18n.getMessage('remove')}
            </a>
          </div>
        </div>
      </div>
    </td>
  `;
  row.querySelector('.more')!.addEventListener('click', () => {
    row.querySelector('.dropdown')!.classList.toggle('is-active');
  });
  row.querySelector('.more')!.addEventListener('blur', () => {
    row.querySelector('.dropdown')!.classList.remove('is-active');
  });
  row.querySelector('.show-subscription')!.addEventListener('mousedown', async () => {
    const { subscriptions: { [id]: subscription } } = await getOptions('subscriptions');
    if (!subscription) {
      return;
    }
    $('showSubscriptionDialog_name').textContent = subscription.name;
    $('showSubscriptionDialog_blacklist').value = subscription.blacklist;
    $showSubscriptionDialog.classList.add('is-active');
  });
  row.querySelector('.update-subscription')!.addEventListener('mousedown', async () => {
    const backgroundPage = await getBackgroundPage();
    backgroundPage.updateSubscription(id);
  });
  row.querySelector('.remove-subscription')!.addEventListener('mousedown', async () => {
    const backgroundPage = await getBackgroundPage();
    backgroundPage.removeSubscription(id);
    $('subscriptions').deleteRow(row.rowIndex);
    if ($('subscriptions').tBodies[0].rows.length === 0) {
      $('noSubscriptionAdded').classList.remove('is-hidden');
      $('updateAllSubscriptions').disabled = true;
    }
  });
  $('noSubscriptionAdded').classList.add('is-hidden');
  $('updateAllSubscriptions').disabled = false;
}

async function requestOriginPermission(origin: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    chrome.permissions.request({ origins: [origin] }, granted => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(granted);
      }
    });
  });
}

async function main(): Promise<void> {
  const backgroundPage = await getBackgroundPage();
  const {
    blacklist: blacklistInit,
    hideBlockLinks: hideBlockLinksInit,
    sync: syncInit,
    syncResult: syncResultInit,
    subscriptions: subscriptionsInit
  } = await getOptions('blacklist', 'hideBlockLinks', 'sync', 'syncResult', 'subscriptions');

  for (const element of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    element.innerHTML = chrome.i18n.getMessage(element.dataset.i18n!);
  }

// #region General
  $blacklist.value = blacklistInit;
  $blacklist.addEventListener('input', () => {
    $('saveBlacklist').disabled = false;
  });
  $('importBlacklist').addEventListener('click', () => {
    $importBlacklistDialog_blacklist.value = '';
    $importBlacklistDialog.classList.add('is-active');
  });
  $('saveBlacklist').addEventListener('click', () => {
    backgroundPage.setBlacklist($blacklist.value);
    $('saveBlacklist').disabled = true;
  });
  $hideBlockLinks.checked = hideBlockLinksInit;
  $hideBlockLinks.addEventListener('change', () => {
    setOptions({ hideBlockLinks: $hideBlockLinks.checked });
  });

  $('importBlacklistDialog_background').addEventListener('click', () => {
    $importBlacklistDialog.classList.remove('is-active');
  });
  $('importBlacklistDialog_cancel').addEventListener('click', () => {
    $importBlacklistDialog.classList.remove('is-active');
  });
  $('importBlacklistDialog_import').addEventListener('click', () => {
    const rules: string[] = [];
    for (const domain of lines($importBlacklistDialog_blacklist.value)) {
      if (/^[^/*]+$/.test(domain)) {
        rules.push(`*://*.${domain}/*`);
      }
    }
    $blacklist.value = unlines([...lines($blacklist.value), ...rules]);
    $blacklist.scrollTop = $blacklist.scrollHeight;
    $('saveBlacklist').disabled = false;
    $importBlacklistDialog.classList.remove('is-active');
  });
// #endregion General

// #region Sync
  onSyncChanged(syncInit);
  onSyncResultChanged(syncResultInit);
  $('disableSync').addEventListener('click', () => {
    backgroundPage.setSync(false);
    onSyncChanged(false);
  });
  $('enableSync').addEventListener('click', async () => {
// #if BROWSER === 'firefox'
    const granted = await requestOriginPermission('https://www.googleapis.com/*');
    if (!granted) {
      return;
    }
// #endif
    await backgroundPage.getAuthToken(true);
    backgroundPage.setSync(true);
    onSyncChanged(true);
  });
  $('syncNow').addEventListener('click', () => {
    backgroundPage.syncBlacklist();
  });
  backgroundPage.addEventHandler('syncStart', () => {
    $('syncResult').textContent = chrome.i18n.getMessage('syncing');
  });
  backgroundPage.addEventHandler('syncEnd', ({ result }) => {
    onSyncResultChanged(result);
  });
// #endregion Sync

// #region Subscription
  for (const id of Object.keys(subscriptionsInit).map(Number)) {
    onSubscriptionAdded(id, subscriptionsInit[id]);
  }
  $('addSubscription').addEventListener('click', () => {
    $('addSubscriptionDialog_name').value = '';
    $('addSubscriptionDialog_url').value = '';
    $('addSubscriptionDialog_add').disabled = true;
    $('addSubscriptionDialog').classList.add('is-active');
  });
  $('updateAllSubscriptions').addEventListener('click', () => {
    backgroundPage.updateAllSubscriptions();
  });
  $('addSubscriptionDialog').addEventListener('input', () => {
    $('addSubscriptionDialog_add').disabled = !$('addSubscriptionDialog_name').checkValidity() || !$('addSubscriptionDialog_url').checkValidity();
  });
  $('addSubscriptionDialog_background').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_cancel').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_add').addEventListener('click', async () => {
    const url = $('addSubscriptionDialog_url').value;
    const granted = await requestOriginPermission(url);
    if (!granted) {
      return;
    }
    $('addSubscriptionDialog').classList.remove('is-active');
    const subscription = {
      name: $('addSubscriptionDialog_name').value,
      url: $('addSubscriptionDialog_url').value,
      blacklist: '',
      updateResult: nullResult(),
    };
    const id = await backgroundPage.addSubscription(subscription);
    onSubscriptionAdded(id, subscription);
    backgroundPage.updateSubscription(id);
  });
  $('showSubscriptionDialog_background').addEventListener('click', () => {
    $('showSubscriptionDialog').classList.remove('is-active');
  });
  $('showSubscriptionDialog_ok').addEventListener('click', () => {
    $('showSubscriptionDialog').classList.remove('is-active');
  });
  backgroundPage.addEventHandler('updateStart', ({ id }) => {
    const row = document.getElementById(`subscription${id}`);
    if (!row) {
      return;
    }
    row.querySelector('.update-result')!.textContent = chrome.i18n.getMessage('updating');
  });
  backgroundPage.addEventHandler('updateEnd', ({ id, result }) => {
    const row = document.getElementById(`subscription${id}`);
    if (!row) {
      return;
    }
    row.querySelector('.update-result')!.textContent = updateResultToString(result);
  });
// #endregion Subscription
}

main();
