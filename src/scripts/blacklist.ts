import * as mpsl from 'mpsl';
import { SerpEntryProps } from './types';
import { AltURL, MatchPattern, lines, unlines } from './utilities';

export type BlacklistPatch = {
  unblock: boolean;
  props: SerpEntryProps;
  rulesToAdd: string;
  rulesToRemove: string;
};

class MatchPatternTester {
  private readonly matchPattern: MatchPattern;

  constructor(mp: string) {
    this.matchPattern = new MatchPattern(mp);
  }

  test(props: Readonly<SerpEntryProps>): boolean {
    return this.matchPattern.test(props.url);
  }
}

class RegExpTester {
  private readonly prop: 'url' | 'title';
  private readonly regExp: RegExp;

  constructor(re: string) {
    const m =
      /^(\w*)\/((?:[^*\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])(?:[^\\/[]|\\.|\[(?:[^\]\\]|\\.)*\])*)\/(.*)$/.exec(
        re,
      );
    if (!m) {
      throw new Error('Invalid regular expression');
    }
    const [, shortProp, pattern, flags] = m;
    const prop = 'url'.startsWith(shortProp) // '' -> 'url'
      ? 'url'
      : 'title'.startsWith(shortProp)
      ? 'title'
      : null;
    if (prop == null) {
      throw new Error('Invalid prop');
    }
    this.prop = prop;
    this.regExp = new RegExp(pattern, flags);
  }

  test(props: Readonly<SerpEntryProps>): boolean {
    this.regExp.lastIndex = 0;
    if (this.prop === 'url') {
      return this.regExp.test(props.url.toString());
    } else {
      return props.title != null && this.regExp.test(props.title);
    }
  }
}

type Tester = MatchPatternTester | RegExpTester;

type Rule = {
  rawRule: string;
  rawRuleIndex: number;
  tester: Tester;
};

class BlacklistFragment {
  rawRules: (string | null)[] = [];

  // rules[0]: block
  // rules[1]: unblock
  // rules[2]: highlight-1
  // rules[3]: highlight-2
  // ...
  // rules may be a sparse array
  rules: Rule[][] = [];

  constructor(blacklist: string) {
    this.add(blacklist);
  }

  add(blacklist: string): void {
    for (const rawRule of lines(blacklist)) {
      this.rawRules.push(rawRule);
      const trimmed = rawRule.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [, at, atNumber, rest] = /^(@(\d*)\s*)?(.*)$/.exec(trimmed)!;
      // *://example.com/*   -> 0 (block)
      // @*://example.com/*  -> 1 (unblock)
      // @1*://example.com/* -> 2 (highlight-1)
      // @2*://example.com/* -> 3 (highlight-2)
      // ...
      const index = at ? (atNumber ? Number(atNumber) + 1 : 1) : 0;
      let tester: Tester;
      try {
        tester = new MatchPatternTester(rest);
      } catch {
        try {
          tester = new RegExpTester(rest);
        } catch {
          continue;
        }
      }
      this.rules[index] ||= [];
      this.rules[index].push({
        rawRule,
        rawRuleIndex: this.rawRules.length - 1,
        tester,
      });
    }
  }

  // 0: block
  // 1: unblock
  // 2: highlight-1
  // 3: highlight-2
  // ...
  // -1: none of the above
  test(props: Readonly<SerpEntryProps>): number {
    return this.rules.reduceRight(
      (result, rules, index) =>
        result !== -1 ? result : rules.some(rule => rule.tester.test(props)) ? index : -1,
      -1,
    );
  }
}

type BlacklistPatchInternal = BlacklistPatch & {
  requireRulesToAdd: boolean;
  ruleIndicesToRemove: [number, number][];
};

function findIndices<T>(xss: readonly T[][], predicate: (x: T) => boolean): [number, number][] {
  const indices: [number, number][] = [];
  xss.forEach((xs, i) => {
    xs.forEach((x, j) => {
      if (predicate(x)) {
        indices.push([i, j]);
      }
    });
  });
  return indices;
}

