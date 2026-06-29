import fs from "node:fs/promises";
import path from "node:path";
import util from "node:util";
import * as dotenv from "dotenv";
import * as esbuild from "esbuild";
import fse from "fs-extra";
import { z } from "zod";
import pkg from "../package.json" with { type: "json" };
import { getManifest, type ManifestContext } from "../src/manifest.ts";

type Context = ManifestContext & {
  e2e: boolean;
  srcDir: string;
  destDir: string;
  additionalLicensePaths: Record<string, string>;
};

async function getStaticAssets(context: Context): Promise<string[]> {
  const { browser, srcDir } = context;
  return [
    ...(await Array.fromAsync(
      fs.glob("_locales/*/messages.json", { cwd: srcDir }),
    )),
    ...(browser === "safari"
      ? ["icons/template-icon-32.png"]
      : ["icons/icon-32.png"]),
    "icons/icon-48.png",
    "icons/icon-128.png",
    "pages/options.html",
    "pages/serpinfo/options.html",
    "pages/popup.html",
    ...(browser === "safari" ? ["scripts/import-content-script.js"] : []),
  ];
}

function getScripts(): string[] {
  return [
    "scripts/background.ts",
    "scripts/options.tsx",
    "scripts/serpinfo/content-script.ts",
    "scripts/serpinfo/options.tsx",
    "scripts/popup.tsx",
  ];
}

function getDefine(context: Context): Record<string, string> {
  const { browser, debug, e2e } = context;
  const vars = {
    NODE_ENV: debug ? "development" : "production",
    BROWSER: browser,
    DEBUG: debug ? "true" : "false",
    E2E: e2e ? "true" : "false",
    DROPBOX_API_KEY: process.env.DROPBOX_API_KEY ?? "<DROPBOX_API_KEY not set>",
    DROPBOX_API_SECRET:
      process.env.DROPBOX_API_SECRET ?? "<DROPBOX_API_SECRET not set>",
    GOOGLE_DRIVE_API_KEY:
      process.env.GOOGLE_DRIVE_API_KEY ?? "<GOOGLE_DRIVE_API_KEY not set>",
    GOOGLE_DRIVE_API_SECRET:
      process.env.GOOGLE_DRIVE_API_SECRET ??
      "<GOOGLE_DRIVE_API_SECRET not set>",
  };
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
}

async function buildStaticAssets(context: Context) {
  const { srcDir, destDir } = context;
  await Promise.all(
    (await getStaticAssets(context)).map((src) =>
      fse.copy(path.join(srcDir, src), path.join(destDir, src)),
    ),
  );
}

async function buildManifestJSON(context: Context) {
  const { destDir } = context;
  await fse.outputFile(
    path.join(destDir, "manifest.json"),
    `${JSON.stringify(getManifest(context), null, 2)}\n`,
  );
}

// Returns the input paths.
async function buildScripts(context: Context): Promise<string[]> {
  const { debug, srcDir, destDir } = context;
  const { metafile } = await esbuild.build({
    bundle: true,
    define: getDefine(context),
    entryPoints: getScripts().map((file) => path.join(srcDir, file)),
    format: "iife",
    jsx: "automatic",
    jsxDev: debug,
    loader: { ".svg": "text", ".yml": "text" },
    logLevel: "silent",
    metafile: true,
    outbase: srcDir,
    outdir: destDir,
    sourcemap: debug,
  });
  return Object.keys(metafile.inputs);
}

// From the esbuild input paths, collects the root directory of each bundled
// npm package, keyed by package name.
function collectBundledPackages(
  inputPaths: readonly string[],
): Record<string, string> {
  const packageDirs: Record<string, string> = {};
  for (const inputPath of inputPaths) {
    const segments = path.dirname(inputPath).split("/");
    const nodeModulesIndex = segments.lastIndexOf("node_modules");
    if (nodeModulesIndex === -1) {
      continue;
    }
    const scopeOrName = segments[nodeModulesIndex + 1];
    if (scopeOrName == null) {
      continue;
    }
    const hasScope = scopeOrName.startsWith("@");
    if (hasScope && segments[nodeModulesIndex + 2] == null) {
      continue;
    }
    const nameEnd = nodeModulesIndex + (hasScope ? 3 : 2);
    const name = segments.slice(nodeModulesIndex + 1, nameEnd).join("/");
    packageDirs[name] = segments.slice(0, nameEnd).join("/");
  }
  return packageDirs;
}

async function readLicense(
  name: string,
  dir: string,
  additionalLicensePaths: Readonly<Record<string, string>>,
): Promise<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const entry = entries.find(
    (entry) => entry.isFile() && /^licen[cs]e/i.test(entry.name),
  );
  const licensePath = entry
    ? path.join(dir, entry.name)
    : additionalLicensePaths[name];
  if (licensePath == null) {
    throw new Error(`No license file found for ${name}`);
  }
  return (await fs.readFile(licensePath, "utf-8")).trim();
}

async function buildThirdPartyNotices(
  context: Context,
  inputPaths: readonly string[],
): Promise<void> {
  const { destDir, additionalLicensePaths } = context;
  const packages = Object.entries(collectBundledPackages(inputPaths)).sort(
    ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
  );
  const notices = await Promise.all(
    packages.map(async ([name, dir]) => {
      const license = await readLicense(name, dir, additionalLicensePaths);
      return `${name}\n\n${license}\n`;
    }),
  );
  await fse.outputFile(
    path.join(destDir, "third-party-notices.txt"),
    notices.join("\n\n"),
  );
}

async function main() {
  dotenv.config({ path: [".env.local", ".env"], quiet: true });
  const { values: args } = util.parseArgs({
    options: {
      browser: { type: "string", short: "b" },
      debug: { type: "boolean", short: "d" },
      e2e: { type: "boolean" },
      "no-key": { type: "boolean" },
    },
  });
  const {
    browser,
    debug,
    e2e,
    "no-key": noKey,
  } = z
    .object({
      browser: z
        .enum(["chrome", "edge", "firefox", "safari"])
        .default("chrome"),
      debug: z.boolean().default(false),
      e2e: z.boolean().default(false),
      "no-key": z.boolean().default(false),
    })
    .parse(args);
  const context = {
    browser,
    version: pkg.version,
    debug,
    e2e,
    noKey,
    srcDir: "src",
    destDir: `dist/${browser}${debug ? "-debug" : ""}${e2e ? "-e2e" : ""}${noKey ? "-no-key" : ""}`,
    additionalLicensePaths: { "is-mobile": "third-party/is-mobile/LICENSE" },
  };
  await Promise.all([
    buildStaticAssets(context),
    buildManifestJSON(context),
    buildScripts(context).then((inputPaths) =>
      buildThirdPartyNotices(context, inputPaths),
    ),
  ]);
}

await main();
