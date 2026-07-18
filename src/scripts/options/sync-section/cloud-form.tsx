import { Checkbox } from "@base-ui/react/checkbox";
import clsx from "clsx";
import { useId, useState } from "react";
import { browser } from "../../shared/browser.ts";
import { getWebsiteURL, translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import { supportedClouds } from "../../shared/supported-clouds.ts";
import type { CloudId, SyncBackendId, SyncForce } from "../../shared/types.ts";
import checkboxStyles from "../../styles/checkbox.module.css";
import indentStyles from "../../styles/indent.module.css";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";
import textStyles from "../../styles/text.module.css";
import textareaStyles from "../../styles/textarea.module.css";
import { getOS } from "../shared/platform.ts";
import {
  BackendSelect,
  FormFooter,
  FormHeader,
  InitialSyncSelect,
} from "./form-parts.tsx";

const altFlowRedirectURL = getWebsiteURL("/callback");

export function CloudForm({
  backendId,
  close,
  onBackendIdChange,
}: {
  backendId: CloudId;
  close: () => void;
  onBackendIdChange: (backendId: SyncBackendId) => void;
}) {
  const id = useId();
  const [phase, setPhase] = useState<
    "none" | "auth" | "auth-alt" | "conn" | "conn-alt"
  >("none");
  const [useAltFlow, setUseAltFlow] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [initialForce, setInitialForce] = useState<SyncForce>("none");
  const cloud = supportedClouds[backendId];
  const forceAltFlow = cloud.shouldUseAltFlow(getOS());
  const okButtonEnabled =
    phase === "none" || (phase === "auth-alt" && authCode !== "");

  const connectWithAuthCode = async (authCode: string, altFlow: boolean) => {
    setPhase(altFlow ? "conn-alt" : "conn");
    try {
      const error = await sendMessage(
        "connect-to-cloud",
        backendId,
        authCode,
        altFlow,
        initialForce,
      );
      if (error) {
        setErrorMessage(error.message);
        return;
      }
    } catch {
      return;
    } finally {
      setPhase("none");
    }
    close();
  };

  const startAuth = async () => {
    const altFlow = forceAltFlow || useAltFlow;
    setPhase(altFlow ? "auth-alt" : "auth");
    let authCode: string;
    try {
      const origins = [
        ...cloud.hostPermissions,
        ...(altFlow ? [altFlowRedirectURL] : []),
      ];
      const granted = await browser.permissions.request({ origins });
      if (!granted) {
        return;
      }
      authCode = (await cloud.authorize(altFlow)).authorizationCode;
    } catch {
      setPhase("none");
      return;
    }
    await connectWithAuthCode(authCode, altFlow);
  };

  return (
    <>
      <FormHeader />
      <div>
        <BackendSelect
          disabled={phase !== "none"}
          value={backendId}
          onValueChange={onBackendIdChange}
        />
        <div className={rowStyles.row}>
          <div className={rowStyles.rowItem}>
            <div className={indentStyles.indent}>
              <Checkbox.Root
                checked={forceAltFlow || useAltFlow}
                className={checkboxStyles.checkbox}
                disabled={phase !== "none" || forceAltFlow}
                id={`${id}-use-alt-flow`}
                onCheckedChange={setUseAltFlow}
              >
                <Checkbox.Indicator className={checkboxStyles.indicator} />
              </Checkbox.Root>
            </div>
          </div>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div
              className={clsx(
                labelStyles.wrapper,
                (phase !== "none" || forceAltFlow) && labelStyles.disabled,
              )}
            >
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-use-alt-flow`}
              >
                {translate("options_turnOnSyncDialog_useAltFlow")}
              </label>
            </div>
          </div>
        </div>
        {(forceAltFlow || useAltFlow) && (
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <span className={textStyles.secondary}>
                {translate(
                  "options_turnOnSyncDialog_altFlowDescription",
                  new URL(altFlowRedirectURL).hostname,
                )}
              </span>
            </div>
          </div>
        )}
        {(phase === "auth-alt" || phase === "conn-alt") && (
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
                <label
                  className={labelStyles.controlLabel}
                  htmlFor={`${id}-auth-code`}
                >
                  {translate("options_turnOnSyncDialog_altFlowAuthCodeLabel")}
                </label>
              </div>
              <textarea
                className={clsx(
                  textareaStyles.textArea,
                  textareaStyles.breakAll,
                )}
                disabled={phase !== "auth-alt"}
                id={`${id}-auth-code`}
                rows={2}
                style={{ height: "calc(1.5em * 2 + 1em + 2px)" }}
                value={authCode}
                onChange={(e) => {
                  setAuthCode(e.currentTarget.value);
                }}
              />
            </div>
          </div>
        )}
        <InitialSyncSelect
          disabled={phase !== "none"}
          value={initialForce}
          onValueChange={setInitialForce}
        />
      </div>
      <FormFooter
        close={close}
        errorMessage={errorMessage}
        okButtonEnabled={okButtonEnabled}
        onOKButtonClick={() => {
          if (phase === "auth-alt") {
            void connectWithAuthCode(authCode, true);
          } else {
            void startAuth();
          }
        }}
      />
    </>
  );
}
