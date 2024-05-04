import type { MessageName } from "../common/locales.ts";

export function exportAsMessages<T extends MessageName>(
  messages: Record<T, string>,
): Record<T, { message: string }> {
  return Object.fromEntries(
    Object.entries(messages).map(([messageName, message]) => [
      messageName,
      { message },
    ]),
  ) as Record<T, { message: string }>;
}
