import { apis } from './apis';
import { Blacklist, BlacklistPatch } from './blacklist';
import { AltURL } from './utilities';
import style from '!!css-loader!sass-loader!../styles/block-form.scss';

export class BlockForm {
  private root: ShadowRoot;
  private blacklist: Blacklist | null = null;
  private blacklistPatch: BlacklistPatch | null = null;
  private onBlocked: (() => void) | null = null;

  constructor(host: HTMLElement, close: () => void) {
    this.root = host.attachShadow({ mode: 'open' });
    this.root.innerHTML = `
      <style>
        ${style.toString()}
      </style>
      <div class="block-form">
        <h1 id="title" class="title block-form__title"></h1>
        <p id="origin" class="block-form__origin"></p>
        <details id="details" class="block-form__details">
          <summary class="block-form__details-title">
            ${apis.i18n.getMessage('popup_details')}
          </summary>
          <div class="field">
            <label class="label" for="url">
              ${apis.i18n.getMessage('popup_pageURLLabel')}
            </label>
            <div class="control">
              <input id="url" class="input" readonly>
            </div>
          </div>
          <div class="field">
            <label class="label" for="depth">
              Depth
            </label>
            <div class="control">
              <input id="depth" class="input" type="number" value="0" min="0">
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
    this.$('details').addEventListener('toggle', () => {
      if (this.$('details').open && this.blacklistPatch) {
        this.$('added').focus();
      }
    });
    this.$('added').addEventListener('input', () => {
      const modifiedPatch = this.blacklist!.modifyPatch({ rulesToAdd: this.$('added').value });
      if (modifiedPatch) {
        this.blacklistPatch = modifiedPatch;
      }
      this.$('update').disabled = !modifiedPatch;
    });
    this.$('depth').addEventListener('input', () => {
      const depth = parseInt(this.$('depth').value, 10);
      const modifiedPatch = this.blacklist!.modifyPatchDepth(depth);
      if (modifiedPatch) {
        this.blacklistPatch = modifiedPatch;
        this.$('added').value = modifiedPatch.rulesToAdd;
        this.$('update').disabled = false;
      }
    });
    this.$('cancel').addEventListener('click', () => {
      close();
    });
    this.$('update').addEventListener('click', () => {
      this.blacklist!.applyPatch();
      if (this.onBlocked) {
        this.onBlocked();
      }
      close();
    });
  }

  initialize(blacklist: Blacklist, url: AltURL, onBlocked: () => void): void {
    this.$('origin').textContent = `${url.scheme}://${url.host}`;
    this.$('details').open = false;
    this.$('url').value = url.toString();
    this.$('depth').max = String((url.path.match(/\//g)?.length || 1) - 1);

    if (/^(https?|ftp)$/.test(url.scheme)) {
      this.blacklist = blacklist;
      this.blacklistPatch = blacklist.createPatch(url);
      this.onBlocked = onBlocked;

      this.$('title').textContent = apis.i18n.getMessage(
        this.blacklistPatch.unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle',
      );
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

      this.$('title').textContent = apis.i18n.getMessage('popup_blockSiteTitle');
      this.$('added').readOnly = true;
      this.$('added').value = '';
      this.$('removed').value = '';
      this.$('update').disabled = true;
      this.$('update').textContent = apis.i18n.getMessage('popup_blockSiteButton');
    }
  }

  private $(id: 'title'): HTMLHeadingElement;
  private $(id: 'origin'): HTMLParagraphElement;
  private $(id: 'details'): HTMLDetailsElement;
  private $(id: 'url'): HTMLInputElement;
  private $(id: 'added'): HTMLTextAreaElement;
  private $(id: 'addedHelper'): HTMLParagraphElement;
  private $(id: 'depth'): HTMLInputElement;
  private $(id: 'removed'): HTMLTextAreaElement;
  private $(id: 'cancel'): HTMLButtonElement;
  private $(id: 'update'): HTMLButtonElement;
  private $(id: string): HTMLElement {
    return this.root.getElementById(id) as HTMLElement;
  }
}
