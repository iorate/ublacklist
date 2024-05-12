export function parseString(string: string): string {
  return string
    .slice(1, -1)
    .replaceAll(
      /\\(?:[0-3][0-7]{2}|[0-7]{1,2}|u(?:[0-9A-Fa-f]{4}|\{(?:10[0-9A-Fa-f]{4}|0[0-9A-Fa-f]{5}|[0-9A-Fa-f]{1,5})\})?|x(?:[0-9A-Fa-f]{2})?|.)/g,
      (s: string): string => {
        // biome-ignore lint/style/noNonNullAssertion: The regular expression guarantees that `s` has at least two characters
        const c = s[1]!;
        if (/^[0-7]$/.test(c)) {
          return String.fromCodePoint(Number.parseInt(s.slice(1), 8));
        }
        if (c === "u") {
          if (s.length < 3) {
            throw new SyntaxError("Invalid Unicode escape sequence");
          }
          if (s[2] !== "{") {
            return String.fromCodePoint(Number.parseInt(s.slice(2), 16));
          }
          return String.fromCodePoint(Number.parseInt(s.slice(3, -1), 16));
        }
        if (c === "x") {
          if (s.length < 3) {
            throw new SyntaxError("Invalid hexadecimal escape sequence");
          }
          return String.fromCodePoint(Number.parseInt(s.slice(2), 16));
        }
        if (c === "n") {
          return "\n";
        }
        if (c === "r") {
          return "\r";
        }
        if (c === "v") {
          return "\v";
        }
        if (c === "t") {
          return "\t";
        }
        if (c === "b") {
          return "\b";
        }
        if (c === "f") {
          return "\f";
        }
        return c;
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
