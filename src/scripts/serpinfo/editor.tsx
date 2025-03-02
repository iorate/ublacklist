import { yamlLanguage } from "@codemirror/lang-yaml";
import { LanguageSupport, syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { type EditorProps, Editor as _Editor } from "../components/editor.tsx";

const yamlLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      if (node.type.isError) {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: "error",
          message: "Syntax error",
        });
      }
    });
  return diagnostics;
});

function yaml(): LanguageSupport {
  return new LanguageSupport(yamlLanguage, yamlLinter);
}

export function Editor(props: Omit<EditorProps, "language">): React.ReactNode {
  return <_Editor language={yaml()} {...props} />;
}
