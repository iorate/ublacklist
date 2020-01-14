import { apis } from './apis';
import { Blacklist } from './blacklist';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { PatchBlacklistForm } from './patch-blacklist-form';
import { AltURL } from './utilities';

async function main(): Promise<void> {
  const { blacklist, subscriptions } = await LocalStorage.load('blacklist', 'subscriptions');
  const b = new Blacklist(
    blacklist,
    Object.values(subscriptions).map(subscription => subscription.blacklist),
  );
  const url = new AltURL((await apis.tabs.query({ active: true, currentWindow: true }))[0].url!);
  new PatchBlacklistForm(
    document.getElementById('patchBlacklistFormHost') as HTMLDivElement,
    () => {
      window.close();
    },
  ).initialize(b, url, () => {
    sendMessage('set-blacklist', b.toString());
  });
}

main();
