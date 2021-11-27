/* eslint-disable import/no-duplicates */
import React, { useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
/* eslint-enable */
import { searchEngineMatches } from '../common/search-engines';
import { Blacklist } from './blacklist';
import { BlockDialog } from './block-dialog';
import { loadFromLocalStorage, saveToLocalStorage } from './local-storage';
import { translate } from './locales';
import { searchEngineSerpHandlers } from './search-engines/serp-handlers';
import { css, glob } from './styles';
import { DialogTheme, SerpControl, SerpEntry, SerpHandler, SerpHandlerResult } from './types';
import { AltURL, MatchPattern, stringKeys } from './utilities';

const Button: React.VFC<{ children: React.ReactNode; onClick: () => void }> = ({
  children,
  onClick,
}) => {
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
      className={`ub-button ${class_}`}
      role="button"
      tabIndex={0}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.click();
        }
      }}
    >
      {children}
    </span>
  );
};

const Control: React.VFC<{
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

const Action: React.VFC<{
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
    skipBlockDialog: boolean;
    hideControls: boolean;
    hideActions: boolean;
    enablePathDepth: boolean;
    blockWholeSite: boolean;
    linkColor: string | null;
    blockColor: string | null;
    highlightColors: string[];
    dialogTheme: DialogTheme | null;
  } | null = null;
  readonly controls: SerpControl[] = [];
  readonly entries: SerpEntry[] = [];
  readonly scopeStates: Record<string, { blockedEntryCount: number; showBlockedEntries: boolean }> =
    {};
  blockDialogRoot: ShadowRoot | null = null;
  didSerpHead = false;

  constructor(readonly serpHandler: SerpHandler) {
    // onSerpStart
    this.onSerpStart();

    // onSerpHead, onSerpElement
    new MutationObserver(records => {
      for (const record of records) {
        for (const addedNode of record.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            // #if DEVELOPMENT
            console.debug(addedNode.cloneNode(true));
            // #endif
            if (addedNode === document.head && this.options) {
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
      const options = await loadFromLocalStorage([
        'blacklist',
        'subscriptions',
        'skipBlockDialog',
        'hideControl',
        'hideBlockLinks',
        'enablePathDepth',
        'blockWholeSite',
        'linkColor',
        'blockColor',
        'highlightColors',
        'dialogTheme',
      ]);

      this.options = {
        blacklist: new Blacklist(
          options.blacklist,
          Object.values(options.subscriptions).map(subscription => subscription.blacklist),
        ),
        skipBlockDialog: options.skipBlockDialog,
        hideControls: options.hideControl,
        hideActions: options.hideBlockLinks,
        enablePathDepth: options.enablePathDepth,
        blockWholeSite: options.blockWholeSite,
        linkColor: options.linkColor !== 'default' ? options.linkColor : null,
        blockColor: options.blockColor !== 'default' ? options.blockColor : null,
        highlightColors: options.highlightColors,
        dialogTheme: options.dialogTheme !== 'default' ? options.dialogTheme : null,
      };

      if (document.head) {
        this.onSerpHead();
      }

      this.rejudgeAllEntries();
    })();
    this.handleResult(this.serpHandler.onSerpStart());
  }

  onSerpHead(): void {
    if (this.didSerpHead || !document.head || !this.options) {
      return;
    }
    this.didSerpHead = true;

    glob({
      '.ub-hidden': {
        display: 'none !important',
      },
      '[data-ub-blocked="hidden"]': {
        display: 'none !important',
      },
    });
    this.handleResult(
      this.serpHandler.onSerpHead({
        linkColor: this.options.linkColor,
        blockColor: this.options.blockColor,
        highlightColors: this.options.highlightColors,
      }),
    );
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
      this.entries.push(entry);
      this.judgeEntry(entry);
    }
    for (const control of entries.length ? this.controls : controls) {
      this.renderControl(control);
    }
  }

  judgeEntry(entry: SerpEntry): void {
    if (!this.options) {
      return;
    }
    entry.state = this.options.blacklist.test(entry.props);
    if (entry.state === 0) {
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
    ReactDOM.render(
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
        {...(control.onRender ? { onRender: control.onRender } : {})}
      />,
      control.root,
    );
  }

  renderEntry(entry: SerpEntry): void {
    delete entry.root.dataset.ubBlocked;
    delete entry.root.dataset.ubHighlight;
    if (entry.state === 0) {
      entry.root.dataset.ubBlocked = this.scopeStates[entry.scope]?.showBlockedEntries
        ? 'visible'
        : 'hidden';
    } else if (entry.state >= 2) {
      entry.root.dataset.ubHighlight = String(entry.state - 1);
    }
    entry.actionRoot.classList.toggle('ub-hidden', this.options?.hideActions ?? false);
    ReactDOM.render(
      <Action
        blocked={entry.state === 0}
        onClick={() => {
          if (!this.options || !this.blockDialogRoot) {
            return;
          }
          if (this.options.skipBlockDialog) {
            this.options.blacklist.createPatch(entry.props, this.options.blockWholeSite);
            this.options.blacklist.applyPatch();
            void saveToLocalStorage(
              { blacklist: this.options.blacklist.toString() },
              'content-script',
            );
            this.rejudgeAllEntries();
          } else {
            this.renderBlockDialog(entry.props.url.toString(), entry.props.title);
          }
        }}
        {...(entry.onActionRender ? { onRender: entry.onActionRender } : {})}
      />,
      entry.actionRoot,
    );
  }

  renderBlockDialog(url: string, title: string | null, open = true) {
    if (!this.options || !this.blockDialogRoot) {
      return;
    }
    ReactDOM.render(
      <BlockDialog
        blacklist={this.options.blacklist}
        blockWholeSite={this.options.blockWholeSite}
        close={() => this.renderBlockDialog(url, title, false)}
        enablePathDepth={this.options.enablePathDepth}
        open={open}
        target={this.blockDialogRoot}
        theme={this.options.dialogTheme ?? this.serpHandler.getDialogTheme()}
        title={title}
        url={url}
        onBlocked={() => {
          if (!this.options) {
            return;
          }
          void saveToLocalStorage(
            { blacklist: this.options.blacklist.toString() },
            'content-script',
          );
          this.rejudgeAllEntries();
        }}
      />,
      this.blockDialogRoot,
    );
  }
}

function main() {
  if (document.documentElement.dataset.ubActive) {
    return;
  }
  document.documentElement.dataset.ubActive = '1';

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
