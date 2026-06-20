import fs from "node:fs/promises";
import path from "node:path";

export async function getLicenseTexts(
  files: readonly string[],
  fallbackDir: string,
): Promise<[name: string, licenseText: string][]> {
  const packageDirs: Record<string, string> = {};
  for (const file of files) {
    const dir = path.dirname(file);
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
      const entries = await fs.readdir(dir);
      const licenseFile = entries.find((entry) => /^licen[cs]e/i.test(entry));
      const licensePath =
        licenseFile != null
          ? path.join(dir, licenseFile)
          : path.join(fallbackDir, `${name}.txt`);
      const licenseText = (await fs.readFile(licensePath, "utf-8")).trim();
      licenseTexts.push([name, licenseText]);
    }),
  );
  return licenseTexts.sort(([name1], [name2]) =>
    name1 < name2 ? -1 : name1 > name2 ? 1 : 0,
  );
}
