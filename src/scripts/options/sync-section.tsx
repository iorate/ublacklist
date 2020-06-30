import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import React from 'react';
import ReactDOM from 'react-dom';
import { apis } from '../apis';
import '../dayjs-locales';
import { addMessageListeners, sendMessage } from '../messages';
import { supportedClouds } from '../supported-clouds';
import { CloudId } from '../types';
import { isErrorResult } from '../utilities';
import { Dialog, DialogProps } from './dialog';
import { FromNow } from './from-now';
import { InitialItems } from './initial-items';
import { Section } from './section';
import { SetIntervalItem } from './set-interval-item';

dayjs.extend(dayjsDuration);

type TurnOnSyncDialogProps = DialogProps & {
  setSyncCloudId: (syncCloudId: CloudId) => void;
};

const TurnOnSyncDialog: React.FC<Readonly<TurnOnSyncDialogProps>> = props => {
  const [syncCloudId, setSyncCloudId] = React.useState<CloudId>('googleDrive');
  React.useLayoutEffect(() => {
    if (props.open) {
      setSyncCloudId('googleDrive');
    }
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div className="ub-row field">
        <h1 className="title">{apis.i18n.getMessage('options_turnOnSyncDialog_title')}</h1>
      </div>
      {React.Children.map(Object.keys(supportedClouds) as CloudId[], cloudId => (
        <div className="ub-row field is-grouped">
          <div className="control">
            <input
              id={cloudId}
              type="radio"
              name="syncCloudId"
              checked={cloudId === syncCloudId}
              onChange={e => {
                if (e.currentTarget.checked) {
                  setSyncCloudId(cloudId);
                }
              }}
            />
          </div>
          <label htmlFor={cloudId}>
            <p>{apis.i18n.getMessage(supportedClouds[cloudId].messageNames.sync)}</p>
            <p className="has-text-grey">
              {apis.i18n.getMessage(supportedClouds[cloudId].messageNames.syncDescription)}
            </p>
          </label>
        </div>
      ))}
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
              (async () => {
                const granted = await apis.permissions.request({
                  origins: supportedClouds[syncCloudId].hostPermissions,
                });
                if (!granted) {
                  return;
                }
                const connected = await sendMessage('connect-to-cloud', syncCloudId);
                if (!connected) {
                  return;
                }
                props.setSyncCloudId(syncCloudId);
                props.setOpen(false);
              })();
            }}
          >
            {apis.i18n.getMessage('options_turnOnSyncDialog_turnOnSyncButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type TurnOnSyncProps = {
  syncCloudId: CloudId | null;
  setSyncCloudId: (syncCloudId: CloudId | null) => void;
};

const TurnOnSync: React.FC<Readonly<TurnOnSyncProps>> = props => {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = React.useState(false);
  return (
    <div className="ub-row field is-grouped">
      <div className="control is-expanded">
        {props.syncCloudId == null ? (
          <>
            <p>{apis.i18n.getMessage('options_syncFeature')}</p>
            <p className="has-text-grey">
              {apis.i18n.getMessage('options_syncFeatureDescription')}
            </p>
          </>
        ) : (
          <p>
            {apis.i18n.getMessage(supportedClouds[props.syncCloudId].messageNames.syncTurnedOn)}
          </p>
        )}
      </div>
      <div className="control">
        {props.syncCloudId == null ? (
          <button
            className="ub-button button is-primary"
            onClick={() => {
              setTurnOnSyncDialogOpen(true);
            }}
          >
            {apis.i18n.getMessage('options_turnOnSync')}
          </button>
        ) : (
          <button
            className="ub-button button has-text-primary"
            onClick={() => {
              sendMessage('disconnect-from-cloud');
              props.setSyncCloudId(null);
            }}
          >
            {apis.i18n.getMessage('options_turnOffSync')}
          </button>
        )}
      </div>
      {ReactDOM.createPortal(
        <TurnOnSyncDialog
          open={turnOnSyncDialogOpen}
          setOpen={setTurnOnSyncDialogOpen}
          setSyncCloudId={props.setSyncCloudId}
        />,
        document.getElementById('turnOnSyncDialogRoot')!,
      )}
    </div>
  );
};

type SyncNowProps = {
  syncCloudId: CloudId | null;
};

const SyncNow: React.FC<Readonly<SyncNowProps>> = props => {
  const { syncResult: initialSyncResult } = React.useContext(InitialItems);
  const [syncResult, setSyncResult] = React.useState(initialSyncResult);
  const [syncing, setSyncing] = React.useState(false);
  React.useEffect(() => {
    addMessageListeners({
      'blacklist-syncing': () => {
        setSyncing(true);
      },
      'blacklist-synced': result => {
        setSyncResult(result);
        setSyncing(false);
      },
    });
  }, []);
  return (
    <div className="ub-row field is-grouped">
      <div className="control is-expanded">
        <p>{apis.i18n.getMessage('options_syncResult')}</p>
        <p className="has-text-grey">
          {syncing ? (
            apis.i18n.getMessage('options_syncRunning')
          ) : props.syncCloudId == null || syncResult == null ? (
            apis.i18n.getMessage('options_syncNever')
          ) : isErrorResult(syncResult) ? (
            apis.i18n.getMessage('error', syncResult.message)
          ) : (
            <FromNow time={dayjs(syncResult.timestamp)} />
          )}
        </p>
      </div>
      <div className="control">
        <button
          className="ub-button button has-text-primary"
          disabled={syncing || props.syncCloudId == null}
          onClick={() => {
            sendMessage('sync-blacklist');
          }}
        >
          {apis.i18n.getMessage('options_syncNowButton')}
        </button>
      </div>
    </div>
  );
};

export const SyncSection: React.FC = () => {
  const { syncCloudId: initialSyncCloudId } = React.useContext(InitialItems);
  const [syncCloudId, setSyncCloudId] = React.useState(initialSyncCloudId);
  // #if CHROMIUM
  /*
  // #else
  const [android, setAndroid] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const platformInfo = await browser.runtime.getPlatformInfo();
      setAndroid(platformInfo.os === 'android');
    })();
  }, []);
  if (android) {
    return null;
  }
  // #endif
  // #if CHROMIUM
  */
  // #endif
  return (
    <Section id="sync" title={apis.i18n.getMessage('options_syncTitle')}>
      <TurnOnSync syncCloudId={syncCloudId} setSyncCloudId={setSyncCloudId} />
      <SyncNow syncCloudId={syncCloudId} />
      <SetIntervalItem
        itemKey="syncInterval"
        label={apis.i18n.getMessage('options_syncInterval')}
        valueOptions={[5, 15, 30, 60, 120, 300]}
      />
    </Section>
  );
};
