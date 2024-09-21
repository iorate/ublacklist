import { useLayoutEffect, useMemo } from "react";
import { type Root, createRoot } from "react-dom/client";
import { MatchPatternMap } from "../common/match-pattern.ts";
import { BlockDialog } from "./block-dialog.tsx";
import { browser } from "./browser.ts";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { loadFromLocalStorage, saveToLocalStorage } from "./local-storage.ts";
import { translate } from "./locales.ts";
import { sendMessage } from "./messages.ts";
import type { LinkProps } from "./ruleset/ruleset.ts";
import { SEARCH_ENGINES } from "./search-engines.ts";
import { css, glob } from "./styles.ts";
import type {
  DialogTheme,
  SearchEngine,
  SerpControl,
  SerpEntry,
  SerpHandler,
  SerpHandlerResult,
} from "./types.ts";
import { fromPlainRuleset } from "./utilities.ts";

const Button: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({
  children,
  onClick,
}) => {
  const className = useMemo(
    () =>
      css({
        cursor: "pointer",
        whiteSpace: "nowrap",
        "&:focus:not(:focus-visible)": {
          outline: "none",
        },
        "&:focus:not(:-moz-focusring)": {
          outline: "none",
        },
      }),
    [],
  );
  return (
    <span
      className={`ub-button ${className}`}
      // biome-ignore lint/a11y/useSemanticElements: to be replaced in the future
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.click();
        }
      }}
    >
      {children}
    </span>
  );
};

const Control: React.FC<{
  blockedEntryCount: number;
  showBlockedEntries: boolean;
  onClick: () => void;
  onRender?: () => void;
}> = ({ blockedEntryCount, showBlockedEntries, onClick, onRender }) => {
  useLayoutEffect(() => onRender?.());
  return !blockedEntryCount ? null : (
    <>
      {blockedEntryCount === 1
        ? translate("content_singleSiteBlocked")
        : translate(
            "content_multipleSitesBlocked",
            String(blockedEntryCount),
          )}{" "}
      <Button onClick={onClick}>
        {translate(
          showBlockedEntries
            ? "content_hideBlockedSitesLink"
            : "content_showBlockedSitesLink",
        )}
      </Button>
    </>
  );
};

const Action: React.FC<{
  blocked: boolean;
  onClick: () => void;
  onRender?: () => void;
}> = ({ blocked, onClick, onRender }) => {
  useLayoutEffect(() => onRender?.());
  return (
    <Button onClick={onClick}>
      {translate(blocked ? "content_unblockSiteLink" : "content_blockSiteLink")}
    </Button>
  );
};

class ContentScript {
  options: {
    ruleset: InteractiveRuleset;
    skipBlockDialog: boolean;
    hideControls: boolean;
    hideActions: boolean;
    enablePathDepth: boolean;
    blockWholeSite: boolean;
    linkColor: string | null;
    blockColor: string | null;
    highlightColors: string[];
    dialogTheme: DialogTheme | null;
  } | null = null;
  controls: SerpControl[] = [];
  entries: SerpEntry[] = [];
  readonly scopeStates: Record<
    string,
    { blockedEntryCount: number; showBlockedEntries: boolean }
  > = {};
  blockDialogRoot: ShadowRoot | null = null;
  didSerpHead = false;
  readonly roots = new Map<HTMLElement | ShadowRoot, Root>();

