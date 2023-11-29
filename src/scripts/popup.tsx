import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { SEARCH_ENGINES } from '../common/search-engines';
import icon from '../icons/icon.svg';
import { BlockEmbeddedDialog, BlockEmbeddedDialogProps } from './block-dialog';
import { browser } from './browser';
import { Baseline } from './components/baseline';
import { Button, LinkButton } from './components/button';
import { FOCUS_DEFAULT_CLASS, FOCUS_END_CLASS, FOCUS_START_CLASS } from './components/constants';
import { DialogFooter, DialogHeader, DialogTitle, EmbeddedDialog } from './components/dialog';
import { Icon } from './components/icon';
import { Row, RowItem } from './components/row';
import { AutoThemeProvider } from './components/theme';
import { useClassName } from './components/utilities';
import { InteractiveRuleset } from './interactive-ruleset';
import { loadFromLocalStorage, saveToLocalStorage } from './local-storage';
import { translate } from './locales';
import { sendMessage } from './messages';
import { Ruleset } from './ruleset';
import { MatchPattern, makeAltURL } from './utilities';

async function openOptionsPage(): Promise<void> {
  await sendMessage('open-options-page');
  // https://github.com/iorate/ublacklist/issues/378
  /* #if FIREFOX
  window.close();
  */
  // #endif
}

const Loading: React.VFC = () => {
  const className = useClassName(
    () => ({
      height: 'calc(12.5em + 24px)', // The height of `BlockEmbeddedDialog`
      width: '360px',
    }),
    [],
  );
  return <div className={className} />;
};

type ActivateEmbeddedDialogProps = {
  active: boolean;
  match: string;
  tabId: number;
};

const ActivateEmbeddedDialog: React.VFC<ActivateEmbeddedDialogProps> = ({
  active,
  match,
  tabId,
}) => (
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
          <LinkButton className={FOCUS_START_CLASS} onClick={openOptionsPage}>
            {translate('popup_openOptionsLink')}
          </LinkButton>
        </RowItem>
        <RowItem>
          {active ? (
            <Row>
              <RowItem>
                <Button
                  className={`${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}`}
                  primary
                  onClick={() => window.close()}
                >
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
                  className={`${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}`}
                  primary
                  onClick={async () => {
                    // In Chrome, the popup is closed immediately after 'permissions.request'!
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=952645
                    const [granted] = await Promise.all([
                      browser.permissions.request({ origins: [match] }),
                      // #if CHROME_MV3
                      browser.scripting.executeScript({
                        target: { tabId },
                        files: ['/scripts/content-script.js'],
                      }),
                      /* #else
                      browser.tabs.executeScript(tabId, {
                        file: '/scripts/content-script.js',
                      }),
                      */
                      // #endif
                    ]);
                    if (!granted) {
                      return;
                    }
                    await sendMessage('register-content-scripts');
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
);

const Popup: React.VFC = () => {
  const [state, setState] = useState<
    | { type: 'loading' }
    | { type: 'activate'; props: ActivateEmbeddedDialogProps }
    | { type: 'block'; props: BlockEmbeddedDialogProps }
  >({ type: 'loading' });
  useEffect(() => {
    void (async () => {
      const [{ id: tabId, url, title = null }] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabId == null || url == null) {
        return;
      }
      const altURL = makeAltURL(url);
      const match =
        altURL &&
        Object.values(SEARCH_ENGINES)
          .flatMap(({ contentScripts }) => contentScripts.flatMap(({ matches }) => matches))
          .find(match => new MatchPattern(match).test(altURL));
      if (match != null) {
        // #if CHROME_MV3
        const [{ result: active }] = await browser.scripting.executeScript({
          target: { tabId },
          files: ['/scripts/active.js'],
        });
        /* #else
        const [active] = await browser.tabs.executeScript(tabId, {
          file: '/scripts/active.js',
        });
        */
        // #endif
        setState({
          type: 'activate',
          props: {
            active: Boolean(active),
            match,
            tabId,
          },
        });
      } else {
        const options = await loadFromLocalStorage([
          'blacklist',
          'compiledRules',
          'subscriptions',
          'enablePathDepth',
          'blockWholeSite',
        ]);
        const ruleset = new InteractiveRuleset(
          options.blacklist,
          options.compiledRules !== false
            ? options.compiledRules
            : Ruleset.compile(options.blacklist),
          Object.values(options.subscriptions)
            .filter(subscription => subscription.enabled ?? true)
            .map(
              subscription => subscription.compiledRules ?? Ruleset.compile(subscription.blacklist),
            ),
        );
        setState({
          type: 'block',
          props: {
            blockWholeSite: options.blockWholeSite,
            close: () => window.close(),
            enablePathDepth: options.enablePathDepth,
            openOptionsPage,
            ruleset,
            title,
            url,
            onBlocked: () => saveToLocalStorage({ blacklist: ruleset.toString() }, 'popup'),
          },
        });
      }
    })();
  }, []);
  return (
    <AutoThemeProvider>
      <Baseline>
        {state.type === 'loading' ? (
          <Loading />
        ) : state.type === 'activate' ? (
          <ActivateEmbeddedDialog {...state.props} />
        ) : (
          <BlockEmbeddedDialog {...state.props} />
        )}
      </Baseline>
    </AutoThemeProvider>
  );
};

function main(): void {
  document.documentElement.lang = translate('lang');
  ReactDOM.render(<Popup />, document.body.appendChild(document.createElement('div')));
}

void main();
