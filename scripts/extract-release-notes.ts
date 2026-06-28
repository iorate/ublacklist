import fs from "node:fs/promises";

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

async function main() {
  const changelog = await fs.readFile("CHANGELOG.md", "utf8");
  await fs.mkdir("dist", { recursive: true });
  await fs.writeFile(
    "dist/release-notes.md",
    `${extractReleaseNotes(changelog)}\n`,
  );
}

if (import.meta.main) {
  await main();
}
