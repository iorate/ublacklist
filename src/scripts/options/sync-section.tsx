import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import { Button } from '../components/button';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from '../components/constants';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogProps,
  DialogTitle,
} from '../components/dialog';
import { Indent } from '../components/indent';
import { Label, LabelWrapper, SubLabel } from '../components/label';
import { List, ListItem } from '../components/list';
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
import { usePrevious } from '../components/utilities';
import '../dayjs-locales';
import { addMessageListeners, sendMessage } from '../messages';
import { supportedClouds } from '../supported-clouds';
import { CloudId } from '../types';
import { isErrorResult, stringEntries, translate } from '../utilities';
import { FromNow } from './from-now';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';
import { SetBooleanItem } from './set-boolean-item';
import { SetIntervalItem } from './set-interval-item';

dayjs.extend(dayjsDuration);

const TurnOnSyncDialog: FunctionComponent<
  { setSyncCloudId: StateUpdater<CloudId | null> } & DialogProps
> = ({ close, open, setSyncCloudId }) => {
  const [state, setState] = useState({
    selectedCloudId: 'googleDrive' as CloudId,
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    state.selectedCloudId = 'googleDrive';
  }

  return (
    <Dialog aria-labelledby="turnOnSyncDialogTitle" close={close} open={open}>
      <DialogHeader>
        <DialogTitle id="turnOnSyncDialogTitle">
          {translate('options_turnOnSyncDialog_title')}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem>
            <Select
              class={FOCUS_START_CLASS}
              value={state.selectedCloudId}
              onInput={e =>
                setState(s => ({ ...s, selectedCloudId: e.currentTarget.value as CloudId }))
              }
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
            <Text>
              {translate(supportedClouds[state.selectedCloudId].messageNames.syncDescription)}
            </Text>
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
              class={FOCUS_END_CLASS}
              primary
              onClick={() => {
                void (async () => {
                  const granted = await apis.permissions.request({
                    origins: supportedClouds[state.selectedCloudId].hostPermissions,
                  });
                  if (!granted) {
                    return;
                  }
                  const connected = await sendMessage('connect-to-cloud', state.selectedCloudId);
                  if (!connected) {
                    return;
                  }
                  setSyncCloudId(state.selectedCloudId);
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
            <LabelWrapper>
              <Label>{translate(supportedClouds[syncCloudId].messageNames.syncTurnedOn)}</Label>
            </LabelWrapper>
          ) : (
            <LabelWrapper>
              <Label>{translate('options_syncFeature')}</Label>
              <SubLabel>{translate('options_syncFeatureDescription')}</SubLabel>
            </LabelWrapper>
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
      <Portal id="turnOnSyncDialogPortal">
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
        syncing: () => {
          setSyncing(true);
        },
        synced: result => {
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
          <LabelWrapper>
            <Label>{translate('options_syncResult')}</Label>
            <SubLabel>
              {syncing ? (
                translate('options_syncRunning')
              ) : props.syncCloudId == null || syncResult == null ? (
                translate('options_syncNever')
              ) : isErrorResult(syncResult) ? (
                translate('error', syncResult.message)
              ) : (
                <FromNow time={dayjs(syncResult.timestamp)} />
              )}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            disabled={syncing || props.syncCloudId == null}
            onClick={() => {
              void sendMessage('sync');
            }}
          >
            {translate('options_syncNowButton')}
          </Button>
        </RowItem>
      </Row>
    </SectionItem>
  );
};

const SyncCategories: FunctionComponent<{ disabled: boolean }> = ({ disabled }) => (
  <SectionItem>
    <Row>
      <RowItem expanded>
        <LabelWrapper>
          <Label>{translate('options_syncCategories')}</Label>
        </LabelWrapper>
      </RowItem>
    </Row>
    <Row>
      <RowItem>
        <Indent />
      </RowItem>
      <RowItem expanded>
        <List>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncBlocklist"
              label={translate('options_syncBlocklist')}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncGeneral"
              label={translate('options_syncGeneral')}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncAppearance"
              label={translate('options_syncAppearance')}
            />
          </ListItem>
          <ListItem>
            <SetBooleanItem
              disabled={disabled}
              itemKey="syncSubscriptions"
              label={translate('options_syncSubscriptions')}
            />
          </ListItem>
        </List>
      </RowItem>
    </Row>
  </SectionItem>
);

export const SyncSection: FunctionComponent = () => {
  // #if !SAFARI
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
    <Section aria-labelledby="syncSectionTitle" id="sync">
      <SectionHeader>
        <SectionTitle id="syncSectionTitle">{translate('options_syncTitle')}</SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync setSyncCloudId={setSyncCloudId} syncCloudId={syncCloudId} />
        <SyncNow syncCloudId={syncCloudId} />
        <SyncCategories disabled={syncCloudId == null} />
        <SectionItem>
          <SetIntervalItem
            disabled={syncCloudId == null}
            itemKey="syncInterval"
            label={translate('options_syncInterval')}
            valueOptions={[5, 15, 30, 60, 120, 300]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
  /* #else
  return null;
  */
  // #endif
};
