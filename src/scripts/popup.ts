import { apis } from './apis';
import { Blacklist } from './blacklist';
import { BlockForm } from './block-form';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { AltURL } from './utilities';

async function main(): Promise<void> {
  const { blacklist: b, subscriptions } = await LocalStorage.load('blacklist', 'subscriptions');
  const blacklist = new Blacklist(
    b,
    Object.values(subscriptions).map(subscription => subscription.blacklist),
  );
  const url = new AltURL((await apis.tabs.query({ active: true, currentWindow: true }))[0].url!);
  new BlockForm(document.getElementById('block-form') as HTMLDivElement, () => {
    window.close();
  }).initialize(blacklist, url, () => {
    sendMessage('set-blacklist', blacklist.toString());
  });
}

main();
