import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import clsx from "clsx";
import { useId, useState } from "react";
import buttonStyles from "../../components/button.module.css";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog.tsx";
import inputStyles from "../../components/input.module.css";
import labelStyles from "../../components/label.module.css";
import rowStyles from "../../components/row.module.css";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import type { Subscription, SubscriptionId } from "../../shared/types.ts";

function RenameForm({
  close,
  subscription,
  subscriptionId,
}: {
  close: () => void;
  subscription: Subscription;
  subscriptionId: SubscriptionId;
}) {
  const id = useId();
  const [name, setName] = useState(subscription.name);
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {translate("options_renameSubscriptionDialog_title")}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-name`}
              >
                {translate("options_addSubscriptionDialog_nameLabel")}
              </label>
              <div className={labelStyles.subLabel}>
                {translate("options_addSubscriptionDialog_nameDescription")}
              </div>
            </div>
            <Input
              className={inputStyles.input}
              id={`${id}-name`}
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className={clsx(rowStyles.row, rowStyles.right)}>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.secondary)}
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </div>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={async () => {
                await sendMessage("rename-subscription", subscriptionId, name);
                close();
              }}
            >
              {translate("options_renameSubscriptionDialog_renameButton")}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </>
  );
}

export function RenameDialog({
  close,
  open,
  subscription,
  subscriptionId,
}: {
  close: () => void;
  open: boolean;
  subscription: Subscription;
  subscriptionId: SubscriptionId;
}) {
  return (
    <Dialog close={close} open={open}>
      <RenameForm
        close={close}
        subscription={subscription}
        subscriptionId={subscriptionId}
      />
    </Dialog>
  );
}
