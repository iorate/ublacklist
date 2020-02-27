import { AltURL, MatchPattern, lines, unlines } from './utilities';

export interface BlacklistPatch {
  unblock: boolean;
  url: AltURL;
  rulesToAdd: string;
  rulesToRemove: string;
}

class RegularExpression {
  regExp: RegExp;

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

interface CookedRule {
  rawRuleIndex: number;
  unblock: boolean;
  pattern: Pattern;
}

class Part {
  rawRules: (string | null)[] = [];
  blockRules: CookedRule[] = [];
  unblockRules: CookedRule[] = [];

  constructor(blacklist: string) {
    this.add(blacklist);
  }

  add(blacklist: string): void {
    for (let rawRule of lines(blacklist)) {
      this.rawRules.push(rawRule);
      rawRule = rawRule.trim();
      const unblock = rawRule.startsWith('@');
      if (unblock) {
        rawRule = rawRule.slice(1).trimStart();
      }
      let pattern!: Pattern;
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

interface Patch extends BlacklistPatch {
  requireRulesToAdd: boolean;
  cookedRuleIndicesToRemove: number[];
}

function findIndices<T>(array: T[], predicate: (element: T) => boolean): number[] {
  const indices: number[] = [];
  array.forEach((element, index) => {
    if (predicate(element)) {
      indices.push(index);
    }
  });
  return indices;
}

function suggestMatchPattern(url: AltURL, unblock: boolean): string {
  if (url.scheme === 'http' || url.scheme === 'https') {
    return `${unblock ? '@' : ''}*://${url.host}/*`;
  } else {
    return `${unblock ? '@' : ''}${url.scheme}://${url.host}/*`;
  }
}

export class Blacklist {
  private userPart: Part;
  private subscriptionParts: Part[];
  private patch: Patch | null = null;

  constructor(blacklist: string, subscriptionBlacklists: string[]) {
    this.userPart = new Part(blacklist);
    this.subscriptionParts = subscriptionBlacklists.map(blacklist => new Part(blacklist));
  }

  toString(): string {
    return unlines(this.userPart.rawRules.filter(rawRule => rawRule != null) as string[]);
  }

  test(url: AltURL): boolean {
    if (this.userPart.unblocks(url)) {
      return false;
    } else if (this.userPart.blocks(url)) {
      return true;
    } else if (this.subscriptionParts.some(part => part.unblocks(url))) {
      return false;
    } else if (this.subscriptionParts.some(part => part.blocks(url))) {
      return true;
    } else {
      return false;
    }
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(url: AltURL): BlacklistPatch {
    const patch = { url } as Patch;
    const unblockRuleIndices = findIndices(this.userPart.unblockRules, unblockRule =>
      unblockRule.pattern.test(url),
    );
    if (unblockRuleIndices.length) {
      // The URL is unblocked by a user rule. Block it.
      patch.unblock = false;
      if (this.userPart.blocks(url)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else if (this.subscriptionParts.some(part => part.unblocks(url))) {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
      } else if (this.subscriptionParts.some(part => part.blocks(url))) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
      }
      patch.cookedRuleIndicesToRemove = unblockRuleIndices;
      patch.rulesToRemove = unlines(
        unblockRuleIndices.map(
          index => this.userPart.rawRules[this.userPart.unblockRules[index].rawRuleIndex]!,
        ),
      );
    } else {
      const blockRuleIndices = findIndices(this.userPart.blockRules, blockRule =>
        blockRule.pattern.test(url),
      );
      if (blockRuleIndices.length) {
        // The URL is blocked by a user rule. Unblock it.
        patch.unblock = true;
        if (this.subscriptionParts.some(part => part.unblocks(url))) {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        } else if (this.subscriptionParts.some(part => part.blocks(url))) {
          // Add a user rule to unblock it.
          patch.requireRulesToAdd = true;
          patch.rulesToAdd = suggestMatchPattern(url, true);
        } else {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        }
        patch.cookedRuleIndicesToRemove = blockRuleIndices;
        patch.rulesToRemove = unlines(
          blockRuleIndices.map(
            index => this.userPart.rawRules[this.userPart.blockRules[index].rawRuleIndex]!,
          ),
        );
      } else if (this.subscriptionParts.some(part => part.unblocks(url))) {
        // The URL is unblocked by a subscription rule. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
        patch.cookedRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else if (this.subscriptionParts.some(part => part.blocks(url))) {
        // The URL is blocked by a subscription rule. Unblock it.
        // Add a user rule to unblock it.
        patch.unblock = true;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, true);
        patch.cookedRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else {
        // The URL is neither blocked nor unblocked. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(url, false);
        patch.cookedRuleIndicesToRemove = [];
        patch.rulesToRemove = '';
      }
    }
    this.patch = patch;
    return patch as BlacklistPatch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch(patch: Pick<BlacklistPatch, 'rulesToAdd'>): BlacklistPatch | null {
    if (!this.patch) {
      throw new Error('Patch not created');
    }
    const partToAdd = new Part(patch.rulesToAdd);
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
    return this.patch as BlacklistPatch;
  }

  applyPatch(): void {
    if (!this.patch) {
      throw new Error('Patch not created');
    }
    const cookedRules = this.patch.unblock ? this.userPart.blockRules : this.userPart.unblockRules;
    for (const index of this.patch.cookedRuleIndicesToRemove.reverse()) {
      this.userPart.rawRules[cookedRules[index].rawRuleIndex] = null;
      cookedRules.splice(index, 1);
    }
    this.userPart.add(this.patch.rulesToAdd);
    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}
