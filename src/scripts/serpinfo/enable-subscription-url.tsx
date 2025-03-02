import { use, useState } from "react";
import { browser } from "../browser.ts";
import { Button } from "../components/button.tsx";
import { Label, LabelWrapper, SubLabel } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import { SectionItem } from "../components/section.tsx";
import { translate } from "../locales.ts";
import * as C from "./constants.ts";

const hasPermissionPromise = browser.permissions.contains({
  origins: [`${C.SUBSCRIPTION_URL_ORIGIN}/*`],
});

export function EnableSubscriptionURL(props: { type: "ruleset" | "serpinfo" }) {
  const hasPermission = use(hasPermissionPromise);
  const [enabled, setEnabled] = useState(hasPermission);
  const labels =
    props.type === "ruleset"
      ? {
          enable: translate("options_enableRulesetSubscriptionURL"),
          enableDescription: translate(
            "options_enableRulesetSubscriptionURLDescription",
            `${C.RULESET_SUBSCRIPTION_URL}?url=...`,
          ),
          enableButton: translate("options_enableRulesetSubscriptionURLButton"),
          isEnabled: translate("options_rulesetSubscriptionURLIsEnabled"),
        }
      : {
          enable: translate("options_enableSerpInfoSubscriptionURL"),
          enableDescription: translate(
            "options_enableSerpInfoSubscriptionURLDescription",
            `${C.SERPINFO_SUBSCRIPTION_URL}?url=...`,
          ),
          enableButton: translate(
            "options_enableSerpInfoSubscriptionURLButton",
          ),
          isEnabled: translate("options_serpInfoSubscriptionURLIsEnabled"),
        };
  return (
    <SectionItem>
      {enabled ? (
        <Row>
          <RowItem expanded>
            <LabelWrapper>
              <Label>{labels.isEnabled}</Label>
            </LabelWrapper>
          </RowItem>
        </Row>
      ) : (
        <Row>
          <RowItem expanded>
            <LabelWrapper>
              <Label>{labels.enable}</Label>
              <SubLabel>{labels.enableDescription}</SubLabel>
            </LabelWrapper>
          </RowItem>
          <RowItem>
            <Button
              primary
              onClick={() => {
                void browser.permissions
                  .request({
                    origins: [`${C.SUBSCRIPTION_URL_ORIGIN}/*`],
                  })
                  .then((granted) => {
                    if (granted) {
                      setEnabled(true);
                    }
                  });
              }}
            >
              {labels.enableButton}
            </Button>
          </RowItem>
        </Row>
      )}
    </SectionItem>
  );
}
