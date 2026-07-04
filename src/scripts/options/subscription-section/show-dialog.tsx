import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import badgeStyles from "../../components/badge.module.css";
import buttonStyles from "../../components/button.module.css";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog.tsx";
import { Editor } from "../../components/editor.tsx";
import { Link } from "../../components/link.tsx";
import rowStyles from "../../components/row.module.css";
import { translate } from "../../shared/locales.ts";
import type { Subscription } from "../../shared/types.ts";
import { getSubscriptionDisplayName } from "../../shared/utilities.ts";
import { RulesetEditor } from "../ruleset-editor.tsx";
import dialogStyles from "./show-dialog.module.css";

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
      <DialogHeader>
        <DialogTitle>
          {getSubscriptionDisplayName(subscription)}
          {subscription.type && subscription.type !== "ruleset" ? (
            <span className={clsx(badgeStyles.badge, dialogStyles.badge)}>
              {subscription.type}
            </span>
          ) : null}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <span className={dialogStyles.url}>
              <Link href={subscription.url}>{subscription.url}</Link>
            </span>
          </div>
        </div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            {subscription.type === "domains" ? (
              <Editor
                height="200px"
                readOnly
                resizable
                value={subscription.blacklist}
              />
            ) : (
              <RulesetEditor
                height="200px"
                readOnly
                resizable
                value={subscription.blacklist}
              />
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
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
      </DialogFooter>
    </Dialog>
  );
}
