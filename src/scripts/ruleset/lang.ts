import { yamlFrontmatter } from "@codemirror/lang-yaml";
import { LRLanguage, LanguageSupport, syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser as rulesetParser } from "./parser.js";
import { parseRegExp, parseString } from "./utils.ts";

const rulesetLanguage = LRLanguage.define({
  name: "ruleset",
  parser: rulesetParser.configure({
    props: [
      styleTags({
        Comment: t.lineComment,
        "@ AtInteger @if": t.modifier,
        Identifier: t.variableName,
        "StringMatchOperator CaseSensitivity RegExpMatchOperator":
          t.compareOperator,
        String: t.string,
        RegExp: t.regexp,
        "( )": t.paren,
        '"!" & |': t.logicOperator,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "#" },
  },
});

function getMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

const rulesetLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      const pushError = (message: string) => {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: "error",
          message,
        });
      };
      if (node.type.isError) {
        pushError("Syntax error");
      } else if (node.name === "String") {
        try {
          parseString(view.state.sliceDoc(node.from, node.to));
        } catch (error) {
          pushError(getMessage(error));
        }
      } else if (node.name === "RegExp") {
        try {
          parseRegExp(view.state.sliceDoc(node.from, node.to));
        } catch (error) {
          pushError(getMessage(error));
        }
      }
    });
  return diagnostics;
});

export function ruleset(): LanguageSupport {
  return yamlFrontmatter({
    content: new LanguageSupport(rulesetLanguage, rulesetLinter),
  });
}
