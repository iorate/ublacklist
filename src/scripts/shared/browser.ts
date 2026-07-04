import type * as Browser from "webextension-polyfill";

export type { Browser };

declare global {
  var browser: unknown;
}

// biome-ignore lint/suspicious/noRedeclare: This is an exported variable
export const browser = (
  process.env.BROWSER === "chrome" || process.env.BROWSER === "edge"
    ? globalThis.chrome
    : globalThis.browser
) as typeof import("webextension-polyfill");
