import type { MessageName, Messages } from "../common/locales.ts";

export function exportAsMessages(
  messages: Partial<Messages>,
): Partial<Record<MessageName, { message: string }>> {
  return Object.fromEntries(
    Object.entries(messages).map(([messageName, message]) => [
      messageName,
      { message },
    ]),
  ) as Partial<Record<MessageName, { message: string }>>;
}
