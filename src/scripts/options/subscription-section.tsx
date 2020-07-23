import dayjs from 'dayjs';
import { FunctionComponent, h } from 'preact';
import { useContext, useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { apis } from '../apis';
import { addMessageListeners, sendMessage } from '../messages';
import { Dialog, DialogProps } from '../shared/dialog';
import { Subscription, SubscriptionId, Subscriptions } from '../types';
import { AltURL, isErrorResult, translate } from '../utilities';
import { Context } from './context';
import { FromNow } from './from-now';
import { Portal } from './portal';
import { Section, SectionItem } from './section';
import { SetIntervalItem } from './set-interval-item';

type AddSubscriptionDialogProps = DialogProps & {
  setSubscriptions(update: (subscriptions: Subscriptions) => Subscriptions): void;
};

const AddSubscriptionDialog: FunctionComponent<Readonly<AddSubscriptionDialogProps>> = props => {
  const [name, setName] = useState('');
  const [nameValid, setNameValid] = useState(false);
  const [url, setURL] = useState('');
  const [urlValid, setURLValid] = useState(false);
  useLayoutEffect(() => {
    if (props.open) {
      setName('');
      setNameValid(false);
      setURL('');
      setURLValid(false);
    }
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div class="field">
        <h1 class="title">{translate('options_addSubscriptionDialog_title')}</h1>
      </div>
      <div class="field">
        <label class="label" for="subscriptionName">
          {translate('options_addSubscriptionDialog_nameLabel')}
        </label>
        <div class="control">
          <input
            id="subscriptionName"
            class="input"
            type="text"
            required={true}
            value={name}
            onInput={e => {
              setName(e.currentTarget.value);
              setNameValid(e.currentTarget.validity.valid);
            }}
          />
        </div>
      </div>
      <div class="field">
        <label class="label" for="subscriptionURL">
          {translate('options_addSubscriptionDialog_urlLabel')}
        </label>
        <div class="control">
          <input
            id="subscriptionURL"
            class="input"
            type="url"
            pattern="^https?:.*"
            required={true}
            value={url}
            onInput={e => {
              setURL(e.currentTarget.value);
              setURLValid(e.currentTarget.validity.valid);
            }}
          />
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
            disabled={!nameValid || !urlValid}
            onClick={async () => {
              const normalizedURL = new AltURL(url).toString();
              if (!(await apis.permissions.request({ origins: [normalizedURL] }))) {
                return;
              }
              const subscription = {
                name,
                url: normalizedURL,
                blacklist: '',
                updateResult: null,
              };
              const id = await sendMessage('add-subscription', subscription);
              props.setSubscriptions(subscriptions => ({ ...subscriptions, [id]: subscription }));
              props.setOpen(false);
            }}
          >
            {translate('options_addSubscriptionDialog_addButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type ShowSubscriptionDialogProps = DialogProps & {
  subscription: Subscription | null;
};

const ShowSubscriptionDialog: FunctionComponent<Readonly<ShowSubscriptionDialogProps>> = props => {
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div class="field">
        <h1 class="title">{props.subscription?.name}</h1>
      </div>
      <div class="field">
        <div class="control">
          <textarea
            class="textarea has-fixed-size"
            readOnly={true}
            rows={10}
            value={props.subscription?.blacklist}
          />
        </div>
      </div>
      <div class="ub-row field is-grouped is-grouped-right">
        <div class="control">
          <button
            class="ub-button button is-primary"
            onClick={() => {
              props.setOpen(false);
            }}
          >
            {translate('okButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type ManageSubscriptionProps = {
  id: SubscriptionId;
  subscription: Subscription;
  updating: boolean;
  setSubscriptions(update: (subscriptions: Subscriptions) => Subscriptions): void;
  setShowSubscriptionDialogOpen(open: boolean): void;
  setShowSubscriptionDialogSubscription(subscription: Subscription | null): void;
};

const ManageSubscription: FunctionComponent<Readonly<ManageSubscriptionProps>> = props => {
  const [dropdownActive, setDropdownActive] = useState(false);
  return (
    <tr>
      <td class="ub-table-data ub-subscription-name">{props.subscription.name}</td>
      <td class="ub-table-data ub-subscription-url">{props.subscription.url}</td>
      <td class="ub-table-data ub-subscription-update-result">
        {props.updating ? (
          translate('options_subscriptionUpdateRunning')
        ) : !props.subscription.updateResult ? (
          ''
        ) : isErrorResult(props.subscription.updateResult) ? (
          translate('error', props.subscription.updateResult.message)
        ) : (
          <FromNow time={dayjs(props.subscription.updateResult.timestamp)} />
        )}
      </td>
      <td class="ub-table-data subscription-menu">
        <div class={`dropdown is-right${dropdownActive ? ' is-active' : ''}`}>
          <div class="dropdown-trigger">
            <button
              class="ub-button ub-subscription-menu-button button is-white is-rounded"
              onBlur={() => {
                setDropdownActive(false);
              }}
              onClick={() => {
                setDropdownActive(true);
              }}
            />
          </div>
          <div class="dropdown-menu">
            <div class="dropdown-content">
              <a
                class="ub-dropdown-item dropdown-item"
                onMouseDown={() => {
                  props.setShowSubscriptionDialogOpen(true);
                  props.setShowSubscriptionDialogSubscription(props.subscription);
                }}
              >
                {chrome.i18n.getMessage('options_showSubscriptionMenu')}
              </a>
              <a
                class="ub-dropdown-item dropdown-item"
                onMouseDown={() => {
                  sendMessage('update-subscription', props.id);
                }}
              >
                {chrome.i18n.getMessage('options_updateSubscriptionNowMenu')}
              </a>
              <a
                class="ub-dropdown-item dropdown-item"
                onMouseDown={async () => {
                  await sendMessage('remove-subscription', props.id);
                  props.setSubscriptions(subscriptions => {
                    const newSubscriptions = { ...subscriptions };
                    delete newSubscriptions[props.id];
                    return newSubscriptions;
                  });
                }}
              >
                {chrome.i18n.getMessage('options_removeSubscriptionMenu')}
              </a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export const ManageSubscriptions: FunctionComponent = () => {
  const { subscriptions: initialSubscriptions } = useContext(Context).initialItems;
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(false);
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] = useState(false);
  const [
    showSubscriptionDialogSubscription,
    setShowSubscriptionDialogSubscription,
  ] = useState<Subscription | null>(null);
  useEffect(() => {
    return addMessageListeners({
      'subscription-updating': id => {
        setUpdating(updating => ({ ...updating, [id]: true }));
      },
      'subscription-updated': (id, subscription) => {
        setSubscriptions(subscriptions => ({ ...subscriptions, [id]: subscription }));
        setUpdating(updating => ({ ...updating, [id]: false }));
      },
    });
  }, []);
  return (
    <SectionItem>
      <div class="ub-row field is-grouped">
        <div class="control is-expanded">
          <p>{translate('options_subscriptionFeature')}</p>
          <p class="has-text-grey">{translate('options_subscriptionFeatureDescription')}</p>
        </div>
        <div class="control">
          <button
            class="ub-button button is-primary"
            onClick={() => {
              setAddSubscriptionDialogOpen(true);
            }}
          >
            {translate('options_addSubscriptionButton')}
          </button>
        </div>
      </div>
      <div class="field">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th class="ub-table-header ub-subscription-name has-text-grey">
                {translate('options_subscriptionNameHeader')}
              </th>
              <th class="ub-table-header ub-subscription-url has-text-grey">
                {translate('options_subscriptionURLHeader')}
              </th>
              <th class="ub-table-header ub-subscription-update-result has-text-grey">
                {translate('options_subscriptionUpdateResultHeader')}
              </th>
              <th class="ub-table-header ub-subscription-menu"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subscriptions)
              .map(([id, subscription]) => [Number(id), subscription] as const)
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
          </tbody>
        </table>
        {!Object.keys(subscriptions).length && (
          <div class="is-fullwidth has-text-centered">
            <p class="has-text-grey">{translate('options_noSubscriptionsAdded')}</p>
          </div>
        )}
      </div>
      <div class="ub-row field is-grouped is-grouped-right">
        <div class="control">
          <button
            class="ub-button button has-text-primary"
            disabled={!Object.keys(subscriptions).length}
            onClick={() => {
              sendMessage('update-all-subscriptions');
            }}
          >
            {translate('options_updateAllSubscriptionsNowButton')}
          </button>
        </div>
      </div>
      <Portal id="addSubscriptionDialog">
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          setOpen={setAddSubscriptionDialogOpen}
          setSubscriptions={setSubscriptions}
        />
      </Portal>
      <Portal id="showSubscriptionDialog">
        <ShowSubscriptionDialog
          open={showSubscriptionDialogOpen}
          setOpen={setShowSubscriptionDialogOpen}
          subscription={showSubscriptionDialogSubscription}
        />
      </Portal>
    </SectionItem>
  );
};

export const SubscriptionSection: FunctionComponent = () => (
  <Section id="subscription" title={translate('options_subscriptionTitle')}>
    <ManageSubscriptions />
    <SetIntervalItem
      itemKey="updateInterval"
      label={translate('options_updateInterval')}
      valueOptions={[5, 15, 30, 60, 120, 300]}
    />
  </Section>
);
