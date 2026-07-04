import { Checkbox } from "@base-ui/react/checkbox";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import badgeStyles from "../../components/badge.module.css";
import styles from "../../components/checkbox.module.css";
import labelStyles from "../../components/label.module.css";
import { Menu, MenuItem } from "../../components/menu.tsx";
import tableStyles from "../../components/table.module.css";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import { requestPermission } from "../../shared/permissions.ts";
import type { Subscription, SubscriptionId } from "../../shared/types.ts";
import {
  getSubscriptionDisplayName,
  isErrorResult,
} from "../../shared/utilities.ts";
import { FromNow } from "../from-now.tsx";
import { RenameDialog } from "./rename-dialog.tsx";
import rowStyles from "./row.module.css";
import { ShowDialog } from "./show-dialog.tsx";

export function ManageSubscription({
  id,
  subscription,
  updating,
}: {
  id: SubscriptionId;
  subscription: Subscription;
  updating: boolean;
}) {
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const checkboxId = `enableSubscription${id}`;
  return (
    <tr data-testid="subscription-row">
      <td className={tableStyles.cell}>
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
      </td>
      <td className={tableStyles.cell}>
        <div className={labelStyles.wrapper}>
          <label className={labelStyles.controlLabel} htmlFor={checkboxId}>
            {getSubscriptionDisplayName(subscription)}
            {subscription.type && subscription.type !== "ruleset" ? (
              <span className={clsx(badgeStyles.badge, rowStyles.badge)}>
                {subscription.type}
              </span>
            ) : null}
          </label>
        </div>
      </td>
      <td className={tableStyles.cell}>
        {updating ? (
          translate("options_subscriptionUpdateRunning")
        ) : !subscription.updateResult ? (
          ""
        ) : isErrorResult(subscription.updateResult) ? (
          translate("error", subscription.updateResult.message)
        ) : (
          <FromNow time={dayjs(subscription.updateResult.timestamp)} />
        )}
      </td>
      <td className={tableStyles.cell}>
        <Menu
          aria-label={translate("options_subscriptionMenuButtonLabel")}
          data-testid="subscription-menu-button"
        >
          <MenuItem onClick={() => setShowDialogOpen(true)}>
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
          <MenuItem onClick={() => setRenameDialogOpen(true)}>
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
        <ShowDialog
          close={() => setShowDialogOpen(false)}
          open={showDialogOpen}
          subscription={subscription}
        />
        <RenameDialog
          close={() => setRenameDialogOpen(false)}
          open={renameDialogOpen}
          subscription={subscription}
          subscriptionId={id}
        />
      </td>
    </tr>
  );
}
