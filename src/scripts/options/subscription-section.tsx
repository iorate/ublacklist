import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
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
import { Input } from '../components/input';
import { Label, LabelWrapper, SubLabel } from '../components/label';
import { Menu, MenuBody, MenuButton, MenuItem } from '../components/menu';
import { Portal } from '../components/portal';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { useCSS } from '../components/styles';
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from '../components/table';
import { ReadOnlyTextArea } from '../components/textarea';
import { addMessageListeners, sendMessage } from '../messages';
import { Subscription, SubscriptionId, Subscriptions } from '../types';
import { isErrorResult, numberEntries, numberKeys, translate } from '../utilities';
import { FromNow } from './from-now';
import { useOptionsContext } from './options-context';
import { SetIntervalItem } from './set-interval-item';

const AddSubscriptionDialog: FunctionComponent<
  { setSubscriptions: StateUpdater<Subscriptions> } & DialogProps
> = ({ close, open, setSubscriptions }) => {
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(false);
  const [url, setURL] = useState('');
  const [urlValid, setURLValid] = useState(false);
  useLayoutEffect(() => {
    if (open) {
      setName('');
      setNameValid(false);
      setURL('');
      setURLValid(false);
    }
  }, [open]);
  const ok = nameValid && urlValid;
  return (
    <Dialog aria-labelledby="addSubscriptionDialogTitle" close={close} open={open} width="480px">
      <DialogHeader>
        <DialogTitle id="addSubscriptionDialogTitle">
          {translate('options_addSubscriptionDialog_title')}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <Label for="subscriptionName">
                {translate('options_addSubscriptionDialog_nameLabel')}
              </Label>
            </LabelWrapper>
            <Input
              class={FOCUS_START_CLASS}
              id="subscriptionName"
              required={true}
              value={name}
              onInput={e => {
                setName(e.currentTarget.value);
                setNameValid(e.currentTarget.validity.valid);
              }}
            />
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <Label for="subscriptionURL">
                {translate('options_addSubscriptionDialog_urlLabel')}
              </Label>
            </LabelWrapper>
            <Input
              id="subscriptionURL"
              pattern="^https?:.*"
              required={true}
              type="url"
              value={url}
              onInput={e => {
                setURL(e.currentTarget.value);
                setURLValid(e.currentTarget.validity.valid);
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button class={!ok ? FOCUS_END_CLASS : undefined} onClick={close}>
              {translate('cancelButton')}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              class={ok ? FOCUS_END_CLASS : undefined}
              disabled={!ok}
              primary
              onClick={async () => {
                const u = new URL(url);
                const granted = await apis.permissions.request({
                  origins: [`${u.protocol}//${u.hostname}/*`],
                });
                if (!granted) {
                  return;
                }
                const subscription = {
                  name,
                  url: u.toString(),
                  blacklist: '',
                  updateResult: null,
                };
                const id = await sendMessage('add-subscription', subscription);
                setSubscriptions(subscriptions => ({ ...subscriptions, [id]: subscription }));
                close();
              }}
            >
              {translate('options_addSubscriptionDialog_addButton')}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const ShowSubscriptionDialog: FunctionComponent<
  { subscription: Subscription | null } & DialogProps
> = ({ close, open, subscription }) => {
  const blacklistTextArea = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (open) {
      blacklistTextArea.current.scrollTop = 0;
    }
  }, [open]);
  return (
    <Dialog aria-labelledby="showSubscriptionDialogTitle" close={close} open={open} width="480px">
      <DialogHeader>
        <DialogTitle id="showSubscriptionDialogTitle">{subscription?.name ?? ''}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <ReadOnlyTextArea
              aria-label="Blacklist"
              class={FOCUS_START_CLASS}
              ref={blacklistTextArea}
              rows={10}
              wrap="off"
              value={subscription?.blacklist ?? ''}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button class={FOCUS_END_CLASS} primary onClick={close}>
              {translate('okButton')}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const ManageSubscription: FunctionComponent<{
  id: SubscriptionId;
  setShowSubscriptionDialogOpen: StateUpdater<boolean>;
  setShowSubscriptionDialogSubscription: StateUpdater<Subscription | null>;
  setSubscriptions: StateUpdater<Subscriptions>;
  subscription: Subscription;
  updating: boolean;
}> = ({
  id,
  setSubscriptions,
  setShowSubscriptionDialogOpen,
  setShowSubscriptionDialogSubscription,
  subscription,
  updating,
}) => {
  return (
    <TableBodyRow>
      <TableBodyCell>{subscription.name}</TableBodyCell>
      <TableBodyCell breakAll>{subscription.url}</TableBodyCell>
      <TableBodyCell>
        {updating ? (
          translate('options_subscriptionUpdateRunning')
        ) : !subscription.updateResult ? (
          ''
        ) : isErrorResult(subscription.updateResult) ? (
          translate('error', subscription.updateResult.message)
        ) : (
          <FromNow time={dayjs(subscription.updateResult.timestamp)} />
        )}
      </TableBodyCell>
      <TableBodyCell>
        <Menu>
          <MenuButton aria-label="Open the menu" />
          <MenuBody>
            <MenuItem
              onClick={() => {
                requestAnimationFrame(() => {
                  setShowSubscriptionDialogOpen(true);
                  setShowSubscriptionDialogSubscription(subscription);
                });
              }}
            >
              {translate('options_showSubscriptionMenu')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                void sendMessage('update-subscription', id);
              }}
            >
              {translate('options_updateSubscriptionNowMenu')}
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await sendMessage('remove-subscription', id);
                setSubscriptions(subscriptions => {
                  const newSubscriptions = { ...subscriptions };
                  delete newSubscriptions[id];
                  return newSubscriptions;
                });
              }}
            >
              {translate('options_removeSubscriptionMenu')}
            </MenuItem>
          </MenuBody>
        </Menu>
      </TableBodyCell>
    </TableBodyRow>
  );
};

export const ManageSubscriptions: FunctionComponent = () => {
  const {
    initialItems: { subscriptions: initialSubscriptions },
  } = useOptionsContext();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(false);
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] = useState(false);
  const [
    showSubscriptionDialogSubscription,
    setShowSubscriptionDialogSubscription,
  ] = useState<Subscription | null>(null);
  useEffect(
    () =>
      addMessageListeners({
        'subscription-updating': id => {
          setUpdating(updating => ({ ...updating, [id]: true }));
        },
        'subscription-updated': (id, subscription) => {
          setSubscriptions(subscriptions => ({ ...subscriptions, [id]: subscription }));
          setUpdating(updating => ({ ...updating, [id]: false }));
        },
      }),
    [],
  );

  const css = useCSS();
  const emptyClass = useMemo(
    () =>
      css({
        minHeight: '3em',
        textAlign: 'center',
      }),
    [css],
  );

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate('options_subscriptionFeature')}</Label>
            <SubLabel>{translate('options_subscriptionFeatureDescription')}</SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            primary
            onClick={() => {
              setAddSubscriptionDialogOpen(true);
            }}
          >
            {translate('options_addSubscriptionButton')}
          </Button>
        </RowItem>
      </Row>
      {numberKeys(subscriptions).length ? (
        <Row>
          <RowItem expanded>
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell width="20%">
                    {translate('options_subscriptionNameHeader')}
                  </TableHeaderCell>
                  {
                    // #if !SAFARI
                    <TableHeaderCell width="calc(60% - 0.75em - 36px)">
                      {translate('options_subscriptionURLHeader')}
                    </TableHeaderCell>
                    /* #else
                    <TableHeaderCell width="calc((640px - 1.25em * 2) * 0.6 - 0.75em - 36px)">
                      {translate('options_subscriptionURLHeader')}
                    </TableHeaderCell>
                    */
                    // #endif
                  }
                  <TableHeaderCell width="20%">
                    {translate('options_subscriptionUpdateResultHeader')}
                  </TableHeaderCell>
                  <TableHeaderCell width="calc(0.75em + 36px)" />
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {numberEntries(subscriptions)
                  .sort(([id1, { name: name1 }], [id2, { name: name2 }]) =>
                    name1 < name2 ? -1 : name1 > name2 ? 1 : id1 - id2,
                  )
                  .map(([id, subscription]) => (
                    <ManageSubscription
                      key={id}
                      id={id}
                      subscription={subscription}
                      updating={updating[id] ?? false}
                      setSubscriptions={setSubscriptions}
                      setShowSubscriptionDialogOpen={setShowSubscriptionDialogOpen}
                      setShowSubscriptionDialogSubscription={setShowSubscriptionDialogSubscription}
                    />
                  ))}
              </TableBody>
            </Table>
          </RowItem>
        </Row>
      ) : (
        <Row class={emptyClass}>
          <RowItem expanded>{translate('options_noSubscriptionsAdded')}</RowItem>
        </Row>
      )}
      <Row right>
        <RowItem>
          <Button
            disabled={!numberKeys(subscriptions).length}
            onClick={() => {
              void sendMessage('update-all-subscriptions');
            }}
          >
            {translate('options_updateAllSubscriptionsNowButton')}
          </Button>
        </RowItem>
      </Row>
      <Portal>
        <AddSubscriptionDialog
          close={() => setAddSubscriptionDialogOpen(false)}
          open={addSubscriptionDialogOpen}
          setSubscriptions={setSubscriptions}
        />
      </Portal>
      <Portal>
        <ShowSubscriptionDialog
          close={() => setShowSubscriptionDialogOpen(false)}
          open={showSubscriptionDialogOpen}
          subscription={showSubscriptionDialogSubscription}
        />
      </Portal>
    </SectionItem>
  );
};

export const SubscriptionSection: FunctionComponent = () => (
  <Section id="subscription">
    <SectionHeader>
      <SectionTitle>{translate('options_subscriptionTitle')}</SectionTitle>
    </SectionHeader>
    <SectionBody>
      <ManageSubscriptions />
      <SetIntervalItem
        itemKey="updateInterval"
        label={translate('options_updateInterval')}
        valueOptions={[5, 15, 30, 60, 120, 300]}
      />
    </SectionBody>
  </Section>
);
