let platformInfo: browser.runtime.PlatformInfo | null = null;

export function initializePlatform(info: browser.runtime.PlatformInfo): void {
  platformInfo = info;
}

export function getOS(): browser.runtime.PlatformInfo["os"] {
  if (!platformInfo) {
    throw new Error("getOS: platform info is not initialized");
  }
  return platformInfo.os;
}
