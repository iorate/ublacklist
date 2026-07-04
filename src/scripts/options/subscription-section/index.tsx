import { Suspense, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/button.tsx";
import { Label, LabelWrapper, SubLabel } from "../../components/label.tsx";
import { Row, RowItem } from "../../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../../components/section.tsx";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
} from "../../components/table.tsx";
import { useClassName } from "../../components/utilities.ts";
import { EnableSubscriptionURL } from "../../shared/enable-subscription-url.tsx";
import { translate } from "../../shared/locales.ts";
import { addMessageListeners, sendMessage } from "../../shared/messages.ts";
import { requestPermission } from "../../shared/permissions.ts";
import { storageStore } from "../../shared/storage-store.ts";
import type { SubscriptionId, Subscriptions } from "../../shared/types.ts";
import { numberEntries, numberKeys } from "../../shared/utilities.ts";
import { SetIntervalItem } from "../set-interval-item.tsx";
import { AddDialog } from "./add-dialog.tsx";
import { ManageSubscription } from "./row.tsx";

export type OptionsQuery = {
  addSubscriptionName: string | null;
  addSubscriptionURL: string | null;
  addSubscriptionType: "ruleset" | "domains" | null;
};

export const ManageSubscriptions: React.FC<{
  query: OptionsQuery;
  subscriptions: Subscriptions;
}> = ({ query, subscriptions }) => {
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

  const emptyClass = useClassName(
    () => ({
      minHeight: "3em",
      textAlign: "center",
    }),
    [],
  );

  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate("options_subscriptionFeature")}</Label>
            <SubLabel>
              {translate("options_subscriptionFeatureDescription")}
            </SubLabel>
          </LabelWrapper>
        </RowItem>
        <RowItem>
          <Button
            data-testid="add-subscription-button"
            primary
            onClick={() => {
              setAddDialogOpen(true);
            }}
          >
            {translate("options_addSubscriptionButton")}
          </Button>
        </RowItem>
      </Row>
      {numberKeys(subscriptions).length ? (
        <Row>
          <RowItem expanded>
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell width="2.25em" />
                  <TableHeaderCell>
                    {translate("options_subscriptionNameHeader")}
                  </TableHeaderCell>
                  <TableHeaderCell width="20%">
                    {translate("options_subscriptionUpdateResultHeader")}
                  </TableHeaderCell>
                  <TableHeaderCell width="calc(0.75em + 36px)" />
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {numberEntries(subscriptions)
                  .sort(([id1], [id2]) => id1 - id2)
                  .map(([id, subscription]) => (
                    <ManageSubscription
                      id={id}
                      key={id}
                      subscription={subscription}
                      updating={updating[id] ?? false}
                    />
                  ))}
              </TableBody>
            </Table>
          </RowItem>
        </Row>
      ) : (
        <Row className={emptyClass}>
          <RowItem expanded>
            {translate("options_noSubscriptionsAdded")}
          </RowItem>
        </Row>
      )}
      <Row right>
        <RowItem>
          <Button
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
        </RowItem>
      </Row>
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
    </SectionItem>
  );
};

export const SubscriptionSection: React.FC<{
  id: string;
  query: OptionsQuery;
}> = (props) => {
  const id = useId();
  const subscriptions = storageStore.use.subscriptions();
  return (
    <Section aria-labelledby={`${id}-title`} id={props.id}>
      <SectionHeader>
        <SectionTitle id={`${id}-title`}>
          {translate("options_subscriptionTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <ManageSubscriptions
          query={props.query}
          subscriptions={subscriptions}
        />
        <Suspense fallback={null}>
          <EnableSubscriptionURL type="ruleset" />
        </Suspense>
        <SectionItem>
          <SetIntervalItem
            disabled={
              !Object.values(subscriptions).filter(
                (subscription) => subscription.enabled ?? true,
              ).length
            }
            itemKey="updateInterval"
            label={translate("options_updateInterval")}
            valueOptions={[60, 120, 180, 360, 720, 1440]}
          />
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
