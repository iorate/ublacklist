import * as LocalStorage from './local-storage';
import { sendMessage } from './messages';
import { AltURL, MatchPattern, lines, unlines } from './utilities';
import blacklistUpdateStyle from '!!css-loader!sass-loader!../styles/blacklistUpdate.scss';

class RegularExpression {
  regExp: RegExp;

  constructor(re: string) {
    const m = /^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/.exec(
      re,
    );
    if (!m) {
      throw new Error('Invalid regular expression');
    }
    const [, pattern, flags] = m;
    this.regExp = new RegExp(pattern, flags);
    if (this.regExp.global || this.regExp.sticky) {
      this.regExp = new RegExp(this.regExp, flags.replace(/[gy]/g, ''));
    }
  }

  test(url: AltURL): boolean {
    return this.regExp.test(url.toString());
  }
}

interface CompiledRule {
  tester: MatchPattern | RegularExpression;
  rawRuleIndex: number;
}

class Blacklist {
  rawRules: (string | null)[] = [];
  blockRules: CompiledRule[] = [];
  unblockRules: CompiledRule[] = [];

  constructor(blacklist: string) {
    this.add(blacklist);
  }

  add(blacklist: string): void {
    for (let rawRule of lines(blacklist)) {
      this.rawRules.push(rawRule);
      rawRule = rawRule.trim();
      let unblock = false;
      if (rawRule[0] === '@') {
        rawRule = rawRule.slice(1).trimStart();
        unblock = true;
      }
      let tester!: MatchPattern | RegularExpression;
      try {
        tester = new MatchPattern(rawRule);
      } catch {
        try {
          tester = new RegularExpression(rawRule);
        } catch {
          continue;
        }
      }
      (unblock ? this.unblockRules : this.blockRules).push({
        tester,
        rawRuleIndex: this.rawRules.length - 1,
      });
    }
  }

  blocks(url: AltURL): boolean {
    return this.blockRules.some(({ tester }) => tester.test(url));
  }

  unblocks(url: AltURL): boolean {
    return this.unblockRules.some(({ tester }) => tester.test(url));
  }

  toString(): string {
    return unlines(this.rawRules.filter(rawRule => rawRule != null) as string[]);
  }
}

interface BlacklistUpdateParams {
  url: AltURL;
  unblock: boolean;
  added: string;
  removed: string;
  removedIndices: number[];
}

function suggestMatchPattern(url: AltURL): string {
  if (url.scheme === 'http' || url.scheme === 'https') {
    return `*://${url.host}/*`;
  } else {
    return `${url.scheme}://${url.host}/*`;
  }
}

function acceptsAdded(params: BlacklistUpdateParams, added: string): boolean {
  const blacklist = new Blacklist(added);
  if (params.unblock) {
    return blacklist.unblocks(params.url) || (!params.added && !blacklist.blocks(params.url));
  } else {
    return !blacklist.unblocks(params.url) && (!params.added || blacklist.blocks(params.url));
  }
}

export class BlacklistAggregation {
  private user: Blacklist;
  private subscription: Blacklist;

  constructor(user: string, subscription: string[]) {
    this.user = new Blacklist(user);
    this.subscription = new Blacklist(subscription.filter(s => s).join('\n'));
  }

  test(url: AltURL): boolean {
    if (this.user.unblocks(url)) {
      return false;
    }
    if (this.user.blocks(url)) {
      return true;
    }
    if (this.subscription.unblocks(url)) {
      return false;
    }
    if (this.subscription.blocks(url)) {
      return true;
    }
    return false;
  }

  preUpdate(url: AltURL): BlacklistUpdateParams {
    const params: BlacklistUpdateParams = {
      url,
      unblock: false,
      added: '',
      removed: '',
      removedIndices: [],
    };
    this.initializeRemoved(params, this.user.unblockRules);
    if (params.removedIndices.length) {
      if (
        !this.user.blocks(url) &&
        (this.subscription.unblocks(url) || !this.subscription.blocks(url))
      ) {
        params.added = suggestMatchPattern(url);
      }
    } else {
      this.initializeRemoved(params, this.user.blockRules);
      if (params.removedIndices.length) {
        params.unblock = true;
        if (!this.subscription.unblocks(url) && this.subscription.blocks(url)) {
          params.added = `@${suggestMatchPattern(url)}`;
        }
      } else if (this.subscription.unblocks(url) || !this.subscription.blocks(url)) {
        params.added = suggestMatchPattern(url);
      } else {
        params.unblock = true;
        params.added = `@${suggestMatchPattern(url)}`;
      }
    }
    return params;
  }

  update(params: BlacklistUpdateParams): void {
    if (params.unblock) {
      this.applyRemoved(params, this.user.blockRules);
    } else {
      this.applyRemoved(params, this.user.unblockRules);
    }
    this.user.add(params.added);
    sendMessage('set-blacklist', this.user.toString());
  }

  private initializeRemoved(params: BlacklistUpdateParams, rules: CompiledRule[]): void {
    const removed: string[] = [];
    rules.forEach(({ tester, rawRuleIndex }, index) => {
      if (tester.test(params.url)) {
        removed.push(this.user.rawRules[rawRuleIndex]!);
        params.removedIndices.push(index);
      }
    });
    params.removed = unlines(removed);
  }

