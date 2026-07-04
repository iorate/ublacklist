import { MatchPattern } from "@ublacklist/match-pattern";
import { browser } from "./browser.ts";
import { permissionExemptOrigins } from "./constants.ts";
import { AltURL } from "./utilities.ts";

export async function requestPermission(
  urls: readonly string[],
): Promise<boolean> {
  const origins: string[] = [];
  const exemptPattern = new MatchPattern(
    permissionExemptOrigins.map((origin) => `${origin}/*`),
  );
  for (const url of urls) {
    if (exemptPattern.test(url)) {
      continue;
    }
    const u = new AltURL(url);
    origins.push(`${u.scheme}://${u.host}/*`);
  }
  // Don't call `permissions.request` when unnecessary. re #110
  return origins.length ? browser.permissions.request({ origins }) : true;
}
