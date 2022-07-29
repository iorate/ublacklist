import { browser } from './browser';
import { MessageName, MessageName0, MessageName1 } from './types';

export function translate(messageName: MessageName0): string;
export function translate(messageName: MessageName1, substitution1: string): string;
export function translate(messageName: MessageName, ...substitutions: readonly string[]): string {
  return browser.i18n.getMessage(messageName, substitutions as string | string[] | undefined);
}

export function getWebsiteURL(path: string): string {
  const locale = translate('websiteLocale');
  return `https://iorate.github.io/ublacklist${locale === 'en' ? '' : `/${locale}`}${
    path.startsWith('/') ? '' : '/'
  }${path}`;
}
