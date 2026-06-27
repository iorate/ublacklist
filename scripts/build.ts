import fs from "node:fs/promises";
import path from "node:path";
import util from "node:util";
import * as dotenv from "dotenv";
import * as esbuild from "esbuild";
import fse from "fs-extra";
import { z } from "zod";
import { getManifest, type ManifestContext } from "../src/manifest.ts";
import { getLicenseTexts } from "./get-license-texts.ts";

type Context = ManifestContext & {
  e2e: boolean;
  srcDir: string;
  destDir: string;
  licenseFallbackDir: string;
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
  const { browser, version, debug, e2e } = context;
  const vars = {
    NODE_ENV: debug ? "development" : "production",
    BROWSER: browser,
    VERSION: version,
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

async function buildThirdPartyNotices(
  context: Context,
  paths: readonly string[],
): Promise<void> {
  const { destDir, licenseFallbackDir } = context;
  const licenseTexts = await getLicenseTexts(paths, licenseFallbackDir);
  const thirdPartyNotices = licenseTexts
    .map(([name, licenseText]) => `${name}\n\n${licenseText}\n`)
    .join("\n\n");
  await fse.outputFile(
    path.join(destDir, "third-party-notices.txt"),
    thirdPartyNotices,
  );
}

async function main() {
  dotenv.config({ path: [".env.local", ".env"], quiet: true });
  const { values: args } = util.parseArgs({
    options: {
      browser: { type: "string", short: "b" },
      version: { type: "string", short: "v" },
      debug: { type: "boolean", short: "d" },
      e2e: { type: "boolean" },
      "no-key": { type: "boolean" },
    },
  });
  const {
    browser,
    version,
    debug,
    e2e,
    "no-key": noKey,
  } = z
    .object({
      browser: z
        .enum(["chrome", "edge", "firefox", "safari"])
        .default("chrome"),
      version: z.string().default("0.1.0"),
      debug: z.boolean().default(false),
      e2e: z.boolean().default(false),
      "no-key": z.boolean().default(false),
    })
    .parse(args);
  const context = {
    browser,
    version,
    debug,
    e2e,
    noKey,
    srcDir: "src",
    destDir: `dist/${browser}${debug ? "-debug" : ""}${e2e ? "-e2e" : ""}${noKey ? "-no-key" : ""}`,
    licenseFallbackDir: "licenses",
  };
  await Promise.all([
    buildStaticAssets(context),
    buildManifestJSON(context),
    buildScripts(context).then((paths) =>
      buildThirdPartyNotices(context, paths),
    ),
  ]);
}

await main();