function suggestMatchPattern(url: AltURL, unblock: boolean, usePSL: boolean): string {
  const at = unblock ? '@' : '';
  const scheme = url.scheme === 'http' || url.scheme === 'https' ? '*' : url.scheme;
  let host;
  if (usePSL) {
    const domain = mpsl.get(url.host);
    host = domain != null ? `*.${domain}` : url.host;
  } else {
    host = url.host;
  }
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

  // 0: block
  // 1: unblock
  // 2: highlight-1
  // 3: highlight-2
  // ...
  // -1: none of the above
  test(props: Readonly<SerpEntryProps>): number {
    const userResult = this.userFragment.test(props);
    if (userResult >= 0) {
      return userResult;
    }
    return Math.max(...this.subscriptionFragments.map(fragment => fragment.test(props)), -1);
  }

  // Create a patch to block an unblocked URL or unblock a blocked URL.
  // If a patch is already created, it will be deleted.
  createPatch(props: SerpEntryProps, usePSL: boolean): BlacklistPatch {
    const patch = { props } as BlacklistPatchInternal;
    const ruleIndices = findIndices(this.userFragment.rules, rule => rule.tester.test(props));
    if (ruleIndices.some(([i]) => i >= 1)) {
      // The URL is unblocked by a user rule. Block it.
      patch.unblock = false;
      if (ruleIndices.some(([i]) => i === 0)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else if (this.subscriptionFragments.some(fragment => fragment.test(props) >= 1)) {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, usePSL);
      } else if (this.subscriptionFragments.some(fragment => fragment.test(props) === 0)) {
        // No need to add a user rule to block it.
        patch.requireRulesToAdd = false;
        patch.rulesToAdd = '';
      } else {
        // Add a user rule to block it.
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, usePSL);
      }
      patch.ruleIndicesToRemove = ruleIndices.filter(([i]) => i >= 1);
      patch.rulesToRemove = unlines(
        patch.ruleIndicesToRemove.map(([i, j]) => this.userFragment.rules[i][j].rawRule),
      );
    } else {
      if (ruleIndices.some(([i]) => i === 0)) {
        // The URL is blocked by a user rule. Unblock it.
        patch.unblock = true;
        if (this.subscriptionFragments.some(fragment => fragment.test(props) >= 1)) {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        } else if (this.subscriptionFragments.some(fragment => fragment.test(props) === 0)) {
          // Add a user rule to unblock it.
          patch.requireRulesToAdd = true;
          patch.rulesToAdd = suggestMatchPattern(props.url, true, usePSL);
        } else {
          // No need to add a user rule to unblock it.
          patch.requireRulesToAdd = false;
          patch.rulesToAdd = '';
        }
        patch.ruleIndicesToRemove = ruleIndices.filter(([i]) => i === 0);
        patch.rulesToRemove = unlines(
          patch.ruleIndicesToRemove.map(([i, j]) => this.userFragment.rules[i][j].rawRule),
        );
      } else if (this.subscriptionFragments.some(fragment => fragment.test(props) >= 1)) {
        // The URL is unblocked by a subscription rule. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, usePSL);
        patch.ruleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else if (this.subscriptionFragments.some(fragment => fragment.test(props) === 0)) {
        // The URL is blocked by a subscription rule. Unblock it.
        // Add a user rule to unblock it.
        patch.unblock = true;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, true, usePSL);
        patch.ruleIndicesToRemove = [];
        patch.rulesToRemove = '';
      } else {
        // The URL is neither blocked nor unblocked. Block it.
        // Add a user rule to block it.
        patch.unblock = false;
        patch.requireRulesToAdd = true;
        patch.rulesToAdd = suggestMatchPattern(props.url, false, usePSL);
        patch.ruleIndicesToRemove = [];
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
    const fragmentToAdd = new BlacklistFragment(patch.rulesToAdd);
    let rulesAddable!: boolean;
    if (this.patch.unblock) {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = fragmentToAdd.test(this.patch.props) >= 1;
      } else {
        rulesAddable = fragmentToAdd.test(this.patch.props) !== 0;
      }
    } else {
      if (this.patch.requireRulesToAdd) {
        rulesAddable = fragmentToAdd.test(this.patch.props) === 0;
      } else {
        rulesAddable = fragmentToAdd.test(this.patch.props) < 1;
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

    this.patch.ruleIndicesToRemove.reverse();
    for (const [i, j] of this.patch.ruleIndicesToRemove) {
      this.userFragment.rawRules[this.userFragment.rules[i][j].rawRuleIndex] = null;
      this.userFragment.rules[i].splice(j, 1);
    }

    this.userFragment.add(this.patch.rulesToAdd);
    this.patch = null;
  }

  deletePatch(): void {
    this.patch = null;
  }
}
