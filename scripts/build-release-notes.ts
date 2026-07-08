import fs from "node:fs/promises";

export const AMO_RELEASE_NOTES_MAX_LENGTH = 3000;

export function extractReleaseNotes(changelog: string): string {
  // # <package>
  //
  // ## <version>   <- latest release
  //
  // ...body...     <- what we want
  //
  // ## <version>   <- previous release
  //
  // ...body...
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.startsWith("## "));
  if (start === -1) {
    throw new Error("No version heading (`## `) found in CHANGELOG.md");
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

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

async function main() {
  const releaseUrl = process.argv[2];
  if (!releaseUrl) {
    throw new Error(
      "Usage: pnpm node scripts/build-release-notes.ts <release-url>",
    );
  }
  const changelog = await fs.readFile("CHANGELOG.md", "utf8");
  const notes = extractReleaseNotes(changelog);
  await fs.mkdir("dist/release/github", { recursive: true });
  await fs.writeFile("dist/release/github/release-notes.md", `${notes}\n`);
  await fs.mkdir("dist/release/firefox", { recursive: true });
  await fs.writeFile(
    "dist/release/firefox/release-notes.md",
    `${truncateReleaseNotes(notes, AMO_RELEASE_NOTES_MAX_LENGTH, releaseUrl)}\n`,
  );
}

if (import.meta.main) {
  await main();
}
