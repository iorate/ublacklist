import { history, historyKeymap, standardKeymap } from "@codemirror/commands";
import {
  HighlightStyle,
  type LanguageSupport,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter } from "@codemirror/lint";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { type Highlighter, tags as t } from "@lezer/highlight";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from "./constants.ts";
import { useTheme } from "./theme.tsx";

type ColorScheme = {
  background: string;
  foreground: string;
  selectionBackground: string;
  lineNumberForeground: string;
  activeLineNumberForeground: string;
  comment: string;
  name: string;
  literal: string;
  string: string;
  keyword: string;
  operator: string;
  meta: string;
};

// [jellybeans.vim](https://github.com/nanotech/jellybeans.vim)
const darkColorScheme: ColorScheme = {
  background: "#202124",
  foreground: "#e8e8d3",
  selectionBackground: "#2e2e2e",
  lineNumberForeground: "#858585",
  activeLineNumberForeground: "#fabb6e",
  comment: "#888888",
  name: "#fabb6e",
  literal: "#cf6a4c",
  string: "#99ad6a",
  keyword: "#8197bf",
  operator: "#ffe2a9",
  meta: "#8fbfdc",
};

// [hybrid.vim](https://github.com/w0ng/vim-hybrid)
const lightColorScheme: ColorScheme = {
  background: "#f8f9fa",
  foreground: "#000",
  selectionBackground: "#bcbcbc",
  lineNumberForeground: "#bcbcbc",
  activeLineNumberForeground: "#5f5f00",
  comment: "#5f5f5f",
  name: "#875f00",
  literal: "#5f0000",
  string: "#005f00",
  keyword: "#00005f",
  operator: "#8abeb7",
  meta: "#005f5f",
};

export type EditorProps = {
  focusStart?: boolean;
  focusEnd?: boolean;
  height?: string;
  language?: LanguageSupport;
  readOnly?: boolean;
  resizable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export const Editor: React.FC<EditorProps> = ({
  focusStart = false,
  focusEnd = false,
  height = "200px",
  language: lang,
  readOnly = false,
  resizable = false,
  value = "",
  onChange,
}) => {
  const view = useRef<EditorView | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const highlightStyleCompartment = useRef(new Compartment());
  const languageCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const updateListenerCompartment = useRef(new Compartment());

  // biome-ignore lint/correctness/useExhaustiveDependencies: 'view' and `resizeObserver` do not change between renders
  const parentCallback = useCallback((parent: HTMLDivElement | null) => {
    if (parent) {
      // mount
      view.current = new EditorView({
        state: EditorState.create({
          doc: value, // Set the initial value to prevent undo from going back to empty
          extensions: [
            keymap.of([...standardKeymap, ...historyKeymap]),
            history(),
            lintGutter(),
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            highlightStyleCompartment.current.of([]),
            languageCompartment.current.of([]),
            readOnlyCompartment.current.of([]),
            themeCompartment.current.of([]),
            updateListenerCompartment.current.of([]),
          ],
        }),
        parent,
      });
      resizeObserver.current = new ResizeObserver(() => {
        view.current?.requestMeasure();
      });
      resizeObserver.current.observe(view.current.dom);
    } else {
      // unmount
      resizeObserver.current?.disconnect();
      view.current?.destroy();
    }
  }, []);

  useLayoutEffect(() => {
    view.current?.contentDOM.classList.toggle(FOCUS_START_CLASS, focusStart);
  }, [focusStart]);

  useLayoutEffect(() => {
    view.current?.contentDOM.classList.toggle(FOCUS_END_CLASS, focusEnd);
  }, [focusEnd]);

  const theme = useTheme();
  useLayoutEffect(() => {
    const colorScheme =
      theme.name === "dark" ? darkColorScheme : lightColorScheme;
    view.current?.dispatch({
      effects: highlightStyleCompartment.current.reconfigure(
        syntaxHighlighting(
          HighlightStyle.define([
            { tag: t.comment, color: colorScheme.comment },
            { tag: t.name, color: colorScheme.name },
            { tag: t.literal, color: colorScheme.literal },
            { tag: t.string, color: colorScheme.string },
            { tag: t.regexp, color: colorScheme.string },
            { tag: t.keyword, color: colorScheme.keyword },
            { tag: t.operator, color: colorScheme.operator },
            { tag: t.meta, color: colorScheme.meta },
          ]) as Highlighter,
        ),
      ),
    });
  }, [theme]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: languageCompartment.current.reconfigure(lang || []),
    });
  }, [lang]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly),
      ),
    });
  }, [readOnly]);

  useLayoutEffect(() => {
    const colorScheme =
      theme.name === "dark" ? darkColorScheme : lightColorScheme;
    view.current?.dispatch({
      effects: themeCompartment.current.reconfigure(
        EditorView.theme(
          {
            "&": {
              backgroundColor: colorScheme.background,
              border: `1px solid ${theme.editor.border}`,
              color: colorScheme.foreground,
              height,
              overflow: "hidden",
              resize: resizable ? "vertical" : "none",
            },
            "&.cm-editor.cm-focused": {
              boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
              outline: "none",
            },
            ".cm-scroller": {
              fontFamily:
                'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
              overflow: "auto",
            },
            ".cm-gutters": {
              backgroundColor: "transparent",
              border: "none",
              color: colorScheme.lineNumberForeground,
            },
            ".cm-activeLineGutter": {
              backgroundColor: "transparent",
            },
            "&.cm-focused .cm-activeLineGutter": {
              color: colorScheme.activeLineNumberForeground,
            },
            ".cm-lineNumbers .cm-gutterElement": {
              padding: "0 8px",
            },
            ".cm-content ::selection": {
              backgroundColor: colorScheme.selectionBackground,
            },
          },
          { dark: theme.name === "dark" },
        ),
      ),
    });
  }, [height, resizable, theme]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: updateListenerCompartment.current.reconfigure(
        onChange
          ? EditorView.updateListener.of((viewUpdate) => {
              if (
                viewUpdate.docChanged &&
                viewUpdate.transactions.some(
                  (transaction) =>
                    transaction.annotation(Transaction.userEvent) != null,
                )
              ) {
                onChange(viewUpdate.state.doc.toString());
              }
            })
          : [],
      ),
    });
  }, [onChange]);

  useEffect(() => {
    if (view.current) {
      const currentValue = view.current.state.doc.toString();
      if (value !== currentValue) {
        view.current.dispatch(
          view.current.state.update({
            changes: {
              from: 0,
              to: currentValue.length,
              insert: value,
            },
          }),
        );
      }
    }
  }, [value]);

  return <div ref={parentCallback} />;
};
