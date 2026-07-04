import { useId, useState } from "react";
import { Button } from "../../components/button.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog.tsx";
import { Input } from "../../components/input.tsx";
import {
  ControlLabel,
  LabelWrapper,
  SubLabel,
} from "../../components/label.tsx";
import { Row, RowItem } from "../../components/row.tsx";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import type { Subscription, SubscriptionId } from "../../shared/types.ts";

const RenameForm: React.FC<{
  close: () => void;
  subscription: Subscription;
  subscriptionId: SubscriptionId;
}> = ({ close, subscription, subscriptionId }) => {
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
              id={`${id}-name`}
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
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
              primary
              onClick={async () => {
                await sendMessage("rename-subscription", subscriptionId, name);
                close();
              }}
            >
              {translate("options_renameSubscriptionDialog_renameButton")}
            </Button>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
};

export const RenameDialog: React.FC<{
  close: () => void;
  open: boolean;
  subscription: Subscription;
  subscriptionId: SubscriptionId;
}> = ({ close, open, subscription, subscriptionId }) => (
  <Dialog close={close} open={open}>
    <RenameForm
      close={close}
      subscription={subscription}
      subscriptionId={subscriptionId}
    />
  </Dialog>
);
