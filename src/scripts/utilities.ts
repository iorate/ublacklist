import dayjs from "dayjs";
import { Ruleset, type RulesetJSON } from "./ruleset/ruleset.ts";
import type {
  ErrorResult,
  PlainRuleset,
  Result,
  SuccessResult,
} from "./types.ts";

// #region AltURL
export class AltURL {
  readonly scheme: string;
  readonly host: string;
  readonly path: string;

  constructor(url: string) {
    const u = new URL(url);
    this.scheme = u.protocol.slice(0, -1);
    this.host = u.hostname;
    this.path = `${u.pathname}${u.search}`;
  }

  toString(): string {
    return `${this.scheme}://${this.host}${this.path}`;
  }
}

export function makeAltURL(url: string): AltURL | null {
  try {
    return new AltURL(url);
  } catch {
    return null;
  }
}
// #endregion AltURL

// #region Error
export class HTTPError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
  ) {
    super(`${status}${statusText ? " " : ""}${statusText}`);
    this.name = "HTTPError";
  }
}

export class UnexpectedResponse extends Error {
  constructor(readonly response: unknown) {
    super(JSON.stringify(response));
    this.name = "UnexpectedResponse";
  }
}
// #endregion Error

// #region Mutex
export class Mutex {
  private queue: (() => Promise<void>)[] = [];

  lock<T>(func: () => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await Promise.resolve(func()));
        } catch (e: unknown) {
          reject(e);
        }
      });
      if (this.queue.length === 1) {
        void this.dequeue();
      }
    });
  }

  private async dequeue(): Promise<void> {
    if (!this.queue.length) {
      return;
    }
    await this.queue[0]();
    this.queue.shift();
    void this.dequeue();
  }
}
// #endregion Mutex

// #region Result
export function isErrorResult(result: Result): result is ErrorResult {
  return result.type === "error";
}

export function isSuccessResult(result: Result): result is SuccessResult {
  return result.type === "success";
}

export function errorResult(message: string): ErrorResult {
  return {
    type: "error",
    message,
  };
}

export function successResult(): SuccessResult {
  return {
    type: "success",
    timestamp: dayjs().toISOString(),
  };
}
// #endregion Result

// #region object
export function stringKeys<Key extends string, Value>(
  record: Readonly<Record<Key, Value>>,
): Key[] {
  return Object.keys(record) as Key[];
}

export function stringEntries<Key extends string, Value>(
  record: Readonly<Record<Key, Value>>,
): [Key, Value][] {
  return Object.entries(record) as [Key, Value][];
}

export function numberKeys<Key extends number, Value>(
  record: Readonly<Record<Key, Value>>,
): Key[] {
  return Object.keys(record).map(Number) as Key[];
}

export function numberEntries<Key extends number, Value>(
  record: Readonly<Record<Key, Value>>,
): [Key, Value][] {
  return Object.entries(record).map(([key, value]) => [Number(key), value]) as [
    Key,
    Value,
  ][];
}
// #endregion object

// #region string
export function lines(s: string): string[] {
  return s ? s.split("\n") : [];
}
// #endregion string

export function downloadTextFile(
  filename: string,
  mimeType: string,
  content: string,
): void {
  const a = document.createElement("a");
  a.href = `data:${mimeType},${encodeURIComponent(content)}`;
  a.download = filename;
  a.click();
}

export function uploadTextFile(mimeType: string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const fileInput = document.createElement("input");
    fileInput.accept = mimeType;
    fileInput.type = "file";
    fileInput.addEventListener("input", () => {
      const file = fileInput.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        resolve(fileReader.result as string);
      });
      fileReader.addEventListener("error", () => {
        resolve(null);
      });
      fileReader.readAsText(file);
    });
    fileInput.click();
  });
}

export function svgToDataURL(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function parseJSON(text: string): string | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function fromPlainRuleset(
  ruleset: PlainRuleset | null,
  source: string,
): Ruleset {
  return new Ruleset(
    ruleset
      ? {
          source: source.split("\n"),
          metadata: ruleset.metadata,
          rules: JSON.parse(ruleset.rules) as RulesetJSON["rules"],
        }
      : source,
  );
}

export function toPlainRuleset(source: string): PlainRuleset {
  const { metadata, rules } = new Ruleset(source).toJSON();
  return { metadata, rules: JSON.stringify(rules) };
}
