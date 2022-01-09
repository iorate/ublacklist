import { standardKeymap } from '@codemirror/commands';
import { highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';
import { HighlightStyle, tags as t } from '@codemirror/highlight';
import { history, historyKeymap } from '@codemirror/history';
import { language } from '@codemirror/language';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
import { StreamLanguage, StreamParser } from '@codemirror/stream-parser';
import { EditorView, highlightSpecialChars, keymap } from '@codemirror/view';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from './constants';
import { useTheme } from './theme';

export type EditorProps<ParserState> = {
  focusStart?: boolean;
  focusEnd?: boolean;
  parser?: StreamParser<ParserState>;
  height?: string;
  readOnly?: boolean;
  resizable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export function Editor<ParserState>({
  focusStart = false,
  focusEnd = false,
  parser,
  height = '200px',
  readOnly = false,
  resizable = false,
  value = '',
  onChange,
}: EditorProps<ParserState>): JSX.Element {
  const view = useRef<EditorView | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const highlightStyleCompartment = useRef(new Compartment());
  const languageCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const updateListenerCompartment = useRef(new Compartment());

  const parentCallback = useCallback((parent: HTMLDivElement | null) => {
    if (parent) {
      // mount
      view.current = new EditorView({
        state: EditorState.create({
          doc: value, // Set the initial value to prevent undo from going back to empty
          extensions: [
            keymap.of([...standardKeymap, ...historyKeymap]),
            history(),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    view.current?.contentDOM.classList.toggle(FOCUS_START_CLASS, focusStart);
  }, [focusStart]);

  useLayoutEffect(() => {
    view.current?.contentDOM.classList.toggle(FOCUS_END_CLASS, focusEnd);
  }, [focusEnd]);

  const theme = useTheme();
  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: highlightStyleCompartment.current.reconfigure(
        HighlightStyle.define([
          {
            tag: t.annotation,
            color: theme.editor.annotation,
          },
          {
            tag: t.regexp,
            color: theme.editor.regexp,
          },
          {
            tag: t.comment,
            color: theme.editor.comment,
          },
          {
            tag: t.invalid,
            color: theme.editor.comment,
          },
        ]),
      ),
    });
  }, [theme]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: languageCompartment.current.reconfigure(
        parser ? language.of(StreamLanguage.define(parser)) : [],
      ),
    });
  }, [parser]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: themeCompartment.current.reconfigure(
        EditorView.theme(
          {
            '&': {
              backgroundColor: theme.editor.background,
              border: `1px solid ${theme.editor.border}`,
              color: theme.editor.text,
              height,
              overflow: 'hidden',
              resize: resizable ? 'vertical' : 'none',
            },
            '&.cm-editor.cm-focused': {
              boxShadow: `0 0 0 2px ${theme.focus.shadow}`,
              outline: 'none',
            },
            '.cm-scroller': {
              fontFamily:
                'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
              overflow: 'auto',
            },
            '.cm-gutters': {
              backgroundColor: theme.editor.background,
              border: 'none',
              color: theme.editor.lineNumber,
            },
            '.cm-activeLineGutter': {
              backgroundColor: 'transparent',
            },
            '&.cm-focused .cm-activeLineGutter': {
              color: theme.editor.activeLineNumber,
            },
            '.cm-lineNumbers .cm-gutterElement': {
              padding: '0 8px',
            },
            '.cm-content ::selection': {
              backgroundColor: theme.editor.selectionBackground,
            },
          },
          { dark: theme.name === 'dark' },
        ),
      ),
    });
  }, [height, resizable, theme]);

  useLayoutEffect(() => {
    view.current?.dispatch({
      effects: updateListenerCompartment.current.reconfigure(
        onChange
          ? EditorView.updateListener.of(viewUpdate => {
              if (
                viewUpdate.docChanged &&
                viewUpdate.transactions.some(
                  transaction => transaction.annotation(Transaction.userEvent) != null,
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
}
