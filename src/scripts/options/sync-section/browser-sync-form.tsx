import { useState } from "react";
import { sendMessage } from "../../shared/messages.ts";
import type { SyncBackendId, SyncForce } from "../../shared/types.ts";
import {
  BackendSelect,
  FormFooter,
  FormHeader,
  InitialSyncSelect,
} from "./form-parts.tsx";

export function BrowserSyncForm({
  close,
  onBackendIdChange,
}: {
  close: () => void;
  onBackendIdChange: (backendId: SyncBackendId) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [initialForce, setInitialForce] = useState<SyncForce>("none");

  const connect = async () => {
    setBusy(true);
    try {
      const error = await sendMessage("connect-to-browser-sync", initialForce);
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
          value="browserSync"
          onValueChange={onBackendIdChange}
        />
        <InitialSyncSelect
          disabled={busy}
          value={initialForce}
          onValueChange={setInitialForce}
        />
      </div>
      <FormFooter
        close={close}
        errorMessage={errorMessage}
        okButtonEnabled={!busy}
        onOKButtonClick={() => {
          void connect();
        }}
      />
    </>
  );
}
