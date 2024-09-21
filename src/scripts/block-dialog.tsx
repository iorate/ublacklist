import * as punycode from "punycode/";
import { useState } from "react";
import * as tldts from "tldts";
import icon from "../icons/icon.svg";
import { ScopedBaseline } from "./components/baseline.tsx";
import { Button, LinkButton } from "./components/button.tsx";
import {
  FOCUS_DEFAULT_CLASS,
  FOCUS_END_CLASS,
  FOCUS_START_CLASS,
} from "./components/constants.ts";
import { Details, DetailsBody, DetailsSummary } from "./components/details.tsx";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from "./components/dialog.tsx";
import { Icon } from "./components/icon.tsx";
import { Input } from "./components/input.tsx";
import { ControlLabel, LabelWrapper } from "./components/label.tsx";
import { Row, RowItem } from "./components/row.tsx";
import { StylesProvider } from "./components/styles.tsx";
import { TextArea } from "./components/textarea.tsx";
import { ThemeProvider, darkTheme, lightTheme } from "./components/theme.tsx";
import { useClassName, usePrevious } from "./components/utilities.ts";
import type { InteractiveRuleset } from "./interactive-ruleset.ts";
import { translate } from "./locales.ts";
import { PathDepth } from "./path-depth.ts";
import type { LinkProps } from "./ruleset/ruleset.ts";
import type { DialogTheme } from "./types.ts";
import { makeAltURL, svgToDataURL } from "./utilities.ts";

type BlockDialogContentProps = {
  blockWholeSite: boolean;
  close: () => void;
  enablePathDepth: boolean;
  entryProps: LinkProps;
  open: boolean;
  openOptionsPage: () => Promise<void>;
  ruleset: InteractiveRuleset;
  onBlocked: () => void | Promise<void>;
};

