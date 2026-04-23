import * as tldts from "tldts";

// Includes private TLDs (e.g. `pp.ua`, `github.io`) as effective TLDs.
export function getRegistrableDomain(host: string): string | null {
  return tldts.getDomain(host, { allowPrivateDomains: true });
}
