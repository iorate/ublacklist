import mobile from 'is-mobile';
import { Fragment, FunctionComponent, h, render } from 'preact';
import { Blacklist } from './blacklist';
import { BlockDialog } from './block-dialog';
import contentScriptStyle from './content-script.scss';
import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { supportedSearchEngines } from './supported-search-engines';
import { SearchEngineHandlers } from './types';
import { AltURL, MatchPattern, assertNonNull, translate } from './utilities';

const optionKeys = [
  'blacklist',
  'subscriptions',
  'hideControl',
  'hideBlockLinks',
  'skipBlockDialog',
  'enablePathDepth',
] as const;

// #region LinkButton
type LinkButtonProps = {
  class: string;
  onClick(): void;
};

const LinkButton: FunctionComponent<LinkButtonProps> = props => (
  <span
    class={`ub-link-button ${props.class}`}
    tabIndex={0}
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      props.onClick();
    }}
    onKeyDown={e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.click();
      }
    }}
  >
    {props.children}
  </span>
);
// #endregion LinkButton

class Main {
  private readonly style: string;
  private readonly handlers: SearchEngineHandlers;
  private queuedEntries: HTMLElement[] = [];
  private blockedEntryCount = 0;

  private options: {
    blacklist: Blacklist;
    skipBlockDialog: boolean;
    enablePathDepth: boolean;
  } | null = null;

  private domContent: {
    control: HTMLElement | null;
    adjustControl: ((control: HTMLElement) => void) | null;
    blockDialogRoot: ShadowRoot;
  } | null = null;

  constructor() {
    // style, handlers
    const url = new AltURL(window.location.href);
    const searchEngine = Object.values(supportedSearchEngines).find(searchEngine =>
      searchEngine.matches.some(match => new MatchPattern(match).test(url)),
    );
    if (!searchEngine) {
      throw new Error('No search engine');
    }
    this.style = searchEngine.style;
    const handlers = searchEngine.getHandlers(
      window.location.href,
      mobile({ ua: window.navigator.userAgent, tablet: true }),
    );
    if (!handlers) {
      this.handlers = {} as SearchEngineHandlers; // never used
      return;
    }
    this.handlers = handlers;

    // options
    void LocalStorage.load(optionKeys).then(this.onOptionsLoaded);

    // domContent
    if (document.readyState !== 'loading') {
      this.onDOMContentLoaded();
    } else {
      document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded);
    }

