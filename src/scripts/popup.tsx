import { h, render } from 'preact';
import { apis } from './apis';
import { Blacklist } from './blacklist';
import { BlockForm } from './block-form';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import popupStyle from '!!raw-loader!extract-loader!css-loader!sass-loader!../styles/popup.scss';

async function main(): Promise<void> {
  const url = (await apis.tabs.query({ active: true, currentWindow: true }))[0].url;
  if (url == null) {
    throw new Error('No URL');
  }

  const options = await LocalStorage.load(['blacklist', 'subscriptions', 'enablePathDepth']);
  const blacklist = new Blacklist(
    options.blacklist,
    Object.values(options.subscriptions).map(subscription => subscription.blacklist),
  );

  render(popupStyle, document.head.appendChild(document.createElement('style')));

  render(
    <BlockForm
      open={true}
      setOpen={open => {
        if (!open) {
          window.close();
        }
      }}
      blacklist={blacklist}
      url={url}
      enablePathDepth={options.enablePathDepth}
      onBlocked={() => sendMessage('set-blacklist', blacklist.toString(), 'popup')}
    />,
    document.body.attachShadow({ mode: 'open' }),
  );
}

void main();
