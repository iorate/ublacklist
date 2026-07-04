import cog from "@mdi/svg/svg/cog.svg";
import type { Props, SearchResult } from "@ublacklist/ruleset";
import * as punycode from "punycode/";
import React, { useId, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import icon from "../../icons/icon.svg";
import {
  FOCUS_DEFAULT_CLASS,
  FOCUS_END_CLASS,
  FOCUS_START_CLASS,
} from "../components/constants.ts";
import { ScopedBaseline } from "../components/legacy/baseline.tsx";
import { Button } from "../components/legacy/button.tsx";
import {
  Details,
  DetailsBody,
  DetailsSummary,
} from "../components/legacy/details.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from "../components/legacy/dialog.tsx";
import { Icon } from "../components/legacy/icon.tsx";
import { IconButton } from "../components/legacy/icon-button.tsx";
import {
  ControlLabel,
  Label,
  LabelWrapper,
} from "../components/legacy/label.tsx";
import { MenuItem } from "../components/legacy/menu.tsx";
import { Row, RowItem } from "../components/legacy/row.tsx";
import { SplitButton } from "../components/legacy/split-button.tsx";
import { TextArea } from "../components/legacy/textarea.tsx";
import { StylesProvider } from "../components/styles.tsx";
import {
  darkTheme,
  lightTheme,
  ThemeProvider,
  useTheme,
} from "../components/theme.tsx";
import { useClassName } from "../components/utilities.ts";
import type {
  InteractiveRuleset,
  Patch,
  PatchMode,
} from "../shared/interactive-ruleset.ts";
import { translate } from "../shared/locales.ts";
import { getRegistrableDomain } from "../shared/registrable-domain.ts";
import type { DialogTheme, MessageName0 } from "../shared/types.ts";
import { svgToDataURL } from "../shared/utilities.ts";

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

const PropertiesTable: React.FC<{ searchResult: SearchResult }> = ({
  searchResult,
}) => {
  const tableClassName = useClassName(
    () => ({
      display: "grid",
      gridTemplateColumns: "6em 1fr",
      gap: "0.15em 0.75em",
    }),
    [],
  );
  const cellClassName = useClassName(
    () => ({
      fontFamily: "monospace",
      maxHeight: "4.5em",
      overflowY: "auto",
      whiteSpace: "break-spaces",
      wordBreak: "break-all",
      lineBreak: "anywhere",
    }),
    [],
  );
  const props = searchResult.props ?? {};
  const keys = sortPropertyKeys(props);
  return (
    <Row spacing="1.5em">
      <RowItem expanded>
        <LabelWrapper fullWidth>
          <Label>{translate("popup_propertiesLabel")}</Label>
        </LabelWrapper>
        <div className={tableClassName}>
          <div className={cellClassName}>url</div>
          <div className={cellClassName}>{searchResult.url}</div>
          {keys.map((key) => (
            <React.Fragment key={key}>
              <div className={cellClassName}>{key}</div>
              <div className={cellClassName}>{props[key]}</div>
            </React.Fragment>
          ))}
        </div>
      </RowItem>
    </Row>
  );
};

const RulesToAddInput: React.FC<{
  id: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}> = ({ id, value, disabled, onChange }) => {
  return (
    <Row spacing="1.5em">
      <RowItem expanded>
        <LabelWrapper disabled={disabled} fullWidth>
          <ControlLabel for={id}>
            {translate("popup_addedRulesLabel")}
          </ControlLabel>
        </LabelWrapper>
        <TextArea
          breakAll
          disabled={disabled}
          id={id}
          monospace
          resizable
          rows={2}
          spellCheck="false"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </RowItem>
    </Row>
  );
};

const RulesDisplay: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const theme = useTheme();
  const bodyClassName = useClassName(
    () => ({
      fontFamily: "monospace",
      whiteSpace: "pre",
      overflowX: "auto",
    }),
    [],
  );
  const placeholderClassName = useClassName(
    () => ({
      color: theme.text.secondary,
    }),
    [theme.text.secondary],
  );
  return (
    <Row spacing="1.5em">
      <RowItem expanded>
        <LabelWrapper fullWidth>
          <Label>{label}</Label>
        </LabelWrapper>
        {value ? (
          <div className={bodyClassName}>{value}</div>
        ) : (
          <div className={placeholderClassName}>
            {translate("popup_noRules")}
          </div>
        )}
      </RowItem>
    </Row>
  );
};

const ActionButton: React.FC<{
  autoMode: PatchMode; // never "highlight"
  mode: PatchMode;
  disabled: boolean;
  focusDefault: boolean;
  focusEnd: boolean;
  menuDisabled: boolean;
  testId: string;
  onClick: () => void;
  onSelectMode: (mode: PatchMode) => void;
}> = ({
  autoMode,
  mode,
  disabled,
  focusDefault,
  focusEnd,
  menuDisabled,
  testId,
  onClick,
  onSelectMode,
}) => {
  return autoMode === "block" ? (
    <SplitButton
      className={focusDefault ? FOCUS_DEFAULT_CLASS : undefined}
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
      menuClassName={focusEnd ? FOCUS_END_CLASS : undefined}
      menuDisabled={menuDisabled}
      placement="top"
      primary
      onClick={onClick}
    >
      {translate(MODE_BUTTON_MESSAGE[mode])}
    </SplitButton>
  ) : (
    <Button
      className={
        [focusDefault && FOCUS_DEFAULT_CLASS, focusEnd && FOCUS_END_CLASS]
          .filter(Boolean)
          .join(" ") || undefined
      }
      data-testid={testId}
      disabled={disabled}
      primary
      onClick={onClick}
    >
      {translate(MODE_BUTTON_MESSAGE[mode])}
    </Button>
  );
};

