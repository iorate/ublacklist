import { MessageName } from '../common/locales';

export function exportAsMessages(
  filename: string,
  messages: Partial<Record<MessageName, string>>,
): void {
  exportAsJSON(
    filename,
    Object.fromEntries(
      Object.entries(messages).map(([messageName, message]) => [messageName, { message }]),
    ),
  );
}
