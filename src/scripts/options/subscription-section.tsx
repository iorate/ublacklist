import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { MatchPatternMap } from "../../common/match-pattern.ts";
import { browser } from "../browser.ts";
import { Button } from "../components/button.tsx";
import { CheckBox } from "../components/checkbox.tsx";
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from "../components/constants.ts";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
} from "../components/dialog.tsx";
import { Input } from "../components/input.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
  SubLabel,
} from "../components/label.tsx";
import { Link } from "../components/link.tsx";
import { Menu, MenuItem } from "../components/menu.tsx";
import { Portal } from "../components/portal.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "../components/table.tsx";
import { useClassName, usePrevious } from "../components/utilities.ts";
import { translate } from "../locales.ts";
import { addMessageListeners, sendMessage } from "../messages.ts";
import type { Subscription, SubscriptionId, Subscriptions } from "../types.ts";
import {
  AltURL,
  isErrorResult,
  numberEntries,
  numberKeys,
} from "../utilities.ts";
import { FromNow } from "./from-now.tsx";
import { useOptionsContext } from "./options-context.tsx";
import { RulesetEditor } from "./ruleset-editor.tsx";
import { SetIntervalItem } from "./set-interval-item.tsx";

function getName(subscription: Readonly<Subscription>): string {
  const name = subscription.ruleset?.metadata.name;
  return typeof name === "string"
    ? name
    : subscription.name || subscription.url;
}

const PERMISSION_PASSLIST = [
  "*://*.githubusercontent.com/*",
  // A third-party CDN service supporting GitHub, GitLab and BitBucket
  "*://cdn.statically.io/*",
];

async function requestPermission(urls: readonly string[]): Promise<boolean> {
  const origins: string[] = [];
  const map = new MatchPatternMap<null>();
  for (const pass of PERMISSION_PASSLIST) {
    map.set(pass, null);
  }
  for (const url of urls) {
    if (map.get(url).length) {
      continue;
    }
    const u = new AltURL(url);
    origins.push(`${u.scheme}://${u.host}/*`);
  }
  // Don't call `permissions.request` when unnecessary. re #110
  return origins.length ? browser.permissions.request({ origins }) : true;
}

const AddSubscriptionDialog: React.FC<
  {
    initialName: string;
    initialURL: string;
    setSubscriptions: React.Dispatch<React.SetStateAction<Subscriptions>>;
  } & DialogProps
