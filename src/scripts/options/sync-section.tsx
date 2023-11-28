import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import React, { useEffect, useState } from 'react';
import { browser } from '../browser';
import { Button, LinkButton } from '../components/button';
import { CheckBox } from '../components/checkbox';
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
import { ControlLabel, Label, LabelWrapper, SubLabel } from '../components/label';
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
import { TextArea } from '../components/textarea';
import { usePrevious } from '../components/utilities';
import '../dayjs-locales';
import { getWebsiteURL, translate } from '../locales';
import { addMessageListeners, sendMessage } from '../messages';
import { supportedClouds } from '../supported-clouds';
import { CloudId } from '../types';
import { AltURL, isErrorResult, stringEntries } from '../utilities';
import { FromNow } from './from-now';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';
import { SetBooleanItem } from './set-boolean-item';
import { SetIntervalItem } from './set-interval-item';

dayjs.extend(dayjsDuration);

const altFlowRedirectURL = getWebsiteURL('/callback');

const TurnOnSyncDialog: React.VFC<
  { setSyncCloudId: React.Dispatch<React.SetStateAction<CloudId | false | null>> } & DialogProps
> = ({ close, open, setSyncCloudId }) => {
  const {
    platformInfo: { os },
  } = useOptionsContext();

  const [state, setState] = useState({
    phase: 'none' as 'none' | 'auth' | 'auth-alt' | 'conn' | 'conn-alt',
    selectedCloudId: 'googleDrive' as CloudId,
    useAltFlow: false,
    authCode: '',
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    state.phase = 'none';
    state.selectedCloudId = 'googleDrive';
    state.useAltFlow = false;
    state.authCode = '';
  }
  const forceAltFlow = supportedClouds[state.selectedCloudId].shouldUseAltFlow(os);

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
              className={state.phase === 'none' ? FOCUS_START_CLASS : ''}
              disabled={state.phase !== 'none'}
              value={state.selectedCloudId}
              onChange={e =>
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
        <Row>
          <RowItem>
            <Indent>
              <CheckBox
                checked={forceAltFlow || state.useAltFlow}
                disabled={state.phase !== 'none' || forceAltFlow}
                id="useAltFlow"
                onChange={e => setState(s => ({ ...s, useAltFlow: e.currentTarget.checked }))}
              />
            </Indent>
          </RowItem>
          <RowItem expanded>
            <LabelWrapper disabled={state.phase !== 'none' || forceAltFlow}>
              <ControlLabel for="useAltFlow">
                {translate('options_turnOnSyncDialog_useAltFlow')}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
        </Row>
        {(forceAltFlow || state.useAltFlow) && (
          <Row>
            <RowItem expanded>
              <Text>
                {translate(
                  'options_turnOnSyncDialog_altFlowDescription',
                  new AltURL(altFlowRedirectURL).host,
                )}
              </Text>
            </RowItem>
          </Row>
        )}
        {state.phase === 'auth-alt' || state.phase === 'conn-alt' ? (
          <Row>
            <RowItem expanded>
              <LabelWrapper fullWidth>
                <ControlLabel for="authCode">
                  {translate('options_turnOnSyncDialog_altFlowAuthCodeLabel')}
                </ControlLabel>
              </LabelWrapper>
              <TextArea
                breakAll
                className={state.phase === 'auth-alt' ? FOCUS_START_CLASS : ''}
                disabled={state.phase !== 'auth-alt'}
                id="authCode"
                rows={2}
                value={state.authCode}
                onChange={e => {
                  setState(s => ({ ...s, authCode: e.currentTarget.value }));
                }}
              />
            </RowItem>
          </Row>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              className={
                state.phase === 'auth' || state.phase === 'conn' || state.phase === 'conn-alt'
                  ? `${FOCUS_START_CLASS} ${FOCUS_END_CLASS}`
                  : state.phase === 'auth-alt' && !state.authCode
                  ? FOCUS_END_CLASS
                  : ''
              }
              onClick={close}
            >
              {translate('cancelButton')}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={
                state.phase === 'none' || (state.phase === 'auth-alt' && state.authCode)
                  ? FOCUS_END_CLASS
                  : ''
              }
              disabled={!(state.phase === 'none' || (state.phase === 'auth-alt' && state.authCode))}
              primary
              onClick={() => {
                void (async () => {
                  let useAltFlow: boolean;
                  let authCode: string;
                  if (state.phase === 'auth-alt') {
                    useAltFlow = true;
                    authCode = state.authCode;
                  } else {
                    const cloud = supportedClouds[state.selectedCloudId];
                    useAltFlow = forceAltFlow || state.useAltFlow;
                    setState(s => ({ ...s, phase: useAltFlow ? 'auth-alt' : 'auth' }));
                    try {
                      const granted = await browser.permissions.request({
                        origins: [
                          ...cloud.hostPermissions,
                          ...(useAltFlow ? [altFlowRedirectURL] : []),
                        ],
                      });
                      if (!granted) {
                        throw new Error('Not granted');
                      }
                      authCode = (await cloud.authorize(useAltFlow)).authorizationCode;
                    } catch {
                      setState(s => ({ ...s, phase: 'none' }));
                      return;
                    }
                  }
                  setState(s => ({ ...s, phase: useAltFlow ? 'conn-alt' : 'conn' }));
                  try {
                    const connected = await sendMessage(
                      'connect-to-cloud',
                      state.selectedCloudId,
                      authCode,
                      useAltFlow,
                    );
                    if (!connected) {
                      throw new Error('Not connected');
                    }
                  } catch {
                    return;
                  } finally {
                    setState(s => ({ ...s, phase: 'none' }));
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

const TurnOnSync: React.VFC<{
  syncCloudId: CloudId | false | null;
  setSyncCloudId: React.Dispatch<React.SetStateAction<CloudId | false | null>>;
}> = ({ syncCloudId, setSyncCloudId }) => {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          {syncCloudId ? (
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
          {syncCloudId ? (
            <Button
              onClick={() => {
                void sendMessage('disconnect-from-cloud');
                setSyncCloudId(false);
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

const SyncNow: React.VFC<{ syncCloudId: CloudId | false | null }> = props => {
  const {
    initialItems: { syncResult: initialSyncResult },
  } = useOptionsContext();
  const [syncResult, setSyncResult] = useState(initialSyncResult);
  const [updated, setUpdated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        syncing: id => {
          if (id !== props.syncCloudId) {
            return;
          }
          setUpdated(false);
          setSyncing(true);
        },
        synced: (id, result, updated) => {
          if (id !== props.syncCloudId) {
            return;
          }
          setSyncResult(result);
          setUpdated(updated);
          setSyncing(false);
        },
      }),
    [props.syncCloudId],
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
              ) : !props.syncCloudId || !syncResult ? (
                translate('options_syncNever')
              ) : isErrorResult(syncResult) ? (
                translate('error', syncResult.message)
              ) : (
                <FromNow time={dayjs(syncResult.timestamp)} />
              )}
              {updated ? (
                <>
                  {' '}
                  <LinkButton
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    {translate('options_syncReloadButton')}
                  </LinkButton>
                </>
              ) : null}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            disabled={syncing || !props.syncCloudId}
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

const SyncCategories: React.VFC<{ disabled: boolean }> = ({ disabled }) => (
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

export const SyncSection: React.VFC = () => {
  const {
    initialItems: { syncCloudId: initialSyncCloudId },
  } = useOptionsContext();
  const [syncCloudId, setSyncCloudId] = useState(initialSyncCloudId);
  return (
    <Section aria-labelledby="syncSectionTitle" id="sync">
      <SectionHeader>
        <SectionTitle id="syncSectionTitle">{translate('options_syncTitle')}</SectionTitle>
      </SectionHeader>
      <SectionBody>
        <TurnOnSync setSyncCloudId={setSyncCloudId} syncCloudId={syncCloudId} />
        <SyncNow syncCloudId={syncCloudId} />
        <SyncCategories disabled={!syncCloudId} />
        <SectionItem>
          <SetIntervalItem
            disabled={!syncCloudId}
            itemKey="syncInterval"
            label={translate('options_syncInterval')}
            valueOptions={[5, 10, 15, 30, 60, 120]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
