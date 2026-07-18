import { Input } from "@base-ui/react/input";
import clsx from "clsx";
import { useId, useState } from "react";
import { browser } from "../../shared/browser.ts";
import { translate } from "../../shared/locales.ts";
import { sendMessage } from "../../shared/messages.ts";
import type { SyncBackendId, SyncForce } from "../../shared/types.ts";
import inputStyles from "../../styles/input.module.css";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";
import {
  BackendSelect,
  FormFooter,
  FormHeader,
  InitialSyncSelect,
} from "./form-parts.tsx";

export function WebDAVForm({
  close,
  onBackendIdChange,
}: {
  close: () => void;
  onBackendIdChange: (backendId: SyncBackendId) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [url, setURL] = useState("");
  const [urlValid, setURLValid] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [initialForce, setInitialForce] = useState<SyncForce>("none");

  const connect = async () => {
    try {
      const u = new URL(url);
      const origins = [`${u.protocol}//${u.hostname}${u.pathname}${u.search}`];
      const granted = await browser.permissions.request({ origins });
      if (!granted) {
        return;
      }
    } catch {
      return;
    }
    setBusy(true);
    try {
      const error = await sendMessage(
        "connect-to-webdav",
        { url, username, password, path: "" },
        initialForce,
      );
      if (error) {
        setErrorMessage(error.message);
        return;
      }
    } catch {
      return;
    } finally {
      setBusy(false);
    }
    close();
  };

  return (
    <>
      <FormHeader />
      <div>
        <BackendSelect
          disabled={busy}
          value="webdav"
          onValueChange={onBackendIdChange}
        />
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
              <label className={labelStyles.controlLabel} htmlFor={`${id}-url`}>
                {translate("clouds_webdavUrlLabel")}
              </label>
              <div className={labelStyles.subLabel}>
                {translate("clouds_webdavUrlDescription")}
              </div>
            </div>
            <Input
              className={inputStyles.input}
              disabled={busy}
              id={`${id}-url`}
              pattern="https?:.*"
              placeholder="https://example.com/webdav/"
              type="url"
              value={url}
              onChange={(e) => {
                const {
                  value,
                  validity: { valid },
                } = e.currentTarget;
                setURL(value);
                setURLValid(valid);
              }}
            />
          </div>
        </div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-username`}
              >
                {translate("clouds_webdavUsernameLabel")}
              </label>
            </div>
            <Input
              className={inputStyles.input}
              disabled={busy}
              id={`${id}-username`}
              value={username}
              onChange={(e) => {
                setUsername(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
              <label
                className={labelStyles.controlLabel}
                htmlFor={`${id}-password`}
              >
                {translate("clouds_webdavPasswordLabel")}
              </label>
            </div>
            <Input
              className={inputStyles.input}
              disabled={busy}
              id={`${id}-password`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <InitialSyncSelect
          disabled={busy}
          value={initialForce}
          onValueChange={setInitialForce}
        />
      </div>
      <FormFooter
        close={close}
        errorMessage={errorMessage}
        okButtonEnabled={!busy && urlValid}
        onOKButtonClick={() => {
          void connect();
        }}
      />
    </>
  );
}
