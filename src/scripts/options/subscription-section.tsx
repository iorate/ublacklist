import { Checkbox } from "@base-ui/react/checkbox";
import dayjs from "dayjs";
import { Suspense, useEffect, useId, useState } from "react";
import { Badge } from "../components/badge.tsx";
import { Button } from "../components/button.tsx";
import styles from "../components/checkbox.module.css";
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from "../components/constants.ts";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
} from "../components/dialog.tsx";
import { Editor } from "../components/editor.tsx";
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
import { Select, SelectOption } from "../components/select.tsx";
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
import { EnableSubscriptionURL } from "../shared/enable-subscription-url.tsx";
import { translate } from "../shared/locales.ts";
import { addMessageListeners, sendMessage } from "../shared/messages.ts";
import { requestPermission } from "../shared/permissions.ts";
import { storageStore } from "../shared/storage-store.ts";
import type {
  Subscription,
  SubscriptionId,
  Subscriptions,
  SubscriptionType,
} from "../shared/types.ts";
import {
  getSubscriptionDisplayName,
  isErrorResult,
  numberEntries,
  numberKeys,
} from "../shared/utilities.ts";
import { FromNow } from "./from-now.tsx";
import { RulesetEditor } from "./ruleset-editor.tsx";
import { SetIntervalItem } from "./set-interval-item.tsx";

export type OptionsQuery = {
  addSubscriptionName: string | null;
  addSubscriptionURL: string | null;
  addSubscriptionType: "ruleset" | "domains" | null;
};

const AddSubscriptionDialog: React.FC<
  {
    initialName: string;
    initialURL: string;
    initialType: SubscriptionType;
  } & DialogProps
