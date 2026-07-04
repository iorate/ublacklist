import { Checkbox } from "@base-ui/react/checkbox";
import dayjs from "dayjs";
import { useState } from "react";
import { Badge } from "../../components/badge.tsx";
import styles from "../../components/checkbox.module.css";
import { ControlLabel, LabelWrapper } from "../../components/label.tsx";
import { Menu, MenuItem } from "../../components/menu.tsx";
import { TableCell, TableRow } from "../../components/table.tsx";
import { useClassName } from "../../components/utilities.ts";
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
import { ShowDialog } from "./show-dialog.tsx";

export const ManageSubscription: React.FC<{
  id: SubscriptionId;
  subscription: Subscription;
  updating: boolean;
}> = ({ id, subscription, updating }) => {
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
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
      </TableCell>
    </TableRow>
  );
};
