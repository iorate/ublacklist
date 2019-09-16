import { AltURL, loadBlacklists, BlacklistUpdate } from './blacklist';

function getCurrentURL(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ url }]) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(url);
      }
    });
  });
}

async function main(): Promise<void> {
  const blacklists = await loadBlacklists();
  const url = new AltURL(await getCurrentURL());

  customElements.define('blacklist-update', BlacklistUpdate);
  const blacklistUpdate = document.querySelector('blacklist-update') as BlacklistUpdate;
  blacklistUpdate.initialize(blacklists, url, () => {
    window.close();
  });
}

main();
