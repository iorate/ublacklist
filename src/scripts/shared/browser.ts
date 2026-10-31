export const browser: typeof globalThis.browser =
  process.env.BROWSER === "chrome" || process.env.BROWSER === "edge"
    ? chrome
    : globalThis.browser;
