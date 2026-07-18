import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import { Dialog, DialogTitle } from "../../components/dialog.tsx";
import { Editor } from "../../components/editor.tsx";
import { Link } from "../../components/link.tsx";
import { translate } from "../../shared/locales.ts";
import type { Subscription } from "../../shared/types.ts";
import { getSubscriptionDisplayName } from "../../shared/utilities.ts";
import badgeStyles from "../../styles/badge.module.css";
import buttonStyles from "../../styles/button.module.css";
import dialogStyles from "../../styles/dialog.module.css";
import rowStyles from "../../styles/row.module.css";
import { RulesetEditor } from "../shared/ruleset-editor.tsx";
import styles from "./show-dialog.module.css";

export function ShowDialog({
  close,
  open,
  subscription,
}: {
  close: () => void;
  open: boolean;
  subscription: Subscription;
}) {
  return (
    <Dialog close={close} open={open}>
      <div className={dialogStyles.header}>
        <DialogTitle>
          {getSubscriptionDisplayName(subscription)}
          {subscription.type && subscription.type !== "ruleset" ? (
            <span className={clsx(badgeStyles.badge, styles.badge)}>
              {subscription.type}
            </span>
          ) : null}
        </DialogTitle>
      </div>
      <div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <span className={styles.url}>
              <Link href={subscription.url}>{subscription.url}</Link>
            </span>
          </div>
        </div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            {subscription.type === "domains" ? (
              <Editor
                height="calc(14em + 10px)"
                readOnly
                resizable
                value={subscription.blacklist}
              />
            ) : (
              <RulesetEditor
                height="calc(14em + 10px)"
                readOnly
                resizable
                value={subscription.blacklist}
              />
            )}
          </div>
        </div>
      </div>
      <div className={dialogStyles.footer}>
        <div className={clsx(rowStyles.row, rowStyles.right)}>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={close}
            >
              {translate("okButton")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
