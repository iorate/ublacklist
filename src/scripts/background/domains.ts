const DOMAIN_CHARS = /^[A-Za-z0-9.-]+$/;
const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;

export function parseDomainLine(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed === "" || trimmed.startsWith("#")) {
    return null;
  }
  if (!DOMAIN_CHARS.test(trimmed)) {
    return null;
  }
  if (trimmed.length > MAX_DOMAIN_LENGTH) {
    return null;
  }
  if (!trimmed.includes(".")) {
    return null;
  }
  const labels = trimmed.split(".");
  for (const label of labels) {
    if (
      label.length === 0 ||
      label.length > MAX_LABEL_LENGTH ||
      label.startsWith("-") ||
      label.endsWith("-")
    ) {
      return null;
    }
  }
  return trimmed;
}

export function domainsToRuleset(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const domain = parseDomainLine(line);
      return domain != null ? `*://*.${domain}/*` : "";
    })
    .join("\n");
}
