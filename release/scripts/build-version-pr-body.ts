import fs from "node:fs/promises";
import pkg from "../../package.json" with { type: "json" };
import { extractReleaseNotes } from "./release-notes.ts";

async function main() {
  const outPath = process.argv[2];
  if (!outPath) {
    throw new Error(
      "Usage: pnpm node release/scripts/build-version-pr-body.ts <output-path>",
    );
  }
  const changelog = await fs.readFile("CHANGELOG.md", "utf8");
  await fs.writeFile(
    outPath,
    `## ${pkg.version}\n\n${extractReleaseNotes(changelog)}\n`,
  );
}

if (import.meta.main) {
  await main();
}
