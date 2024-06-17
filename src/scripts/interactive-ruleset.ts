import * as tldts from "tldts";
import {
  type LinkProps,
  Ruleset,
  type TestRawResult,
} from "./ruleset/ruleset.ts";

export type QueryResult =
  | { type: "block" }
  | { type: "unblock" }
  | { type: "highlight"; colorNumber: number };

function isBlock(result: QueryResult | null): boolean {
  return result?.type === "block";
}

function isUnblockOrHighlight(result: QueryResult | null): boolean {
  return result?.type === "unblock" || result?.type === "highlight";
}

function query(ruleset: Ruleset, props: LinkProps): QueryResult | null {
  return toQueryResult(testRawWithURLParts(ruleset, props));
}

function toQueryResult(testRawResult: TestRawResult): QueryResult | null {
  let result: QueryResult | null = null;
  for (const { specifier } of testRawResult) {
    if (!specifier) {
      if (!result) {
        result = { type: "block" };
      }
    } else if (specifier.type === "negate") {
      if (!result || result.type === "block") {
        result = { type: "unblock" };
      }
    } else if (
      !result ||
      result.type === "block" ||
      result.type === "unblock" ||
      result.colorNumber < specifier.colorNumber
    ) {
      result = { type: "highlight", colorNumber: specifier.colorNumber };
    }
  }
  return result;
}

function testRawWithURLParts(
  ruleset: Ruleset,
  props: LinkProps,
): TestRawResult {
  const { protocol, hostname, pathname, search } = new URL(props.url);
  return ruleset.testRaw({
    scheme: protocol.slice(0, -1),
    host: hostname,
    path: `${pathname}${search}`,
    ...props,
  });
}

export type Patch = {
  props: LinkProps;
  unblock: boolean;
  rulesToAdd: string;
  rulesToRemove: string;
  requireRulesToAdd: boolean;
  lineNumbersToRemove: number[];
};

export class InteractiveRuleset {
  private readonly userRuleset: Ruleset;
  private readonly subscriptionRulesets: readonly Ruleset[];
  private patch: Patch | null = null;

  constructor(userRuleset: Ruleset, subscriptionRulesets: readonly Ruleset[]) {
    this.userRuleset = userRuleset;
    this.subscriptionRulesets = subscriptionRulesets;
  }

  toString(): string {
    return this.userRuleset.toString();
  }

