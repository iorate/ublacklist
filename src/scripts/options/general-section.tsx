import React from 'react';
import ReactDOM from 'react-dom';
import { apis } from '../apis';
import { addMessageListeners, sendMessage } from '../messages';
import { supportedSearchEngines } from '../supported-search-engines';
import { SearchEngine, SearchEngineId } from '../types';
import { lines } from '../utilities';
import { Dialog, DialogProps } from './dialog';
import { InitialItems } from './initial-items';
import { Section } from './section';
import { SetBooleanItem } from './set-boolean-item';

type ImportBlacklistDialogProps = DialogProps & {
  setBlacklist(update: (blacklist: string) => string): void;
  setBlacklistDirty(ditry: boolean): void;
};

const ImportBlacklistDialog: React.FC<Readonly<ImportBlacklistDialogProps>> = props => {
  const [blocklist, setBlocklist] = React.useState('');
  React.useLayoutEffect(() => {
    setBlocklist('');
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div className="ub-row field">
        <h1 className="title">{apis.i18n.getMessage('options_importBlacklistDialog_title')}</h1>
      </div>
      <div className="ub-row field">
        <p className="has-text-grey">
          {apis.i18n.getMessage('options_importBlacklistDialog_helper')}
        </p>
        <p className="has-text-grey">
          {apis.i18n.getMessage('options_blacklistExample', 'example.com')}
        </p>
      </div>
      <div className="ub-row field">
        <div className="control">
          <textarea
            className="textarea has-fixed-size"
            rows={10}
            spellCheck="false"
            value={blocklist}
            onChange={e => {
              setBlocklist(e.currentTarget.value);
            }}
          />
        </div>
      </div>
      <div className="ub-row field is-grouped is-grouped-right">
        <div className="control">
          <button
            className="ub-button button has-text-primary"
            onClick={() => {
              props.setOpen(false);
            }}
          >
            {apis.i18n.getMessage('cancelButton')}
          </button>
        </div>
        <div className="control">
          <button
            className="ub-button button is-primary"
            onClick={() => {
              let newBlacklist = '';
              for (const domain of lines(blocklist)) {
                if (/^[^/*]+$/.test(domain)) {
                  newBlacklist = `${newBlacklist}${newBlacklist ? '\n' : ''}*://*.${domain}/*`;
                }
              }
              if (newBlacklist) {
                props.setBlacklist(
                  blacklist => `${blacklist}${blacklist ? '\n' : ''}${newBlacklist}`,
                );
                props.setBlacklistDirty(true);
              }
              props.setOpen(false);
            }}
          >
            {apis.i18n.getMessage('options_importBlacklistDialog_importButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

const SetBlacklist: React.FC = () => {
  const { blacklist: initialBlacklist } = React.useContext(InitialItems);
  const [blacklist, setBlacklist] = React.useState(initialBlacklist);
  const [blacklistDirty, setBlacklistDirty] = React.useState(false);
  const [latestBlacklist, setLatestBlacklist] = React.useState<string | null>(null);
  const [importBlacklistDialogOpen, setImportBlacklistDialogOpen] = React.useState(false);
  React.useEffect(() => {
    return addMessageListeners({
      'blacklist-set': (latestBlacklist, source) => {
        if (source !== 'options') {
          setLatestBlacklist(latestBlacklist);
        }
      },
    });
  }, []);
  return (
    <>
      <div className="ub-row field">
        <p>{apis.i18n.getMessage('options_blacklistLabel')}</p>
        <p
          className="has-text-grey"
          dangerouslySetInnerHTML={{ __html: apis.i18n.getMessage('options_blacklistHelper') }}
        />
        <p className="has-text-grey">
          {apis.i18n.getMessage('options_blacklistExample', '*://*.example.com/*')}
        </p>
        <p className="has-text-grey">
          {apis.i18n.getMessage('options_blacklistExample', '/example\\.(net|org)/')}
        </p>
      </div>
      <div className="ub-row field">
        <div className="control">
          <textarea
            className="textarea has-fixed-size"
            rows={10}
            spellCheck={false}
            value={blacklist}
            onChange={e => {
              setBlacklist(e.target.value);
              setBlacklistDirty(true);
            }}
          />
        </div>
      </div>
      <div className="field is-grouped is-grouped-multiline is-grouped-right">
        {latestBlacklist != null && (
          <div className="control is-expanded">
            <p className="has-text-grey">
              {apis.i18n.getMessage('options_blacklistUpdated')}
              &nbsp;
              <span
                className="ub-link-button"
                tabIndex={0}
                onClick={async () => {
                  setBlacklist(latestBlacklist);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                {apis.i18n.getMessage('options_reloadBlacklistButton')}
              </span>
            </p>
          </div>
        )}
        <div className="control field is-grouped">
          <div className="control">
            <button
              className="ub-button button has-text-primary"
              onClick={() => {
                setImportBlacklistDialogOpen(true);
              }}
            >
              {apis.i18n.getMessage('options_importBlacklistButton')}
            </button>
          </div>
          <div className="control">
            <button
              className="ub-button button is-primary"
              disabled={!blacklistDirty}
              onClick={() => {
                sendMessage('set-blacklist', blacklist, 'options');
                setBlacklistDirty(false);
                setLatestBlacklist(null);
              }}
            >
              {apis.i18n.getMessage('options_saveBlacklistButton')}
            </button>
          </div>
        </div>
      </div>
      {ReactDOM.createPortal(
        <ImportBlacklistDialog
          open={importBlacklistDialogOpen}
          setOpen={setImportBlacklistDialogOpen}
          setBlacklist={setBlacklist}
          setBlacklistDirty={setBlacklistDirty}
        />,
        document.getElementById('importBlacklistDialogRoot')!,
      )}
    </>
  );
};

type RegisterSearchEngineProps = {
  searchEngine: SearchEngine;
};

const RegisterSearchEngine: React.FC<Readonly<RegisterSearchEngineProps>> = props => {
  const [registered, setRegistered] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const registered = await apis.permissions.contains({ origins: props.searchEngine.matches });
      setRegistered(registered);
    })();
  }, [props.searchEngine]);
  return (
    <div className="ub-row field is-grouped">
      <div className="control is-expanded">
        <label>{apis.i18n.getMessage(props.searchEngine.messageNames.name)}</label>
      </div>
      <div className="control">
        {registered ? (
          <button className="ub-button button has-text-primary" disabled>
            {apis.i18n.getMessage('options_searchEngineRegistered')}
          </button>
        ) : (
          <button
            className="ub-button button is-primary"
            onClick={async () => {
              const registered = await apis.permissions.request({
                origins: props.searchEngine.matches,
              });
              if (registered) {
                sendMessage('register-search-engine', props.searchEngine);
              }
              setRegistered(registered);
            }}
          >
            {apis.i18n.getMessage('options_registerSearchEngine')}
          </button>
        )}
      </div>
    </div>
  );
};

const RegisterSearchEngines: React.FC = () => {
  return (
    <>
      <div className="field">
        <p>{apis.i18n.getMessage('options_otherSearchEngines')}</p>
        <p className="has-text-grey">
          {apis.i18n.getMessage('options_otherSearchEnginesDescription')}
        </p>
      </div>
      <div className="field">
        <ul className="ub-list">
          {(Object.keys(supportedSearchEngines) as SearchEngineId[]).map(
            id =>
              id !== 'google' && (
                <li className="ub-list-item" key={id}>
                  <RegisterSearchEngine searchEngine={supportedSearchEngines[id]} />
                </li>
              ),
          )}
        </ul>
      </div>
    </>
  );
};

export const GeneralSection: React.FC = () => (
  <Section id="general" title={apis.i18n.getMessage('options_generalTitle')}>
    <SetBlacklist />
    <RegisterSearchEngines />
    <SetBooleanItem
      itemKey="skipBlockDialog"
      label={apis.i18n.getMessage('options_skipBlockDialogLabel')}
    />
    <SetBooleanItem
      itemKey="hideBlockLinks"
      label={apis.i18n.getMessage('options_hideBlockLinksLabel')}
    />
    <SetBooleanItem
      itemKey="hideControl"
      label={apis.i18n.getMessage('options_hideControlLabel')}
    />
  </Section>
);
