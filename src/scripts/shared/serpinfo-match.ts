import { MatchPattern } from "@ublacklist/match-pattern";
import type { SerpDescription } from "@ublacklist/serpinfo";

export function serpMatchesUrl(
  serp: SerpDescription,
  url: string,
  mobile: boolean,
): boolean {
  if (!new MatchPattern(serp.matches).test(url)) {
    return false;
  }
  if (serp.excludeMatches && new MatchPattern(serp.excludeMatches).test(url)) {
    return false;
  }
  if (serp.includeRegex && !new RegExp(serp.includeRegex).test(url)) {
    return false;
  }
  if (serp.excludeRegex && new RegExp(serp.excludeRegex).test(url)) {
    return false;
  }
  if (
    (serp.userAgent === "desktop" && mobile) ||
    (serp.userAgent === "mobile" && !mobile)
  ) {
    return false;
  }
  return true;
}
