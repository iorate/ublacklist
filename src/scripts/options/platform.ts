import type { Browser } from "../shared/browser.ts";

let platformInfo: Browser.Runtime.PlatformInfo | null = null;

export function initializePlatform(info: Browser.Runtime.PlatformInfo): void {
  platformInfo = info;
}

export function getOS(): Browser.Runtime.PlatformInfo["os"] {
  if (!platformInfo) {
    throw new Error("getOS: platform info is not initialized");
  }
  return platformInfo.os;
}
