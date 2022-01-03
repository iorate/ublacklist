import { SerpEntryProps } from './types';
import { MatchPatternScheme, lines, r } from './utilities';

export type RegularExpressionProp = 'url' | 'title';

export type ParsedRule =
  | {
      type: 'mp';
      scheme: MatchPatternScheme;
      host: string;
      path: string;
      value: number;
    }
  | {
      type: 're';
      prop: RegularExpressionProp;
      pattern: string;
      flags: string;
      value: number;
    };

export const RE_LINE = (() => {
  const spaceBeforeRuleOrComment = r`(?<spaceBeforeRuleOrComment>\s+)`;

  const color = r`(?<color>0|[1-9]\d*)`;
  const highlight = r`(?<highlight>@${color}?)`;
  const spaceAfterHighlight = r`(?<spaceAfterHighlight>\s+)`;

  const scheme = r`(?<scheme>\*|[Hh][Tt][Tt][Pp][Ss]?|[Ff][Tt][Pp])`;
  const label = r`(?:[0-9A-Za-z](?:[-0-9A-Za-z]*[0-9A-Za-z])?)`;
  const host = r`(?<host>(?:\*|${label})(?:\.${label})*)`;
  const path = r`(?<path>/(?:\*|[-0-9A-Za-z._~:/?[\]@!$&'()+,;=]|%[0-9A-Fa-f]{2})*)`;
  const matchPattern = r`(?<matchPattern>${scheme}://${host}${path})`;

  const prop = r`(?<prop>u(?:rl?)?|t(?:i(?:t(?:le?)?)?)?)`;
  const backslashSequence = r`(?:\\.)`;
  const class_ = r`(?:\[(?:[^\]\\]|${backslashSequence})*])`;
  const firstChar = r`(?:[^*\\/[]|${backslashSequence}|${class_})`;
  const char = r`(?:[^\\/[]|${backslashSequence}|${class_})`;
  const pattern = r`(?<pattern>${firstChar}${char}*)`;
  const flags = r`(?<flags>iu?|ui?)`;
  const regularExpression = r`(?<regularExpression>${prop}?/${pattern}/${flags}?)`;

  const rule = r`(?<rule>(${highlight}${spaceAfterHighlight}?)?(?:${matchPattern}|${regularExpression}))`;
  const spaceAfterRule = r`(?<spaceAfterRule>\s+)`;

  const comment = r`(?<comment>#.*)`;

  const line = r`^${spaceBeforeRuleOrComment}?(?:${rule}${spaceAfterRule}?)?${comment}?$`;

  return new RegExp(line);
})();

export function parseRule(input: string): ParsedRule | null {
  const groups = RE_LINE.exec(input)?.groups;
  if (!groups?.rule) {
    return null;
  }
  // *://example.com/*   -> 0 (block)
  // @*://example.com/*  -> 1 (unblock)
  // @1*://example.com/* -> 2 (highlight-1)
  // @2*://example.com/* -> 3 (highlight-2)
  // ...
  const value = groups.highlight ? (groups.color ? Number(groups.color) + 1 : 1) : 0;
  return groups.matchPattern
    ? {
        type: 'mp',
        scheme: groups.scheme.toLowerCase() as MatchPatternScheme,
        host: groups.host.toLowerCase(),
        path: groups.path,
        value,
      }
    : {
        type: 're',
        prop: groups.prop && 'title'.startsWith(groups.prop) ? 'title' : 'url',
        pattern: groups.pattern,
        flags: groups.flags || '',
        value,
      };
}
// #endregion rule

type CompiledMatchPatternISPV<RT> =
  | number
  | [
      index: number,
      scheme: string,
      path: true extends RT ? string | RegExp : string,
      value: number,
    ];

type CompiledMatchPattern<RT> = {
  [key: string]:
    | (true extends RT ? CompiledMatchPatternISPV<RT> | null : CompiledMatchPatternISPV<RT>)[]
    | CompiledMatchPattern<RT>;
};

type CompiledRegularExpressionIPFV<RT> = [
  index: number,
  pattern: true extends RT ? string | RegExp : string,
  flags: string,
  value: number,
];

type CompiledRegularExpression<RT> = Record<
  RegularExpressionProp,
  (true extends RT ? CompiledRegularExpressionIPFV<RT> | null : CompiledRegularExpressionIPFV<RT>)[]
>;

export type CompiledRules<RT> = {
  length: number;
  mp: CompiledMatchPattern<RT>;
  re: CompiledRegularExpression<RT>;
};

function compileMatchPattern<RT>(
  mp: CompiledMatchPattern<RT>,
  index: number,
  scheme: string,
  host: string,
  path: string,
  value: number,
): void {
  // NOTE: `current['*']` and `current['']` are always of type `CompiledMatchPatternISPV<RT>[]`.
  const labels = host.split('.').reverse();
  let current = mp;
  for (const label of labels.slice(0, -1)) {
    if (!label || label === '*') {
      return;
    }
    const next = current[label];
    if (!next) {
      current = current[label] = {};
    } else if (Array.isArray(next)) {
      current = current[label] = { '': next };
    } else {
      current = next;
    }
  }
  {
    const label = labels[labels.length - 1];
    if (!label) {
      return;
    }
    const next = current[label];
    const ispv =
      scheme === '*' && path === '/*' && !value
        ? index
        : ([index, scheme, path, value] as CompiledMatchPatternISPV<RT>);
    if (!next) {
      current[label] = [ispv];
    } else if (Array.isArray(next)) {
      current[label] = [...next, ispv];
    } else {
      next[''] = [...((next[''] as CompiledMatchPatternISPV<RT>[] | undefined) || []), ispv];
    }
  }
}

