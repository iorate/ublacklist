import { useState } from "react";
import { Dialog } from "../../components/dialog.tsx";
import type { SyncBackendId } from "../../shared/types.ts";
import { BrowserSyncForm } from "./browser-sync-form.tsx";
import { CloudForm } from "./cloud-form.tsx";
import { WebDAVForm } from "./webdav-form.tsx";

function TurnOnSyncForm({ close }: { close: () => void }) {
  const [backendId, setBackendId] = useState<SyncBackendId>("googleDrive");
  return backendId === "webdav" ? (
    <WebDAVForm close={close} onBackendIdChange={setBackendId} />
  ) : backendId === "browserSync" ? (
    <BrowserSyncForm close={close} onBackendIdChange={setBackendId} />
  ) : (
    <CloudForm
      // Remount on cloud switches to reset the form state, as with other backend switches
      key={backendId}
      backendId={backendId}
      close={close}
      onBackendIdChange={setBackendId}
    />
  );
}

export function TurnOnSyncDialog({
  close,
  open,
}: {
  close: () => void;
  open: boolean;
}) {
  return (
    <Dialog close={close} open={open}>
      <TurnOnSyncForm close={close} />
    </Dialog>
  );
}
