import { Ruleset, type RulesetJSON } from "@ublacklist/ruleset";
import dayjs from "dayjs";
import { InteractiveRuleset } from "./interactive-ruleset.ts";
import { translate } from "./locales.ts";
import type {
  ErrorResult,
  PlainRuleset,
  Result,
  Subscription,
  Subscriptions,
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

// #endregion AltURL

// #region Error
export class HTTPError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`${status}${statusText ? " " : ""}${statusText}`);
    this.name = "HTTPError";
    this.status = status;
    this.statusText = statusText;
  }
}

export class UnexpectedResponse extends Error {
  readonly response: unknown;

  constructor(response: unknown) {
    super(JSON.stringify(response));
    this.name = "UnexpectedResponse";
    this.response = response;
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
    // biome-ignore lint/style/noNonNullAssertion: `queue` is not empty
    await this.queue[0]!();
    this.queue.shift();
    void this.dequeue();
  }
}
// #endregion Mutex

// #region Result
export function isErrorResult(result: Result): result is ErrorResult {
  return result.type === "error";
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

export function lines(s: string): string[] {
  return s ? s.split("\n") : [];
}

export function getSubscriptionDisplayName(
  subscription: Readonly<Subscription>,
): string {
  if (subscription.name) {
    return subscription.name;
  }
  const name = subscription.ruleset?.metadata.name;
  return typeof name === "string" ? name : subscription.url;
}

export function createInteractiveRuleset(
  blacklist: string,
  ruleset: PlainRuleset | false | null,
  subscriptions: Subscriptions,
): InteractiveRuleset {
  const userRulesetName =
    ruleset && typeof ruleset.metadata.name === "string"
      ? ruleset.metadata.name
      : translate("popup_myRulesetHeader");
  return new InteractiveRuleset(
    {
      name: userRulesetName,
      ruleset: fromPlainRuleset(ruleset || null, blacklist),
    },
    Object.values(subscriptions)
      .filter((subscription) => subscription.enabled ?? true)
      .map((subscription) => ({
        name: getSubscriptionDisplayName(subscription),
        ruleset: fromPlainRuleset(
          subscription.ruleset || null,
          subscription.blacklist,
        ),
      })),
  );
}

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

export function parseJSON(text: string): unknown {
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
          source,
          metadata: ruleset.metadata,
          ruleMap: JSON.parse(ruleset.rules) as RulesetJSON["ruleMap"],
          frontmatterUnclosed: ruleset.frontMatterUnclosed ?? false,
        }
      : source,
  );
}

export function toPlainRuleset(source: string): PlainRuleset {
  const { metadata, ruleMap, frontmatterUnclosed } = new Ruleset(
    source,
  ).toJSON();
  return {
    metadata,
    rules: JSON.stringify(ruleMap),
    frontMatterUnclosed: frontmatterUnclosed,
  };
}
