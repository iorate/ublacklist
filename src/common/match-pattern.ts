export type MatchPatternScheme = "*" | "http" | "https" | "ftp";

export type ParsedMatchPattern = {
  scheme: MatchPatternScheme;
  host: string;
  path: string;
};

export function parseMatchPattern(input: string): ParsedMatchPattern | null {
  const m = /^(\*|https?|ftp):\/\/(\*|(?:\*\.)?[^/*]+)(\/.*)$/.exec(
    input.trim(),
  );
  return m && { scheme: m[1] as MatchPatternScheme, host: m[2], path: m[3] };
}
