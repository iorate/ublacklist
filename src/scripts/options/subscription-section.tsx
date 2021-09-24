import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useMemo, useState } from 'preact/hooks';
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
import { ControlLabel, Label, LabelWrapper, SubLabel } from '../components/label';
import { Menu, MenuItem } from '../components/menu';
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
import { TextArea } from '../components/textarea';
import { usePrevious } from '../components/utilities';
import { translate } from '../locales';
import { addMessageListeners, sendMessage } from '../messages';
import { Subscription, SubscriptionId, Subscriptions } from '../types';
import { AltURL, MatchPattern, isErrorResult, numberEntries, numberKeys } from '../utilities';
import { FromNow } from './from-now';
import { useOptionsContext } from './options-context';
import { SetIntervalItem } from './set-interval-item';

const PERMISSION_PASSLIST = [
  '*://*.githubusercontent.com/*',
  // A third-party CDN service supporting GitHub, GitLab and BitBucket
  '*://cdn.statically.io/*',
];

async function requestPermission(urls: readonly string[]): Promise<boolean> {
  const origins: string[] = [];
  const passlist = PERMISSION_PASSLIST.map(pass => new MatchPattern(pass));
  for (const url of urls) {
    const u = new AltURL(url);
    if (passlist.some(pass => pass.test(u))) {
      continue;
    }
    origins.push(`${u.scheme}://${u.host}/*`);
  }
  // Don't call `permissions.request` when unnecessary. re #110
  return origins.length ? apis.permissions.request({ origins }) : true;
}

const AddSubscriptionDialog: FunctionComponent<
  {
    initialName: string;
    initialURL: string;
    setSubscriptions: StateUpdater<Subscriptions>;
  } & DialogProps
