import { StreamLanguage } from "@codemirror/language";
import { Editor, type EditorProps } from "../components/editor.tsx";
import { RE_LINE } from "../ruleset.ts";

const rulesetLanguage = StreamLanguage.define<{
  tokens: (readonly [number, string | null])[];
}>({
  token(stream, state) {
    if (stream.sol()) {
      const groups = RE_LINE.exec(stream.string)?.groups;
      if (!groups) {
        stream.skipToEnd();
        return "invalid";
      }
      state.tokens = [];
      if (groups.spaceBeforeRuleOrComment) {
        state.tokens.push([groups.spaceBeforeRuleOrComment.length, null]);
      }
      if (groups.highlight) {
        state.tokens.push([groups.highlight.length, "annotation"]);
      }
      if (groups.spaceAfterHighlight) {
        state.tokens.push([groups.spaceAfterHighlight.length, null]);
      }
      if (groups.matchPattern) {
        state.tokens.push([groups.matchPattern.length, null]);
      }
      if (groups.regularExpression) {
        state.tokens.push([groups.regularExpression.length, "regexp"]);
      }
      if (groups.spaceAfterRule) {
        state.tokens.push([groups.spaceAfterRule.length, null]);
      }
      if (groups.comment) {
        state.tokens.push([groups.comment.length, "lineComment"]);
      }
    }
    const token = state.tokens.shift();
    if (!token) {
      // Something went wrong...
      stream.skipToEnd();
      return "invalid";
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
});

export type RulesetEditorProps = Omit<EditorProps, "language">;

export const RulesetEditor: React.FC<RulesetEditorProps> = (props) => (
  <Editor language={rulesetLanguage} {...props} />
);
