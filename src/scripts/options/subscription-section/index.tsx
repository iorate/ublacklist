import { Button } from "@base-ui/react/button";
import clsx from "clsx";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { EnableSubscriptionURL } from "../../shared/enable-subscription-url.tsx";
import { translate } from "../../shared/locales.ts";
import { addMessageListeners, sendMessage } from "../../shared/messages.ts";
import { requestPermission } from "../../shared/permissions.ts";
import { storageStore } from "../../shared/storage-store.ts";
import type { SubscriptionId, Subscriptions } from "../../shared/types.ts";
import { numberEntries, numberKeys } from "../../shared/utilities.ts";
import buttonStyles from "../../styles/button.module.css";
import labelStyles from "../../styles/label.module.css";
import rowStyles from "../../styles/row.module.css";
import sectionStyles from "../../styles/section.module.css";
import tableStyles from "../../styles/table.module.css";
import { SetIntervalItem } from "../shared/set-interval-item.tsx";
import { AddDialog } from "./add-dialog.tsx";
import localStyles from "./index.module.css";
import { SubscriptionTableRow } from "./table-row.tsx";

export type OptionsQuery = {
  addSubscriptionName: string | null;
  addSubscriptionURL: string | null;
  addSubscriptionType: "ruleset" | "domains" | null;
};

export function SubscriptionTable({
  query,
  subscriptions,
}: {
  query: OptionsQuery;
  subscriptions: Subscriptions;
}) {
  const [updating, setUpdating] = useState<Record<SubscriptionId, boolean>>({});
  const queryRef = useRef(
    query.addSubscriptionName != null ||
      query.addSubscriptionURL != null ||
      query.addSubscriptionType != null
      ? query
      : null,
  );
  const [addDialogOpen, setAddDialogOpen] = useState(queryRef.current != null);

  useEffect(
    () =>
      addMessageListeners({
        "subscription-updating": (id) => {
          setUpdating((updating) => ({ ...updating, [id]: true }));
        },
        "subscription-updated": (id) => {
          setUpdating((updating) => ({ ...updating, [id]: false }));
        },
      }),
    [],
  );

  return (
    <div className={sectionStyles.item}>
      <div className={rowStyles.row}>
        <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
          <div className={labelStyles.wrapper}>
            <div className={labelStyles.label}>
              {translate("options_subscriptionFeature")}
            </div>
            <div className={labelStyles.subLabel}>
              {translate("options_subscriptionFeatureDescription")}
            </div>
          </div>
        </div>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.primary)}
            data-testid="add-subscription-button"
            onClick={() => {
              setAddDialogOpen(true);
            }}
          >
            {translate("options_addSubscriptionButton")}
          </Button>
        </div>
      </div>
      {numberKeys(subscriptions).length ? (
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th
                    className={tableStyles.headerCell}
                    style={{ width: "2.25em" }}
                  />
                  <th className={tableStyles.headerCell}>
                    {translate("options_subscriptionNameHeader")}
                  </th>
                  <th
                    className={tableStyles.headerCell}
                    style={{ width: "20%" }}
                  >
                    {translate("options_subscriptionUpdateResultHeader")}
                  </th>
                  <th
                    className={tableStyles.headerCell}
                    style={{ width: "calc(0.75em + 36px)" }}
                  />
                </tr>
              </thead>
              <tbody>
                {numberEntries(subscriptions)
                  .sort(([id1], [id2]) => id1 - id2)
                  .map(([id, subscription]) => (
                    <SubscriptionTableRow
                      id={id}
                      key={id}
                      subscription={subscription}
                      updating={updating[id] ?? false}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={clsx(rowStyles.row, localStyles.empty)}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            {translate("options_noSubscriptionsAdded")}
          </div>
        </div>
      )}
      <div className={clsx(rowStyles.row, rowStyles.right)}>
        <div className={rowStyles.rowItem}>
          <Button
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            disabled={
              !Object.values(subscriptions).filter(
                (subscription) => subscription.enabled ?? true,
              ).length
            }
            onClick={async () => {
              if (
                !(await requestPermission(
                  Object.values(subscriptions).map((s) => s.url),
                ))
              ) {
                return;
              }
              await sendMessage("update-all-subscriptions");
            }}
          >
            {translate("options_updateAllSubscriptionsNowButton")}
          </Button>
        </div>
      </div>
      <AddDialog
        close={() => {
          setAddDialogOpen(false);
          queryRef.current = null;
        }}
        initialName={queryRef.current?.addSubscriptionName ?? ""}
        initialType={queryRef.current?.addSubscriptionType ?? "ruleset"}
        initialURL={queryRef.current?.addSubscriptionURL ?? ""}
        open={addDialogOpen}
      />
    </div>
  );
}

export function SubscriptionSection(props: {
  id: string;
  query: OptionsQuery;
}) {
  const id = useId();
  const subscriptions = storageStore.use.subscriptions();
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_subscriptionTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <SubscriptionTable query={props.query} subscriptions={subscriptions} />
        <Suspense fallback={null}>
          <EnableSubscriptionURL type="ruleset" />
        </Suspense>
        <div className={sectionStyles.item}>
          <SetIntervalItem
            itemKey="updateInterval"
            label={translate("options_updateIntervalInDays")}
            min={1}
            unit="day"
          />
        </div>
      </div>
    </section>
  );
}
