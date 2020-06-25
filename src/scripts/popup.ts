import { apis } from './apis';
import { Blacklist } from './blacklist';
import { BlockForm } from './block-form';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { AltURL } from './utilities';

async function main(): Promise<void> {
  const options = await LocalStorage.load('blacklist', 'subscriptions', 'enablePathDepth');
  const blacklist = new Blacklist(
    options.blacklist,
    Object.values(options.subscriptions).map(subscription => subscription.blacklist),
  );
  const url = new AltURL((await apis.tabs.query({ active: true, currentWindow: true }))[0].url!);
  const blockForm = new BlockForm(document.getElementById('block-form') as HTMLDivElement, () => {
    window.close();
  });
  if (options.enablePathDepth) {
    blockForm.enablePathDepth();
  }
  blockForm.initialize(blacklist, url, async () => {
    await sendMessage('set-blacklist', blacklist.toString());
  });
}

main();