    // head, elements
    if (document.head) {
      this.onHeadAdded();
    }
    (this.handlers.getAddedElements?.() ?? []).forEach(this.onElementAdded);
    new MutationObserver(records => {
      for (const record of records) {
        for (const addedNode of record.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            // #if DEVELOPMENT
            console.debug(addedNode.cloneNode(true));
            // #endif
            if (addedNode === document.head) {
              this.onHeadAdded();
            }
            this.onElementAdded(addedNode);
            (this.handlers.getSilentlyAddedElements?.(addedNode) ?? []).forEach(
              this.onElementAdded,
            );
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  private onOptionsLoaded = (options: LocalStorage.ItemsFor<typeof optionKeys>) => {
    this.options = {
      blacklist: new Blacklist(
        options.blacklist,
        Object.values(options.subscriptions).map(subscription => subscription.blacklist),
      ),
      skipBlockDialog: options.skipBlockDialog,
      enablePathDepth: options.enablePathDepth,
    };
    this.queuedEntries.forEach(this.judgeEntry);
    this.queuedEntries.length = 0;
    if (this.domContent) {
      this.renderControl();
    }
    document.documentElement.dataset.ubHideEntry = '';
    if (options.hideControl) {
      document.documentElement.dataset.ubHideControl = '';
    }
    if (options.hideBlockLinks) {
      document.documentElement.dataset.ubHideAction = '';
    }
  };

  private onDOMContentLoaded = () => {
    const [control, adjustControl] = (() => {
      for (const controlHandler of this.handlers.controlHandlers) {
        const control = controlHandler.createControl();
        if (!control) {
          continue;
        }
        control.classList.add('ub-control');
        return [control, controlHandler.adjustControl?.bind(controlHandler) ?? null] as const;
      }
      return [null, null];
    })();
    const blockDialogRoot = document.body
      .appendChild(document.createElement('div'))
      .attachShadow({ mode: 'open' });
    this.domContent = {
      control,
      adjustControl,
      blockDialogRoot,
    };
    this.renderControl();
  };

  private onHeadAdded = () => {
    render(contentScriptStyle, document.head.appendChild(document.createElement('style')));
    render(this.style, document.head.appendChild(document.createElement('style')));
  };

  private onElementAdded = (addedElement: HTMLElement) => {
    const entry = (() => {
      for (const entryHandler of this.handlers.entryHandlers) {
        const entry = entryHandler.getEntry(addedElement);
        if (!entry || entry.hasAttribute('data-ub-url')) {
          continue;
        }
        const url = entryHandler.getURL(entry);
        if (url == null) {
          continue;
        }
        const action = entryHandler.createAction(entry);
        if (!action) {
          continue;
        }
        entry.setAttribute('data-ub-url', url);
        action.classList.add('ub-action');
        this.renderAction(action, url);
        entryHandler.adjustEntry?.(entry);
        return entry;
      }
      return null;
    })();
    if (!entry) {
      return;
    }
    if (this.options) {
      this.judgeEntry(entry);
      if (this.domContent) {
        this.renderControl();
      }
    } else {
      this.queuedEntries.push(entry);
    }
  };

  private onBlacklistUpdated = () => {
    assertNonNull(this.options);
    void sendMessage('set-blacklist', this.options.blacklist.toString(), 'content-script');
    this.blockedEntryCount = 0;
    for (const entry of document.querySelectorAll<HTMLElement>('[data-ub-url]')) {
      entry.classList.remove('ub-is-blocked');
      this.judgeEntry(entry);
    }
    if (this.domContent) {
      this.renderControl();
    }
    if (!this.blockedEntryCount) {
      document.documentElement.dataset.ubHideEntry = '';
    }
  };

  private judgeEntry = (entry: HTMLElement) => {
    assertNonNull(this.options);
    const url = entry.dataset.ubUrl;
    if (url == undefined) {
      throw new Error('Not entry');
    }
    if (this.options.blacklist.test(new AltURL(url))) {
      ++this.blockedEntryCount;
      entry.classList.add('ub-is-blocked');
    }
  };

  private renderControl = () => {
    assertNonNull(this.domContent);
    if (!this.domContent.control) {
      return;
    }
    render(
      this.blockedEntryCount ? (
        <>
          <span class="ub-stats">
            {this.blockedEntryCount === 1
              ? translate('content_singleSiteBlocked')
              : translate('content_multipleSitesBlocked', String(this.blockedEntryCount))}
          </span>{' '}
          <LinkButton
            class="ub-show-button"
            onClick={() => {
              delete document.documentElement.dataset['ubHideEntry'];
            }}
          >
            {translate('content_showBlockedSitesLink')}
          </LinkButton>
          <LinkButton
            class="ub-hide-button"
            onClick={() => {
              document.documentElement.dataset.ubHideEntry = '';
            }}
          >
            {translate('content_hideBlockedSitesLink')}
          </LinkButton>
        </>
      ) : null,
      this.domContent.control,
    );
    this.domContent.adjustControl?.(this.domContent.control);
  };

  private renderAction = (action: HTMLElement, url: string) => {
    const onButtonClicked = () => {
      if (!this.options || !this.domContent) {
        return;
      }
      if (this.options.skipBlockDialog) {
        this.options.blacklist.createPatch(new AltURL(url));
        this.options.blacklist.applyPatch();
        this.onBlacklistUpdated();
      } else {
        this.renderBlockDialog(url);
      }
    };
    render(
      <>
        <LinkButton class="ub-block-button" onClick={onButtonClicked}>
          {translate('content_blockSiteLink')}
        </LinkButton>
        <LinkButton class="ub-unblock-button" onClick={onButtonClicked}>
          {translate('content_unblockSiteLink')}
        </LinkButton>
      </>,
      action,
    );
  };

  private renderBlockDialog = (url: string, open = true) => {
    assertNonNull(this.options);
    assertNonNull(this.domContent);
    render(
      <BlockDialog
        target={this.domContent.blockDialogRoot}
        open={open}
        close={() => this.renderBlockDialog(url, false)}
        url={url}
        blacklist={this.options.blacklist}
        enablePathDepth={this.options.enablePathDepth}
        onBlocked={this.onBlacklistUpdated}
      />,
      this.domContent.blockDialogRoot,
    );
  };
}

new Main();