> = ({ close, open, initialName, initialURL, setSubscriptions }) => {
  const [state, setState] = useState(() => ({
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
    name: initialName,
  }));
  const prevOpen = usePrevious(open);
  if (open && prevOpen === false) {
    state.url = "";
    state.urlValid = false;
    state.name = "";
  }
  const ok = state.urlValid;

  return (
    <Dialog
      aria-labelledby="addSubscriptionDialogTitle"
      close={close}
      open={open}
    >
      <DialogHeader>
        <DialogTitle id="addSubscriptionDialogTitle">
          {translate("options_addSubscriptionDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for="subscriptionURL">
                {translate("options_addSubscriptionDialog_urlLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Input
              className={FOCUS_START_CLASS}
              id="subscriptionURL"
              pattern="https?:.*"
              required={true}
              type="url"
              value={state.url}
              onChange={(e) => {
                const {
                  value: url,
                  validity: { valid: urlValid },
                } = e.currentTarget;
                setState((s) => ({ ...s, url, urlValid }));
              }}
            />
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for="subscriptionName">
                {translate("options_addSubscriptionDialog_altNameLabel")}
              </ControlLabel>
              <SubLabel>
                {translate("options_addSubscriptionDialog_altNameDescription")}
              </SubLabel>
            </LabelWrapper>
            <Input
              id="subscriptionName"
              required={true}
              value={state.name}
              onChange={(e) => {
                const name = e.currentTarget.value;
                setState((s) => {
                  return { ...s, name };
                });
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button className={!ok ? FOCUS_END_CLASS : ""} onClick={close}>
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={ok ? FOCUS_END_CLASS : ""}
              disabled={!ok}
              primary
              onClick={async () => {
                if (!(await requestPermission([state.url]))) {
                  return;
                }
                const subscription: Subscription = {
                  name: state.name,
                  url: state.url,
                  blacklist: "",
                  updateResult: null,
                  enabled: true,
                };
                const id = await sendMessage("add-subscription", subscription);
                setSubscriptions((subscriptions) => ({
                  ...subscriptions,
                  [id]: subscription,
                }));
                close();
              }}
            >
              {translate("options_addSubscriptionDialog_addButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const ShowSubscriptionDialog: React.FC<
  { subscription: Subscription | null } & DialogProps
> = ({ close, open, subscription }) => {
  const urlClassName = useClassName(
    () => ({
      wordBreak: "break-all",
    }),
    [],
  );
  return (
    <Dialog
      aria-labelledby="showSubscriptionDialogTitle"
      close={close}
      open={open}
    >
      <DialogHeader>
        <DialogTitle id="showSubscriptionDialogTitle">
          {subscription ? getName(subscription) : ""}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span className={urlClassName}>
              <Link className={FOCUS_START_CLASS} href={subscription?.url}>
                {subscription?.url}
              </Link>
            </span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            {open && (
              <RulesetEditor
                height="200px"
                readOnly
                resizable
                value={subscription?.blacklist ?? ""}
              />
            )}
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button className={FOCUS_END_CLASS} primary onClick={close}>
              {translate("okButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const ManageSubscription: React.FC<{
  id: SubscriptionId;
  setShowSubscriptionDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSubscriptionDialogSubscription: React.Dispatch<
    React.SetStateAction<Subscription | null>
  >;
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscriptions>>;
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
  const checkboxId = `enableSubscription${id}`;
  return (
    <TableRow>
      <TableCell>
        <CheckBox
          aria-label={translate("options_subscriptionCheckBoxLabel")}
          checked={subscription.enabled ?? true}
          id={checkboxId}
          onChange={async (e) => {
            const enabled = e.currentTarget.checked;
            await sendMessage("enable-subscription", id, enabled);
            setSubscriptions((subscriptions) => {
              const newSubscriptions = { ...subscriptions };
              if (subscriptions[id]) {
                newSubscriptions[id] = { ...subscriptions[id], enabled };
              }
              return newSubscriptions;
            });
          }}
        />
      </TableCell>
      <TableCell>
        <LabelWrapper>
          <ControlLabel for={checkboxId}>{getName(subscription)}</ControlLabel>
        </LabelWrapper>
      </TableCell>
      <TableCell>
        {updating ? (
          translate("options_subscriptionUpdateRunning")
        ) : !subscription.updateResult ? (
          ""
        ) : isErrorResult(subscription.updateResult) ? (
          translate("error", subscription.updateResult.message)
        ) : (
          <FromNow time={dayjs(subscription.updateResult.timestamp)} />
        )}
      </TableCell>
      <TableCell>
        <Menu aria-label={translate("options_subscriptionMenuButtonLabel")}>
          <MenuItem
            onClick={() => {
              requestAnimationFrame(() => {
                setShowSubscriptionDialogOpen(true);
                setShowSubscriptionDialogSubscription(subscription);
              });
            }}
          >
            {translate("options_showSubscriptionMenu")}
          </MenuItem>
          <MenuItem
            disabled={!(subscription.enabled ?? true)}
            onClick={async () => {
              if (!(await requestPermission([subscription.url]))) {
                return;
              }
              await sendMessage("update-subscription", id);
            }}
          >
            {translate("options_updateSubscriptionNowMenu")}
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await sendMessage("remove-subscription", id);
              setSubscriptions((subscriptions) => {
                const newSubscriptions = { ...subscriptions };
                delete newSubscriptions[id];
                return newSubscriptions;
              });
            }}
          >
            {translate("options_removeSubscriptionMenu")}
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

export const ManageSubscriptions: React.FC<{
  subscriptions: Subscriptions;
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscriptions>>;
}> = ({ subscriptions, setSubscriptions }) => {
  const { query } = useOptionsContext();

  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(
    query.addSubscriptionName != null || query.addSubscriptionURL != null,
  );
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] =
    useState(false);
  const [
    showSubscriptionDialogSubscription,
    setShowSubscriptionDialogSubscription,
  ] = useState<Subscription | null>(null);

  useEffect(
    () =>
      addMessageListeners({
        "subscription-updating": (id) => {
          setUpdating((updating) => ({ ...updating, [id]: true }));
        },
        "subscription-updated": (id, subscription) => {
          setSubscriptions((subscriptions) =>
            subscriptions[id]
              ? { ...subscriptions, [id]: subscription }
              : subscriptions,
          );
          setUpdating((updating) => ({ ...updating, [id]: false }));
        },
      }),
    [setSubscriptions],
  );

  const emptyClass = useClassName(
    () => ({
      minHeight: "3em",
      textAlign: "center",
    }),
    [],
  );

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_subscriptionFeature")}</Label>
            <SubLabel>
              {translate("options_subscriptionFeatureDescription")}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            primary
            onClick={() => {
              setAddSubscriptionDialogOpen(true);
            }}
          >
            {translate("options_addSubscriptionButton")}
          </Button>
        </RowItem>
      </Row>
      {numberKeys(subscriptions).length ? (
        <Row>
          <RowItem expanded>
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell width="2.25em" />
                  <TableHeaderCell>
                    {translate("options_subscriptionNameHeader")}
                  </TableHeaderCell>
                  <TableHeaderCell width="20%">
                    {translate("options_subscriptionUpdateResultHeader")}
                  </TableHeaderCell>
                  <TableHeaderCell width="calc(0.75em + 36px)" />
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {numberEntries(subscriptions)
                  .sort(([id1], [id2]) => id1 - id2)
                  .map(([id, subscription]) => (
                    <ManageSubscription
                      id={id}
                      key={id}
                      setShowSubscriptionDialogOpen={
                        setShowSubscriptionDialogOpen
                      }
                      setShowSubscriptionDialogSubscription={
                        setShowSubscriptionDialogSubscription
                      }
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
        <Row className={emptyClass}>
          <RowItem expanded>
            {translate("options_noSubscriptionsAdded")}
          </RowItem>
        </Row>
      )}
      <Row right>
        <RowItem>
          <Button
            disabled={
              !Object.values(subscriptions).filter(
                (subscription) => subscription.enabled ?? true,
              ).length
            }
            onClick={async () => {
              if (
                !(await requestPermission(
                  Object.values(subscriptions).map((s) => s.url),
                ))
              ) {
                return;
              }
              await sendMessage("update-all-subscriptions");
            }}
          >
            {translate("options_updateAllSubscriptionsNowButton")}
          </Button>
        </RowItem>
      </Row>
      <Portal id="addSubscriptionDialogPortal">
        <AddSubscriptionDialog
          close={() => setAddSubscriptionDialogOpen(false)}
          initialName={query.addSubscriptionName ?? ""}
          initialURL={query.addSubscriptionURL ?? ""}
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

export const SubscriptionSection: React.FC = () => {
  const {
    initialItems: { subscriptions: initialSubscriptions },
  } = useOptionsContext();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  return (
    <Section aria-labelledby="subscriptionSectionTitle" id="subscription">
      <SectionHeader>
        <SectionTitle id="subscriptionSectionTitle">
          {translate("options_subscriptionTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <ManageSubscriptions
          setSubscriptions={setSubscriptions}
          subscriptions={subscriptions}
        />
        <SectionItem>
          <SetIntervalItem
            disabled={
              !Object.values(subscriptions).filter(
                (subscription) => subscription.enabled ?? true,
              ).length
            }
            itemKey="updateInterval"
            label={translate("options_updateInterval")}
            valueOptions={[60, 120, 180, 360, 720, 1440]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
