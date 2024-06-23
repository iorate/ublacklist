import { DocInput } from "@codemirror/language";
import { Text } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import yaml from "js-yaml";
import { z } from "zod";
import {
  MatchPatternMap,
  type MatchPatternMapJSON,
} from "../../common/match-pattern.ts";
import { ruleset } from "./lang.ts";
import { parser } from "./parser.js";
import { parseRegExp, parseString } from "./utils.ts";

export type RulesetJSON = {
  source: string[];
  metadata: Record<string, unknown>;
  rules: MatchPatternMapJSON<Rule>;
};

export type LinkProps = {
  url: string;
  [prop: string]: string | undefined;
};

export type TestRawResult = {
  lineNumber: number;
  specifier: Specifier | null;
}[];

export type Specifier =
  | { type: "negate" }
  | { type: "highlight"; colorNumber: number };

export class Ruleset implements Iterable<string> {
  private source: Text;
  private readonly metadata: Record<string, unknown>;
  private readonly rules: MatchPatternMap<Rule>;
  private readonly deletedLineNumbers: Set<number> = new Set();

  constructor(input: string | RulesetJSON) {
    if (typeof input === "string") {
      this.source = Text.of(input.split("\n"));
      this.metadata = {};
      this.rules = new MatchPatternMap();
      const tree = ruleset().language.parser.parse(new DocInput(this.source));
      const frontMatterNode = tree.topNode.getChild("Frontmatter");
      if (frontMatterNode) {
        // biome-ignore lint/style/noNonNullAssertion: "Frontmatter" always has "Stream"
        const streamNode = frontMatterNode.getChild("Stream")!;
        const stream = this.source.sliceString(streamNode.from, streamNode.to);
        try {
          this.metadata = z
            .record(z.string(), z.unknown())
            .parse(yaml.load(stream, { schema: yaml.JSON_SCHEMA }));
        } catch {
          // `YAMLException` or `ZodError` is thrown
        }
      }
      collectRuleset(
        // biome-ignore lint/style/noNonNullAssertion: "Document" always has "Ruleset"
        tree.topNode.getChild("Ruleset")!,
        this.source,
        this.rules,
      );
    } else {
      this.source = Text.of(input.source);
      this.metadata = input.metadata;
      this.rules = new MatchPatternMap(input.rules);
    }
  }

  extend(input: string) {
    if (!input.length) {
      return;
    }
    if (!this.source.length) {
      this.source = Text.of(input.split("\n"));
      const tree = parser.parse(new DocInput(this.source));
      collectRuleset(tree.topNode, this.source, this.rules);
      return;
    }
    const from = this.source.length + 1;
    this.source = this.source.append(Text.of(["", ...input.split("\n")]));
    const to = this.source.length;
    const tree = parser.parse(new DocInput(this.source), undefined, [
      { from: 0, to: 0 },
      { from, to },
    ]);
    collectRuleset(tree.topNode, this.source, this.rules);
  }

  toString(): string {
    return [...this].join("\n");
  }

  toJSON(): RulesetJSON {
    if (this.deletedLineNumbers.size) {
      return new Ruleset(this.toString()).toJSON();
    }
    return {
      source: this.source.toJSON(),
      metadata: this.metadata,
      rules: this.rules.toJSON(),
    };
  }

  get length(): number {
    return this.source.lines - this.deletedLineNumbers.size;
  }

  *[Symbol.iterator](): Generator<string> {
    for (let n = 1; n <= this.source.lines; ++n) {
      if (this.deletedLineNumbers.has(n)) {
        continue;
      }
      yield this.source.line(n).text;
    }
  }

  get(n: number): string | null {
    if (n < 1 || n > this.source.lines || this.deletedLineNumbers.has(n)) {
      return null;
    }
    return this.source.line(n).text;
  }

  delete(n: number) {
    if (!Number.isInteger(n) || n < 1 || n > this.source.lines) {
      return;
    }
    this.deletedLineNumbers.add(n);
  }

  test(props: Readonly<LinkProps>): boolean {
    const result = this.testRaw(props);
    return result.length !== 0 && result.every(({ specifier }) => !specifier);
  }