> = ({ close, open, initialName, initialURL, setSubscriptions }) => {
  const [state, setState] = useState(() => ({
    name: initialName,
    // required
    nameValid: initialName !== '',
    url: initialURL,
    urlValid: (() => {
      // pattern="https?:.*"
      // required
      if (!initialURL || !/^https?:/.test(initialURL)) {
        return false;
      }
      // type="url"
      try {
        new URL(initialURL);
      } catch {
        return false;
      }
      return true;
    })(),
  }));
  const prevOpen = usePrevious(open);
  if (open && prevOpen === false) {
    state.name = '';
    state.nameValid = false;
    state.url = '';
    state.urlValid = false;
  }
  const ok = state.nameValid && state.urlValid;

  return (
    <Dialog aria-labelledby="addSubscriptionDialogTitle" close={close} open={open}>
      <DialogHeader>
        <DialogTitle id="addSubscriptionDialogTitle">
          {translate('options_addSubscriptionDialog_title')}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for="subscriptionName">
                {translate('options_addSubscriptionDialog_nameLabel')}
              </ControlLabel>
            </LabelWrapper>
            {open && (
              <Input
                class={FOCUS_START_CLASS}
                id="subscriptionName"
                required={true}
                value={state.name}
                onInput={e =>
                  setState(s => ({
                    ...s,
                    name: e.currentTarget.value,
                    nameValid: e.currentTarget.validity.valid,
                  }))
                }
              />
            )}
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for="subscriptionURL">
                {translate('options_addSubscriptionDialog_urlLabel')}
              </ControlLabel>
            </LabelWrapper>
            {open && (
              <Input
                id="subscriptionURL"
                pattern="https?:.*"
                required={true}
                type="url"
                value={state.url}
                onInput={e =>
                  setState(s => ({
                    ...s,
                    url: e.currentTarget.value,
                    urlValid: e.currentTarget.validity.valid,
                  }))
                }
              />
            )}
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
                if (!(await requestPermission([state.url]))) {
                  return;
                }
                const subscription = {
                  name: state.name,
                  url: state.url,
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
  return (
    <Dialog aria-labelledby="showSubscriptionDialogTitle" close={close} open={open}>
      <DialogHeader>
        <DialogTitle id="showSubscriptionDialogTitle">{subscription?.name ?? ''}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            {open && (
              <TextArea
                aria-label={translate('options_showSubscriptionDialog_blacklistLabel')}
                class={FOCUS_START_CLASS}
                readOnly
                rows={10}
                value={subscription?.blacklist ?? ''}
                wrap="off"
              />
            )}
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
        <Menu buttonLabel={translate('options_subscriptionMenuButtonLabel')}>
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
            onClick={async () => {
              if (!(await requestPermission([subscription.url]))) {
                return;
              }
              await sendMessage('update-subscription', id);
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
        </Menu>
      </TableBodyCell>
    </TableBodyRow>
  );
};

export const ManageSubscriptions: FunctionComponent<{
  subscriptions: Subscriptions;
  setSubscriptions: StateUpdater<Subscriptions>;
}> = ({ subscriptions, setSubscriptions }) => {
  const { query } = useOptionsContext();

  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(
    query.addSubscriptionName != null || query.addSubscriptionURL != null,
  );
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] = useState(false);
  const [showSubscriptionDialogSubscription, setShowSubscriptionDialogSubscription] =
    useState<Subscription | null>(null);

  useEffect(
    () =>
      addMessageListeners({
        'subscription-updating': id => {
          setUpdating(updating => ({ ...updating, [id]: true }));
        },
        'subscription-updated': (id, subscription) => {
          setSubscriptions(subscriptions =>
            subscriptions[id] ? { ...subscriptions, [id]: subscription } : subscriptions,
          );
          setUpdating(updating => ({ ...updating, [id]: false }));
        },
      }),
    [subscriptions, setSubscriptions],
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
                    <TableHeaderCell width="calc((min(640px, 100vw) - 1.25em * 2) * 0.6 - 0.75em - 36px)">
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
                      id={id}
                      key={id}
                      setShowSubscriptionDialogOpen={setShowSubscriptionDialogOpen}
                      setShowSubscriptionDialogSubscription={setShowSubscriptionDialogSubscription}
                      setSubscriptions={setSubscriptions}
                      subscription={subscription}
                      updating={updating[id] ?? false}
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
            onClick={async () => {
              if (!(await requestPermission(Object.values(subscriptions).map(s => s.url)))) {
                return;
              }
              await sendMessage('update-all-subscriptions');
            }}
          >
            {translate('options_updateAllSubscriptionsNowButton')}
          </Button>
        </RowItem>
      </Row>
      <Portal id="addSubscriptionDialogPortal">
        <AddSubscriptionDialog
          close={() => setAddSubscriptionDialogOpen(false)}
          initialName={query.addSubscriptionName ?? ''}
          initialURL={query.addSubscriptionURL ?? ''}
          open={addSubscriptionDialogOpen}
          setSubscriptions={setSubscriptions}
        />
      </Portal>
      <Portal id="showSubscriptionDialogPortal">
        <ShowSubscriptionDialog
          close={() => setShowSubscriptionDialogOpen(false)}
          open={showSubscriptionDialogOpen}
          subscription={showSubscriptionDialogSubscription}
        />
      </Portal>
    </SectionItem>
  );
};

export const SubscriptionSection: FunctionComponent = () => {
  const {
    initialItems: { subscriptions: initialSubscriptions },
  } = useOptionsContext();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  return (
    <Section aria-labelledby="subscriptionSectionTitle" id="subscription">
      <SectionHeader>
        <SectionTitle id="subscriptionSectionTitle">
          {translate('options_subscriptionTitle')}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <ManageSubscriptions setSubscriptions={setSubscriptions} subscriptions={subscriptions} />
        <SectionItem>
          <SetIntervalItem
            disabled={!numberKeys(subscriptions).length}
            itemKey="updateInterval"
            label={translate('options_updateInterval')}
            valueOptions={[5, 15, 30, 60, 120, 300]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
