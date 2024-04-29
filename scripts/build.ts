import fs from "node:fs/promises";
import module from "node:module";
import path from "node:path";
import url from "node:url";
import util from "node:util";
import chalk from "chalk";
import * as chokidar from "chokidar";
import dayjs from "dayjs";
import * as dotenv from "dotenv";
import * as esbuild from "esbuild";
import { globby } from "globby";
import pLimit from "p-limit";
import { z } from "zod";

type Context = {
  browser: "chrome" | "firefox" | "safari";
  version: string;
  debug: boolean;
  watch: boolean;
  srcDir: string;
  destDir: string;
  define: Record<string, string>;
};

async function copyAssets({ browser, watch, srcDir, destDir }: Context) {
  const files = [
    ...(browser === "safari"
      ? ["icons/template-icon-32.png"]
      : ["icons/icon-32.png"]),
    "icons/icon-48.png",
    "icons/icon-128.png",
    "pages/options.html",
    "pages/popup.html",
    ...(watch && browser === "chrome" ? ["pages/watch.html"] : []),
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

async function buildJsonTs({ srcDir, destDir, define }: Context) {
  const files = [
    ...(await globby("_locales/*/messages.json.ts", { cwd: srcDir })),
    "manifest.json.ts",
  ];
  await esbuild.build({
    bundle: true,
    define,
    entryPoints: files.map((file) => path.join(srcDir, file)),
    format: "cjs",
    logLevel: "silent",
    outExtension: { ".js": ".cjs" },
    outbase: srcDir,
    outdir: destDir,
  });
  const require = module.createRequire(import.meta.url);
  await Promise.all(
    files.map(async (file) => {
      const dest = path.join(destDir, file.slice(0, -3)); // Remove ".ts"
      const destCjsRelative = path.relative(
        path.dirname(url.fileURLToPath(import.meta.url)),
        `${dest}.cjs`,
      ); // Relative to this script
      delete require.cache[require.resolve(destCjsRelative)]; // Invalidate cache
      const { default: content } = z
        .object({ default: z.unknown() })
        .parse(require(destCjsRelative));
      await fs.rm(`${dest}.cjs`);
      await fs.writeFile(dest, `${JSON.stringify(content, null, 2)}\n`);
    }),
  );
}

async function buildTs({
  browser,
  debug,
  watch,
  srcDir,
  destDir,
  define,
}: Context) {
  const files = [
    "scripts/background.ts",
    "scripts/content-script.tsx",
    "scripts/options.tsx",
    "scripts/popup.tsx",
    ...(watch && browser === "chrome"
      ? ["scripts/watch.ts", "scripts/watch-worker.ts"]
      : []),
  ];
  await esbuild.build({
    bundle: true,
    define,
    entryPoints: files.map((file) => path.join(srcDir, file)),
    format: "esm",
    jsx: "automatic",
    jsxDev: debug,
    // https://github.com/evanw/esbuild/issues/3418
    loader: { ".svg": "text" },
    logLevel: "silent",
    outbase: srcDir,
    outdir: destDir,
    sourcemap: debug,
  });
}

async function build(context: Context) {
  if (context.watch) {
    process.stdout.write(`[${dayjs().format("HH:mm:ss")}] `);
  }
  process.stdout.write("Building... ");
  try {
    await Promise.all([
      copyAssets(context),
      buildJsonTs(context),
      buildTs(context),
    ]);
    if (context.watch && context.browser === "chrome") {
      await fs.writeFile(path.join(context.destDir, ".watch"), "");
    }
    process.stdout.write(chalk.green("✔\n"));
  } catch (error) {
    process.stdout.write(chalk.red("✘\n"));
    if (error instanceof Error) {
      process.stderr.write(`${error.toString()}\n`);
    }
    if (!context.watch) {
      process.exitCode = 1;
    }
  }
}

function defineProcessEnv(
  vars: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
}

async function main() {
  dotenv.config({ path: [".env.local", ".env"] });

  const { values } = util.parseArgs({
    options: {
      browser: { type: "string", short: "b" },
      version: { type: "string", short: "v" },
      debug: { type: "boolean", short: "d" },
      watch: { type: "boolean", short: "w" },
    },
  });
  const { browser, version, debug, watch } = z
    .object({
      browser: z.enum(["chrome", "firefox", "safari"]).default("chrome"),
      version: z.string().default("0.1.0"),
      debug: z.boolean().default(false),
      watch: z.boolean().default(false),
    })
    .parse(values);

  const context = {
    browser,
    version,
    debug,
    watch,
    srcDir: "src",
    destDir: `dist/${browser}${debug ? "-debug" : ""}`,
    define: defineProcessEnv({
      NODE_ENV: debug ? "development" : "production",
      BROWSER: browser,
      VERSION: version,
      DEBUG: debug ? "true" : "false",
      WATCH: watch ? "true" : "false",
      DROPBOX_API_KEY: process.env.DROPBOX_API_KEY,
      DROPBOX_API_SECRET: process.env.DROPBOX_API_SECRET,
      GOOGLE_DRIVE_API_KEY: process.env.GOOGLE_DRIVE_API_KEY,
      GOOGLE_DRIVE_API_SECRET: process.env.GOOGLE_DRIVE_API_SECRET,
    }),
  };

  await build(context);
  if (watch) {
    await new Promise((_resolve, reject) => {
      const limit = pLimit(1);
      chokidar
        .watch(context.srcDir, { ignoreInitial: true })
        .on("all", () => {
          if (limit.pendingCount === 0) {
            limit(() => build(context));
          }
        })
        .on("error", reject);
    });
  }
}

await main();
