import { FunctionComponent, h } from 'preact';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { apis } from '../apis';
import { addMessageListeners, sendMessage } from '../messages';
import { Dialog, DialogProps } from '../shared/dialog';
import { TextWithLinks } from '../shared/text-with-links';
import { supportedSearchEngines } from '../supported-search-engines';
import { SearchEngine, SearchEngineId } from '../types';
import { lines, stringEntries, translate } from '../utilities';
import { Context } from './context';
import { Portal } from './portal';
import { Section, SectionItem } from './section';
import { SetBooleanItem } from './set-boolean-item';

type ImportBlacklistDialogProps = DialogProps & {
  setBlacklist(update: (blacklist: string) => string): void;
  setBlacklistDirty(blacklistDirty: boolean): void;
};

const ImportBlacklistDialog: FunctionComponent<Readonly<ImportBlacklistDialogProps>> = props => {
  const [source, setSource] = useState<'file' | 'pb'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [pb, setPB] = useState('');
  const [append, setAppend] = useState(false);
  const fileInput = useRef<HTMLInputElement>();
  useLayoutEffect(() => {
    if (props.open) {
      setSource('file');
      setFile(null);
      setPB('');
      setAppend(false);
      fileInput.current.value = '';
    }
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div class="field">
        <h1 class="title">{translate('options_importBlacklistDialog_title')}</h1>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <input
            id="fromFile"
            class="is-checkradio is-small"
            checked={source === 'file'}
            name="source"
            type="radio"
            onInput={e => {
              if (e.currentTarget.checked) {
                setSource('file');
              }
            }}
          />
          <label class="ub-checkradio" for="fromFile" />
        </div>
        <div class="control is-expanded">
          <div class="field">
            <label for="fromFile">{translate('options_importBlacklistDialog_fromFile')}</label>
          </div>
          <div class="field">
            <div class="file has-name is-fullwidth is-right">
              <label class="file-label">
                <input
                  class="file-input"
                  accept="text/plain"
                  ref={fileInput}
                  type="file"
                  onInput={e => {
                    setSource('file');
                    setFile(e.currentTarget.files?.[0] ?? null);
                  }}
                />
                <span class="file-cta">
                  <span class="file-label">
                    {translate('options_importBlacklistDialog_selectFile')}
                  </span>
                </span>
                <span class="file-name">{file?.name ?? ''}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <input
            id="fromPB"
            class="is-checkradio is-small"
            checked={source === 'pb'}
            name="source"
            type="radio"
            onInput={e => {
              if (e.currentTarget.checked) {
                setSource('pb');
              }
            }}
          />
          <label class="ub-checkradio" for="fromPB" />
        </div>
        <div class="control is-expanded">
          <div class="field">
            <label for="fromPB">{translate('options_importBlacklistDialog_fromPB')}</label>
          </div>
          <div class="field">
            <textarea
              class="ub-textarea textarea has-fixed-size"
              rows={5}
              spellcheck={false}
              value={pb}
              onInput={e => {
                setSource('pb');
                setPB(e.currentTarget.value);
              }}
            />
          </div>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <input
            id="append"
            class="is-checkradio is-small"
            type="checkbox"
            checked={append}
            onInput={e => {
              setAppend(e.currentTarget.checked);
            }}
          />
          <label class="ub-checkradio" for="append" />
        </div>
        <div class="control is-expanded">
          <label for="append">
            <p>{translate('options_importBlacklistDialog_append')}</p>
          </label>
        </div>
      </div>
      <div class="ub-row field is-grouped is-grouped-right">
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
            disabled={source === 'file' ? !file : !pb}
            onClick={() => {
              const replaceOrAppend = (newBlacklist: string) => {
                if (append) {
                  props.setBlacklist(
                    oldBlacklist =>
                      `${oldBlacklist}${oldBlacklist && newBlacklist ? '\n' : ''}${newBlacklist}`,
                  );
                } else {
                  props.setBlacklist(() => newBlacklist);
                }
                props.setBlacklistDirty(true);
              };
              if (source === 'file') {
                if (!file) {
                  throw new Error('No file');
                }
                const fileReader = new FileReader();
                fileReader.addEventListener('load', () => {
                  replaceOrAppend(fileReader.result as string);
                });
                fileReader.readAsText(file);
              } else {
                if (!pb) {
                  throw new Error('No PB');
                }
                let newBlacklist = '';
                for (const domain of lines(pb)) {
                  if (/^([A-Za-z0-9-]+\.)*[A-Za-z0-9-]+$/.test(domain)) {
                    newBlacklist = `${newBlacklist}${newBlacklist ? '\n' : ''}*://*.${domain}/*`;
                  }
                }
                replaceOrAppend(newBlacklist);
              }
              props.setOpen(false);
            }}
          >
            {translate('options_importBlacklistDialog_importButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

const SetBlacklist: FunctionComponent = () => {
  const { blacklist: initialBlacklist } = useContext(Context).initialItems;
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [blacklistDirty, setBlacklistDirty] = useState(false);
  const [latestBlacklist, setLatestBlacklist] = useState<string | null>(null);
  const [importBlacklistDialogOpen, setImportBlacklistDialogOpen] = useState(false);
  useEffect(() => {
    return addMessageListeners({
      'blacklist-set': (latestBlacklist, source) => {
        if (source !== 'options') {
          setLatestBlacklist(latestBlacklist);
        }
      },
    });
  }, []);
  return (
    <SectionItem>
      <div class="field">
        <p>{translate('options_blacklistLabel')}</p>
        <p class="has-text-grey">
          <TextWithLinks text={translate('options_blacklistHelper')} />
        </p>
        <p class="has-text-grey">{translate('options_blacklistExample', '*://*.example.com/*')}</p>
        <p class="has-text-grey">
          {translate('options_blacklistExample', '/example\\.(net|org)/')}
        </p>
      </div>
      <div class="field">
        <div class="control">
          <textarea
            class="ub-textarea textarea has-fixed-size"
            rows={10}
            spellcheck={false}
            value={blacklist}
            onInput={e => {
              setBlacklist(e.currentTarget.value);
              setBlacklistDirty(true);
            }}
          />
        </div>
      </div>
      <div class="ub-row field is-grouped is-grouped-multiline is-grouped-right">
        {latestBlacklist != null && (
          <div class="control is-expanded">
            <p class="has-text-grey">
              {translate('options_blacklistUpdated')}{' '}
              <span
                class="ub-link-button"
                tabIndex={0}
                onClick={() => {
                  setBlacklist(latestBlacklist);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.click();
                  }
                }}
              >
                {translate('options_reloadBlacklistButton')}
              </span>
            </p>
          </div>
        )}
        <div class="control">
          <button
            class="ub-button button has-text-primary"
            onClick={() => {
              setImportBlacklistDialogOpen(true);
            }}
          >
            {translate('options_importBlacklistButton')}
          </button>
        </div>
        <div class="control">
          <button
            class="ub-button button has-text-primary"
            onClick={() => {
              const a = document.createElement('a');
              a.href = `data:text/plain;charset=UTF-8,${encodeURIComponent(blacklist)}`;
              a.download = 'uBlacklist.txt';
              a.click();
            }}
          >
            {translate('options_exportBlacklistButton')}
          </button>
        </div>
        <div class="control">
          <button
            class="ub-button button is-primary"
            disabled={!blacklistDirty}
            onClick={() => {
              void sendMessage('set-blacklist', blacklist, 'options');
              setBlacklistDirty(false);
              setLatestBlacklist(null);
            }}
          >
            {translate('options_saveBlacklistButton')}
          </button>
        </div>
      </div>
      <Portal id="importBlacklistDialog">
        <ImportBlacklistDialog
          open={importBlacklistDialogOpen}
          setOpen={setImportBlacklistDialogOpen}
          setBlacklist={setBlacklist}
          setBlacklistDirty={setBlacklistDirty}
        />
      </Portal>
    </SectionItem>
  );
};

type RegisterSearchEngineProps = {
  id: SearchEngineId;
  searchEngine: SearchEngine;
};

const RegisterSearchEngine: FunctionComponent<Readonly<RegisterSearchEngineProps>> = props => {
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    void (async () => {
      const registered = await apis.permissions.contains({ origins: props.searchEngine.matches });
      setRegistered(registered);
    })();
  }, [props.searchEngine]);
  return (
    <div class="ub-row field is-grouped">
      <div class="control is-expanded">
        <p>{translate(props.searchEngine.messageNames.name)}</p>
      </div>
      <div class="control">
        {registered ? (
          <button class="ub-button button has-text-primary" disabled>
            {translate('options_searchEngineRegistered')}
          </button>
        ) : (
          <button
            class="ub-button button is-primary"
            onClick={async () => {
              const registered = await apis.permissions.request({
                origins: props.searchEngine.matches,
              });
              if (registered) {
                void sendMessage('register-search-engine', props.id);
              }
              setRegistered(registered);
            }}
          >
            {translate('options_registerSearchEngine')}
          </button>
        )}
      </div>
    </div>
  );
};

const RegisterSearchEngines: FunctionComponent = () => {
  return (
    <SectionItem>
      <div class="field">
        <p>{translate('options_otherSearchEngines')}</p>
        <p class="has-text-grey">{translate('options_otherSearchEnginesDescription')}</p>
      </div>
      <div class="field">
        <ul class="ub-list">
          {stringEntries(supportedSearchEngines).map(
            ([id, searchEngine]) =>
              id !== 'google' && (
                <li key={id} class="ub-list-item">
                  <RegisterSearchEngine id={id} searchEngine={searchEngine} />
                </li>
              ),
          )}
        </ul>
      </div>
    </SectionItem>
  );
};

export const GeneralSection: FunctionComponent = () => (
  <Section id="general" title={translate('options_generalTitle')}>
    <SetBlacklist />
    <RegisterSearchEngines />
    <SetBooleanItem itemKey="skipBlockDialog" label={translate('options_skipBlockDialogLabel')} />
    <SetBooleanItem itemKey="hideBlockLinks" label={translate('options_hideBlockLinksLabel')} />
    <SetBooleanItem itemKey="hideControl" label={translate('options_hideControlLabel')} />
  </Section>
);
