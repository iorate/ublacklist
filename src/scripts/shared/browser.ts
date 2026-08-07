import type * as Browser from "webextension-polyfill";

export type { Browser };

declare global {
  var browser: unknown;
}

export const browser = (
  process.env.BROWSER === "chrome" || process.env.BROWSER === "edge"
    ? globalThis.chrome
    : globalThis.browser
) as typeof import("webextension-polyfill");