  testRaw(props: Readonly<LinkProps>): TestRawResult {
    const result: TestRawResult = [];
    for (const [lineNumber, value = 1, expression = null] of this.rules.get(
      props.url,
    )) {
      if (
        !this.deletedLineNumbers.has(lineNumber) &&
        (!expression || execExpression(expression, props))
      ) {
        const specifier: Specifier | null =
          value === 1
            ? null
            : value === 0
              ? { type: "negate" }
              : { type: "highlight", colorNumber: -value };
        result.push({ lineNumber, specifier });
      }
    }
    return result;
  }
}

type Rule = [
  lineNumber: number,
  value?: number,
  expression?: Expression | null,
];

type Expression =
  | ["=", string, string]
  | ["=i", string, string]
  | ["^=", string, string]
  | ["^=i", string, string]
  | ["$=", string, string]
  | ["$=i", string, string]
  | ["*=", string, string]
  | ["*=i", string, string]
  | ["=~", string, PlainRegExp]
  | ["!", Expression]
  | ["&", Expression, Expression]
  | ["|", Expression, Expression];

const regExpSymbol = Symbol("RegExp");

type PlainRegExp = [pattern: string, flags?: string] & {
  [regExpSymbol]?: RegExp;
};

function collectRuleset(
  rulesetNode: SyntaxNode,
  source: Text,
  rules: MatchPatternMap<Rule>,
) {
  for (const ruleNode of rulesetNode.getChildren("Rule")) {
    if (hasError(ruleNode)) {
      continue;
    }
    const lineNumber = getLineNumber(ruleNode, source);
    const value = getValue(ruleNode, source);
    const matchPattern = getMatchPattern(ruleNode, source);
    let expression: Expression | null;
    try {
      expression = getExpression(ruleNode, source);
    } catch {
      // An invalid string literal or regular expression
      continue;
    }
    try {
      rules.set(
        matchPattern ?? "<all_urls>",
        expression
          ? [lineNumber, value, expression]
          : value !== 1
            ? [lineNumber, value]
            : [lineNumber],
      );
    } catch {
      // #497 Just in case
    }
  }
}

function hasError(ruleNode: SyntaxNode): boolean {
  const cursor = ruleNode.cursor();
  do {
    if (cursor.type.isError) {
      return true;
    }
    // #497 An error node may expand to the next line
  } while (cursor.next() && cursor.from <= ruleNode.to + 1);
  return false;
}

function getLineNumber(ruleNode: SyntaxNode, source: Text): number {
  return source.lineAt(ruleNode.from).number;
}

function getValue(ruleNode: SyntaxNode, source: Text): number {
  if (ruleNode.getChild("NegateSpecifier")) {
    return 0;
  }
  const highlightSpecifierNode = ruleNode.getChild("HighlightSpecifier");
  if (highlightSpecifierNode) {
    return -Number(
      source.sliceString(
        highlightSpecifierNode.from + 1,
        highlightSpecifierNode.to,
      ),
    );
  }
  return 1;
}

function getMatchPattern(ruleNode: SyntaxNode, source: Text): string | null {
  const matchPatternNode = ruleNode.getChild("MatchPattern");
  if (matchPatternNode) {
    return source.sliceString(matchPatternNode.from, matchPatternNode.to);
  }
  return null;
}

function getExpression(ruleNode: SyntaxNode, source: Text): Expression | null {
  const ifSpecifierNode = ruleNode.getChild("IfSpecifier");
  if (ifSpecifierNode) {
    // biome-ignore lint/style/noNonNullAssertion: "IfSpecifier" always has "Expression"
    return collectExpression(ifSpecifierNode.getChild("Expression")!, source);
  }
  const expressionNode = ruleNode.getChild("Expression");
  if (expressionNode) {
    return collectExpression(expressionNode, source);
  }
  return null;
}

