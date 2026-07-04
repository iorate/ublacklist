import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import { use, useState } from "react";
import buttonStyles from "../styles/button.module.css";
import labelStyles from "../styles/label.module.css";
import rowStyles from "../styles/row.module.css";
import sectionStyles from "../styles/section.module.css";
import { browser } from "./browser.ts";
import {
  rulesetSubscriptionURL,
  serpinfoSubscriptionURL,
  subscriptionURLOrigin,
} from "./constants.ts";
import { translate } from "./locales.ts";

const hasPermissionPromise = browser.permissions.contains({
  origins: [`${subscriptionURLOrigin}/*`],
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
            `${rulesetSubscriptionURL}?url=...`,
          ),
          enableButton: translate("options_enableRulesetSubscriptionURLButton"),
          isEnabled: translate("options_rulesetSubscriptionURLIsEnabled"),
        }
      : {
          enable: translate("options_enableSerpInfoSubscriptionURL"),
          enableDescription: translate(
            "options_enableSerpInfoSubscriptionURLDescription",
            `${serpinfoSubscriptionURL}?url=...`,
          ),
          enableButton: translate(
            "options_enableSerpInfoSubscriptionURLButton",
          ),
          isEnabled: translate("options_serpInfoSubscriptionURLIsEnabled"),
        };
  return (
    <div className={sectionStyles.item}>
      {enabled ? (
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>{labels.isEnabled}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>{labels.enable}</div>
              <div className={labelStyles.subLabel}>
                {labels.enableDescription}
              </div>
            </div>
          </div>
          <div className={rowStyles.rowItem}>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={() => {
                void browser.permissions
                  .request({
                    origins: [`${subscriptionURLOrigin}/*`],
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
          </div>
        </div>
      )}
    </div>
  );
}
