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

function query(ruleset: Ruleset, props: LinkProps): QueryResult | null {
  return toQueryResult(ruleset.testRaw(props));
}

export type InteractiveRulesetPatch = {
  unblock: boolean;
  props: LinkProps;
  rulesToAdd: string;
  rulesToRemove: string;
};

type PatchInternal = InteractiveRulesetPatch & {
  requireRulesToAdd: boolean;
  ruleRemovers: (() => void)[];
};

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

export class InteractiveRuleset {
  private readonly userRuleset: Ruleset;
  private readonly subscriptionRulesets: readonly Ruleset[];
  private patch: PatchInternal | null = null;

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
      this.subscriptionRulesets.flatMap((ruleset) => ruleset.testRaw(props)),
    );
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(
    props: LinkProps,
    blockWholeSite: boolean,
  ): InteractiveRulesetPatch {
    const patch = { props } as PatchInternal;
    const userResults = this.userRuleset.testRaw(props);
    if (userResults.some(({ specifier }) => specifier != null)) {
      // The URL is unblocked by a user rule. Block it.
      patch.unblock = false;
      if (userResults.some(({ specifier }) => specifier == null)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = "";
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isUnblockOrHighlight(query(ruleset, props)),
        )
      ) {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(
          props.url,
          false,
          blockWholeSite,
        );
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isBlock(query(ruleset, props)),
        )
      ) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = "";
      } else {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(
          props.url,
          false,
          blockWholeSite,
        );
      }
      patch.rulesToRemove = userResults
        .flatMap(({ lineNumber, specifier }) =>
          specifier ? [this.userRuleset.get(lineNumber)] : [],
        )
        .join("\n");
      patch.ruleRemovers = userResults.flatMap(({ lineNumber, specifier }) =>
        specifier ? [() => this.userRuleset.delete(lineNumber)] : [],
      );
    } else if (userResults.some(({ specifier }) => !specifier)) {
      // The URL is blocked by a user rule. Unblock it.
      patch.unblock = true;
      if (
        this.subscriptionRulesets.some((ruleset) =>
          isUnblockOrHighlight(query(ruleset, props)),
        )
      ) {
        // No need to add a user rule to unblock it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = "";
      } else if (
        this.subscriptionRulesets.some((ruleset) =>
          isBlock(query(ruleset, props)),
        )
      ) {
        // Add a user rule to unblock it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      } else {
        // No need to add a user rule to unblock it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = "";
      }
      patch.rulesToRemove = userResults
        .flatMap(({ lineNumber, specifier }) =>
          !specifier ? [this.userRuleset.get(lineNumber)] : [],
        )
        .join("\n");
      patch.ruleRemovers = userResults.flatMap(({ lineNumber, specifier }) =>
        !specifier ? [() => this.userRuleset.delete(lineNumber)] : [],
      );
    } else if (
      this.subscriptionRulesets.some((ruleset) =>
        isUnblockOrHighlight(query(ruleset, props)),
      )
    ) {
      // The URL is unblocked by a subscription rule. Block it.
      // Add a user rule to block it.
      patch.unblock = false;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      patch.rulesToRemove = "";
      patch.ruleRemovers = [];
    } else if (
      this.subscriptionRulesets.some((ruleset) =>
        isBlock(query(ruleset, props)),
      )
    ) {
      // The URL is blocked by a subscription rule. Unblock it.
      // Add a user rule to unblock it.
      patch.unblock = true;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      patch.rulesToRemove = "";
      patch.ruleRemovers = [];
    } else {
      // The URL is neither blocked nor unblocked. Block it.
      // Add a user rule to block it.
      patch.unblock = false;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      patch.rulesToRemove = "";
      patch.ruleRemovers = [];
    }
    this.patch = patch;
    return patch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch(
    patch: Readonly<Pick<InteractiveRulesetPatch, "rulesToAdd">>,
  ): InteractiveRulesetPatch | null {
    if (!this.patch) {
      throw new Error("Patch not created");
    }
    const rulesetToAdd = new Ruleset("");
    rulesetToAdd.extend(patch.rulesToAdd);
    const resultToAdd = query(rulesetToAdd, this.patch.props);
    const rulesAddable = this.patch.unblock
      ? this.patch.requireRulesToAdd
        ? isUnblockOrHighlight(resultToAdd)
        : !isBlock(resultToAdd)
      : this.patch.requireRulesToAdd
        ? isBlock(resultToAdd)
        : !isUnblockOrHighlight(resultToAdd);
    // console.log({ old: this.patch, new: patch, resultToAdd, rulesAddable });
    if (!rulesAddable) {
      return null;
    }
    this.patch.rulesToAdd = patch.rulesToAdd;
    return this.patch;
  }

  applyPatch(): void {
    if (!this.patch) {
      throw new Error("Patch not created");
    }

    for (const removeRule of this.patch.ruleRemovers) {
      removeRule();
    }

    this.userRuleset.extend(this.patch.rulesToAdd);

    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}
