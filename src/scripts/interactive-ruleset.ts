import * as mpsl from 'mpsl';
import { Ruleset } from './ruleset';
import { SerpEntryProps } from './types';
import { AltURL, lines, unlines } from './utilities';

export type InteractiveRulesetPatch = {
  unblock: boolean;
  props: SerpEntryProps;
  rulesToAdd: string;
  rulesToRemove: string;
};

type PatchInternal = InteractiveRulesetPatch & {
  requireRulesToAdd: boolean;
  ruleRemovers: (() => void)[];
};

function unlinesNullable(lines: readonly (string | null)[]): string {
  return unlines(lines.filter((line): line is string => line != null));
}

function suggestMatchPattern(url: AltURL, unblock: boolean, blockWholeSite: boolean): string {
  const at = unblock ? '@' : '';
  const scheme = url.scheme === 'http' || url.scheme === 'https' ? '*' : url.scheme;
  let host;
  if (blockWholeSite) {
    const domain = mpsl.get(url.host);
    host = domain != null ? `*.${domain}` : url.host;
  } else {
    host = url.host;
  }
  const path = '/*';
  return `${at}${scheme}://${host}${path}`;
}

export class InteractiveRuleset {
  private readonly userRules: (string | null)[];
  private readonly userRuleset: Ruleset;
  private readonly subscriptionRulesets: readonly Ruleset[];
  private patch: PatchInternal | null = null;

  constructor(
    userRules: string,
    userCompiledRules: string,
    subscriptionCompiledRules: readonly string[],
  ) {
    this.userRules = lines(userRules);
    this.userRuleset = new Ruleset(userCompiledRules);
    this.subscriptionRulesets = subscriptionCompiledRules.map(compiled => new Ruleset(compiled));
  }

  toString(): string {
    return unlinesNullable(this.userRules);
  }

  // 0: block
  // 1: unblock
  // 2: highlight-1
  // 3: highlight-2
  // ...
  // -1: none of the above
  test(props: Readonly<SerpEntryProps>): number {
    const userResults = this.userRuleset.test(props);
    if (userResults >= 0) {
      return userResults;
    }
    return Math.max(-1, ...this.subscriptionRulesets.map(ruleset => ruleset.test(props)));
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(props: SerpEntryProps, blockWholeSite: boolean): InteractiveRulesetPatch {
    const patch = { props } as PatchInternal;
    const userResults = this.userRuleset.exec(props);
    if (userResults.some(([, value]) => value >= 1)) {
      // The URL is unblocked by a user rule. Block it.
      patch.unblock = false;
      if (userResults.some(([, value]) => value === 0)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) >= 1)) {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      } else if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) === 0)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      }
      patch.rulesToRemove = unlinesNullable(
        userResults.flatMap(([index, value]) => (value >= 1 ? [this.userRules[index]] : [])),
      );
      patch.ruleRemovers = userResults.flatMap(([index, value, remove]) =>
        value >= 1 ? [() => (this.userRules[index] = null), remove] : [],
      );
    } else if (userResults.some(([, value]) => value === 0)) {
      // The URL is blocked by a user rule. Unblock it.
      patch.unblock = true;
      if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) >= 1)) {
        // No need to add a user rule to unblock it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) === 0)) {
        // Add a user rule to unblock it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      } else {
        // No need to add a user rule to unblock it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      }
      patch.rulesToRemove = unlinesNullable(
        userResults.flatMap(([index, value]) => (value === 0 ? [this.userRules[index]] : [])),
      );
      patch.ruleRemovers = userResults.flatMap(([index, value, remove]) =>
        value === 0 ? [() => (this.userRules[index] = null), remove] : [],
      );
    } else if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) >= 1)) {
      // The URL is unblocked by a subscription rule. Block it.
      // Add a user rule to block it.
      patch.unblock = false;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      patch.rulesToRemove = '';
      patch.ruleRemovers = [];
    } else if (this.subscriptionRulesets.some(ruleset => ruleset.test(props) === 0)) {
      // The URL is blocked by a subscription rule. Unblock it.
      // Add a user rule to unblock it.
      patch.unblock = true;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, true, blockWholeSite);
      patch.rulesToRemove = '';
      patch.ruleRemovers = [];
    } else {
      // The URL is neither blocked nor unblocked. Block it.
      // Add a user rule to block it.
      patch.unblock = false;
      patch.requireRulesToAdd = true;
      patch.rulesToAdd = suggestMatchPattern(props.url, false, blockWholeSite);
      patch.rulesToRemove = '';
      patch.ruleRemovers = [];
    }
    this.patch = patch;
    return patch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch(
    patch: Readonly<Pick<InteractiveRulesetPatch, 'rulesToAdd'>>,
  ): InteractiveRulesetPatch | null {
    if (!this.patch) {
      throw new Error('Patch not created');
    }
    const rulesetToAdd = new Ruleset(Ruleset.compile(patch.rulesToAdd));
    let rulesAddable!: boolean;
    if (this.patch.unblock) {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = rulesetToAdd.test(this.patch.props) >= 1;
      } else {
        rulesAddable = rulesetToAdd.test(this.patch.props) !== 0;
      }
    } else {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = rulesetToAdd.test(this.patch.props) === 0;
      } else {
        rulesAddable = rulesetToAdd.test(this.patch.props) < 1;
      }
    }
    if (!rulesAddable) {
      return null;
    }
    this.patch.rulesToAdd = patch.rulesToAdd;
    return this.patch;
  }

  applyPatch(): void {
    if (!this.patch) {
      throw new Error('Patch not created');
    }

    for (const removeRule of this.patch.ruleRemovers) {
      removeRule();
    }

    this.userRules.push(...lines(this.patch.rulesToAdd));
    this.userRuleset.add(this.patch.rulesToAdd);

    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}
