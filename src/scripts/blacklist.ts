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

interface PatternAndRuleIndex {
  pattern: Pattern;
  ruleIndex: number;
}

type InternalPatch = BlacklistPatch & {
  requireRulesToAdd: boolean;
  patternIndicesToRemove: number[];
};

interface PatternAndUnblock {
  pattern: Pattern;
  unblock: boolean;
}

function compileRule(rule: string): PatternAndUnblock | null {
  rule = rule.trim();
  const unblock = rule.startsWith('@');
  if (unblock) {
    rule = rule.slice(1).trimStart();
  }
  let pattern!: Pattern | null;
  try {
    pattern = new MatchPattern(rule);
  } catch {
    try {
      pattern = new RegularExpression(rule);
    } catch {
      pattern = null;
    }
  }
  return pattern ? { pattern, unblock } : null;
}

function suggestMatchPattern(url: AltURL, unblock: boolean): string {
  if (url.scheme === 'http' || url.scheme === 'https') {
    return `${unblock ? '@' : ''}*://${url.host}/*`;
  } else {
    return `${unblock ? '@' : ''}${url.scheme}://${url.host}/*`;
  }
}

function testBlock(rules: string, url: AltURL): boolean {
  return lines(rules).some(rule => {
    const pu = compileRule(rule);
    return pu && !pu.unblock && pu.pattern.test(url);
  });
}

function testUnblock(rules: string, url: AltURL): boolean {
  return lines(rules).some(rule => {
    const pu = compileRule(rule);
    return pu && pu.unblock && pu.pattern.test(url);
  });
}

export class Blacklist {
  private rules: (string | null)[] = [];
  private blockPatterns: PatternAndRuleIndex[] = [];
  private unblockPatterns: PatternAndRuleIndex[] = [];
  private subscriptionBlockPatterns: Pattern[] = [];
  private subscriptionUnblockPatterns: Pattern[] = [];
  private internalPatch: InternalPatch | null = null;

  constructor(blacklist: string, subscriptionBlacklists: string[]) {
    this.add(blacklist);
    for (const subscriptionBlacklist of subscriptionBlacklists) {
      for (const rule of lines(subscriptionBlacklist)) {
        const pu = compileRule(rule);
        if (pu) {
          const { pattern, unblock } = pu;
          const patterns = unblock
            ? this.subscriptionUnblockPatterns
            : this.subscriptionBlockPatterns;
          patterns.push(pattern);
        }
      }
    }
  }

  toString(): string {
    return unlines(this.rules.filter(rule => rule != null) as string[]);
  }