const BlockDialogContent: React.FC<BlockDialogContentProps> = ({
  blockWholeSite,
  close,
  enablePathDepth,
  entryProps,
  open,
  openOptionsPage,
  ruleset,
  onBlocked,
}) => {
  const [state, setState] = useState({
    disabled: false,
    unblock: false,
    host: "",
    detailsOpen: false,
    pathDepth: null as PathDepth | null,
    depth: "",
    rulesToAdd: "",
    rulesToAddValid: false,
    rulesToRemove: "",
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    const url = makeAltURL(entryProps.url);
    if (url && /^(https?|ftp)$/.test(url.scheme)) {
      const patch = ruleset.createPatch(entryProps, blockWholeSite);
      state.disabled = false;
      state.unblock = patch.unblock;
      state.host = punycode.toUnicode(
        blockWholeSite ? (tldts.getDomain(url.host) ?? url.host) : url.host,
      );
      state.detailsOpen = false;
      state.pathDepth = enablePathDepth ? new PathDepth(url) : null;
      state.depth = "0";
      state.rulesToAdd = patch.rulesToAdd;
      state.rulesToAddValid = true;
      state.rulesToRemove = patch.rulesToRemove;
    } else {
      state.disabled = true;
      state.unblock = false;
      state.host = entryProps.url;
      state.detailsOpen = false;
      state.pathDepth = null;
      state.depth = "";
      state.rulesToAdd = "";
      state.rulesToAddValid = false;
      state.rulesToRemove = "";
    }
  }
  const ok = !state.disabled && state.rulesToAddValid;

  const hostClass = useClassName(
    () => ({
      wordBreak: "break-all",
    }),
    [],
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle id="title">
          <Row>
            <RowItem>
              <Icon iconSize="24px" url={svgToDataURL(icon)} />
            </RowItem>
            <RowItem expanded>
              {translate(
                state.unblock
                  ? "popup_unblockSiteTitle"
                  : "popup_blockSiteTitle",
              )}
            </RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span className={hostClass}>{state.host}</span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Details
              open={state.detailsOpen}
              onToggle={(e) => {
                const { open } = e.currentTarget;
                setState((s) => ({
                  ...s,
                  detailsOpen: open,
                }));
              }}
            >
              <DetailsSummary className={FOCUS_START_CLASS}>
                {translate("popup_details")}
              </DetailsSummary>
              <DetailsBody>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper fullWidth>
                      <ControlLabel for="url">
                        {translate("popup_pageURLLabel")}
                      </ControlLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        id="url"
                        readOnly
                        rows={2}
                        value={entryProps.url}
                      />
                    )}
                  </RowItem>
                </Row>
                {enablePathDepth && (
                  <Row>
                    <RowItem expanded>
                      <LabelWrapper disabled={state.disabled} fullWidth>
                        <ControlLabel for="depth">
                          {translate("popup_pathDepth")}
                        </ControlLabel>
                      </LabelWrapper>
                      {open && (
                        <Input
                          disabled={state.disabled}
                          id="depth"
                          max={state.pathDepth?.maxDepth() ?? 0}
                          min={0}
                          type="number"
                          value={state.depth}
                          onChange={(e) => {
                            const depth = e.currentTarget.value;
                            if (
                              !state.pathDepth ||
                              !depth ||
                              !e.currentTarget.validity.valid
                            ) {
                              setState((s) => ({ ...s, depth }));
                              return;
                            }
                            const rulesToAdd =
                              state.pathDepth.suggestMatchPattern(
                                Number(depth),
                                state.unblock,
                              );
                            const patch = ruleset.modifyPatch({ rulesToAdd });
                            setState((s) => ({
                              ...s,
                              depth,
                              rulesToAdd,
                              rulesToAddValid: Boolean(patch),
                            }));
                          }}
                        />
                      )}
                    </RowItem>
                  </Row>
                )}
                <Row>
                  <RowItem expanded>
                    <LabelWrapper fullWidth>
                      <ControlLabel for="pageTitle">
                        {translate("popup_pageTitleLabel")}
                      </ControlLabel>
                    </LabelWrapper>
                    <TextArea
                      id="pageTitle"
                      readOnly
                      rows={2}
                      spellCheck="false"
                      value={entryProps.title ?? ""}
                    />
                  </RowItem>
                </Row>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper disabled={state.disabled} fullWidth>
                      <ControlLabel for="rulesToAdd">
                        {translate("popup_addedRulesLabel")}
                      </ControlLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        disabled={state.disabled}
                        id="rulesToAdd"
                        rows={2}
                        spellCheck="false"
                        value={state.rulesToAdd}
                        onChange={(e) => {
                          const rulesToAdd = e.currentTarget.value;
                          const patch = ruleset.modifyPatch({ rulesToAdd });
                          setState((s) => ({
                            ...s,
                            rulesToAdd,
                            rulesToAddValid: Boolean(patch),
                          }));
                        }}
                      />
                    )}
                  </RowItem>
                </Row>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper disabled={state.disabled} fullWidth>
                      <ControlLabel for="rulesToRemove">
                        {translate("popup_removedRulesLabel")}
                      </ControlLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        disabled={state.disabled}
                        id="rulesToRemove"
                        readOnly
                        rows={2}
                        value={state.rulesToRemove}
                      />
                    )}
                  </RowItem>
                </Row>
              </DetailsBody>
            </Details>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <LinkButton onClick={openOptionsPage}>
              {translate("popup_openOptionsLink")}
            </LinkButton>
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button className={!ok ? FOCUS_END_CLASS : ""} onClick={close}>
                  {translate("cancelButton")}
                </Button>
              </RowItem>
              <RowItem>
                <Button
                  className={
                    ok
                      ? `${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}`
                      : FOCUS_DEFAULT_CLASS
                  }
                  disabled={!ok}
                  primary
                  onClick={async () => {
                    ruleset.applyPatch();
                    await Promise.resolve(onBlocked());
                    close();
                  }}
                >
                  {translate(
                    state.unblock
                      ? "popup_unblockSiteButton"
                      : "popup_blockSiteButton",
                  )}
                </Button>
              </RowItem>
            </Row>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
};

export type BlockDialogProps = {
  target: HTMLElement | ShadowRoot;
  theme: DialogTheme;
} & BlockDialogContentProps;

export const BlockDialog: React.FC<BlockDialogProps> = ({
  target,
  theme,
  ...props
}) => (
  <StylesProvider target={target}>
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <ScopedBaseline>
        <Dialog
          aria-labelledby="title"
          close={props.close}
          open={props.open}
          width="360px"
        >
          <BlockDialogContent {...props} />
        </Dialog>
      </ScopedBaseline>
    </ThemeProvider>
  </StylesProvider>
);

export type BlockEmbeddedDialogProps = Omit<BlockDialogContentProps, "open">;

export const BlockEmbeddedDialog: React.FC<BlockEmbeddedDialogProps> = (
  props,
) => (
  <EmbeddedDialog close={props.close} width="360px">
    <BlockDialogContent open={true} {...props} />
  </EmbeddedDialog>
);
