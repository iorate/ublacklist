import dayjs from 'dayjs';
import React from 'react';
import ReactDOM from 'react-dom';
import { apis } from '../apis';
import * as LocalStorage from '../local-storage';
import { addMessageListeners, sendMessage } from '../messages';
import { Subscription, SubscriptionId, Subscriptions } from '../types';
import { isErrorResult } from '../utilities';
import { Dialog, DialogProps } from './dialog';
import { FromNow } from './from-now';
import { InitialItems } from './initial-items';
import { Section } from './section';
import { SetIntervalItem } from './set-interval-item';

type AddSubscriptionDialogProps = DialogProps & {
  setSubscriptions(update: (subscriptions: Subscriptions) => Subscriptions): void;
};

const AddSubscriptionDialog: React.FC<Readonly<AddSubscriptionDialogProps>> = props => {
  const [name, setName] = React.useState('');
  const [nameValid, setNameValid] = React.useState(false);
  const [url, setURL] = React.useState('');
  const [urlValid, setURLValid] = React.useState(false);
  React.useLayoutEffect(() => {
    if (props.open) {
      setName('');
      setNameValid(false);
      setURL('');
      setURLValid(false);
    }
  }, [props.open]);
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div className="field">
        <h1 className="title">{apis.i18n.getMessage('options_addSubscriptionDialog_title')}</h1>
      </div>
      <div className="field">
        <label className="label" htmlFor="subscriptionName">
          {apis.i18n.getMessage('options_addSubscriptionDialog_nameLabel')}
        </label>
        <div className="control">
          <input
            id="subscriptionName"
            className="input"
            type="text"
            required
            value={name}
            onChange={e => {
              setName(e.currentTarget.value);
              setNameValid(e.currentTarget.validity.valid);
            }}
          />
        </div>
      </div>
      <div className="ub-row field">
        <label className="label" htmlFor="subscriptionURL">
          {apis.i18n.getMessage('options_addSubscriptionDialog_urlLabel')}
        </label>
        <div className="control">
          <input
            id="subscriptionURL"
            className="input"
            type="url"
            pattern="^https?:.*"
            required
            value={url}
            onChange={e => {
              setURL(e.currentTarget.value);
              setURLValid(e.currentTarget.validity.valid);
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
            disabled={!nameValid || !urlValid}
            onClick={async () => {
              if (!(await apis.permissions.request({ origins: [url] }))) {
                return;
              }
              const subscription = { name, url, blacklist: '', updateResult: null };
              const id = await sendMessage('add-subscription', subscription);
              props.setSubscriptions(subscriptions => ({ ...subscriptions, [id]: subscription }));
              props.setOpen(false);
            }}
          >
            {apis.i18n.getMessage('options_addSubscriptionDialog_addButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type ShowSubscriptionDialogProps = DialogProps & {
  subscription: Subscription | null;
};

const ShowSubscriptionDialog: React.FC<Readonly<ShowSubscriptionDialogProps>> = props => {
  return (
    <Dialog open={props.open} setOpen={props.setOpen}>
      <div className="ub-row field">
        <h1 className="title">{props.subscription?.name}</h1>
      </div>
      <div className="ub-row field">
        <div className="control">
          <textarea
            className="textarea has-fixed-size"
            readOnly
            rows={10}
            value={props.subscription?.blacklist}
          />
        </div>
      </div>
      <div className="ub-row field is-grouped is-grouped-right">
        <div className="control">
          <button
            className="ub-button button is-primary"
            onClick={() => {
              props.setOpen(false);
            }}
          >
            {apis.i18n.getMessage('okButton')}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

type ManageSubscriptionProps = {
  id: SubscriptionId;
  subscription: Subscription;
  setSubscriptions(update: (subscriptions: Subscriptions) => Subscriptions): void;
  setShowDialogOpen(open: boolean): void;
  setShowDialogSubscription(subscription: Subscription | null): void;
};

const ManageSubscription: React.FC<Readonly<ManageSubscriptionProps>> = props => {
  const [updateResult, setUpdateResult] = React.useState(props.subscription.updateResult);
  const [updating, setUpdating] = React.useState(false);
  const [dropdownActive, setDropdownActive] = React.useState(false);
  React.useEffect(() => {
    return addMessageListeners({
      'subscription-updating': id => {
        if (id === props.id) {
          setUpdating(true);
        }
      },
      'subscription-updated': (id, result) => {
        if (id === props.id) {
          setUpdateResult(result);
          setUpdating(false);
        }
      },
    });
  }, [props.id]);
  return (
    <tr>
      <td className="ub-table-data ub-subscription-name">{props.subscription.name}</td>
      <td className="ub-table-data ub-subscription-url">{props.subscription.url}</td>
      <td className="ub-table-data ub-subscription-update-result">
        {updating ? (
          apis.i18n.getMessage('options_subscriptionUpdateRunning')
        ) : !updateResult ? (
          ''
        ) : isErrorResult(updateResult) ? (
          apis.i18n.getMessage('error', updateResult.message)
        ) : (
          <FromNow time={dayjs(updateResult.timestamp)} />
        )}
      </td>
      <td className="ub-table-data subscription-menu">
        <div className={`dropdown is-right ${dropdownActive ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <button
              className="ub-button ub-subscription-menu-button button is-white is-rounded"
              onBlur={() => {
                setDropdownActive(false);
              }}
              onClick={() => {
                setDropdownActive(true);
              }}
            />
          </div>
          <div className="dropdown-menu">
            <div className="dropdown-content">
              <a
                className="ub-dropdown-item dropdown-item"
                onMouseDown={async () => {
                  const { subscriptions } = await LocalStorage.load(['subscriptions']);
                  if (!subscriptions[props.id]) {
                    return;
                  }
                  props.setShowDialogOpen(true);
                  props.setShowDialogSubscription(subscriptions[props.id]);
                }}
              >
                {chrome.i18n.getMessage('options_showSubscriptionMenu')}
              </a>
              <a
                className="ub-dropdown-item dropdown-item"
                onMouseDown={() => {
                  sendMessage('update-subscription', props.id);
                }}
              >
                {chrome.i18n.getMessage('options_updateSubscriptionNowMenu')}
              </a>
              <a
                className="ub-dropdown-item dropdown-item"
                onMouseDown={() => {
                  sendMessage('remove-subscription', props.id);
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

export const ManageSubscriptions: React.FC = () => {
  const { subscriptions: initialSubscriptions } = React.useContext(InitialItems);
  const [subscriptions, setSubscriptions] = React.useState(initialSubscriptions);
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = React.useState(false);
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] = React.useState(false);
  const [
    showSubscriptionDialogSubscription,
    setShowSubscriptionDialogSubscription,
  ] = React.useState<Subscription | null>(null);
  return (
    <>
      <div className="ub-row field is-grouped">
        <div className="control is-expanded">
          <p>{apis.i18n.getMessage('options_subscriptionFeature')}</p>
          <p className="has-text-grey">
            {apis.i18n.getMessage('options_subscriptionFeatureDescription')}
          </p>
        </div>
        <div className="control">
          <button
            className="ub-button button is-primary"
            onClick={() => {
              setAddSubscriptionDialogOpen(true);
            }}
          >
            {apis.i18n.getMessage('options_addSubscriptionButton')}
          </button>
        </div>
      </div>
      <div className="field">
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th className="ub-table-header ub-subscription-name has-text-grey">
                {apis.i18n.getMessage('options_subscriptionNameHeader')}
              </th>
              <th className="ub-table-header ub-subscription-url has-text-grey">
                {apis.i18n.getMessage('options_subscriptionURLHeader')}
              </th>
              <th className="ub-table-header ub-subscription-update-result has-text-grey">
                {apis.i18n.getMessage('options_subscriptionUpdateResultHeader')}
              </th>
              <th className="ub-table-header ub-subscription-menu"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subscriptions).map(([id, subscription]) => (
              <ManageSubscription
                key={id}
                id={Number(id)}
                subscription={subscription}
                setSubscriptions={setSubscriptions}
                setShowDialogOpen={setShowSubscriptionDialogOpen}
                setShowDialogSubscription={setShowSubscriptionDialogSubscription}
              />
            ))}
          </tbody>
        </table>
        {!Object.keys(subscriptions).length && (
          <div className="is-fullwidth has-text-centered">
            <p className="has-text-grey">{apis.i18n.getMessage('options_noSubscriptionsAdded')}</p>
          </div>
        )}
      </div>
      <div className="field is-grouped is-grouped-right">
        <div className="control">
          <button
            className="ub-button button has-text-primary"
            disabled={!Object.keys(subscriptions).length}
            onClick={() => {
              sendMessage('update-all-subscriptions');
            }}
          >
            {apis.i18n.getMessage('options_updateAllSubscriptionsNowButton')}
          </button>
        </div>
      </div>
      {ReactDOM.createPortal(
        <AddSubscriptionDialog
          open={addSubscriptionDialogOpen}
          setOpen={setAddSubscriptionDialogOpen}
          setSubscriptions={setSubscriptions}
        />,
        document.getElementById('addSubscriptionDialogRoot')!,
      )}
      {ReactDOM.createPortal(
        <ShowSubscriptionDialog
          open={showSubscriptionDialogOpen}
          setOpen={setShowSubscriptionDialogOpen}
          subscription={showSubscriptionDialogSubscription}
        />,
        document.getElementById('showSubscriptionDialogRoot')!,
      )}
    </>
  );
};

export const SubscriptionSection: React.FC = () => (
  <Section id="subscription" title={apis.i18n.getMessage('options_subscriptionTitle')}>
    <ManageSubscriptions />
    <SetIntervalItem
      itemKey="updateInterval"
      label={apis.i18n.getMessage('options_updateInterval')}
      valueOptions={[5, 15, 30, 60, 120, 300]}
    />
  </Section>
);
