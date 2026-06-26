import type { Page } from "@playwright/test";

export async function sendMessage<T = unknown>(
  from: Page,
  type: string,
  args: unknown[] = [],
): Promise<T> {
  return from.evaluate(
    async ({ type, args }) => {
      const response = await chrome.runtime.sendMessage({ type, args });
      if (response === undefined) {
        throw new Error("No response");
      }
      if (response === null || typeof response !== "object") {
        throw new Error("Invalid response");
      }
      return (response as { value?: unknown }).value;
    },
    { type, args },
  ) as Promise<T>;
}
