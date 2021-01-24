import { Fragment, FunctionComponent, h, render } from 'preact';
import { useLayoutEffect, useMemo } from 'preact/hooks';
import { searchEngineMatches } from '../common/search-engines';
import { Blacklist } from './blacklist';
import { BlockDialog } from './block-dialog';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { searchEngineSerpHandlers } from './search-engines/serp-handlers';
import { css, glob } from './styles';
import { SerpControl, SerpEntry, SerpHandler, SerpHandlerResult } from './types';
import { AltURL, MatchPattern, stringKeys, translate } from './utilities';

type SerpEntryWithState = SerpEntry & { blocked: boolean };

const Button: FunctionComponent<{ onClick: () => void }> = ({ children, onClick }) => {
  const class_ = useMemo(
    () =>
      css({
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        '&:focus:not(:focus-visible)': {
          outline: 'none',
        },
        '&:focus:not(:-moz-focusring)': {
          outline: 'none',
        },
      }),
    [],
  );
  return (
    <span
      class={`ub-button ${class_}`}
      role="link"
      tabIndex={0}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {children}
    </span>
  );
};

const Control: FunctionComponent<{
  blockedEntryCount: number;
  showBlockedEntries: boolean;
  onClick: () => void;
  onRender?: () => void;
}> = ({ blockedEntryCount, showBlockedEntries, onClick, onRender }) => {
  useLayoutEffect(() => onRender?.());
  return !blockedEntryCount ? null : (
    <>
      {blockedEntryCount === 1
        ? translate('content_singleSiteBlocked')
        : translate('content_multipleSitesBlocked', String(blockedEntryCount))}{' '}
      <Button onClick={onClick}>
        {translate(
          showBlockedEntries ? 'content_hideBlockedSitesLink' : 'content_showBlockedSitesLink',
        )}
      </Button>
    </>
  );
};

const Action: FunctionComponent<{
  blocked: boolean;
  onClick: () => void;
  onRender?: () => void;
}> = ({ blocked, onClick, onRender }) => {
  useLayoutEffect(() => onRender?.());
  return (
    <Button onClick={onClick}>
      {translate(blocked ? 'content_unblockSiteLink' : 'content_blockSiteLink')}
    </Button>
  );
};

class ContentScript {
  options: {
    blacklist: Blacklist;
    hideControls: boolean;
    hideActions: boolean;
    skipBlockDialog: boolean;
    enablePathDepth: boolean;
  } | null = null;
  readonly controls: SerpControl[] = [];
  readonly entries: SerpEntryWithState[] = [];
  readonly scopeStates: Record<
    string,
    { blockedEntryCount: number; showBlockedEntries: boolean }
  > = {};
  blockDialogRoot: ShadowRoot | null = null;