  private applyRemoved(params: BlacklistUpdateParams, rules: CompiledRule[]): void {
    for (let i = params.removedIndices.length - 1; i >= 0; --i) {
      const removedIndex = params.removedIndices[i];
      this.user.rawRules[rules[removedIndex].rawRuleIndex] = null;
      rules.splice(removedIndex, 1);
    }
  }
}

export async function loadBlacklists(): Promise<BlacklistAggregation> {
  const { blacklist, subscriptions } = await LocalStorage.load('blacklist', 'subscriptions');
  return new BlacklistAggregation(
    blacklist,
    Object.keys(subscriptions).map(id => subscriptions[Number(id)].blacklist),
  );
}

export class BlacklistUpdate {
  private root: ShadowRoot;

  private $(id: 'title'): HTMLHeadingElement;
  private $(id: 'origin'): HTMLParagraphElement;
  private $(id: 'details'): HTMLDetailsElement;
  private $(id: 'url'): HTMLInputElement;
  private $(id: 'added'): HTMLTextAreaElement;
  private $(id: 'addedHelper'): HTMLParagraphElement;
  private $(id: 'removed'): HTMLTextAreaElement;
  private $(id: 'cancel'): HTMLButtonElement;
  private $(id: 'update'): HTMLButtonElement;
  private $(id: string): HTMLElement {
    return this.root.getElementById(id) as HTMLElement;
  }

  private blacklists: BlacklistAggregation | null = null;
  private params: BlacklistUpdateParams | null = null;
  private onFinish: (() => void) | null = null;

  constructor(host: HTMLElement, closeParent: () => void) {
    this.root = host.attachShadow({ mode: 'open' });
    this.root.innerHTML = `<style>
  ${blacklistUpdateStyle.toString()}
</style>
<div id="body">
  <h1 id="title" class="title"></h1>
  <p id="origin"></p>
  <details id="details">
    <summary>
      ${chrome.i18n.getMessage('popup_details')}
    </summary>
    <div class="field">
      <label class="label" for="url">
        ${chrome.i18n.getMessage('popup_pageURLLabel')}
      </label>
      <div class="control">
        <input id="url" class="input" readonly>
      </div>
    </div>
    <div class="field">
      <label class="label" for="added">
        ${chrome.i18n.getMessage('popup_addedRulesLabel')}
      </label>
      <div class="control">
        <textarea id="added" class="textarea has-fixed-size" rows="2" spellcheck="false"></textarea>
      </div>
      <p id="addedHelper" class="help has-text-grey">
        ${chrome.i18n.getMessage('options_blacklistHelper')}
      </p>
    </div>
    <div class="field">
      <label class="label" for="removed">
        ${chrome.i18n.getMessage('popup_removedRulesLabel')}
      </label>
      <div class="control">
        <textarea id="removed" class="textarea has-fixed-size" readonly rows="2" spellcheck="false"></textarea>
      </div>
    </div>
  </details>
  <div class="field is-grouped is-grouped-right">
    <div class="control">
      <button id="cancel" class="button has-text-primary">
        ${chrome.i18n.getMessage('cancelButton')}
      </button>
    </div>
    <div class="control">
      <button id="update" class="button is-primary"></button>
    </div>
  </div>
</div>`;
    this.$('details').addEventListener('toggle', () => {
      if (this.$('details').open && this.params) {
        this.$('added').focus();
      }
    });
    this.$('added').addEventListener('input', () => {
      this.$('update').disabled = !acceptsAdded(this.params!, this.$('added').value);
    });
    this.$('cancel').addEventListener('click', () => {
      closeParent();
    });
    this.$('update').addEventListener('click', () => {
      this.params!.added = this.$('added').value;
      this.blacklists!.update(this.params!);
      if (this.onFinish) {
        this.onFinish();
      }
      closeParent();
    });
  }

  start(blacklists: BlacklistAggregation, url: AltURL, onFinish?: () => void): void {
    this.$('origin').textContent = `${url.scheme}://${url.host}`;
    this.$('details').open = false;
    this.$('url').value = url.toString();

    if (/^(https?|ftp)$/.test(url.scheme)) {
      this.blacklists = blacklists;
      this.params = blacklists.preUpdate(url);
      this.onFinish = onFinish || null;

      this.$('title').textContent = chrome.i18n.getMessage(
        this.params!.unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle',
      );
      this.$('added').readOnly = false;
      this.$('added').value = this.params!.added;
      this.$('removed').value = this.params!.removed;
      this.$('update').disabled = false;
      this.$('update').textContent = chrome.i18n.getMessage(
        this.params!.unblock ? 'popup_unblockSiteButton' : 'popup_blockSiteButton',
      );
    } else {
      this.blacklists = null;
      this.params = null;
      this.onFinish = null;

      this.$('title').textContent = chrome.i18n.getMessage('popup_blockSiteTitle');
      this.$('added').readOnly = true;
      this.$('added').value = '';
      this.$('removed').value = '';
      this.$('update').disabled = true;
      this.$('update').textContent = chrome.i18n.getMessage('popup_blockSiteButton');
    }
  }
}
