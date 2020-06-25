import { apis } from './apis';
import { Blacklist, BlacklistPatch } from './blacklist';
import { PathDepth } from './path-depth';
import { AltURL } from './utilities';
import style from '!!css-loader!sass-loader!../styles/block-form.scss';

export class BlockForm {
  private blacklist: Blacklist | null = null;
  private blacklistPatch: BlacklistPatch | null = null;
  private onBlocked: (() => void | Promise<void>) | null = null;
  private pathDepth: PathDepth | null = null;
  private root: ShadowRoot;

  constructor(host: HTMLElement, close: () => void) {
    this.root = host.attachShadow({ mode: 'open' });
    this.root.innerHTML = `
<style>
  ${style.toString()}
</style>
<div class="block-form">
  <h1 id="title" class="title block-form__title"></h1>
  <p id="url-host" class="block-form__url-host"></p>
  <details id="details" class="block-form__details">
    <summary class="block-form__details-title">
      ${apis.i18n.getMessage('popup_details')}
    </summary>
    <div class="field">
      <label class="label" for="url">
        ${apis.i18n.getMessage('popup_pageURLLabel')}
      </label>
      <div class="control">
        <textarea id="url" class="textarea has-fixed-size" readonly rows="2" spellcheck="false"></textarea>
      </div>
    </div>
    <div id="path-depth-field" class="field is-hidden">
      <label class="label" for="depth">
        ${apis.i18n.getMessage('popup_pathDepth')}
      </label>
      <div class="control">
        <input id="depth" class="input" type="number" value="0" min="0" max="0">
      </div>
    </div>
    <div class="field">
      <label class="label" for="added">
        ${apis.i18n.getMessage('popup_addedRulesLabel')}
      </label>
      <div class="control">
        <textarea id="added" class="textarea has-fixed-size" rows="2" spellcheck="false"></textarea>
      </div>
      <p id="addedHelper" class="help has-text-grey">
        ${apis.i18n.getMessage('options_blacklistHelper')}
      </p>
    </div>
    <div class="field">
      <label class="label" for="removed">
        ${apis.i18n.getMessage('popup_removedRulesLabel')}
      </label>
      <div class="control">
        <textarea id="removed" class="textarea has-fixed-size" readonly rows="2" spellcheck="false"></textarea>
      </div>
    </div>
  </details>
  <div class="field is-grouped is-grouped-right">
    <div class="control">
      <button id="cancel" class="button has-text-primary">
        ${apis.i18n.getMessage('cancelButton')}
      </button>
    </div>
    <div class="control">
      <button id="update" class="button is-primary block-form__block-button"></button>
    </div>
  </div>
</div>`;
    this.$('added').addEventListener('input', () => {
      const modifiedPatch = this.blacklist!.modifyPatch({ rulesToAdd: this.$('added').value });
      if (modifiedPatch) {
        this.blacklistPatch = modifiedPatch;
      }
      this.$('update').disabled = !modifiedPatch;
    });
    this.$('depth').addEventListener('input', () => {
      const depth = this.$('depth').valueAsNumber;
      if (Number.isNaN(depth) || depth < 0 || depth > this.pathDepth!.maxDepth()) {
        return;
      }
      const modifiedPatch = this.blacklist!.modifyPatch({
        rulesToAdd: this.pathDepth!.suggestMatchPattern(depth, this.blacklistPatch!.unblock),
      });
      if (modifiedPatch) {
        this.blacklistPatch = modifiedPatch;
        this.$('added').value = modifiedPatch.rulesToAdd;
      }
      this.$('update').disabled = !modifiedPatch;
    });
    this.$('cancel').addEventListener('click', () => {
      close();
    });
    this.$('update').addEventListener('click', async () => {
      this.blacklist!.applyPatch();
      if (this.onBlocked) {
        await Promise.resolve(this.onBlocked());
      }
      close();
    });
  }

  enablePathDepth(): void {
    this.$('path-depth-field').classList.remove('is-hidden');
  }

  initialize(blacklist: Blacklist, url: AltURL, onBlocked: () => void): void {
    this.$('url-host').textContent = url.host;
    this.$('details').open = false;
    this.$('url').value = url.toString();

    if (/^(https?|ftp)$/.test(url.scheme)) {
      this.blacklist = blacklist;
      this.blacklistPatch = blacklist.createPatch(url);
      this.onBlocked = onBlocked;
      this.pathDepth = new PathDepth(url);

      this.$('title').textContent = apis.i18n.getMessage(
        this.blacklistPatch.unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle',
      );
      this.$('depth').readOnly = false;
      this.$('depth').max = String(this.pathDepth!.maxDepth());
      this.$('depth').value = this.blacklistPatch.rulesToAdd ? '0' : '';
      this.$('added').readOnly = false;
      this.$('added').value = this.blacklistPatch.rulesToAdd;
      this.$('removed').value = this.blacklistPatch.rulesToRemove;
      this.$('update').disabled = false;
      this.$('update').textContent = apis.i18n.getMessage(
        this.blacklistPatch.unblock ? 'popup_unblockSiteButton' : 'popup_blockSiteButton',
      );
    } else {
      this.blacklist = null;
      this.blacklistPatch = null;
      this.onBlocked = null;
      this.pathDepth = null;

      this.$('title').textContent = apis.i18n.getMessage('popup_blockSiteTitle');
      this.$('depth').readOnly = true;
      this.$('depth').value = '';
      this.$('added').readOnly = true;
      this.$('added').value = '';
      this.$('removed').value = '';
      this.$('update').disabled = true;
      this.$('update').textContent = apis.i18n.getMessage('popup_blockSiteButton');
    }
  }

  private $(id: 'title'): HTMLHeadingElement;
  private $(id: 'url-host'): HTMLParagraphElement;
  private $(id: 'details'): HTMLDetailsElement;
  private $(id: 'url'): HTMLTextAreaElement;
  private $(id: 'added'): HTMLTextAreaElement;
  private $(id: 'addedHelper'): HTMLParagraphElement;
  private $(id: 'path-depth-field'): HTMLDivElement;
  private $(id: 'depth'): HTMLInputElement;
  private $(id: 'removed'): HTMLTextAreaElement;
  private $(id: 'cancel'): HTMLButtonElement;
  private $(id: 'update'): HTMLButtonElement;
  private $(id: string): Element | null {
    return this.root.getElementById(id);
  }
}