  constructor(readonly serpHandler: SerpHandler) {
    // onSerpStart
    this.onSerpStart();

    // onSerpHead, onSerpElement
    if (document.head) {
      this.onSerpHead();
    }
    new MutationObserver(records => {
      for (const record of records) {
        for (const addedNode of record.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            // #if DEVELOPMENT
            console.debug(addedNode.cloneNode(true));
            // #endif
            if (addedNode === document.head) {
              this.onSerpHead();
            }
            this.onSerpElement(addedNode);
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    // onSerpEnd
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onSerpEnd());
    } else {
      this.onSerpEnd();
    }
  }

  onSerpStart(): void {
    void (async () => {
      const options = await LocalStorage.load([
        'blacklist',
        'subscriptions',
        'hideControl',
        'hideBlockLinks',
        'skipBlockDialog',
        'enablePathDepth',
      ]);
      this.options = {
        blacklist: new Blacklist(
          options.blacklist,
          Object.values(options.subscriptions).map(subscription => subscription.blacklist),
        ),
        hideControls: options.hideControl,
        hideActions: options.hideBlockLinks,
        skipBlockDialog: options.skipBlockDialog,
        enablePathDepth: options.enablePathDepth,
      };
      this.rejudgeAllEntries();
    })();
    this.handleResult(this.serpHandler.onSerpStart());
  }

  onSerpHead(): void {
    glob({
      '.ub-hidden': {
        display: 'none !important',
      },
      '[data-ub-blocked="hidden"]': {
        display: 'none !important',
      },
    });
    this.handleResult(this.serpHandler.onSerpHead());
  }

  onSerpElement(element: HTMLElement): void {
    this.handleResult(this.serpHandler.onSerpElement(element));
  }

  onSerpEnd(): void {
    this.blockDialogRoot = document.body
      .appendChild(document.createElement('div'))
      .attachShadow({ mode: 'open' });
  }

  handleResult({ controls, entries }: SerpHandlerResult): void {
    this.controls.push(...controls);
    for (const entry of entries) {
      const entryWithState = { ...entry, blocked: false };
      this.entries.push(entryWithState);
      this.judgeEntry(entryWithState);
    }
    for (const control of entries.length ? this.controls : controls) {
      this.renderControl(control);
    }
  }

  judgeEntry(entry: SerpEntryWithState): void {
    if (!this.options) {
      return;
    }
    entry.blocked = this.options.blacklist.test(new AltURL(entry.url));
    if (entry.blocked) {
      const scopeState = this.scopeStates[entry.scope] ?? {
        blockedEntryCount: 0,
        showBlockedEntries: false,
      };
      ++scopeState.blockedEntryCount;
      this.scopeStates[entry.scope] = scopeState;
    }
    this.renderEntry(entry);
  }

  rejudgeAllEntries(): void {
    for (const scopeState of Object.values(this.scopeStates)) {
      scopeState.blockedEntryCount = 0;
    }
    for (const entry of this.entries) {
      this.judgeEntry(entry);
    }
    for (const scopeState of Object.values(this.scopeStates)) {
      if (!scopeState.blockedEntryCount) {
        scopeState.showBlockedEntries = false;
      }
    }
    for (const control of this.controls) {
      this.renderControl(control);
    }
  }

  renderControl(control: SerpControl): void {
    const scopeState = this.scopeStates[control.scope] ?? {
      blockedEntryCount: 0,
      showBlockedEntries: false,
    };
    control.root.classList.toggle(
      'ub-hidden',
      this.options?.hideControls || !scopeState.blockedEntryCount,
    );
    render(
      <Control
        blockedEntryCount={scopeState.blockedEntryCount}
        showBlockedEntries={scopeState.showBlockedEntries}
        onClick={() => {
          scopeState.showBlockedEntries = !scopeState.showBlockedEntries;
          for (const control of this.controls) {
            this.renderControl(control);
          }
          for (const entry of this.entries) {
            this.renderEntry(entry);
          }
        }}
        onRender={control.onRender}
      />,
      control.root,
    );
  }

  renderEntry(entry: SerpEntryWithState): void {
    if (entry.blocked) {
      entry.root.dataset.ubBlocked = this.scopeStates[entry.scope]?.showBlockedEntries
        ? 'visible'
        : 'hidden';
    } else {
      delete entry.root.dataset.ubBlocked;
    }
    entry.actionRoot.classList.toggle('ub-hidden', this.options?.hideActions ?? false);
    render(
      <Action
        blocked={entry.blocked}
        onClick={() => {
          if (!this.options || !this.blockDialogRoot) {
            return;
          }
          if (this.options.skipBlockDialog) {
            this.options.blacklist.createPatch(new AltURL(entry.url));
            this.options.blacklist.applyPatch();
            void sendMessage('set-blacklist', this.options.blacklist.toString(), 'content-script');
            this.rejudgeAllEntries();
          } else {
            this.renderBlockDialog(entry.url);
          }
        }}
        onRender={entry.onActionRender}
      />,
      entry.actionRoot,
    );
  }

  renderBlockDialog(url: string, open = true) {
    if (!this.options || !this.blockDialogRoot) {
      return;
    }
    render(
      <BlockDialog
        target={this.blockDialogRoot}
        open={open}
        close={() => this.renderBlockDialog(url, false)}
        url={url}
        blacklist={this.options.blacklist}
        enablePathDepth={this.options.enablePathDepth}
        onBlocked={() => {
          if (!this.options) {
            return;
          }
          void sendMessage('set-blacklist', this.options.blacklist.toString(), 'content-script');
          this.rejudgeAllEntries();
        }}
      />,
      this.blockDialogRoot,
    );
  }
}

function main() {
  const url = new AltURL(window.location.href);
  const id = stringKeys(searchEngineMatches).find(id =>
    searchEngineMatches[id].some(match => new MatchPattern(match).test(url)),
  );
  if (id) {
    const serpHandler = searchEngineSerpHandlers[id]();
    if (serpHandler) {
      new ContentScript(serpHandler);
    }
  }
}

main();