function compileRegularExpression<RT>(
  re: CompiledRegularExpression<RT>,
  index: number,
  prop: RegularExpressionProp,
  pattern: string,
  flags: string,
  value: number,
): void {
  try {
    new RegExp(pattern, flags);
  } catch {
    return;
  }
  const ipfv = [index, pattern, flags, value] as CompiledRegularExpressionIPFV<RT>;
  re[prop].push(ipfv);
}

function compileRuleset<S>(result: CompiledRules<S>, rules: readonly string[]): void {
  for (const rule of rules) {
    const parsed = parseRule(rule);
    if (!parsed) {
      // pass
    } else if (parsed.type === 'mp') {
      compileMatchPattern(
        result.mp,
        result.length,
        parsed.scheme,
        parsed.host,
        parsed.path,
        parsed.value,
      );
    } else {
      compileRegularExpression(
        result.re,
        result.length,
        parsed.prop,
        parsed.pattern,
        parsed.flags,
        parsed.value,
      );
    }
    ++result.length;
  }
}

export type RulesetResults = [index: number, value: number, remove: () => void][];

function execMatchPatternISPVArray(
  results: RulesetResults,
  ispvs: (CompiledMatchPatternISPV<true> | null)[],
  scheme: string,
  path: string,
): void {
  ispvs.forEach((ispv, i) => {
    if (ispv == null) {
      return;
    } else if (typeof ispv === 'number') {
      if (scheme === 'http' || scheme === 'https') {
        results.push([ispv, 0, () => (ispvs[i] = null)]);
      }
    } else {
      if (typeof ispv[2] === 'string') {
        ispv[2] = new RegExp(
          `^${ispv[2].replace(/[$^\\.+?()[\]{}|]/g, '\\$&').replace(/\*/g, '.*')}$`,
        );
      }
      if (
        (ispv[1] === '*' ? scheme === 'http' || scheme === 'https' : scheme === ispv[1]) &&
        ispv[2].test(path)
      ) {
        results.push([ispv[0], ispv[3], () => (ispvs[i] = null)]);
      }
    }
  });
}

function execMatchPattern(
  results: RulesetResults,
  mp: CompiledMatchPattern<true>,
  scheme: string,
  host: string,
  path: string,
): void {
  // NOTE: `current['*']` and `current['']` are always of type `CompiledMatchPatternISPV<true>[]`.
  const labels = host.split('.').reverse();
  let current = mp;
  for (const label of labels.slice(0, -1)) {
    let next = current['*'];
    if (Array.isArray(next)) {
      execMatchPatternISPVArray(results, next, scheme, path);
    }
    next = current[label];
    if (!next || Array.isArray(next)) {
      return;
    } else {
      current = next;
    }
  }
  {
    const label = labels[labels.length - 1];
    let next = current['*'];
    if (Array.isArray(next)) {
      execMatchPatternISPVArray(results, next, scheme, path);
    }
    next = current[label];
    if (!next) {
      return;
    } else if (Array.isArray(next)) {
      execMatchPatternISPVArray(results, next, scheme, path);
    } else {
      current = next;
      next = current[''];
      if (Array.isArray(next)) {
        execMatchPatternISPVArray(results, next, scheme, path);
      }
      next = current['*'];
      if (Array.isArray(next)) {
        execMatchPatternISPVArray(results, next, scheme, path);
      }
    }
  }
}

function execRegularExpressionIPFVArray(
  results: RulesetResults,
  ipfvs: (CompiledRegularExpressionIPFV<true> | null)[],
  prop: string,
): void {
  ipfvs.forEach((ipfv, i) => {
    if (ipfv == null) {
      return;
    }
    if (typeof ipfv[1] === 'string') {
      ipfv[1] = new RegExp(ipfv[1], ipfv[2]);
    }
    if (ipfv[1].test(prop)) {
      results.push([ipfv[0], ipfv[3], () => (ipfvs[i] = null)]);
    }
  });
}

export class Ruleset {
  static compile(rules: string): string {
    const compiledRules: CompiledRules<false> = { length: 0, mp: {}, re: { url: [], title: [] } };
    compileRuleset(compiledRules, lines(rules));
    return JSON.stringify(compiledRules);
  }

  private readonly compiled: CompiledRules<true>;

  constructor(compiled: string) {
    this.compiled = JSON.parse(compiled) as CompiledRules<true>;
  }

  add(rules: string): void {
    compileRuleset(this.compiled, lines(rules));
  }

  exec(props: Readonly<SerpEntryProps>): RulesetResults {
    const results: RulesetResults = [];
    execMatchPattern(results, this.compiled.mp, props.url.scheme, props.url.host, props.url.path);
    execRegularExpressionIPFVArray(results, this.compiled.re.url, props.url.toString());
    if (props.title != null) {
      execRegularExpressionIPFVArray(results, this.compiled.re.title, props.title);
    }
    return results;
  }

  test(props: Readonly<SerpEntryProps>): number {
    return Math.max(-1, ...this.exec(props).map(([, value]) => value));
  }
}