// ---------------------------------------------------------------------------
// BlockDialogContent — body shared by BlockDialog and BlockEmbeddedDialog.

type BlockDialogContentProps = {
  blockWholeSite: boolean;
  close: () => void;
  enableMatchingRules: boolean;
  id: string;
  openOptionsPage: () => Promise<void>;
  ruleset: InteractiveRuleset;
  searchResult: SearchResult;
  onBlocked: (newSource: string) => void | Promise<void>;
};

const BlockDialogContent: React.FC<BlockDialogContentProps> = ({
  blockWholeSite,
  close,
  enableMatchingRules,
  id,
  openOptionsPage,
  ruleset,
  searchResult,
  onBlocked,
}) => {
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

  // ---- Styles
  const hostClassName = useClassName(
    () => ({
      wordBreak: "break-all",
    }),
    [],
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle id={`${id}-title`}>
          <Row>
            <RowItem>
              <Icon iconSize="24px" url={svgToDataURL(icon)} />
            </RowItem>
            <RowItem expanded>{translate(MODE_TITLE_MESSAGE[mode])}</RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span className={hostClassName}>{host}</span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Details
              open={detailsOpen}
              onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
            >
              <DetailsSummary className={FOCUS_START_CLASS}>
                {translate("popup_details")}
              </DetailsSummary>
              <DetailsBody>
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
              </DetailsBody>
            </Details>
          </RowItem>
        </Row>
        {patch?.matchingRules && (
          <Row>
            <RowItem expanded>
              <Details
                open={matchingRulesOpen}
                onToggle={(e) => setMatchingRulesOpen(e.currentTarget.open)}
              >
                <DetailsSummary>
                  {translate("popup_matchingRules")}
                </DetailsSummary>
                <DetailsBody>
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
                </DetailsBody>
              </Details>
            </RowItem>
          </Row>
        )}
      </DialogBody>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <IconButton
              aria-label={translate("popup_openOptionsLink")}
              iconURL={svgToDataURL(cog)}
              title={translate("popup_openOptionsLink")}
              onClick={() => {
                void openOptionsPage();
              }}
            />
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button
                  className={
                    !urlIsProcessable
                      ? `${FOCUS_DEFAULT_CLASS} ${FOCUS_END_CLASS}`
                      : undefined
                  }
                  onClick={close}
                >
                  {translate("cancelButton")}
                </Button>
              </RowItem>
              <RowItem>
                <ActionButton
                  mode={mode}
                  autoMode={autoMode}
                  disabled={!rulesToAddValid}
                  menuDisabled={!urlIsProcessable}
                  focusDefault={urlIsProcessable}
                  focusEnd={urlIsProcessable}
                  testId="block-dialog-action-button"
                  onClick={() => {
                    void handleApply();
                  }}
                  onSelectMode={setManualMode}
                />
              </RowItem>
            </Row>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
};

// ---------------------------------------------------------------------------
// Wrappers

export type BlockDialogProps = {
  open: boolean;
  target: HTMLElement | ShadowRoot;
  theme: DialogTheme;
} & Omit<BlockDialogContentProps, "id">;

export const BlockDialog: React.FC<BlockDialogProps> = ({
  open,
  target,
  theme,
  ...contentProps
}) => {
  const id = useId();
  return (
    <StylesProvider target={target}>
      <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <ScopedBaseline>
          <Dialog
            aria-labelledby={`${id}-title`}
            close={contentProps.close}
            open={open}
            width="360px"
          >
            {open && (
              <BlockDialogContent
                key={contentProps.searchResult.url}
                id={id}
                {...contentProps}
              />
            )}
          </Dialog>
        </ScopedBaseline>
      </ThemeProvider>
    </StylesProvider>
  );
};

export type BlockEmbeddedDialogProps = Omit<BlockDialogContentProps, "id">;

export const BlockEmbeddedDialog: React.FC<BlockEmbeddedDialogProps> = (
  props,
) => {
  const id = useId();
  return (
    <EmbeddedDialog
      aria-labelledby={`${id}-title`}
      close={props.close}
      width="360px"
    >
      <BlockDialogContent key={props.searchResult.url} id={id} {...props} />
    </EmbeddedDialog>
  );
};

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

type DialogRoot = { root: Root; shadowRoot: ShadowRoot };

let dialogRoot: DialogRoot | null = null;

function getDialogRoot(): DialogRoot {
  if (!dialogRoot) {
    const shadowRoot = document.body
      .appendChild(document.createElement("div"))
      .attachShadow({ mode: "open" });
    const root = createRoot(shadowRoot);
    dialogRoot = { root, shadowRoot };
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
  const dialogRoot = getDialogRoot();
  dialogRoot.root.render(
    <BlockDialog
      blockWholeSite={request.blockWholeSite}
      close={closeDialog}
      enableMatchingRules={request.enableMatchingRules}
      open={true}
      openOptionsPage={async () => request.openOptionsPage()}
      ruleset={request.ruleset}
      searchResult={searchResult}
      target={dialogRoot.shadowRoot}
      theme={request.theme}
      onBlocked={request.onBlocked}
    />,
  );
}
