/* eslint-disable import/no-duplicates */
import React from 'react';
import ReactDOM from 'react-dom';
/* eslint-enable */
import { searchEngineMatches } from '../common/search-engines';
import icon from '../icons/icon.svg';
import { apis } from './apis';
import { Blacklist } from './blacklist';
import { BlockPopup } from './block-dialog';
import { Baseline } from './components/baseline';
import { Button, LinkButton } from './components/button';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from './components/constants';
import { DialogFooter, DialogHeader, DialogTitle, EmbeddedDialog } from './components/dialog';
import { Icon } from './components/icon';
import { Row, RowItem } from './components/row';
import { AutoThemeProvider } from './components/theme';
import { loadFromLocalStorage, saveToLocalStorage } from './local-storage';
import { translate } from './locales';
import { sendMessage } from './messages';
import { MatchPattern, makeAltURL } from './utilities';

const ActivatePopup: React.VFC<{
  active: boolean;
  match: string;
  tabId: number;
}> = ({ active, match, tabId }) => (
  <AutoThemeProvider>
    <Baseline>
      <EmbeddedDialog close={() => window.close()} width="360px">
        <DialogHeader>
          <DialogTitle id="title">
            <Row>
              <RowItem>
                <Icon iconSize="24px" url={icon} />
              </RowItem>
              <RowItem expanded>{translate(active ? 'popup_active' : 'popup_inactive')}</RowItem>
            </Row>
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Row multiline right>
            <RowItem expanded>
              <LinkButton
                className={FOCUS_START_CLASS}
                onClick={() => sendMessage('open-options-page')}
              >
                {translate('popup_openOptionsLink')}
              </LinkButton>
            </RowItem>
            <RowItem>
              {active ? (
                <Row>
                  <RowItem>
                    <Button className={FOCUS_END_CLASS} primary onClick={() => window.close()}>
                      {translate('okButton')}
                    </Button>
                  </RowItem>
                </Row>
              ) : (
                <Row>
                  <RowItem>
                    <Button onClick={() => window.close()}>{translate('cancelButton')}</Button>
                  </RowItem>
                  <RowItem>
                    <Button
                      className={FOCUS_END_CLASS}
                      primary
                      onClick={async () => {
                        // In Chrome, the popup is closed immediately after 'permissions.request'!
                        // https://bugs.chromium.org/p/chromium/issues/detail?id=952645
                        const [granted] = await Promise.all([
                          apis.permissions.request({ origins: [match] }),
                          /* #if CHROME_MV3
                          chrome.scripting.executeScript({
                            target: { tabId },
                            files: ['/scripts/content-script.js'],
                          }),
                          */
                          // #else
                          apis.tabs.executeScript(tabId, {
                            file: '/scripts/content-script.js',
                            // #if !SAFARI
                            runAt: 'document_start',
                            // #endif
                          }),
                          // #endif
                        ]);
                        if (!granted) {
                          return;
                        }
                        await sendMessage('activate');
                        window.close();
                      }}
                    >
                      {translate('popup_activateButton')}
                    </Button>
                  </RowItem>
                </Row>
              )}
            </RowItem>
          </Row>
        </DialogFooter>
      </EmbeddedDialog>
    </Baseline>
  </AutoThemeProvider>
);

async function openActivatePopup(tabId: number, match: string): Promise<void> {
  /* #if CHROME_MV3
  const [{ result: active }] = await chrome.scripting.executeScript({
    target: { tabId },
    files: ['/scripts/active.js'],
  });
  */
  // #else
  const [active] = await apis.tabs.executeScript(tabId, {
    file: '/scripts/active.js',
    // #if !SAFARI
    runAt: 'document_start',
    // #endif
  });
  // #endif

  document.documentElement.lang = translate('lang');
  ReactDOM.render(<ActivatePopup active={!!active} match={match} tabId={tabId} />, document.body);
}

async function openBlockPopup(url: string, title: string | null): Promise<void> {
  const options = await loadFromLocalStorage([
    'blacklist',
    'subscriptions',
    'enablePathDepth',
    'blockWholeSite',
  ]);
  const blacklist = new Blacklist(
    options.blacklist,
    Object.values(options.subscriptions).map(subscription => subscription.blacklist),
  );

  document.documentElement.lang = translate('lang');
  ReactDOM.render(
    <BlockPopup
      blacklist={blacklist}
      blockWholeSite={options.blockWholeSite}
      close={() => window.close()}
      enablePathDepth={options.enablePathDepth}
      title={title}
      url={url}
      onBlocked={() => saveToLocalStorage({ blacklist: blacklist.toString() }, 'popup')}
    />,
    document.body,
  );
}

async function main(): Promise<void> {
  const [{ id: tabId, url, title = null }] = await apis.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tabId == null || url == null) {
    throw new Error('tab.id or tab.url missing');
  }

  const altURL = makeAltURL(url);
  if (altURL) {
    const match = Object.values(searchEngineMatches)
      .flat()
      .find(match => new MatchPattern(match).test(altURL));
    if (match != null) {
      await openActivatePopup(tabId, match);
    } else {
      await openBlockPopup(url, title);
    }
  } else {
    // 'url' may be an empty string in Safari
    await openBlockPopup(url, title);
  }
}

void main();
