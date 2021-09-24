import { apis } from './apis';
import { MessageName, MessageName0, MessageName1 } from './types';

export function translate(messageName: MessageName0): string;
export function translate(messageName: MessageName1, substitution1: string): string;
export function translate(messageName: MessageName, ...substitutions: readonly string[]): string {
  return apis.i18n.getMessage(messageName, substitutions);
}
