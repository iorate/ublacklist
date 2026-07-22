import fs from "node:fs/promises";
import {
  AMO_RELEASE_NOTES_MAX_LENGTH,
  extractReleaseNotes,
  truncateReleaseNotes,
} from "./release-notes.ts";

async function main() {
  const releaseUrl = process.argv[2];
  if (!releaseUrl) {
    throw new Error(
      "Usage: pnpm node release/scripts/build-release-notes.ts <release-url>",
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
