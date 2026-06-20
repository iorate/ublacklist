import fs from "node:fs/promises";
import path from "node:path";

export async function getLicenseTexts(
  paths: readonly string[],
  fallbackDir: string,
): Promise<[name: string, licenseText: string][]> {
  const packageDirs: Record<string, string> = {};
  for (const path_ of paths) {
    const dir = path.dirname(path_);
    const dirs = dir.split("/");
    const nodeModulesIndex = dirs.lastIndexOf("node_modules");
    if (nodeModulesIndex === -1) {
      continue;
    }
    const scopeOrPackage = dirs[nodeModulesIndex + 1];
    if (scopeOrPackage == null) {
      continue;
    }
    if (scopeOrPackage.startsWith("@")) {
      const package_ = dirs[nodeModulesIndex + 2];
      if (package_ == null) {
        continue;
      }
      packageDirs[`${scopeOrPackage}/${package_}`] = dirs
        .slice(0, nodeModulesIndex + 3)
        .join("/");
    } else {
      packageDirs[scopeOrPackage] = dirs
        .slice(0, nodeModulesIndex + 2)
        .join("/");
    }
  }
  const licenseTexts: [string, string][] = [];
  await Promise.all(
    Object.entries(packageDirs).map(async ([name, dir]) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const licenseEntry = entries.find(
        (entry) => entry.isFile() && /^licen[cs]e/i.test(entry.name),
      );
      const licensePath = licenseEntry
        ? path.join(dir, licenseEntry.name)
        : path.join(fallbackDir, `${name}.txt`);
      const licenseText = (await fs.readFile(licensePath, "utf-8")).trim();
      licenseTexts.push([name, licenseText]);
    }),
  );
  return licenseTexts.sort(([name1], [name2]) =>
    name1 < name2 ? -1 : name1 > name2 ? 1 : 0,
  );
}
