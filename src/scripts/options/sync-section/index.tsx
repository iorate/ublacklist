import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useId, useState } from "react";
import { translate } from "../../shared/locales.ts";
import { addMessageListeners, sendMessage } from "../../shared/messages.ts";
import { storageStore } from "../../shared/storage-store.ts";
import type { SyncBackendId } from "../../shared/types.ts";
import { isErrorResult } from "../../shared/utilities.ts";
import buttonStyles from "../../styles/button.module.css";
import indentStyles from "../../styles/indent.module.css";
import labelStyles from "../../styles/label.module.css";
import listStyles from "../../styles/list.module.css";
import rowStyles from "../../styles/row.module.css";
import sectionStyles from "../../styles/section.module.css";
import { FromNow } from "../shared/from-now.tsx";
import { SetBooleanItem } from "../shared/set-boolean-item.tsx";
import { SetIntervalItem } from "../shared/set-interval-item.tsx";
import { messageNames } from "./message-names.ts";
import { TurnOnSyncDialog } from "./turn-on-sync-dialog.tsx";

function TurnOnSync({
  backendId,
}: {
  backendId: SyncBackendId | false | null;
}) {
  const [turnOnSyncDialogOpen, setTurnOnSyncDialogOpen] = useState(false);
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          {backendId ? (
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>
                {translate(messageNames[backendId].syncTurnedOn)}
              </div>
            </div>
          ) : (
            <div className={labelStyles.wrapper}>
              <div className={labelStyles.label}>
                {translate("options_syncFeature")}
              </div>
              <div className={labelStyles.subLabel}>
                {translate("options_syncFeatureDescription")}
              </div>
            </div>
          )}
        </div>
        <div className={rowStyles.rowItem}>
          {backendId ? (
            <Button
              className={clsx(buttonStyles.button, buttonStyles.secondary)}
              onClick={() => {
                void sendMessage("disconnect-from-sync-backend");
              }}
            >
              {translate("options_turnOffSync")}
            </Button>
          ) : (
            <Button
              className={clsx(buttonStyles.button, buttonStyles.primary)}
              onClick={() => {
                setTurnOnSyncDialogOpen(true);
              }}
            >
              {translate("options_turnOnSync")}
            </Button>
          )}
        </div>
      </div>
      <TurnOnSyncDialog
        close={() => setTurnOnSyncDialogOpen(false)}
        open={turnOnSyncDialogOpen}
      />
    </div>
  );
}

function SyncNow(props: { backendId: SyncBackendId | false | null }) {
  const syncResult = storageStore.use.syncResult();
  const [syncing, setSyncing] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        syncing: (id) => {
          if (id !== props.backendId) {
            return;
          }
          setSyncing(true);
        },
        synced: (id) => {
          if (id !== props.backendId) {
            return;
          }
          setSyncing(false);
        },
      }),
    [props.backendId],
  );
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_syncResult")}
            </div>
            <div className={labelStyles.subLabel}>
              {syncing ? (
                translate("options_syncRunning")
              ) : !props.backendId || !syncResult ? (
                translate("options_syncNever")
              ) : isErrorResult(syncResult) ? (
                translate("error", syncResult.message)
              ) : (
                <FromNow time={dayjs(syncResult.timestamp)} />
              )}
            </div>
          </div>
        </div>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            disabled={syncing || !props.backendId}
            onClick={() => {
              void sendMessage("sync");
            }}
          >
            {translate("options_syncNowButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SyncCategories() {
  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_syncCategories")}
            </div>
          </div>
        </div>
      </div>
      <div className={rowStyles.row}>
        <div className={rowStyles.rowItem}>
          <div className={indentStyles.indent} />
        </div>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <ul className={listStyles.list}>
            <li className={listStyles.item}>
              <SetBooleanItem
                itemKey="syncBlocklist"
                label={translate("options_syncBlocklist")}
              />
            </li>
            <li className={listStyles.item}>
              <SetBooleanItem
                itemKey="syncGeneral"
                label={translate("options_syncGeneral")}
              />
            </li>
            <li className={listStyles.item}>
              <SetBooleanItem
                itemKey="syncAppearance"
                label={translate("options_syncAppearance")}
              />
            </li>
            <li className={listStyles.item}>
              <SetBooleanItem
                itemKey="syncSubscriptions"
                label={translate("options_syncSubscriptions")}
              />
            </li>
            <li className={listStyles.item}>
              <SetBooleanItem
                itemKey="syncSerpInfo"
                label={translate("options_syncSerpInfo")}
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SyncSection(props: { id: string }) {
  const id = useId();
  const backendId = storageStore.use.syncCloudId();
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_syncTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <TurnOnSync backendId={backendId} />
        <SyncNow backendId={backendId} />
        <SyncCategories />
        <div className={sectionStyles.item}>
          <SetIntervalItem
            itemKey="syncInterval"
            label={translate("options_syncIntervalInMinutes")}
            min={5}
            unit="minute"
          />
        </div>
      </div>
    </section>
  );
}
