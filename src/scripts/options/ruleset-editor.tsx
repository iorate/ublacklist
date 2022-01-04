import type { StreamParser } from '@codemirror/stream-parser';
import React from 'react';
import { Editor, EditorProps } from '../components/editor';
import { RE_LINE } from '../ruleset';

type ParserState = {
  tokens: (readonly [number, string | null])[];
};

const parser: StreamParser<ParserState> = {
  token(stream, state) {
    if (stream.sol()) {
      const groups = RE_LINE.exec(stream.string)?.groups;
      if (!groups) {
        stream.skipToEnd();
        return 'invalid';
      }
      state.tokens = [];
      if (groups.spaceBeforeRuleOrComment) {
        state.tokens.push([groups.spaceBeforeRuleOrComment.length, null]);
      }
      if (groups.highlight) {
        state.tokens.push([groups.highlight.length, 'annotation']);
      }
      if (groups.spaceAfterHighlight) {
        state.tokens.push([groups.spaceAfterHighlight.length, null]);
      }
      if (groups.matchPattern) {
        state.tokens.push([groups.matchPattern.length, null]);
      }
      if (groups.regularExpression) {
        state.tokens.push([groups.regularExpression.length, 'regexp']);
      }
      if (groups.spaceAfterRule) {
        state.tokens.push([groups.spaceAfterRule.length, null]);
      }
      if (groups.comment) {
        state.tokens.push([groups.comment.length, 'lineComment']);
      }
    }
    const token = state.tokens.shift();
    if (!token) {
      // Something went wrong...
      stream.skipToEnd();
      return 'invalid';
    }
    stream.pos += token[0];
    return token[1];
  },
  startState() {
    return { tokens: [] };
  },
  copyState(state) {
    return { tokens: [...state.tokens] };
  },
};

export type RulesetEditorProps = Omit<EditorProps<ParserState>, 'parser'>;

export const RulesetEditor: React.VFC<RulesetEditorProps> = props => (
  <Editor parser={parser} {...props} />
);
