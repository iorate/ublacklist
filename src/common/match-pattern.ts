export type MatchPatternScheme = "*" | "http" | "https";

export type ParsedMatchPattern = {
  scheme: MatchPatternScheme;
  host: string;
  path: string;
};

const matchPatternRegExp = (() => {
  const allURLs = String.raw`(?<allURLs><all_urls>)`;
  const scheme = String.raw`(?<scheme>\*|[Hh][Tt][Tt][Pp][Ss]?)`;
  const label = String.raw`(?:[0-9A-Za-z](?:[-0-9A-Za-z]*[0-9A-Za-z])?)`;
  const host = String.raw`(?<host>(?:\*|${label})(?:\.${label})*)`;
  const path = String.raw`(?<path>/(?:\*|[-0-9A-Za-z._~:/?[\]@!$&'()+,;=]|%[0-9A-Fa-f]{2})*)`;
  return new RegExp(String.raw`^(?:${allURLs}|${scheme}://${host}${path})$`);
})();

export function parseMatchPattern(pattern: string): ParsedMatchPattern | null {
  const execResult = matchPatternRegExp.exec(pattern);
  if (!execResult) {
    return null;
  }
  const groups = execResult.groups as
    | { allURLs: string }
    | { allURLs?: never; scheme: string; host: string; path: string };
  return groups.allURLs != null
    ? { scheme: "*", host: "*", path: "/*" }
    : {
        scheme: groups.scheme.toLowerCase() as MatchPatternScheme,
        host: groups.host.toLowerCase(),
        path: groups.path,
      };
}

type SchemePathArray<T> = [
  value: T,
  scheme?: MatchPatternScheme,
  path?: string,
][];

type HostTree<T> = [
  self: SchemePathArray<T>,
  anySubdomain: SchemePathArray<T>,
  subdomains?: Record<string, HostTree<T>>,
];

export class MatchPatternSet<T> {
  private readonly tree: HostTree<T>;

  private constructor(tree: HostTree<T>) {
    this.tree = tree;
  }

  static new<T>(): MatchPatternSet<T> {
    return new MatchPatternSet([[], []]);
  }

  static unsafeFromJSON<T>(json: string): MatchPatternSet<T> {
    const tree = JSON.parse(json) as HostTree<T>;
    return new MatchPatternSet(tree);
  }

  toJSON(): string {
    return JSON.stringify(this.tree);
  }

  add(pattern: string, value: T): void {
    const parseResult = parseMatchPattern(pattern);
    if (!parseResult) {
      throw new Error(`Invalid match pattern: ${pattern}`);
    }
    const { scheme, host, path } = parseResult;
    const keys = host.split(".").reverse();
    const anySubdomain = keys[keys.length - 1] === "*";
    if (anySubdomain) {
      keys.pop();
    }
    let cursor = this.tree;
    for (const key of keys) {
      cursor[2] ||= {};
      cursor = cursor[2][key] ||= [[], []];
    }
    cursor[anySubdomain ? 1 : 0].push(
      path === "/*"
        ? scheme === "*"
          ? [value]
          : [value, scheme]
        : [value, scheme, path],
    );
  }

  exec(url: string): T[] {
    const { protocol, hostname: host, pathname, search } = new URL(url);
    const scheme = protocol.slice(0, -1);
    if (scheme !== "http" && scheme !== "https") {
      return [];
    }
    const path = `${pathname}${search}`;
    const result: T[] = [];
    let cursor = this.tree;
    let complete = true;
    for (const key of host.split(".").reverse()) {
      MatchPatternSet.execSchemePathArray(result, cursor[1], scheme, path);
      if (cursor[2]?.[key]) {
        cursor = cursor[2][key];
      } else {
        complete = false;
        break;
      }
    }
    if (complete) {
      MatchPatternSet.execSchemePathArray(result, cursor[1], scheme, path);
      MatchPatternSet.execSchemePathArray(result, cursor[0], scheme, path);
    }
    return result;
  }

  private static execSchemePathArray<T>(
    result: T[],
    array: SchemePathArray<T>,
    scheme: string,
    path: string,
  ): void {
    for (const [value, mpScheme = "*", mpPath = "/*"] of array) {
      if (
        (mpScheme === "*" || scheme === mpScheme) &&
        (mpPath === "/*" || MatchPatternSet.execPath(mpPath, path))
      ) {
        result.push(value);
      }
    }
  }

  private static execPath(mpPath: string, path: string): boolean {
    const [first, ...rest] = mpPath.split("*");
    if (rest.length === 0) {
      return path === mpPath;
    }
    if (!path.startsWith(first)) {
      return false;
    }
    let pos = first.length;
    for (const part of rest.slice(0, -1)) {
      const partPos = path.indexOf(part, pos);
      if (partPos === -1) {
        return false;
      }
      pos = partPos + part.length;
    }
    return path.slice(pos).endsWith(rest[rest.length - 1]);
  }
}