  constructor(readonly serpHandler: SerpHandler) {
    // onSerpStart
    this.onSerpStart();

    // onSerpHead, onSerpElement
    new MutationObserver((records) => {
      if (
        serpHandler.observeRemoval &&
        records
          .flatMap((record) => [...record.removedNodes])
          .some((node) => node instanceof HTMLElement)
      ) {
        this.controls = this.controls.filter(
          (control) => control.root.isConnected,
        );
        const prevEntryCount = this.entries.length;
        this.entries = this.entries.filter((entry) => entry.root.isConnected);
        if (this.entries.length < prevEntryCount) {
          this.rejudgeAllEntries();
        }
      }
      for (const record of records) {
        for (const addedNode of record.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            if (process.env.DEBUG === "true") {
              console.debug(addedNode.cloneNode(true));
            }
            if (addedNode === document.head && this.options) {
              this.onSerpHead();
            }
            this.onSerpElement(addedNode);
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    // onSerpEnd
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.onSerpEnd());
    } else {
      this.onSerpEnd();
    }
  }

  onSerpStart(): void {
    void (async () => {
      const options = await loadFromLocalStorage([
        "ruleset",
        "blacklist",
        "subscriptions",
        "skipBlockDialog",
        "hideControl",
        "hideBlockLinks",
        "enablePathDepth",
        "blockWholeSite",
        "linkColor",
        "blockColor",
        "highlightColors",
        "dialogTheme",
      ]);

      this.options = {
        ruleset: new InteractiveRuleset(
          fromPlainRuleset(options.ruleset || null, options.blacklist),
          Object.values(options.subscriptions)
            .filter((subscription) => subscription.enabled ?? true)
            .map(({ ruleset, blacklist }) =>
              fromPlainRuleset(ruleset || null, blacklist),
            ),
        ),
        skipBlockDialog: options.skipBlockDialog,
        hideControls: options.hideControl,
        hideActions: options.hideBlockLinks,
        enablePathDepth: options.enablePathDepth,
        blockWholeSite: options.blockWholeSite,
        linkColor: options.linkColor !== "default" ? options.linkColor : null,
        blockColor:
          options.blockColor !== "default" ? options.blockColor : null,
        highlightColors: options.highlightColors,
        dialogTheme:
          options.dialogTheme !== "default" ? options.dialogTheme : null,
      };

      if (document.head) {
        this.onSerpHead();
      }

      this.rejudgeAllEntries();
    })();
    this.handleResult(this.serpHandler.onSerpStart());
  }

  onSerpHead(): void {
    if (this.didSerpHead || !document.head || !this.options) {
      return;
    }
    this.didSerpHead = true;

    glob({
      ".ub-hidden": {
        display: "none !important",
      },
      '[data-ub-blocked="hidden"]': {
        display: "none !important",
      },
    });
    this.handleResult(
      this.serpHandler.onSerpHead({
        linkColor: this.options.linkColor,
        blockColor: this.options.blockColor,
        highlightColors: this.options.highlightColors,
      }),
    );
  }

  onSerpElement(element: HTMLElement): void {
    this.handleResult(this.serpHandler.onSerpElement(element));
  }

  onSerpEnd(): void {
    this.blockDialogRoot = document.body
      .appendChild(document.createElement("div"))
      .attachShadow({ mode: "open" });
  }

  handleResult({ controls, entries }: SerpHandlerResult): void {
    this.controls.push(...controls);
    for (const entry of entries) {
      this.entries.push(entry);
      this.judgeEntry(entry);
    }
    for (const control of entries.length ? this.controls : controls) {
      this.renderControl(control);
    }
  }

  judgeEntry(entry: SerpEntry): void {
    if (!this.options) {
      return;
    }
    entry.state = this.options.ruleset.query(entry.props);
    if (entry.state?.type === "block") {
      const scopeState = this.scopeStates[entry.scope] ?? {
        blockedEntryCount: 0,
        showBlockedEntries: false,
      };
      ++scopeState.blockedEntryCount;
      this.scopeStates[entry.scope] = scopeState;
    }
    this.renderEntry(entry);
  }

  rejudgeAllEntries(): void {
    for (const scopeState of Object.values(this.scopeStates)) {
      scopeState.blockedEntryCount = 0;
    }
    for (const entry of this.entries) {
      this.judgeEntry(entry);
    }
    for (const scopeState of Object.values(this.scopeStates)) {
      if (!scopeState.blockedEntryCount) {
        scopeState.showBlockedEntries = false;
      }
    }
    for (const control of this.controls) {
      this.renderControl(control);
    }
  }

  renderControl(control: SerpControl): void {
    const scopeState = this.scopeStates[control.scope] ?? {
      blockedEntryCount: 0,
      showBlockedEntries: false,
    };
    control.root.classList.toggle(
      "ub-hidden",
      this.options?.hideControls || !scopeState.blockedEntryCount,
    );
    control.root.lang = browser.i18n.getUILanguage();
    this.render(
      <Control
        blockedEntryCount={scopeState.blockedEntryCount}
        showBlockedEntries={scopeState.showBlockedEntries}
        onClick={() => {
          scopeState.showBlockedEntries = !scopeState.showBlockedEntries;
          for (const control of this.controls) {
            this.renderControl(control);
          }
          for (const entry of this.entries) {
            this.renderEntry(entry);
          }
        }}
        {...(control.onRender ? { onRender: control.onRender } : {})}
      />,
      control.root,
    );
  }

  renderEntry(entry: SerpEntry): void {
    delete entry.root.dataset.ubBlocked;
    delete entry.root.dataset.ubHighlight;
    if (entry.state?.type === "block") {
      entry.root.dataset.ubBlocked = this.scopeStates[entry.scope]
        ?.showBlockedEntries
        ? "visible"
        : "hidden";
    } else if (entry.state?.type === "highlight") {
      entry.root.dataset.ubHighlight = String(entry.state.colorNumber);
    }
    entry.actionRoot.classList.toggle(
      "ub-hidden",
      this.options?.hideActions ?? false,
    );
    entry.actionRoot.lang = browser.i18n.getUILanguage();
    this.render(
      <Action
        blocked={entry.state?.type === "block"}
        onClick={() => {
          if (!this.options || !this.blockDialogRoot) {
            return;
          }
          if (this.options.skipBlockDialog) {
            this.options.ruleset.createPatch(
              entry.props,
              this.options.blockWholeSite,
            );
            this.options.ruleset.applyPatch();
            void saveToLocalStorage(
              { blacklist: this.options.ruleset.toString() },
              "content-script",
            );
            this.rejudgeAllEntries();
          } else {
            this.renderBlockDialog(entry.props);
          }
        }}
        {...(entry.onActionRender ? { onRender: entry.onActionRender } : {})}
      />,
      entry.actionRoot,
    );
  }

  renderBlockDialog(entryProps: LinkProps, open = true) {
    if (!this.options || !this.blockDialogRoot) {
      return;
    }
    this.render(
      <BlockDialog
        blockWholeSite={this.options.blockWholeSite}
        close={() => this.renderBlockDialog(entryProps, false)}
        enablePathDepth={this.options.enablePathDepth}
        entryProps={entryProps}
        open={open}
        openOptionsPage={() => sendMessage("open-options-page")}
        ruleset={this.options.ruleset}
        target={this.blockDialogRoot}
        theme={this.options.dialogTheme ?? this.serpHandler.getDialogTheme()}
        onBlocked={() => {
          if (!this.options) {
            return;
          }
          void saveToLocalStorage(
            { blacklist: this.options.ruleset.toString() },
            "content-script",
          );
          this.rejudgeAllEntries();
        }}
      />,
      this.blockDialogRoot,
    );
  }

  render(children: React.ReactNode, element: HTMLElement | ShadowRoot): void {
    let root = this.roots.get(element);
    if (!root) {
      root = createRoot(element);
      this.roots.set(element, root);
    }
    root.render(children);
  }
}

function main() {
  if (document.documentElement.dataset.ubActive) {
    return;
  }
  document.documentElement.dataset.ubActive = "1";

  const map = new MatchPatternMap<SearchEngine>();
  for (const searchEngine of Object.values(SEARCH_ENGINES)) {
    for (const { matches } of searchEngine.contentScripts) {
      for (const match of matches) {
        map.set(match, searchEngine);
      }
    }
  }
  const serpHandler = map.get(window.location.href)[0]?.getSerpHandler();
  if (serpHandler) {
    if (serpHandler.delay) {
      window.setTimeout(
        () => new ContentScript(serpHandler),
        serpHandler.delay,
      );
    } else {
      new ContentScript(serpHandler);
    }
  }
}

main();
