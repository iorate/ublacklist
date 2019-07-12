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
  Result, isNullResult, isErrorResult, getOptions, setOptions,
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
function $(id: 'importBlacklistDialog'): HTMLDivElement;
function $(id: 'importBlacklistDialog_background'): HTMLDivElement;
function $(id: 'importBlacklistDialog_blacklist'): HTMLTextAreaElement;
function $(id: 'importBlacklistDialog_cancel'): HTMLButtonElement;
function $(id: 'importBlacklistDialog_importBlacklist'): HTMLButtonElement;
function $(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

const $blacklist = $('blacklist');
const $hideBlockLinks = $('hideBlockLinks');
const $importBlacklistDialog = $('importBlacklistDialog');
const $importBlacklistDialog_blacklist = $('importBlacklistDialog_blacklist');

// #endregion Elements

function onSyncChanged(sync: boolean): void {
  for (const element of document.getElementsByClassName('sync-true')) {
    element.classList.toggle('is-hidden', !sync);
  }
  for (const element of document.getElementsByClassName('sync-false')) {
    element.classList.toggle('is-hidden', sync);
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
    syncResult: syncResultInit
  } = await getOptions('blacklist', 'hideBlockLinks', 'sync', 'syncResult');

  for (const element of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    element.innerHTML = chrome.i18n.getMessage(element.dataset.i18n!);
  }

// #region General
  $blacklist.value = blacklistInit;
  $blacklist.addEventListener('input', () => {
    $('saveBlacklist').disabled = false;
  });
  $('importBlacklist').addEventListener('click', () => {
    $importBlacklistDialog.classList.add('is-active');
    $importBlacklistDialog_blacklist.value = '';
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
  $('importBlacklistDialog_importBlacklist').addEventListener('click', () => {
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
}

main();
