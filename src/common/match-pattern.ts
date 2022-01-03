export type MatchPatternScheme = '*' | 'http' | 'https' | 'ftp';

export type ParsedMatchPattern = {
  scheme: MatchPatternScheme;
  host: string;
  path: string;
};

export function parseMatchPattern(input: string): ParsedMatchPattern | null {
  input = input.trim();
  const m = /^(\*|https?|ftp):\/\/(\*|(?:\*\.)?[^/*]+)(\/.*)$/.exec(input);
  return m && { scheme: m[1] as MatchPatternScheme, host: m[2], path: m[3] };
}
