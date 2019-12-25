import { AltURL } from './utilities';
import { BlacklistUpdate, loadBlacklists } from './blacklist';

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

  new BlacklistUpdate(document.getElementById('blacklistUpdateHost') as HTMLDivElement, () => {
    window.close();
  }).start(blacklists, url);
}

main();
