import { browser } from "./browser.ts";
import { locales } from "./locales.generated.ts";
import type { MessageName, MessageName0, MessageName1 } from "./types.ts";

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

export function resolveLocale(uiLanguage: string): string {
  if (Object.hasOwn(locales, uiLanguage)) {
    return uiLanguage;
  }
  const [language = ""] = uiLanguage.split("-");
  return Object.hasOwn(locales, language) ? language : "en";
}

export function getLocale(): string {
  return resolveLocale(browser.i18n.getUILanguage());
}

export function getDayjsLocale(): string {
  return locales[getLocale()]?.dayjs ?? "en";
}

export function getWebsiteURL(path: string): string {
  const locale = getLocale();
  return `https://ublacklist.github.io${
    locales[locale]?.website ? `/${locale}` : ""
  }${path.startsWith("/") ? "" : "/"}${path}`;
}
