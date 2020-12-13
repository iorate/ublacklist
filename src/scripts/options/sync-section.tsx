import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import { Button } from '../components/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogProps,
  DialogTitle,
} from '../components/dialog';
import { Label, LabelItem } from '../components/label';
import { Portal } from '../components/portal';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { Text } from '../components/text';
import '../dayjs-locales';
import { addMessageListeners, sendMessage } from '../messages';
import { supportedClouds } from '../supported-clouds';
import { CloudId } from '../types';
import { isErrorResult, stringEntries, stringKeys, translate } from '../utilities';
import { FromNow } from './from-now';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';
import { SetIntervalItem } from './set-interval-item';

dayjs.extend(dayjsDuration);

const TurnOnSyncDialog: FunctionComponent<
  { setSyncCloudId: StateUpdater<CloudId | null> } & DialogProps
> = ({ close, open, setSyncCloudId }) => {
  const [selectedCloudId, setSelectedCloudId] = useState<CloudId>('googleDrive');
  useLayoutEffect(() => {
    if (open) {
      setSelectedCloudId(stringKeys(supportedClouds)[0]);
    }
  }, [open]);
  return (
    <Dialog close={close} open={open} width="480px">
      <DialogHeader>
        <DialogTitle>{translate('options_turnOnSyncDialog_title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem>
            <Select
              class="js-focus-start"
              value={selectedCloudId}
              onInput={e => {
                setSelectedCloudId(e.currentTarget.value as CloudId);
              }}
            >
              {stringEntries(supportedClouds).map(([id, cloud]) => (
                <SelectOption key={id} value={id}>
                  {translate(cloud.messageNames.sync)}
                </SelectOption>
              ))}
            </Select>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Text>{translate(supportedClouds[selectedCloudId].messageNames.syncDescription)}</Text>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button onClick={close}>{translate('cancelButton')}</Button>
          </RowItem>
          <RowItem>
            <Button
              class="js-focus-end"
              primary
              onClick={() => {
                void (async () => {
                  const granted = await apis.permissions.request({
                    origins: supportedClouds[selectedCloudId].hostPermissions,
                  });
                  if (!granted) {
                    return;
                  }
                  const connected = await sendMessage('connect-to-cloud', selectedCloudId);
                  if (!connected) {
                    return;
                  }
                  setSyncCloudId(selectedCloudId);
                  close();
                })();
              }}
            >
              {translate('options_turnOnSyncDialog_turnOnSyncButton')}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const TurnOnSync: FunctionComponent<{
  syncCloudId: CloudId | null;
  setSyncCloudId: StateUpdater<CloudId | null>;
}> = ({ syncCloudId, setSyncCloudId }) => {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          {syncCloudId != null ? (
            <Label>
              <LabelItem primary>
                {translate(supportedClouds[syncCloudId].messageNames.syncTurnedOn)}
              </LabelItem>
            </Label>
          ) : (
            <Label>
              <LabelItem primary>{translate('options_syncFeature')}</LabelItem>
              <LabelItem>{translate('options_syncFeatureDescription')}</LabelItem>
            </Label>
          )}
        </RowItem>
        <RowItem>
          {syncCloudId != null ? (
            <Button
              onClick={() => {
                void sendMessage('disconnect-from-cloud');
                setSyncCloudId(null);
              }}
            >
              {translate('options_turnOffSync')}
            </Button>
          ) : (
            <Button
              primary
              onClick={() => {
                setTurnOnSyncDialogOpen(true);
              }}
            >
              {translate('options_turnOnSync')}
            </Button>
          )}
        </RowItem>
      </Row>
      <Portal>
        <TurnOnSyncDialog
          close={() => setTurnOnSyncDialogOpen(false)}
          open={turnOnSyncDialogOpen}
          setSyncCloudId={setSyncCloudId}
        />
      </Portal>
    </SectionItem>
  );
};

const SyncNow: FunctionComponent<{ syncCloudId: CloudId | null }> = props => {
  const {
    initialItems: { syncResult: initialSyncResult },
  } = useOptionsContext();
  const [syncResult, setSyncResult] = useState(initialSyncResult);
  const [syncing, setSyncing] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        'blacklist-syncing': () => {
          setSyncing(true);
        },
        'blacklist-synced': result => {
          setSyncResult(result);
          setSyncing(false);
        },
      }),
    [],
  );
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <Label>
            <LabelItem primary>{translate('options_syncResult')}</LabelItem>
            <LabelItem>
              {syncing ? (
                translate('options_syncRunning')
              ) : props.syncCloudId == null || syncResult == null ? (
                translate('options_syncNever')
              ) : isErrorResult(syncResult) ? (
                translate('error', syncResult.message)
              ) : (
                <FromNow time={dayjs(syncResult.timestamp)} />
              )}
            </LabelItem>
          </Label>
        </RowItem>
        <RowItem>
          <Button
            disabled={syncing || props.syncCloudId == null}
            onClick={() => {
              void sendMessage('sync-blacklist');
            }}
          >
            {translate('options_syncNowButton')}
          </Button>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

export const SyncSection: FunctionComponent = () => {
  const {
    initialItems: { syncCloudId: initialSyncCloudId },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    platformInfo: { os },
  } = useOptionsContext();
  const [syncCloudId, setSyncCloudId] = useState(initialSyncCloudId);
  /* #if FIREFOX
  if (os === 'android') {
    return null;
  }
  */
  // #endif
  return (
    <Section id="sync">
      <SectionHeader>
        <SectionTitle>{translate('options_syncTitle')}</SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync syncCloudId={syncCloudId} setSyncCloudId={setSyncCloudId} />
        <SyncNow syncCloudId={syncCloudId} />
        <SetIntervalItem
          itemKey="syncInterval"
          label={translate('options_syncInterval')}
          valueOptions={[5, 15, 30, 60, 120, 300]}
        />
      </SectionBody>
    </Section>
  );
};
