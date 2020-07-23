import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import { Fragment, FunctionComponent, h } from 'preact';
import { useContext, useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import '../dayjs-locales';
import * as LocalStorage from '../local-storage';
import { addMessageListeners, sendMessage } from '../messages';
import { Dialog, DialogProps } from '../shared/dialog';
import { supportedClouds } from '../supported-clouds';
import { CloudId } from '../types';
import { isErrorResult, translate } from '../utilities';
import { Context } from './context';
import { FromNow } from './from-now';
import { Portal } from './portal';
import { Section, SectionItem } from './section';
import { SetIntervalItem } from './set-interval-item';

dayjs.extend(dayjsDuration);

const NotifySyncUpdated: FunctionComponent = () => {
  const { sync: initialSync } = useContext(Context).initialItems;
  useEffect(() => {
    if (initialSync) {
      LocalStorage.store({ sync: false });
      window.location.hash = 'sync';
    }
  }, [initialSync]);
  return initialSync ? (
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="ub-notify-sync-updated-icon control" />
        <div class="control is-expanded">
          <p>{translate('options_syncFeatureUpdated')}</p>
        </div>
      </div>
    </SectionItem>
  ) : null;
};

type TurnOnSyncDialogProps = DialogProps & {
  setSyncCloudId(syncCloudId: CloudId): void;
};

const TurnOnSyncDialog: FunctionComponent<Readonly<TurnOnSyncDialogProps>> = props => {
  const [syncCloudId, setSyncCloudId] = useState<CloudId>('googleDrive');
  useLayoutEffect(() => {
    if (props.open) {
      setSyncCloudId('googleDrive');
    }
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div class="field">
        <h1 class="title">{translate('options_turnOnSyncDialog_title')}</h1>
      </div>
      {(Object.keys(supportedClouds) as CloudId[]).map(cloudId => (
        <div key={cloudId} class="ub-row field is-grouped">
          <div class="control">
            <input
              id={cloudId}
              type="radio"
              checked={cloudId === syncCloudId}
              name="syncCloudId"
              onInput={e => {
                if (e.currentTarget.checked) {
                  setSyncCloudId(cloudId);
                }
              }}
            />
          </div>
          <div class="control">
            <label for={cloudId}>
              <p>{translate(supportedClouds[cloudId].messageNames.sync)}</p>
              <p class="has-text-grey">
                {translate(supportedClouds[cloudId].messageNames.syncDescription)}
              </p>
            </label>
          </div>
        </div>
      ))}
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
            {translate('options_turnOnSyncDialog_turnOnSyncButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type TurnOnSyncProps = {
  syncCloudId: CloudId | null;
  setSyncCloudId(syncCloudId: CloudId | null): void;
};

const TurnOnSync: FunctionComponent<Readonly<TurnOnSyncProps>> = props => {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="control is-expanded">
          {props.syncCloudId == null ? (
            <Fragment>
              <p>{translate('options_syncFeature')}</p>
              <p class="has-text-grey">{translate('options_syncFeatureDescription')}</p>
            </Fragment>
          ) : (
            <p>{translate(supportedClouds[props.syncCloudId].messageNames.syncTurnedOn)}</p>
          )}
        </div>
        <div class="control">
          {props.syncCloudId == null ? (
            <button
              class="ub-button button is-primary"
              onClick={() => {
                setTurnOnSyncDialogOpen(true);
              }}
            >
              {translate('options_turnOnSync')}
            </button>
          ) : (
            <button
              class="ub-button button has-text-primary"
              onClick={() => {
                sendMessage('disconnect-from-cloud');
                props.setSyncCloudId(null);
              }}
            >
              {translate('options_turnOffSync')}
            </button>
          )}
        </div>
        <Portal id="turnOnSyncDialog">
          <TurnOnSyncDialog
            open={turnOnSyncDialogOpen}
            setOpen={setTurnOnSyncDialogOpen}
            setSyncCloudId={props.setSyncCloudId}
          />
        </Portal>
      </div>
    </SectionItem>
  );
};

type SyncNowProps = {
  syncCloudId: CloudId | null;
};

const SyncNow: FunctionComponent<Readonly<SyncNowProps>> = props => {
  const { syncResult: initialSyncResult } = useContext(Context).initialItems;
  const [syncResult, setSyncResult] = useState(initialSyncResult);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
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
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="control is-expanded">
          <p>{translate('options_syncResult')}</p>
          <p class="has-text-grey">
            {syncing ? (
              translate('options_syncRunning')
            ) : props.syncCloudId == null || syncResult == null ? (
              translate('options_syncNever')
            ) : isErrorResult(syncResult) ? (
              translate('error', syncResult.message)
            ) : (
              <FromNow time={dayjs(syncResult.timestamp)} />
            )}
          </p>
        </div>
        <div class="control">
          <button
            class="ub-button button has-text-primary"
            disabled={syncing || props.syncCloudId == null}
            onClick={() => {
              sendMessage('sync-blacklist');
            }}
          >
            {translate('options_syncNowButton')}
          </button>
        </div>
      </div>
    </SectionItem>
  );
};

export const SyncSection: FunctionComponent = () => {
  const {
    initialItems: { syncCloudId: initialSyncCloudId },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    platformInfo: { os },
  } = useContext(Context);
  const [syncCloudId, setSyncCloudId] = useState(initialSyncCloudId);
  // #if CHROMIUM
  const mobile = false;
  /*
  // #else
  const mobile = os === 'android';
  // #endif
  // #if CHROMIUM
  */
  // #endif
  return mobile ? null : (
    <Section id="sync" title={translate('options_syncTitle')}>
      <NotifySyncUpdated />
      <TurnOnSync syncCloudId={syncCloudId} setSyncCloudId={setSyncCloudId} />
      <SyncNow syncCloudId={syncCloudId} />
      <SetIntervalItem
        itemKey="syncInterval"
        label={translate('options_syncInterval')}
        valueOptions={[5, 15, 30, 60, 120, 300]}
      />
    </Section>
  );
};
