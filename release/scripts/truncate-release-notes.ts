import { text } from "node:stream/consumers";

export function truncateReleaseNotes(
  notes: string,
  limit: number,
  releaseUrl: string,
): string {
  if (notes.length <= limit) {
    return notes;
  }
  const suffix = `[See the full release notes](${releaseUrl})`;
  const paragraphs = notes.split(/\n{2,}/);
  const kept: string[] = [];
  let length = suffix.length;
  for (const paragraph of paragraphs) {
    length += paragraph.length + 2;
    if (length > limit) {
      break;
    }
    kept.push(paragraph);
  }
  return [...kept, suffix].join("\n\n");
}

async function main(): Promise<void> {
  const [, , limitArg, releaseUrl] = process.argv;
  if (limitArg == null || releaseUrl == null) {
    throw new Error(
      "Usage: node release/scripts/truncate-release-notes.ts <limit> <release-url>",
    );
  }
  const limit = Number(limitArg);
  if (Number.isNaN(limit)) {
    throw new Error(`Invalid limit: ${limitArg}`);
  }
  const releaseNotes = await text(process.stdin);
  const truncated = truncateReleaseNotes(releaseNotes, limit, releaseUrl);
  process.stdout.write(`${truncated}\n`);
}

if (import.meta.main) {
  await main();
}
