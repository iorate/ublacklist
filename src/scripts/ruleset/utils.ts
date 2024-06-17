export function parseString(string: string): string {
  return string
    .slice(1, -1)
    .replaceAll(
      /\\(?:0[0-9]?|u(?:[0-9A-Fa-f]{4}|\{(?:10[0-9A-Fa-f]{4}|0[0-9A-Fa-f]{5}|[0-9A-Fa-f]{1,5})\})?|x(?:[0-9A-Fa-f]{2})?|.)/g,
      (s: string): string => {
        // biome-ignore lint/style/noNonNullAssertion: The regular expression guarantees that `s` has at least two characters
        const c = s[1]!;
        if (c === "0") {
          if (s.length > 2) {
            throw new SyntaxError("Deprecated octal escape sequence");
          }
          // "\0"
          return "\0";
        }
        if (c === "u") {
          if (s.length === 2) {
            throw new SyntaxError("Invalid Unicode escape sequence");
          }
          if (s[2] === "{") {
            // "\u{2F804}"
            return String.fromCodePoint(Number.parseInt(s.slice(3, -1), 16));
          }
          // "\u00A9"
          return String.fromCodePoint(Number.parseInt(s.slice(2), 16));
        }
        if (c === "x") {
          if (s.length === 2) {
            throw new SyntaxError("Invalid hexadecimal escape sequence");
          }
          // "\xA9"
          return String.fromCodePoint(Number.parseInt(s.slice(2), 16));
        }
        return { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v" }[c] ?? c;
      },
    );
}

export function parseRegExp(regExp: string): {
  pattern: string;
  flags: string;
} {
  const patternEnd = regExp.lastIndexOf("/");
  const pattern = regExp.slice(1, patternEnd);
  const flags = regExp.slice(patternEnd + 1);
  new RegExp(pattern, flags);
  return { pattern, flags };
}
