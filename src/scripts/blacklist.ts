import { AltURL, MatchPattern, lines, unlines } from './utilities';

export type BlacklistPatch = {
  unblock: boolean;
  url: AltURL;
  rulesToAdd: string;
  rulesToRemove: string;
};

class RegularExpression {
  private readonly regExp: RegExp;

  constructor(re: string) {
    const m = /^\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/.exec(
      re,
    );
    if (!m) {
      throw new Error('Invalid regular expression');
    }
    const [, pattern, flags] = m;
    this.regExp = new RegExp(pattern, flags);
  }

  test(url: AltURL): boolean {
    this.regExp.lastIndex = 0;
    return this.regExp.test(url.toString());
  }
}

type Pattern = MatchPattern | RegularExpression;

type CompiledRule = {
  rawRule: string;
  rawRuleIndex: number;
  unblock: boolean;
  pattern: Pattern;
};

class BlacklistFragment {
  rawRules: (string | null)[] = [];
  blockRules: CompiledRule[] = [];
  unblockRules: CompiledRule[] = [];

  constructor(blacklist: string) {
    this.add(blacklist);
  }

  add(blacklist: string): void {
    for (const originalRawRule of lines(blacklist)) {
      this.rawRules.push(originalRawRule);
      let rawRule = originalRawRule.trim();
      if (!rawRule || rawRule.startsWith('#')) {
        continue;
      }
      const unblock = rawRule.startsWith('@');
      if (unblock) {
        rawRule = rawRule.slice(1).trim();
      }
      let pattern: Pattern;
      try {
        pattern = new MatchPattern(rawRule);
      } catch {
        try {
          pattern = new RegularExpression(rawRule);
        } catch {
          continue;
        }
      }
      (unblock ? this.unblockRules : this.blockRules).push({
        rawRule: originalRawRule,
        rawRuleIndex: this.rawRules.length - 1,
        unblock,
        pattern,
      });
    }
  }

  blocks(url: AltURL): boolean {
    return this.blockRules.some(blockRule => blockRule.pattern.test(url));
  }

  unblocks(url: AltURL): boolean {
    return this.unblockRules.some(unblockRule => unblockRule.pattern.test(url));
  }
}

type BlacklistPatchInternal = BlacklistPatch & {
  requireRulesToAdd: boolean;
  compiledRuleIndicesToRemove: number[];
};

function findIndices<T>(array: readonly T[], predicate: (element: T) => boolean): number[] {
  const indices: number[] = [];
  array.forEach((element, index) => {
    if (predicate(element)) {
      indices.push(index);
    }
  });
  return indices;
}

function suggestMatchPattern(url: AltURL, unblock: boolean): string {
  const at = unblock ? '@' : '';
  const scheme = url.scheme === 'http' || url.scheme === 'https' ? '*' : url.scheme;
  const host = url.host;
  const path = '/*';
  return `${at}${scheme}://${host}${path}`;
}

export class Blacklist {
  private userFragment: BlacklistFragment;
  private subscriptionFragments: BlacklistFragment[];
  private patch: BlacklistPatchInternal | null = null;

  constructor(blacklist: string, subscriptionBlacklists: readonly string[]) {
    this.userFragment = new BlacklistFragment(blacklist);
    this.subscriptionFragments = subscriptionBlacklists.map(
      blacklist => new BlacklistFragment(blacklist),
    );
  }

  toString(): string {
    return unlines(this.userFragment.rawRules.filter(rawRule => rawRule != null) as string[]);
  }

  test(url: AltURL): boolean {
    if (this.userFragment.unblocks(url)) {
      return false;
    } else if (this.userFragment.blocks(url)) {
      return true;
    } else if (this.subscriptionFragments.some(fragment => fragment.unblocks(url))) {
      return false;
    } else if (this.subscriptionFragments.some(fragment => fragment.blocks(url))) {
      return true;
    } else {
      return false;
    }
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(url: AltURL): BlacklistPatch {
    const patch = { url } as BlacklistPatchInternal;
    const unblockRuleIndices = findIndices(this.userFragment.unblockRules, unblockRule =>
      unblockRule.pattern.test(url),
    );
    if (unblockRuleIndices.length) {
      // The URL is unblocked by a user rule. Block it.
      patch.unblock = false;
      if (this.userFragment.blocks(url)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else if (this.subscriptionFragments.some(part => part.unblocks(url))) {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
      } else if (this.subscriptionFragments.some(part => part.blocks(url))) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
      }
      patch.compiledRuleIndicesToRemove = unblockRuleIndices;
      patch.rulesToRemove = unlines(
        unblockRuleIndices.map(index => this.userFragment.unblockRules[index].rawRule),
      );
    } else {
      const blockRuleIndices = findIndices(this.userFragment.blockRules, blockRule =>
        blockRule.pattern.test(url),
      );
      if (blockRuleIndices.length) {
        // The URL is blocked by a user rule. Unblock it.
        patch.unblock = true;
        if (this.subscriptionFragments.some(part => part.unblocks(url))) {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        } else if (this.subscriptionFragments.some(part => part.blocks(url))) {
          // Add a user rule to unblock it.
          patch.requireRulesToAdd = true;
          patch.rulesToAdd = suggestMatchPattern(url, true);
        } else {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        }
        patch.compiledRuleIndicesToRemove = blockRuleIndices;
        patch.rulesToRemove = unlines(
          blockRuleIndices.map(index => this.userFragment.blockRules[index].rawRule),
        );
      } else if (this.subscriptionFragments.some(part => part.unblocks(url))) {
        // The URL is unblocked by a subscription rule. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
        patch.compiledRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else if (this.subscriptionFragments.some(part => part.blocks(url))) {
        // The URL is blocked by a subscription rule. Unblock it.
        // Add a user rule to unblock it.
        patch.unblock = true;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, true);
        patch.compiledRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else {
        // The URL is neither blocked nor unblocked. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
        patch.compiledRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      }
    }
    this.patch = patch;
    return patch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch(patch: Readonly<Pick<BlacklistPatch, 'rulesToAdd'>>): BlacklistPatch | null {
    if (!this.patch) {
      throw new Error('Patch not created');
    }
    const partToAdd = new BlacklistFragment(patch.rulesToAdd);
    let rulesAddable!: boolean;
    if (this.patch.unblock) {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = partToAdd.unblocks(this.patch.url);
      } else {
        rulesAddable = !partToAdd.blocks(this.patch.url) || partToAdd.unblocks(this.patch.url);
      }
    } else {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = partToAdd.blocks(this.patch.url) && !partToAdd.unblocks(this.patch.url);
      } else {
        rulesAddable = !partToAdd.unblocks(this.patch.url);
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
    const compiledRules = this.patch.unblock
      ? this.userFragment.blockRules
      : this.userFragment.unblockRules;
    for (const index of this.patch.compiledRuleIndicesToRemove.reverse()) {
      this.userFragment.rawRules[compiledRules[index].rawRuleIndex] = null;
      compiledRules.splice(index, 1);
    }
    this.userFragment.add(this.patch.rulesToAdd);
    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}