> = ({ close, open, initialName, initialURL, initialType }) => {
  const id = useId();
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
    type: initialType,
  }));
  const prevOpen = usePrevious(open);
  if (open && prevOpen === false) {
    state.url = "";
    state.urlValid = false;
    state.name = "";
    state.type = initialType;
  }
  const ok = state.urlValid;

  return (
    <Dialog
      aria-labelledby={`${id}-title`}
      close={close}
      data-testid="add-subscription-dialog"
      open={open}
    >
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          {translate("options_addSubscriptionDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for={`${id}-url`}>
                {translate("options_addSubscriptionDialog_urlLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Input
              className={FOCUS_START_CLASS}
              data-testid="add-subscription-dialog-url-input"
              id={`${id}-url`}
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
              <ControlLabel for={`${id}-type`}>
                {translate("options_addSubscriptionDialog_typeLabel")}
              </ControlLabel>
            </LabelWrapper>
            <Select
              id={`${id}-type`}
              value={state.type}
              onChange={(e) => {
                const type = e.currentTarget.value as SubscriptionType;
                setState((s) => ({ ...s, type }));
              }}
            >
              <SelectOption value="ruleset">
                {translate("options_addSubscriptionDialog_typeRuleset")}
              </SelectOption>
              <SelectOption value="domains">
                {translate("options_addSubscriptionDialog_typeDomains")}
              </SelectOption>
            </Select>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for={`${id}-name`}>
                {translate("options_addSubscriptionDialog_nameLabel")}
              </ControlLabel>
              <SubLabel>
                {translate("options_addSubscriptionDialog_nameDescription")}
              </SubLabel>
            </LabelWrapper>
            <Input
              data-testid="add-subscription-dialog-name-input"
              id={`${id}-name`}
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
            <Button
              className={!ok ? FOCUS_END_CLASS : ""}
              data-testid="add-subscription-dialog-cancel-button"
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
              className={ok ? FOCUS_END_CLASS : ""}
              data-testid="add-subscription-dialog-add-button"
              disabled={!ok}
              primary
              onClick={async () => {
                if (!(await requestPermission([state.url]))) {
                  return;
                }
                const subscription: Subscription = {
                  name: state.name,
                  url: state.url,
                  type: state.type,
                  blacklist: "",
                  updateResult: null,
                  enabled: true,
                };
                await sendMessage("add-subscription", subscription);
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

const RenameSubscriptionDialog: React.FC<
  {
    subscriptionId: SubscriptionId | null;
    subscription: Subscription | null;
  } & DialogProps
> = ({ close, open, subscriptionId, subscription }) => {
  const id = useId();
  const [state, setState] = useState(() => ({
    name: subscription?.name ?? "",
  }));
  const prevOpen = usePrevious(open);
  if (open && prevOpen === false) {
    state.name = subscription?.name ?? "";
  }
  return (
    <Dialog aria-labelledby={`${id}-title`} close={close} open={open}>
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          {translate("options_renameSubscriptionDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <LabelWrapper fullWidth>
              <ControlLabel for={`${id}-name`}>
                {translate("options_addSubscriptionDialog_nameLabel")}
              </ControlLabel>
              <SubLabel>
                {translate("options_addSubscriptionDialog_nameDescription")}
              </SubLabel>
            </LabelWrapper>
            <Input
              className={FOCUS_START_CLASS}
              id={`${id}-name`}
              value={state.name}
              onChange={(e) => {
                const name = e.currentTarget.value;
                setState((s) => ({ ...s, name }));
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button onClick={close}>{translate("cancelButton")}</Button>
          </RowItem>
          <RowItem>
            <Button
              className={FOCUS_END_CLASS}
              primary
              onClick={async () => {
                if (subscriptionId == null) {
                  close();
                  return;
                }
                await sendMessage(
                  "rename-subscription",
                  subscriptionId,
                  state.name,
                );
                close();
              }}
            >
              {translate("options_renameSubscriptionDialog_renameButton")}
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
  const id = useId();
  const urlClassName = useClassName(
    () => ({
      wordBreak: "break-all",
    }),
    [],
  );
  const badgeClassName = useClassName(
    () => ({
      marginLeft: "0.5em",
    }),
    [],
  );
  return (
    <Dialog aria-labelledby={`${id}-title`} close={close} open={open}>
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          {subscription ? getSubscriptionDisplayName(subscription) : ""}
          {subscription?.type && subscription.type !== "ruleset" ? (
            <Badge className={badgeClassName}>{subscription.type}</Badge>
          ) : null}
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
            {open &&
              (subscription?.type === "domains" ? (
                <Editor
                  height="200px"
                  readOnly
                  resizable
                  value={subscription?.blacklist ?? ""}
                />
              ) : (
                <RulesetEditor
                  height="200px"
                  readOnly
                  resizable
                  value={subscription?.blacklist ?? ""}
                />
              ))}
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
  setRenameSubscriptionDialogOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setRenameSubscriptionDialogSubscriptionId: React.Dispatch<
    React.SetStateAction<SubscriptionId | null>
  >;
  setRenameSubscriptionDialogSubscription: React.Dispatch<
    React.SetStateAction<Subscription | null>
  >;
  subscription: Subscription;
  updating: boolean;
}> = ({
  id,
  setShowSubscriptionDialogOpen,
  setShowSubscriptionDialogSubscription,
  setRenameSubscriptionDialogOpen,
  setRenameSubscriptionDialogSubscriptionId,
  setRenameSubscriptionDialogSubscription,
  subscription,
  updating,
}) => {
  const checkboxId = `enableSubscription${id}`;
  const badgeClassName = useClassName(
    () => ({
      marginLeft: "0.5em",
    }),
    [],
  );
  return (
    <TableRow data-testid="subscription-row">
      <TableCell>
        <Checkbox.Root
          aria-label={translate("options_subscriptionCheckBoxLabel")}
          checked={subscription.enabled ?? true}
          className={styles.checkbox}
          id={checkboxId}
          onCheckedChange={(checked) => {
            void sendMessage("enable-subscription", id, checked);
          }}
        >
          <Checkbox.Indicator className={styles.indicator} />
        </Checkbox.Root>
      </TableCell>
      <TableCell>
        <LabelWrapper>
          <ControlLabel for={checkboxId}>
            {getSubscriptionDisplayName(subscription)}
            {subscription.type && subscription.type !== "ruleset" ? (
              <Badge className={badgeClassName}>{subscription.type}</Badge>
            ) : null}
          </ControlLabel>
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
        <Menu
          aria-label={translate("options_subscriptionMenuButtonLabel")}
          data-testid="subscription-menu-button"
        >
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
            onClick={() => {
              requestAnimationFrame(() => {
                setRenameSubscriptionDialogOpen(true);
                setRenameSubscriptionDialogSubscriptionId(id);
                setRenameSubscriptionDialogSubscription(subscription);
              });
            }}
          >
            {translate("options_renameSubscriptionMenu")}
          </MenuItem>
          <MenuItem
            data-testid="subscription-menu-remove"
            onClick={() => {
              void sendMessage("remove-subscription", id);
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
  query: OptionsQuery;
  subscriptions: Subscriptions;
}> = ({ query, subscriptions }) => {
  const id = useId();
  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const [addSubscriptionDialogOpen, setAddSubscriptionDialogOpen] = useState(
    query.addSubscriptionName != null ||
      query.addSubscriptionURL != null ||
      query.addSubscriptionType != null,
  );
  const [showSubscriptionDialogOpen, setShowSubscriptionDialogOpen] =
    useState(false);
  const [
    showSubscriptionDialogSubscription,
    setShowSubscriptionDialogSubscription,
  ] = useState<Subscription | null>(null);
  const [renameSubscriptionDialogOpen, setRenameSubscriptionDialogOpen] =
    useState(false);
  const [
    renameSubscriptionDialogSubscriptionId,
    setRenameSubscriptionDialogSubscriptionId,
  ] = useState<SubscriptionId | null>(null);
  const [
    renameSubscriptionDialogSubscription,
    setRenameSubscriptionDialogSubscription,
  ] = useState<Subscription | null>(null);

  useEffect(
    () =>
      addMessageListeners({
        "subscription-updating": (id) => {
          setUpdating((updating) => ({ ...updating, [id]: true }));
        },
        "subscription-updated": (id) => {
          setUpdating((updating) => ({ ...updating, [id]: false }));
        },
      }),
    [],
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
            data-testid="add-subscription-button"
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
                      setRenameSubscriptionDialogOpen={
                        setRenameSubscriptionDialogOpen
                      }
                      setRenameSubscriptionDialogSubscriptionId={
                        setRenameSubscriptionDialogSubscriptionId
                      }
                      setRenameSubscriptionDialogSubscription={
                        setRenameSubscriptionDialogSubscription
                      }
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
      <Portal id={`${id}-add-portal`}>
        <AddSubscriptionDialog
          close={() => setAddSubscriptionDialogOpen(false)}
          initialName={query.addSubscriptionName ?? ""}
          initialURL={query.addSubscriptionURL ?? ""}
          initialType={query.addSubscriptionType ?? "ruleset"}
          open={addSubscriptionDialogOpen}
        />
      </Portal>
      <Portal id={`${id}-show-portal`}>
        <ShowSubscriptionDialog
          close={() => setShowSubscriptionDialogOpen(false)}
          open={showSubscriptionDialogOpen}
          subscription={showSubscriptionDialogSubscription}
        />
      </Portal>
      <Portal id={`${id}-rename-portal`}>
        <RenameSubscriptionDialog
          close={() => setRenameSubscriptionDialogOpen(false)}
          open={renameSubscriptionDialogOpen}
          subscription={renameSubscriptionDialogSubscription}
          subscriptionId={renameSubscriptionDialogSubscriptionId}
        />
      </Portal>
    </SectionItem>
  );
};

export const SubscriptionSection: React.FC<{
  id: string;
  query: OptionsQuery;
}> = (props) => {
  const id = useId();
  const subscriptions = storageStore.use.subscriptions();
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_subscriptionTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <ManageSubscriptions
          query={props.query}
          subscriptions={subscriptions}
        />
        <Suspense fallback={null}>
          <EnableSubscriptionURL type="ruleset" />
        </Suspense>
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
