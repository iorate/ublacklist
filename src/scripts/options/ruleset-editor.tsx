import { Editor, type EditorProps } from "../components/editor.tsx";
import { ruleset } from "./ruleset-lang.ts";

export type RulesetEditorProps = Omit<EditorProps, "language">;

export function RulesetEditor(props: RulesetEditorProps) {
  return <Editor language={ruleset()} {...props} />;
}