function collectExpression(
  expressionNode: SyntaxNode,
  source: Text,
): Expression {
  if (expressionNode.name === "MatchExpression") {
    const identifierNode = expressionNode.getChild("Identifier");
    let identifier =
      identifierNode &&
      source.sliceString(identifierNode.from, identifierNode.to);
    identifier =
      identifier == null || identifier === "u"
        ? "url"
        : identifier === "t"
          ? "title"
          : identifier;
    const stringMatchOperatorNode = expressionNode.getChild(
      "StringMatchOperator",
    );
    if (stringMatchOperatorNode) {
      const operator = source.sliceString(
        stringMatchOperatorNode.from,
        stringMatchOperatorNode.to,
      ) as "=" | "^=" | "$=" | "*=";
      // biome-ignore lint/style/noNonNullAssertion: "StringMatchOperator" is always followed by "String"
      const stringNode = expressionNode.getChild("String")!;
      const string = parseString(
        source.sliceString(stringNode.from, stringNode.to),
      );
      const caseInsensitive =
        expressionNode.getChild("CaseSensitivity") != null;
      return [caseInsensitive ? `${operator}i` : operator, identifier, string];
    }
    // biome-ignore lint/style/noNonNullAssertion: If "StringMatchOperator" is not present, "RegExp" is present
    const regExpNode = expressionNode.getChild("RegExp")!;
    const { pattern, flags } = parseRegExp(
      source.sliceString(regExpNode.from, regExpNode.to),
    );
    return ["=~", identifier, flags ? [pattern, flags] : [pattern]];
  }
  if (expressionNode.name === "ParenthesizedExpression") {
    // biome-ignore lint/style/noNonNullAssertion: "ParenthesizedExpression" always has "Expression"
    return collectExpression(expressionNode.getChild("Expression")!, source);
  }
  if (expressionNode.name === "NegateExpression") {
    return [
      "!",
      // biome-ignore lint/style/noNonNullAssertion: "NegateExpression" always has "Expression"
      collectExpression(expressionNode.getChild("Expression")!, source),
    ];
  }
  if (expressionNode.name === "AndExpression") {
    const [leftNode, rightNode] = expressionNode.getChildren("Expression");
    return [
      "&",
      collectExpression(leftNode, source),
      collectExpression(rightNode, source),
    ];
  }
  {
    // "OrExpression"
    const [leftNode, rightNode] = expressionNode.getChildren("Expression");
    return [
      "|",
      collectExpression(leftNode, source),
      collectExpression(rightNode, source),
    ];
  }
}

function execExpression(
  expression: Expression,
  props: Readonly<LinkProps>,
): boolean {
  if (expression[0] === "=") {
    const prop = props[expression[1]];
    return prop != null && prop === expression[2];
  }
  if (expression[0] === "=i") {
    const prop = props[expression[1]];
    return prop != null && prop.toLowerCase() === expression[2].toLowerCase();
  }
  if (expression[0] === "^=") {
    const prop = props[expression[1]];
    // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
    return prop != null && prop.startsWith(expression[2]);
  }
  if (expression[0] === "^=i") {
    const prop = props[expression[1]];
    return (
      // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
      prop != null && prop.toLowerCase().startsWith(expression[2].toLowerCase())
    );
  }
  if (expression[0] === "$=") {
    const prop = props[expression[1]];
    // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
    return prop != null && prop.endsWith(expression[2]);
  }
  if (expression[0] === "$=i") {
    const prop = props[expression[1]];
    return (
      // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
      prop != null && prop.toLowerCase().endsWith(expression[2].toLowerCase())
    );
  }
  if (expression[0] === "*=") {
    const prop = props[expression[1]];
    // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
    return prop != null && prop.includes(expression[2]);
  }
  if (expression[0] === "*=i") {
    const prop = props[expression[1]];
    return (
      // biome-ignore lint/complexity/useOptionalChain: Return a boolean value
      prop != null && prop.toLowerCase().includes(expression[2].toLowerCase())
    );
  }
  if (expression[0] === "=~") {
    const prop = props[expression[1]];
    return prop != null && plainRegExpTest(expression[2], prop);
  }
  if (expression[0] === "!") {
    return !execExpression(expression[1], props);
  }
  if (expression[0] === "&") {
    return (
      execExpression(expression[1], props) &&
      execExpression(expression[2], props)
    );
  }
  // "|"
  return (
    execExpression(expression[1], props) || execExpression(expression[2], props)
  );
}

function plainRegExpTest(regExp: PlainRegExp, string: string): boolean {
  regExp[regExpSymbol] ||= new RegExp(regExp[0], regExp[1] ?? "");
  return regExp[regExpSymbol].test(string);
}
