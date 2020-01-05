import { apis } from './apis';
import { AltURL } from './utilities';
import { BlacklistUpdate, loadBlacklists } from './blacklist';

async function main(): Promise<void> {
  const blacklists = await loadBlacklists();
  const activeTab = (await apis.tabs.query({ active: true, currentWindow: true }))[0];
  const url = new AltURL(activeTab.url!);
  new BlacklistUpdate(document.getElementById('blacklistUpdateHost') as HTMLDivElement, () => {
    window.close();
  }).start(blacklists, url);
}

main();
