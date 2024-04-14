import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import util from "node:util";
import * as dotenv from "dotenv";
import * as esbuild from "esbuild";
import { globby } from "globby";
import { z } from "zod";

type Context = {
  browser: "chrome" | "firefox" | "safari";
  debug: boolean;
  version: string;
  srcDir: string;
  destDir: string;
};

async function copyAssets({ browser, srcDir, destDir }: Context) {
  const files = [
    ...(browser === "safari"
      ? ["icons/template-icon-32.png"]
      : ["icons/icon-32.png"]),
    "icons/icon-48.png",
    "icons/icon-128.png",
    "pages/options.html",
    "pages/popup.html",
    "scripts/active.js",
    "third-party-notices.txt",
  ];
  await Promise.all(
    files.map(async (file) => {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }),
  );
}

async function buildJsonTs({
  browser,
  debug,
  version,
  srcDir,
  destDir,
}: Context) {
  const files = [
    ...(await globby("_locales/*/messages.json.ts", { cwd: srcDir })),
    "manifest.json.ts",
  ];
  process.env.NODE_ENV = debug ? "development" : "production";
  process.env.BROWSER = browser;
  process.env.DEBUG = debug ? "true" : "false";
  process.env.VERSION = version;
  await Promise.all(
    files.map(async (file) => {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file.slice(0, -3)); // Remove ".ts"
      const { default: content } = await import(
        url.pathToFileURL(src).toString()
      );
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, `${JSON.stringify(content, null, 2)}\n`);
    }),
  );
}

async function buildTs({ browser, debug, version, srcDir, destDir }: Context) {
  const files = [
    "scripts/background.ts",
    "scripts/content-script.tsx",
    "scripts/options.tsx",
    "scripts/popup.tsx",
  ];
  const env = {
    NODE_ENV: debug ? "development" : "production",
    BROWSER: browser,
    DEBUG: debug ? "true" : "false",
    VERSION: version,
    DROPBOX_API_KEY: process.env.DROPBOX_API_KEY,
    DROPBOX_API_SECRET: process.env.DROPBOX_API_SECRET,
    GOOGLE_DRIVE_API_KEY: process.env.GOOGLE_DRIVE_API_KEY,
    GOOGLE_DRIVE_API_SECRET: process.env.GOOGLE_DRIVE_API_SECRET,
  };
  await esbuild.build({
    bundle: true,
    define: Object.fromEntries(
      Object.entries(env).map(([key, value]) => [
        `process.env.${key}`,
        JSON.stringify(value),
      ]),
    ),
    entryPoints: files.map((file) => path.join(srcDir, file)),
    format: "esm",
    jsx: "automatic",
    jsxDev: debug,
    // https://github.com/evanw/esbuild/issues/3418
    loader: { ".svg": "text" },
    outbase: srcDir,
    outdir: destDir,
    sourcemap: debug,
  });
}

async function main() {
  dotenv.config({ path: [".env.local", ".env"] });

  const { values } = util.parseArgs({
    options: {
      browser: { type: "string", short: "b" },
      debug: { type: "boolean", short: "d" },
      version: { type: "string", short: "v" },
    },
  });
  const { browser, debug, version } = z
    .object({
      browser: z.enum(["chrome", "firefox", "safari"]).default("chrome"),
      debug: z.boolean().default(false),
      version: z.string().default("0.1.0"),
    })
    .parse(values);

  const context = {
    browser,
    debug,
    version,
    srcDir: "src",
    destDir: `dist/${browser}${debug ? "-debug" : ""}`,
  };
  await Promise.all([
    copyAssets(context),
    buildJsonTs(context),
    buildTs(context),
  ]);
}

await main();
