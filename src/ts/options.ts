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
  Result, isErrorResult, SubscriptionId, Subscription, Subscriptions, getOptions, setOptions,
  addMessageListener,
  BackgroundPage, getBackgroundPage,
} from './common';

// #region Elements

function $(id: 'blacklist'): HTMLTextAreaElement;
function $(id: 'importBlacklist'): HTMLButtonElement;
function $(id: 'saveBlacklist'): HTMLButtonElement;
function $(id: 'hideBlockSiteLinks'): HTMLInputElement;
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
function $(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

const $blacklist = $('blacklist');

// #endregion Elements

function resultToString(result: Result): string {
  if (isErrorResult(result)) {
    return chrome.i18n.getMessage('error', result.message);
  } else {
    return dayjs(result.timestamp).fromNow();
  }
}

async function requestSiteAccess(url: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const u = new URL(url);
    chrome.permissions.request({ origins: [`${u.protocol}//${u.hostname}/`] }, granted => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(granted);
      }
    });
  });
}

// #region General

function setupGeneralSection(backgroundPage: BackgroundPage, blacklist: string, hideBlockLinks: boolean): void {
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
    backgroundPage.setBlacklist($blacklist.value);
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
    setOptions({ hideBlockLinks: $('hideBlockSiteLinks').checked });
  });
}

// #endregion General

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
  $('syncResult').textContent = syncResult ? resultToString(syncResult) : chrome.i18n.getMessage('options_syncNever');
}

function setupSyncSection(backgroundPage: BackgroundPage, sync: boolean, syncResult: Result | null) {
  onSyncChanged(sync);
  onSyncResultChanged(syncResult);
  $('turnOnSync').addEventListener('click', async () => {
// #if BROWSER === 'firefox'
    const granted = await requestSiteAccess('https://www.googleapis.com/');
    if (!granted) {
      return;
    }
// #endif
    try {
      await backgroundPage.getAuthToken(true);
    } catch (e) {
      return;
    }
    onSyncChanged(true);
    backgroundPage.setSync(true);
  });
  $('turnOffSync').addEventListener('click', () => {
    onSyncChanged(false);
    backgroundPage.setSync(false);
  });
  $('syncNow').addEventListener('click', () => {
    backgroundPage.syncBlacklist();
  });

  addMessageListener('syncStart', () => {
    $('syncResult').textContent = chrome.i18n.getMessage('options_syncRunning');
  });
  addMessageListener('syncEnd', ({ result }) => {
    onSyncResultChanged(result);
  });
}

// #endregion Sync

// #region Subscription

function onSubscriptionAdded(id: SubscriptionId, subscription: Subscription): void {
  const row = $('subscriptions').tBodies[0].insertRow();
  row.id = `subscription${id}`;
  row.innerHTML = `
    <td class="subscription-name">
      ${subscription.name}
    </td>
    <td class="subscription-url">
      ${subscription.url}
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
            <a class="dropdown-item subscription-menu-show">
              ${chrome.i18n.getMessage('options_showSubscriptionMenu')}
            </a>
            <a class="dropdown-item subscription-menu-update">
              ${chrome.i18n.getMessage('options_updateSubscriptionNowMenu')}
            </a>
            <a class="dropdown-item subscription-menu-remove">
              ${chrome.i18n.getMessage('options_removeSubscriptionMenu')}
            </a>
          </div>
        </div>
      </div>
    </td>
  `;
  row.querySelector('.subscription-menu-button')!.addEventListener('click', () => {
    row.querySelector('.dropdown')!.classList.toggle('is-active');
  });
  row.querySelector('.subscription-menu-button')!.addEventListener('blur', () => {
    row.querySelector('.dropdown')!.classList.remove('is-active');
  });
  row.querySelector('.subscription-menu-show')!.addEventListener('mousedown', async () => {
    const { subscriptions: { [id]: subscription } } = await getOptions('subscriptions');
    if (!subscription) {
      return;
    }
    $('showSubscriptionDialog').classList.add('is-active');
    $('showSubscriptionDialog_name').textContent = subscription.name;
    $('showSubscriptionDialog_blacklist').value = subscription.blacklist;
    $('showSubscriptionDialog_ok').focus();
  });
  row.querySelector('.subscription-menu-update')!.addEventListener('mousedown', async () => {
    const backgroundPage = await getBackgroundPage();
    backgroundPage.updateSubscription(id);
  });
  row.querySelector('.subscription-menu-remove')!.addEventListener('mousedown', async () => {
    $('subscriptions').deleteRow(row.rowIndex);
    if (!$('subscriptions').tBodies[0].rows.length) {
      $('noSubscriptionAdded').classList.remove('is-hidden');
      $('updateAllSubscriptions').disabled = true;
    }
    const backgroundPage = await getBackgroundPage();
    backgroundPage.removeSubscription(id);
  });

  $('noSubscriptionAdded').classList.add('is-hidden');
  $('updateAllSubscriptions').disabled = false;
}

function setupSubscriptionSection(backgroundPage: BackgroundPage, subscriptions: Subscriptions) {
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
    backgroundPage.updateAllSubscriptions();
  });

  $('addSubscriptionDialog').addEventListener('input', () => {
    $('addSubscriptionDialog_add').disabled =
      !$('addSubscriptionDialog_name').checkValidity() || !$('addSubscriptionDialog_url').checkValidity();
  });
  $('addSubscriptionDialog_background').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_cancel').addEventListener('click', () => {
    $('addSubscriptionDialog').classList.remove('is-active');
  });
  $('addSubscriptionDialog_add').addEventListener('click', async () => {
    const url = $('addSubscriptionDialog_url').value;
    const granted = await requestSiteAccess(url);
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

  addMessageListener('updateStart', ({ id }) => {
    const row = document.getElementById(`subscription${id}`);
    if (!row) {
      return;
    }
    row.querySelector('.subscription-update-result')!.textContent = chrome.i18n.getMessage('options_subscriptionUpdateRunning');
  });
  addMessageListener('updateEnd', ({ id, result }) => {
    const row = document.getElementById(`subscription${id}`);
    if (!row) {
      return;
    }
    row.querySelector('.subscription-update-result')!.textContent = resultToString(result);
  });
}

// #endregion Subscription

async function main(): Promise<void> {
  for (const element of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    element.innerHTML = chrome.i18n.getMessage(element.dataset.i18n!);
  }

  const backgroundPage = await getBackgroundPage();
  const { blacklist, hideBlockLinks, sync, syncResult, subscriptions } =
    await getOptions('blacklist', 'hideBlockLinks', 'sync', 'syncResult', 'subscriptions');

  setupGeneralSection(backgroundPage, blacklist, hideBlockLinks);

  setupSyncSection(backgroundPage, sync, syncResult);
// #if BROWSER === 'firefox'
  const { os } = await browser.runtime.getPlatformInfo();
  if (os === 'android') {
    $('syncSection').classList.add('is-hidden');
  }
// #endif

  setupSubscriptionSection(backgroundPage, subscriptions);
}

main();
