import { Badge } from "../../components/badge.tsx";
import { Button } from "../../components/button.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog.tsx";
import { Editor } from "../../components/editor.tsx";
import { Link } from "../../components/link.tsx";
import { Row, RowItem } from "../../components/row.tsx";
import { useClassName } from "../../components/utilities.ts";
import { translate } from "../../shared/locales.ts";
import type { Subscription } from "../../shared/types.ts";
import { getSubscriptionDisplayName } from "../../shared/utilities.ts";
import { RulesetEditor } from "../ruleset-editor.tsx";

export const ShowDialog: React.FC<{
  close: () => void;
  open: boolean;
  subscription: Subscription;
}> = ({ close, open, subscription }) => {
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
    <Dialog close={close} open={open}>
      <DialogHeader>
        <DialogTitle>
          {getSubscriptionDisplayName(subscription)}
          {subscription.type && subscription.type !== "ruleset" ? (
            <Badge className={badgeClassName}>{subscription.type}</Badge>
          ) : null}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span className={urlClassName}>
              <Link href={subscription.url}>{subscription.url}</Link>
            </span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
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
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button primary onClick={close}>
              {translate("okButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};
