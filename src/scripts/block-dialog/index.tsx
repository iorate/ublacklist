import "../styles/theme.css";
import "./baseline.css";
import { Button } from "@base-ui/react/button";
import cog from "@mdi/svg/svg/cog.svg";
import type { Props, SearchResult } from "@ublacklist/ruleset";
import clsx from "clsx";
import * as punycode from "punycode/";
import React, { useId, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import icon from "../../icons/icon.svg";
import dialogStyles from "../components/dialog.module.css";
import { Dialog } from "../components/dialog.tsx";
import { EmbeddedDialog } from "../components/embedded-dialog.tsx";
import { MenuItem } from "../components/menu.tsx";
import { SplitButton } from "../components/split-button.tsx";
import { SvgIcon } from "../components/svg-icon.tsx";
import { browser } from "../shared/browser.ts";
import type {
  InteractiveRuleset,
  Patch,
  PatchMode,
} from "../shared/interactive-ruleset.ts";
import { translate } from "../shared/locales.ts";
import { getRegistrableDomain } from "../shared/registrable-domain.ts";
import type { DialogTheme, MessageName0 } from "../shared/types.ts";
import buttonStyles from "../styles/button.module.css";
import iconButtonStyles from "../styles/icon-button.module.css";
import labelStyles from "../styles/label.module.css";
import rowStyles from "../styles/row.module.css";
import textareaStyles from "../styles/textarea.module.css";
import styles from "./index.module.css";

// ---------------------------------------------------------------------------
// Helpers

function isProcessableUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function computeHost(url: string, blockWholeSite: boolean): string {
  if (!isProcessableUrl(url)) {
    return url;
  }
  const { hostname } = new URL(url);
  const display = blockWholeSite
    ? (getRegistrableDomain(hostname) ?? hostname)
    : hostname;
  return punycode.toUnicode(display);
}

const MODE_TITLE_MESSAGE = {
  block: "popup_blockSiteTitle",
  unblock: "popup_unblockSiteTitle",
  highlight: "popup_highlightSiteTitle",
  unhighlight: "popup_unhighlightSiteTitle",
} as const satisfies Record<PatchMode, MessageName0>;

const MODE_BUTTON_MESSAGE = {
  block: "popup_blockSiteButton",
  unblock: "popup_unblockSiteButton",
  highlight: "popup_highlightSiteButton",
  unhighlight: "popup_unhighlightSiteButton",
} as const satisfies Record<PatchMode, MessageName0>;

function sortPropertyKeys(props: Props): string[] {
  const keys = Object.keys(props);
  const dollar = keys.filter((k) => k.startsWith("$")).sort();
  const plain = keys.filter((k) => !k.startsWith("$")).sort();
  return [...plain, ...dollar];
}

// ---------------------------------------------------------------------------
// Sub-components

function PropertiesTable({ searchResult }: { searchResult: SearchResult }) {
  const props = searchResult.props ?? {};
  const keys = sortPropertyKeys(props);
  return (
    <div className={rowStyles.row}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
          <div className={labelStyles.label}>
            {translate("popup_propertiesLabel")}
          </div>
        </div>
        <div className={styles.propertiesTable}>
          <div className={styles.propertiesCell}>url</div>
          <div className={styles.propertiesCell}>{searchResult.url}</div>
          {keys.map((key) => (
            <React.Fragment key={key}>
              <div className={styles.propertiesCell}>{key}</div>
              <div className={styles.propertiesCell}>{props[key]}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function RulesToAddInput({
  id,
  value,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className={rowStyles.row}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div
          className={clsx(
            labelStyles.wrapper,
            labelStyles.fullWidth,
            disabled && labelStyles.disabled,
          )}
        >
          <label className={labelStyles.controlLabel} htmlFor={id}>
            {translate("popup_addedRulesLabel")}
          </label>
        </div>
        <textarea
          className={clsx(
            textareaStyles.textArea,
            textareaStyles.breakAll,
            styles.rulesToAdd,
          )}
          disabled={disabled}
          id={id}
          rows={2}
          spellCheck="false"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </div>
    </div>
  );
}

function RulesDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className={rowStyles.row}>
      <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
        <div className={clsx(labelStyles.wrapper, labelStyles.fullWidth)}>
          <div className={labelStyles.label}>{label}</div>
        </div>
        {value ? (
          <div className={styles.rules}>{value}</div>
        ) : (
          <div className={styles.noRules}>{translate("popup_noRules")}</div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  autoMode,
  mode,
  disabled,
  menuDisabled,
  portalContainer,
  ref,
  testId,
  onClick,
  onSelectMode,
}: {
  autoMode: PatchMode; // never "highlight"
  mode: PatchMode;
  disabled: boolean;
  menuDisabled: boolean;
  portalContainer?: HTMLElement | ShadowRoot | undefined;
  ref?: React.Ref<HTMLButtonElement> | undefined;
  testId: string;
  onClick: () => void;
  onSelectMode: (mode: PatchMode) => void;
}) {
  return autoMode === "block" ? (
    <SplitButton
      data-testid={testId}
      disabled={disabled}
      menu={
        <>
          <MenuItem onClick={() => onSelectMode("block")}>
            {translate(MODE_BUTTON_MESSAGE.block)}
          </MenuItem>
          <MenuItem onClick={() => onSelectMode("highlight")}>
            {translate(MODE_BUTTON_MESSAGE.highlight)}
          </MenuItem>
        </>
      }
      menuAriaLabel={translate("popup_changeActionLabel")}
      menuDisabled={menuDisabled}
      portalContainer={portalContainer}
      primary
      ref={ref}
      onClick={onClick}
    >
      {translate(MODE_BUTTON_MESSAGE[mode])}
    </SplitButton>
  ) : (
    <Button
      className={clsx(buttonStyles.button, buttonStyles.primary)}
      data-testid={testId}
      disabled={disabled}
      ref={ref}
      onClick={onClick}
    >
      {translate(MODE_BUTTON_MESSAGE[mode])}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// BlockForm — body shared by BlockDialog and BlockEmbeddedDialog.

type BlockFormProps = {
  blockWholeSite: boolean;
  close: () => void;
  enableMatchingRules: boolean;
  id: string;
  initialFocusRef?: React.RefObject<HTMLButtonElement | null>;
  openOptionsPage: () => Promise<void>;
  portalContainer?: HTMLElement | ShadowRoot;
  ruleset: InteractiveRuleset;
  searchResult: SearchResult;
  onBlocked: (newSource: string) => void | Promise<void>;
};

function BlockForm({
  blockWholeSite,
  close,
  enableMatchingRules,
  id,
  initialFocusRef,
  openOptionsPage,
  portalContainer,
  ruleset,
  searchResult,
  onBlocked,
}: BlockFormProps) {
  // ---- Derived (pure from props)
  const urlIsProcessable = useMemo(
    () => isProcessableUrl(searchResult.url),
    [searchResult.url],
  );
  const host = useMemo(
    () => computeHost(searchResult.url, blockWholeSite),
    [searchResult.url, blockWholeSite],
  );
  // The auto-detected patch (mode = null) is the source of truth for both
  // the initial selected mode and the SplitButton's secondary menu label.
  // The mode in this patch is never "highlight".
  const autoPatch = useMemo<Patch | null>(
    () =>
      urlIsProcessable
        ? ruleset.createPatch(null, searchResult, {
            ...(blockWholeSite ? { getRegistrableDomain } : {}),
            collectMatchingRules: enableMatchingRules,
          })
        : null,
    [
      urlIsProcessable,
      ruleset,
      searchResult,
      blockWholeSite,
      enableMatchingRules,
    ],
  );
  const autoMode = autoPatch?.mode ?? "block";

  // ---- State
  // null = user has not selected a mode; follow autoPatch.mode instead.
  const [manualMode, setManualMode] = useState<PatchMode | null>(null);
  // null = user has not edited rulesToAdd; show patch.rulesToAdd instead.
  // A manual value persists across mode changes; rulesToAddValid disables
  // Apply if it doesn't fit the new mode.
  const [manualRulesToAdd, setManualRulesToAdd] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [matchingRulesOpen, setMatchingRulesOpen] = useState(false);

  // ---- Derived (state + props)
  // Reuse autoPatch when manualMode is unset or matches autoPatch.mode;
  // otherwise recompute. createPatch is cheap, but reusing avoids a redundant
  // call in the common case where the user never changes mode.
  const patch = useMemo<Patch | null>(() => {
    if (!autoPatch) {
      return null;
    }
    if (manualMode == null || manualMode === autoPatch.mode) {
      return autoPatch;
    }
    return ruleset.createPatch(manualMode, searchResult, {
      ...(blockWholeSite ? { getRegistrableDomain } : {}),
      collectMatchingRules: enableMatchingRules,
    });
  }, [
    autoPatch,
    manualMode,
    ruleset,
    searchResult,
    blockWholeSite,
    enableMatchingRules,
  ]);
  const mode: PatchMode = patch?.mode ?? "block";
  const rulesToAdd = manualRulesToAdd ?? patch?.rulesToAdd ?? "";
  const rulesToAddValid = useMemo(
    () => (patch ? ruleset.validateRulesToAdd(patch, rulesToAdd) : false),
    [ruleset, patch, rulesToAdd],
  );

  // ---- Event handlers
  const handleApply = async () => {
    if (!patch) {
      return;
    }
    const newSource = ruleset.applyPatch(patch, rulesToAdd);
    await Promise.resolve(onBlocked(newSource));
    close();
  };

  return (
    <>
      <div className={dialogStyles.header}>
        <h2 className={dialogStyles.title} id={`${id}-title`}>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <SvgIcon svg={icon} />
            </div>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              {translate(MODE_TITLE_MESSAGE[mode])}
            </div>
          </div>
        </h2>
      </div>
      <div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <span className={styles.host}>{host}</span>
          </div>
        </div>
        <div className={rowStyles.row}>
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <details
              open={detailsOpen}
              onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
            >
              <summary className={styles.summary}>
                {translate("popup_details")}
              </summary>
              <div className={styles.detailsBody}>
                <PropertiesTable searchResult={searchResult} />
                <RulesToAddInput
                  id={`${id}-rules-to-add`}
                  value={rulesToAdd}
                  disabled={!urlIsProcessable}
                  onChange={setManualRulesToAdd}
                />
                <RulesDisplay
                  label={translate("popup_removedRulesLabel")}
                  value={patch?.rulesToRemove ?? ""}
                />
              </div>
            </details>
          </div>
        </div>
        {patch?.matchingRules && (
          <div className={rowStyles.row}>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <details
                open={matchingRulesOpen}
                onToggle={(e) => setMatchingRulesOpen(e.currentTarget.open)}
              >
                <summary className={styles.summary}>
                  {translate("popup_matchingRules")}
                </summary>
                <div className={styles.detailsBody}>
                  <RulesDisplay
                    label={translate("popup_blockingRulesLabel")}
                    value={patch.matchingRules.block}
                  />
                  <RulesDisplay
                    label={translate("popup_unblockingRulesLabel")}
                    value={patch.matchingRules.unblock}
                  />
                  <RulesDisplay
                    label={translate("popup_highlightingRulesLabel")}
                    value={patch.matchingRules.highlight}
                  />
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
      <div className={dialogStyles.footer}>
        <div
          className={clsx(rowStyles.row, rowStyles.multiline, rowStyles.right)}
        >
          <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
            <button
              aria-label={translate("popup_openOptionsLink")}
              className={iconButtonStyles.button}
              title={translate("popup_openOptionsLink")}
              type="button"
              onClick={() => {
                void openOptionsPage();
              }}
            >
              <SvgIcon color="var(--ub-color-text-secondary)" svg={cog} />
            </button>
          </div>
          <div className={rowStyles.rowItem}>
            <div className={rowStyles.row}>
              <div className={rowStyles.rowItem}>
                <Button
                  className={clsx(buttonStyles.button, buttonStyles.secondary)}
                  ref={urlIsProcessable ? undefined : initialFocusRef}
                  onClick={close}
                >
                  {translate("cancelButton")}
                </Button>
              </div>
              <div className={rowStyles.rowItem}>
                <ActionButton
                  mode={mode}
                  autoMode={autoMode}
                  disabled={!rulesToAddValid}
                  menuDisabled={!urlIsProcessable}
                  portalContainer={portalContainer}
                  ref={urlIsProcessable ? initialFocusRef : undefined}
                  testId="block-dialog-action-button"
                  onClick={() => {
                    void handleApply();
                  }}
                  onSelectMode={setManualMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Wrappers

export type BlockDialogProps = {
  container: HTMLElement;
  open: boolean;
} & Omit<BlockFormProps, "id" | "initialFocusRef" | "portalContainer">;

export function BlockDialog({
  container,
  open,
  ...contentProps
}: BlockDialogProps) {
  const id = useId();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      aria-labelledby={`${id}-title`}
      close={contentProps.close}
      container={container}
      initialFocus={initialFocusRef}
      open={open}
      width="360px"
    >
      {open && (
        <BlockForm
          id={id}
          initialFocusRef={initialFocusRef}
          portalContainer={container}
          {...contentProps}
        />
      )}
    </Dialog>
  );
}

export type BlockEmbeddedDialogProps = Omit<
  BlockFormProps,
  "id" | "initialFocusRef" | "portalContainer"
>;

export function BlockEmbeddedDialog(props: BlockEmbeddedDialogProps) {
  const id = useId();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  return (
    <EmbeddedDialog
      aria-labelledby={`${id}-title`}
      close={props.close}
      initialFocus={initialFocusRef}
    >
      <BlockForm id={id} initialFocusRef={initialFocusRef} {...props} />
    </EmbeddedDialog>
  );
}

export type BlockDialogRequest = {
  url: string;
  props: Record<string, string>;
  ruleset: InteractiveRuleset;
  skipDialog: boolean;
  theme: DialogTheme;
  blockWholeSite: boolean;
  enableMatchingRules: boolean;
  onBlocked(newSource: string): void;
  openOptionsPage(): void;
};

type DialogRoot = { container: HTMLDivElement; root: Root };

let dialogRoot: DialogRoot | null = null;
let styleSheetPromise: Promise<CSSStyleSheet> | null = null;

function loadStyleSheet(): Promise<CSSStyleSheet> {
  styleSheetPromise ??= (async () => {
    const response = await fetch(
      browser.runtime.getURL("scripts/block-dialog.css"),
    );
    const styleSheet = new CSSStyleSheet();
    await styleSheet.replace(await response.text());
    return styleSheet;
  })();
  return styleSheetPromise;
}

async function getDialogRoot(): Promise<DialogRoot> {
  const styleSheet = await loadStyleSheet();
  if (!dialogRoot) {
    const shadowRoot = document.body
      .appendChild(document.createElement("div"))
      .attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets = [styleSheet];
    const container = shadowRoot.appendChild(document.createElement("div"));
    container.className = "root";
    for (const type of ["keydown", "keypress", "keyup"] as const) {
      container.addEventListener(type, (e) => {
        e.stopPropagation();
      });
    }
    const root = createRoot(container);
    dialogRoot = { container, root };
  }
  return dialogRoot;
}

export function closeDialog(): void {
  if (!dialogRoot) {
    return;
  }
  dialogRoot.root.render(null);
}

export function openDialog(request: BlockDialogRequest): void {
  const searchResult = { url: request.url, props: request.props };
  if (request.skipDialog) {
    const patch = request.ruleset.createPatch(
      null,
      searchResult,
      request.blockWholeSite ? { getRegistrableDomain } : {},
    );
    request.onBlocked(request.ruleset.applyPatch(patch));
    return;
  }
  void getDialogRoot().then(({ container, root }) => {
    container.dataset.theme = request.theme;
    root.render(
      <BlockDialog
        blockWholeSite={request.blockWholeSite}
        close={closeDialog}
        container={container}
        enableMatchingRules={request.enableMatchingRules}
        open={true}
        openOptionsPage={async () => request.openOptionsPage()}
        ruleset={request.ruleset}
        searchResult={searchResult}
        onBlocked={request.onBlocked}
      />,
    );
  });
}
