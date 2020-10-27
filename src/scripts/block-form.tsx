import { Fragment, FunctionComponent, h } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { Blacklist } from './blacklist';
import { sendMessage } from './messages';
import { PathDepth } from './path-depth';
import { Dialog } from './shared/dialog';
import { TextWithLinks } from './shared/text-with-links';
import { AltURL, translate } from './utilities';
import style from '../styles/block-form.scss';

type BlockFormProps = {
  open: boolean;
  setOpen(open: boolean): void;
  url: string;
  blacklist: Blacklist;
  enablePathDepth: boolean;
  onBlocked(): void | Promise<void>;
};

const BlockFormBase: FunctionComponent<Readonly<BlockFormProps>> = props => {
  const [disabled, setDisabled] = useState(false);
  const [unblock, setUnblock] = useState(false);
  const [host, setHost] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pathDepth, setPathDepth] = useState<PathDepth | null>(null);
  const [depth, setDepth] = useState('');
  const [rulesToAdd, setRulesToAdd] = useState('');
  const [rulesToAddValid, setRulesToAddValid] = useState(false);
  const [rulesToRemove, setRulesToRemove] = useState('');
  useLayoutEffect(() => {
    if (!props.open) {
      return;
    }
    const url = new AltURL(props.url);
    if (/^(https?|ftp)$/.test(url.scheme)) {
      const patch = props.blacklist.createPatch(url);
      setDisabled(false);
      setUnblock(patch.unblock);
      setHost(url.host);
      setDetailsOpen(false);
      setPathDepth(props.enablePathDepth ? new PathDepth(url) : null);
      setDepth('0');
      setRulesToAdd(patch.rulesToAdd);
      setRulesToAddValid(true);
      setRulesToRemove(patch.rulesToRemove);
    } else {
      setDisabled(true);
      setUnblock(false);
      setHost(props.url);
      setDetailsOpen(false);
      setPathDepth(null);
      setDepth('');
      setRulesToAdd('');
      setRulesToAddValid(false);
      setRulesToRemove('');
    }
  }, [props.open, props.url, props.blacklist, props.enablePathDepth]);
  return (
    <div class="ub-main">
      <div class="ub-row field is-grouped">
        <div class="ub-icon control" />
        <div class="control is-expanded">
          <h1 class="title">
            {translate(unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle')}
          </h1>
        </div>
      </div>
      <div class="field">
        <p class="ub-host">{host}</p>
      </div>
      <div class="field">
        <details
          open={detailsOpen}
          onToggle={e => {
            setDetailsOpen(e.currentTarget.open);
          }}
        >
          <summary class="ub-summary">{translate('popup_details')}</summary>
          <div class="field">
            <label class="label" for="url">
              {translate('popup_pageURLLabel')}
            </label>
            <div class="control">
              <textarea
                id="url"
                class="ub-textarea textarea has-fixed-size"
                readOnly={true}
                rows={2}
                spellcheck={false}
                value={props.url}
              />
            </div>
          </div>
          {props.enablePathDepth && (
            <div class="field">
              <label class="label" for="depth">
                {translate('popup_pathDepth')}
              </label>
              <div class="control">
                <input
                  class="input"
                  type="number"
                  max={pathDepth?.maxDepth() ?? 0}
                  min={0}
                  readOnly={disabled}
                  value={depth}
                  onInput={e => {
                    const newDepth = e.currentTarget.value;
                    setDepth(newDepth);
                    if (!pathDepth || !newDepth || !e.currentTarget.validity.valid) {
                      return;
                    }
                    const newRulesToAdd = pathDepth.suggestMatchPattern(Number(newDepth), unblock);
                    setRulesToAdd(newRulesToAdd);
                    const newPatch = props.blacklist.modifyPatch({ rulesToAdd: newRulesToAdd });
                    setRulesToAddValid(Boolean(newPatch));
                  }}
                />
              </div>
            </div>
          )}
          <div class="field">
            <label class="label" for="rulesToAdd">
              {translate('popup_addedRulesLabel')}
            </label>
            <div class="control">
              <textarea
                id="rulesToAdd"
                class="ub-textarea textarea has-fixed-size"
                readOnly={disabled}
                rows={2}
                spellcheck={false}
                value={rulesToAdd}
                onInput={e => {
                  const newRulesToAdd = e.currentTarget.value;
                  setRulesToAdd(newRulesToAdd);
                  const newPatch = props.blacklist.modifyPatch({ rulesToAdd: newRulesToAdd });
                  setRulesToAddValid(Boolean(newPatch));
                }}
              />
            </div>
            <p class="help has-text-grey">
              <TextWithLinks text={translate('options_blacklistHelper')} />
            </p>
          </div>
          <div class="field">
            <label class="label" for="rulesToRemove">
              {translate('popup_removedRulesLabel')}
            </label>
            <div class="control">
              <textarea
                id="rulesToRemove"
                class="ub-textarea textarea has-fixed-size"
                readOnly={true}
                rows={2}
                spellcheck={false}
                value={rulesToRemove}
              ></textarea>
            </div>
          </div>
        </details>
      </div>
      <div class="ub-row field is-grouped is-grouped-right">
        <div class="control is-expanded">
          <span
            class="ub-link-button"
            tabIndex={0}
            onClick={() => {
              void sendMessage('open-options-page');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.currentTarget.click();
              }
            }}
          >
            {translate('popup_openOptionsLink')}
          </span>
        </div>
        <div class="control">
          <button
            class="ub-button button has-text-primary"
            onClick={() => {
              props.setOpen(false);
            }}
          >
            {translate('cancelButton')}
          </button>
        </div>
        <div class="control">
          <button
            class="ub-button button is-primary"
            disabled={disabled || !rulesToAddValid}
            onClick={async () => {
              props.blacklist.applyPatch();
              await Promise.resolve(props.onBlocked());
              props.setOpen(false);
            }}
          >
            {translate(unblock ? 'popup_unblockSiteButton' : 'popup_blockSiteButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BlockForm: FunctionComponent<Readonly<BlockFormProps>> = props => (
  <>
    <style>{style}</style>
    <BlockFormBase {...props} />
  </>
);

export const BlockDialog: FunctionComponent<Readonly<BlockFormProps>> = props => (
  <>
    <style>{style}</style>
    <Dialog open={props.open} setOpen={props.setOpen}>
      <BlockFormBase {...props} />
    </Dialog>
  </>
);