  test(url: AltURL): boolean {
    if (this.unblockPatterns.some(({ pattern }) => pattern.test(url))) {
      // Unblocked by a user rule.
      return false;
    } else if (this.blockPatterns.some(({ pattern }) => pattern.test(url))) {
      // Blocked by a user rule.
      return true;
    } else if (this.subscriptionUnblockPatterns.some(pattern => pattern.test(url))) {
      // Unblocked by a subscription rule.
      return false;
    } else if (this.subscriptionBlockPatterns.some(pattern => pattern.test(url))) {
      // Blocked by a subscription rule.
      return true;
    } else {
      // Neither blocked nor unblocked.
      return false;
    }
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(url: AltURL): BlacklistPatch {
    const internalPatch = { url } as InternalPatch;
    const unblockPatternIndices: number[] = [];
    this.unblockPatterns.forEach(({ pattern }, index) => {
      if (pattern.test(url)) {
        unblockPatternIndices.push(index);
      }
    });
    if (unblockPatternIndices.length) {
      // Unblocked by a user rule. Block it.
      internalPatch.unblock = false;
      if (this.blockPatterns.some(({ pattern }) => pattern.test(url))) {
        // Already blocked by a user rule. No need to add one to block it.
        internalPatch.requireRulesToAdd = false;
        internalPatch.rulesToAdd = '';
      } else if (this.subscriptionUnblockPatterns.some(pattern => pattern.test(url))) {
        // Unblocked by a subscription rule. Add a user rule to block it.
        internalPatch.requireRulesToAdd = true;
        internalPatch.rulesToAdd = suggestMatchPattern(url, false);
      } else if (this.subscriptionBlockPatterns.some(pattern => pattern.test(url))) {
        // Already blocked by a subscription rule. No need to add a user rule to block it.
        internalPatch.requireRulesToAdd = false;
        internalPatch.rulesToAdd = '';
      } else {
        // Not yet blocked. Add a user rule to block it.
        internalPatch.requireRulesToAdd = true;
        internalPatch.rulesToAdd = suggestMatchPattern(url, false);
      }
      internalPatch.patternIndicesToRemove = unblockPatternIndices;
      internalPatch.rulesToRemove = unlines(
        unblockPatternIndices.map(index => this.rules[this.unblockPatterns[index].ruleIndex]!),
      );
    } else {
      const blockPatternIndices: number[] = [];
      this.blockPatterns.forEach(({ pattern }, index) => {
        if (pattern.test(url)) {
          blockPatternIndices.push(index);
        }
      });
      if (blockPatternIndices.length) {
        // Blocked by a user rule. Unblock it.
        internalPatch.unblock = true;
        if (this.subscriptionUnblockPatterns.some(pattern => pattern.test(url))) {
          // Unblocked by a subscription rule. No need to add a user rule to unblock it.
          internalPatch.requireRulesToAdd = false;
          internalPatch.rulesToAdd = '';
        } else if (this.subscriptionBlockPatterns.some(pattern => pattern.test(url))) {
          // Blocked by a subscription rule. Add a user rule to unblock it.
          internalPatch.requireRulesToAdd = true;
          internalPatch.rulesToAdd = suggestMatchPattern(url, true);
        } else {
          // Not blocked by a subscription rule. No need to add a user rule to unblock it.
          internalPatch.requireRulesToAdd = false;
          internalPatch.rulesToAdd = '';
        }
        internalPatch.patternIndicesToRemove = blockPatternIndices;
        internalPatch.rulesToRemove = unlines(
          blockPatternIndices.map(index => this.rules[this.blockPatterns[index].ruleIndex]!),
        );
      } else if (this.subscriptionUnblockPatterns.some(pattern => pattern.test(url))) {
        // Unblocked by a subscription rule. Add a user rule to block it.
        internalPatch.unblock = false;
        internalPatch.requireRulesToAdd = true;
        internalPatch.rulesToAdd = suggestMatchPattern(url, false);
        internalPatch.patternIndicesToRemove = [];
        internalPatch.rulesToRemove = '';
      } else if (this.subscriptionBlockPatterns.some(pattern => pattern.test(url))) {
        // Blocked by a subscription rule. Add a user rule to unblock it.
        internalPatch.unblock = true;
        internalPatch.requireRulesToAdd = true;
        internalPatch.rulesToAdd = suggestMatchPattern(url, true);
        internalPatch.patternIndicesToRemove = [];
        internalPatch.rulesToRemove = '';
      } else {
        // Neither blocked nor unblocked. Add a user rule to block it.
        internalPatch.unblock = false;
        internalPatch.requireRulesToAdd = true;
        internalPatch.rulesToAdd = suggestMatchPattern(url, false);
        internalPatch.patternIndicesToRemove = [];
        internalPatch.rulesToRemove = '';
      }
    }
    this.internalPatch = internalPatch;
    return internalPatch as BlacklistPatch;
  }

  // Modify a created patch.
  // Only 'rulesToAdd' can be modified.
  modifyPatch(patch: Pick<BlacklistPatch, 'rulesToAdd'>): BlacklistPatch | null {
    if (!this.internalPatch) {
      throw new Error('Patch not created');
    }
    let modified!: boolean;
    if (this.internalPatch.unblock) {
      // Unblock the URL.
      if (this.internalPatch.requireRulesToAdd) {
        // Need to add a user rule to unblock it.
        modified = testUnblock(patch.rulesToAdd, this.internalPatch.url);
      } else {
        // No need to add a user rule to unblock it, but do not add one to block it.
        modified = !testBlock(patch.rulesToAdd, this.internalPatch.url);
      }
    } else {
      // Block the URL.
      if (this.internalPatch.requireRulesToAdd) {
        // Need to add a user rule to block it.
        modified = testBlock(patch.rulesToAdd, this.internalPatch.url);
      } else {
        // No need to add a user rule to block it, but do not add one to unblock it.
        modified = !testUnblock(patch.rulesToAdd, this.internalPatch.url);
      }
    }
    if (modified) {
      this.internalPatch.rulesToAdd = patch.rulesToAdd;
    }
    return modified ? (this.internalPatch as BlacklistPatch) : null;
  }

  applyPatch(): void {
    if (!this.internalPatch) {
      throw new Error('Patch not created');
    }
    // Add rules.
    this.add(this.internalPatch.rulesToAdd);
    // Remove rules.
    // If unblocking a url, remove from block patterns. Otherwise, remove from unblock patterns.
    const patterns = this.internalPatch.unblock ? this.blockPatterns : this.unblockPatterns;
    for (const index of this.internalPatch.patternIndicesToRemove.reverse()) {
      this.rules[patterns[index].ruleIndex] = null;
      patterns.splice(index, 1);
    }
    this.internalPatch = null;
  }

  deletePatch(): void {
    this.internalPatch = null;
  }

  private add(rules: string): void {
    for (const rule of lines(rules)) {
      this.rules.push(rule);
      const pu = compileRule(rule);
      if (pu) {
        const { pattern, unblock } = pu;
        const patterns = unblock ? this.unblockPatterns : this.blockPatterns;
        patterns.push({ pattern, ruleIndex: this.rules.length - 1 });
      }
    }
  }
}
