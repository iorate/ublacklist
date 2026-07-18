import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import clsx from "clsx";
import { useId, useState } from "react";
import { Dialog, DialogTitle } from "../../components/dialog.tsx";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import type { Subscription, SubscriptionId } from "../../shared/types.ts";
import buttonStyles from "../../styles/button.module.css";
import dialogStyles from "../../styles/dialog.module.css";
import inputStyles from "../../styles/input.module.css";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";

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
      <div className={dialogStyles.header}>
        <DialogTitle>
          {translate("options_renameSubscriptionDialog_title")}
        </DialogTitle>
      </div>
      <div>
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
      </div>
      <div className={dialogStyles.footer}>
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
      </div>
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
