import { browser } from "./browser.ts";
import type { MessageName, MessageName0, MessageName1 } from "./types.ts";
import { websiteLocales } from "./website-locales.generated.ts";

export function translate(messageName: MessageName0): string;
export function translate(
  messageName: MessageName1,
  substitution1: string,
): string;
export function translate(
  messageName: MessageName,
  ...substitutions: readonly string[]
): string {
  return browser.i18n.getMessage(
    messageName,
    substitutions as string | string[] | undefined,
  );
}

export function getWebsiteLocale(uiLanguage: string): string {
  const [language = "", ...subtags] = uiLanguage.split("-");
  return (
    websiteLocales[[language, ...subtags].join("_")] ??
    websiteLocales[language] ??
    "en"
  );
}

export function getWebsiteURL(path: string): string {
  const locale = getWebsiteLocale(browser.i18n.getUILanguage());
  return `https://ublacklist.github.io${
    locale === "en" ? "" : `/${locale}`
  }${path.startsWith("/") ? "" : "/"}${path}`;
}