  query(props: Readonly<LinkProps>): QueryResult | null {
    const userResult = query(this.userRuleset, props);
    if (userResult) {
      return userResult;
    }
    return toQueryResult(
      this.subscriptionRulesets.flatMap((ruleset) =>
        testRawWithURLParts(ruleset, props),
      ),
    );
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(props: LinkProps, blockWholeSite: boolean): Patch {
    let unblock: boolean;
    let rulesToAdd: string;
    let rulesToRemove: string;
    let requireRulesToAdd: boolean;
    let lineNumbersToRemove: number[];
    const userResults = testRawWithURLParts(this.userRuleset, props);
    if (userResults.some(({ specifier }) => specifier)) {
      // The URL is unblocked by a user rule. Block it.
      unblock = false;
      if (userResults.some(({ specifier }) => !specifier)) {
        // No need to add a user rule to block it.
        requireRulesToAdd = false;
        rulesToAdd = "";
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isUnblockOrHighlight(query(ruleset, props)),
        )
      ) {
        // Add a user rule to block it.
        requireRulesToAdd = true;
        rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isBlock(query(ruleset, props)),
        )
      ) {
        // No need to add a user rule to block it.
        requireRulesToAdd = false;
        rulesToAdd = "";
      } else {
        // Add a user rule to block it.
        requireRulesToAdd = true;
        rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      }
      // Remove user rules unblocking it.
      rulesToRemove = userResults
        .flatMap(({ lineNumber, specifier }) =>
          specifier ? [this.userRuleset.get(lineNumber)] : [],
        )
        .join("\n");
      lineNumbersToRemove = userResults.flatMap(({ lineNumber, specifier }) =>
        specifier ? [lineNumber] : [],
      );
    } else if (userResults.some(({ specifier }) => !specifier)) {
      // The URL is blocked by a user rule. Unblock it.
      unblock = true;
      if (
        this.subscriptionRulesets.some((ruleset) =>
          isUnblockOrHighlight(query(ruleset, props)),
        )
      ) {
        // No need to add a user rule to unblock it.
        requireRulesToAdd = false;
        rulesToAdd = "";
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isBlock(query(ruleset, props)),
        )
      ) {
        // Add a user rule to unblock it.
        requireRulesToAdd = true;
        rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      } else {
        // No need to add a user rule to unblock it.
        requireRulesToAdd = false;
        rulesToAdd = "";
      }
      // Remove user rules blocking it.
      rulesToRemove = userResults
        .flatMap(({ lineNumber, specifier }) =>
          !specifier ? [this.userRuleset.get(lineNumber)] : [],
        )
        .join("\n");
      lineNumbersToRemove = userResults.flatMap(({ lineNumber, specifier }) =>
        !specifier ? [lineNumber] : [],
      );
    } else if (
      this.subscriptionRulesets.some((ruleset) =>
        isUnblockOrHighlight(query(ruleset, props)),
      )
    ) {
      // The URL is unblocked by a subscription rule. Block it.
      // Add a user rule to block it.
      unblock = false;
      requireRulesToAdd = true;
      rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      rulesToRemove = "";
      lineNumbersToRemove = [];
    } else if (
      this.subscriptionRulesets.some((ruleset) =>
        isBlock(query(ruleset, props)),
      )
    ) {
      // The URL is blocked by a subscription rule. Unblock it.
      // Add a user rule to unblock it.
      unblock = true;
      requireRulesToAdd = true;
      rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      rulesToRemove = "";
      lineNumbersToRemove = [];
    } else {
      // The URL is neither blocked nor unblocked. Block it.
      // Add a user rule to block it.
      unblock = false;
      requireRulesToAdd = true;
      rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      rulesToRemove = "";
      lineNumbersToRemove = [];
    }
    this.patch = {
      props,
      unblock,
      rulesToAdd,
      rulesToRemove,
      requireRulesToAdd,
      lineNumbersToRemove,
    };
    return this.patch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch({ rulesToAdd }: { readonly rulesToAdd: string }): Patch | null {
    if (!this.patch) {
      throw new Error("Patch not created");
    }
    const rulesetToAdd = new Ruleset("");
    rulesetToAdd.extend(rulesToAdd);
    const resultToAdd = query(rulesetToAdd, this.patch.props);
    const rulesAddable = this.patch.unblock
      ? this.patch.requireRulesToAdd
        ? isUnblockOrHighlight(resultToAdd)
        : !isBlock(resultToAdd)
      : this.patch.requireRulesToAdd
        ? isBlock(resultToAdd)
        : !isUnblockOrHighlight(resultToAdd);
    if (!rulesAddable) {
      return null;
    }
    this.patch.rulesToAdd = rulesToAdd;
    return this.patch;
  }

  applyPatch(): void {
    if (!this.patch) {
      throw new Error("Patch not created");
    }
    this.userRuleset.extend(this.patch.rulesToAdd);
    for (const lineNumber of this.patch.lineNumbersToRemove) {
      this.userRuleset.delete(lineNumber);
    }
    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}

function suggestMatchPattern(
  url: string,
  unblock: boolean,
  blockWholeSite: boolean,
): string {
  let host = new URL(url).hostname;
  if (blockWholeSite) {
    const domain = tldts.getDomain(host);
    if (domain != null) {
      host = `*.${domain}`;
    }
  }
  return `${unblock ? "@" : ""}*://${host}/*`;
}
