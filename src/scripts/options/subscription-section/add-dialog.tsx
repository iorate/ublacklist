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
import { Select, SelectOption } from "../../components/select.tsx";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import { requestPermission } from "../../shared/permissions.ts";
import type { Subscription, SubscriptionType } from "../../shared/types.ts";

const AddForm: React.FC<{
  close: () => void;
  initialName: string;
  initialURL: string;
  initialType: SubscriptionType;
}> = ({ close, initialName, initialURL, initialType }) => {
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
  const ok = state.urlValid;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
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
                setState((s) => ({ ...s, name }));
              }}
            />
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              data-testid="add-subscription-dialog-cancel-button"
              onClick={close}
            >
              {translate("cancelButton")}
            </Button>
          </RowItem>
          <RowItem>
            <Button
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
    </>
  );
};

export const AddDialog: React.FC<{
  close: () => void;
  initialName: string;
  initialURL: string;
  initialType: SubscriptionType;
  open: boolean;
}> = ({ close, initialName, initialURL, initialType, open }) => (
  <Dialog close={close} data-testid="add-subscription-dialog" open={open}>
    <AddForm
      close={close}
      initialName={initialName}
      initialType={initialType}
      initialURL={initialURL}
    />
  </Dialog>
);
