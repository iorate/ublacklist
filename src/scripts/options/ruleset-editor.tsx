import { Editor, type EditorProps } from "../components/editor.tsx";
import { ruleset } from "../ruleset/lang.ts";

export type RulesetEditorProps = Omit<EditorProps, "language">;

export const RulesetEditor: React.FC<RulesetEditorProps> = (props) => (
  <Editor language={ruleset()} {...props} />
);
