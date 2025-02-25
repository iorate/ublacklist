import dayjs from "dayjs";
import type { InteractiveRuleset } from "./interactive-ruleset.ts";
import { translate } from "./locales.ts";
import {
  type LinkProps,
  Ruleset,
  type RulesetJSON,
} from "./ruleset/ruleset.ts";
import type {
  ErrorResult,
  MatchingRuleKind,
  MatchingRulesText,
  PlainRuleset,
  Result,
  SuccessResult,
} from "./types.ts";

// #region AltURL
export class AltURL {
  readonly scheme: string;
  readonly host: string;
  readonly path: string;

  constructor(url: string) {
    const u = new URL(url);
    this.scheme = u.protocol.slice(0, -1);
    this.host = u.hostname;
    this.path = `${u.pathname}${u.search}`;
  }

  toString(): string {
    return `${this.scheme}://${this.host}${this.path}`;
  }
}

export function makeAltURL(url: string): AltURL | null {
  try {
    return new AltURL(url);
  } catch {
    return null;
  }
}
// #endregion AltURL

// #region Error
export class HTTPError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`${status}${statusText ? " " : ""}${statusText}`);
    this.name = "HTTPError";
    this.status = status;
    this.statusText = statusText;
  }
}

export class UnexpectedResponse extends Error {
  readonly response: unknown;

  constructor(response: unknown) {
    super(JSON.stringify(response));
    this.name = "UnexpectedResponse";
    this.response = response;
  }
}
// #endregion Error

// #region Mutex
export class Mutex {
  private queue: (() => Promise<void>)[] = [];

  lock<T>(func: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await Promise.resolve(func()));
        } catch (e: unknown) {
          reject(e);
        }
      });
      if (this.queue.length === 1) {
        void this.dequeue();
      }
    });
  }

  private async dequeue(): Promise<void> {
    if (!this.queue.length) {
      return;
    }
    await this.queue[0]();
    this.queue.shift();
    void this.dequeue();
  }
}
// #endregion Mutex

// #region Result
export function isErrorResult(result: Result): result is ErrorResult {
  return result.type === "error";
}

export function isSuccessResult(result: Result): result is SuccessResult {
  return result.type === "success";
}

export function errorResult(message: string): ErrorResult {
  return {
    type: "error",
    message,
  };
}

export function successResult(): SuccessResult {
  return {
    type: "success",
    timestamp: dayjs().toISOString(),
  };
}
// #endregion Result

// #region object
export function stringKeys<Key extends string, Value>(
  record: Readonly<Record<Key, Value>>,
): Key[] {
  return Object.keys(record) as Key[];
}

export function stringEntries<Key extends string, Value>(
  record: Readonly<Record<Key, Value>>,
): [Key, Value][] {
  return Object.entries(record) as [Key, Value][];
}

export function numberKeys<Key extends number, Value>(
  record: Readonly<Record<Key, Value>>,
): Key[] {
  return Object.keys(record).map(Number) as Key[];
}

export function numberEntries<Key extends number, Value>(
  record: Readonly<Record<Key, Value>>,
): [Key, Value][] {
  return Object.entries(record).map(([key, value]) => [Number(key), value]) as [
    Key,
    Value,
  ][];
}
// #endregion object

// #region string
export function lines(s: string): string[] {
  return s ? s.split("\n") : [];
}

export function getMatchingRulesText(
  ruleset: InteractiveRuleset,
  props: LinkProps,
): MatchingRulesText {
  const ruleTypes: MatchingRuleKind[] = [
    "blockRules",
    "unblockRules",
    "highlightRules",
  ];
  const matchingRulesText: MatchingRulesText = {
    blockRules: "",
    unblockRules: "",
    highlightRules: "",
  };

  const matchingRules = ruleset.getMatchingRules(props);
  const biggestLineNumber = Math.max(
    ...matchingRules
      .flatMap(({ blockRules, unblockRules, highlightRules }) => [
        ...blockRules,
        ...unblockRules,
        ...highlightRules,
      ])
      .map(({ lineNumber }) => lineNumber),
  );
  const lineNumberLength = String(biggestLineNumber).length;

  for (const ruleType of ruleTypes) {
    for (const match of matchingRules) {
      // Check whether the ruleset contains rules of the current rule type
      if (match[ruleType].length === 0) continue;
      // Add header with ruleset name
      const headerContent =
        match.rulesetName === "personal-blocklist"
          ? translate("personalBlocklist")
          : match.rulesetName;
      matchingRulesText[ruleType] += `# ${headerContent}\n`;
      // Add individual rules
      matchingRulesText[ruleType] += match[ruleType]
        .map(({ lineContent, lineNumber }) => {
          const lineNumberStr = String(lineNumber);
          const formattedLineNumber =
            lineNumberStr.length < lineNumberLength
              ? // Add left padding in order to align all line numbers
                " ".repeat(lineNumberLength - lineNumberStr.length) + lineNumber
              : lineNumberStr;
          return `${formattedLineNumber}: ${lineContent}`;
        })
        .join("\n");
      matchingRulesText[ruleType] += "\n";
    }
  }

  return matchingRulesText;
}

// #endregion string

export function downloadTextFile(
  filename: string,
  mimeType: string,
  content: string,
): void {
  const a = document.createElement("a");
  a.href = `data:${mimeType},${encodeURIComponent(content)}`;
  a.download = filename;
  a.click();
}

export function uploadTextFile(mimeType: string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const fileInput = document.createElement("input");
    fileInput.accept = mimeType;
    fileInput.type = "file";
    fileInput.addEventListener("input", () => {
      const file = fileInput.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        resolve(fileReader.result as string);
      });
      fileReader.addEventListener("error", () => {
        resolve(null);
      });
      fileReader.readAsText(file);
    });
    fileInput.click();
  });
}

export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function parseJSON(text: string): string | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function fromPlainRuleset(
  ruleset: PlainRuleset | null,
  source: string,
): Ruleset {
  return new Ruleset(
    ruleset
      ? {
          source: source.split("\n"),
          metadata: ruleset.metadata,
          rules: JSON.parse(ruleset.rules) as RulesetJSON["rules"],
        }
      : source,
  );
}

export function toPlainRuleset(source: string): PlainRuleset {
  const { metadata, rules } = new Ruleset(source).toJSON();
  return { metadata, rules: JSON.stringify(rules) };
}
