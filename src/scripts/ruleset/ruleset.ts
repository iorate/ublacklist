import type { MatchPatternBatch } from "../../common/match-pattern";

const regExpSymbol = Symbol("RegExp");

type PlainRegExp = [pattern: string, flags?: string] & {
  [regExpSymbol]?: RegExp;
};

function execPlainRegExp(regExp: PlainRegExp, string: string): boolean {
  regExp[regExpSymbol] ||= new RegExp(regExp[0], regExp[1]);
  return regExp[regExpSymbol].test(string);
}

type Expression =
  | ["=" | "^=" | "$=" | "*=", string, string]
  | ["=~", string, PlainRegExp]
  | ["!", Expression]
  | ["&", Expression, Expression]
  | ["|", Expression, Expression];

type Batch = MatchPatternBatch<
  [value: number, line: number, expr?: Expression]
>;

type Props = {
  url: string;
  [key: string]: string;
};

class Ruleset {
  private readonly batch: Batch;
  private readonly length: number;

  constructor(batch: Batch, length: number) {
    this.batch = batch;
    this.length = length;
  }
}
