import module from "node:module";
import os from "node:os";
import path from "node:path";
import util from "node:util";
import chalk from "chalk";
import * as chokidar from "chokidar";
import dayjs from "dayjs";
import * as dotenv from "dotenv";
import * as esbuild from "esbuild";
import fs from "fs-extra";
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
  tempDir: string;
};

function createGetUpdatedFiles(files: string[]): () => Promise<string[]> {
  let mtimes: [string, number | null][] = files.map((file) => [file, null]);
  return async () => {
    const updatedFiles: string[] = [];
    mtimes = await Promise.all(
      mtimes.map(async ([file, mtime]) => {
        const { mtimeMs: newMtime } = await fs.stat(file);
        if (newMtime !== mtime) {
          updatedFiles.push(file);
        }
        return [file, newMtime];
      }),
    );
    return updatedFiles;
  };
}

function defineProcessEnv(context: Context): Record<string, string> {
  const { browser, version, debug, watch } = context;
  const vars = {
    NODE_ENV: debug ? "development" : "production",
    BROWSER: browser,
    VERSION: version,
    DEBUG: debug ? "true" : "false",
    WATCH: watch ? "true" : "false",
    DROPBOX_API_KEY: process.env.DROPBOX_API_KEY,
    DROPBOX_API_SECRET: process.env.DROPBOX_API_SECRET,
    GOOGLE_DRIVE_API_KEY: process.env.GOOGLE_DRIVE_API_KEY,
    GOOGLE_DRIVE_API_SECRET: process.env.GOOGLE_DRIVE_API_SECRET,
  };
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
}

async function createCopyFiles(context: Context): Promise<() => Promise<void>> {
  const { browser, watch, srcDir, destDir } = context;
  const sources = [
    ...(browser === "safari"
      ? ["icons/template-icon-32.png"]
      : ["icons/icon-32.png"]),
    "icons/icon-48.png",
    "icons/icon-128.png",
    "pages/options.html",
    "pages/popup.html",
    ...(watch && browser === "chrome" ? ["pages/watch.html"] : []),
    "scripts/active.js",
    ...(browser === "safari" ? ["scripts/import-content-script.js"] : []),
    "third-party-notices.txt",
  ];
  if (watch) {
    const getUpdateSources = createGetUpdatedFiles(
      sources.map((src) => path.join(srcDir, src)),
    );
    return async () => {
      const updatedSources = await getUpdateSources();
      await Promise.all(
        updatedSources.map((src) =>
          fs.copy(src, path.join(destDir, path.relative(srcDir, src))),
        ),
      );
    };
  }
  return async () => {
    await Promise.all(
      sources.map((src) =>
        fs.copy(path.join(srcDir, src), path.join(destDir, src)),
      ),
    );
  };
}

async function createBuildJSON(context: Context): Promise<() => Promise<void>> {
  const { watch, srcDir, destDir, tempDir } = context;
  const sources = [
    ...(await globby("_locales/*/messages.json.ts", { cwd: srcDir })),
    "manifest.json.ts",
  ];
  const esbuildOptions: esbuild.BuildOptions = {
    bundle: true,
    define: defineProcessEnv(context),
    entryPoints: sources.map((src) => path.join(srcDir, src)),
    format: "cjs",
    logLevel: "silent",
    outExtension: { ".js": ".cjs" },
    outbase: srcDir,
    outdir: tempDir,
  };
  const require = module.createRequire(import.meta.url);
  const requireModule = (mod: string): string => {
    const modulePath = path.resolve(mod);
    delete require.cache[require.resolve(modulePath)];
    const exports: unknown = require(modulePath);
    const { default: defaultExport } = z
      .object({ default: z.unknown() })
      .parse(exports);
    return `${JSON.stringify(defaultExport, null, 2)}\n`;
  };
  if (watch) {
    const esbuildContext = await esbuild.context(esbuildOptions);
    const getUpdatedModules = createGetUpdatedFiles(
      sources.map((src) => path.join(tempDir, `${src.slice(0, -3)}.cjs`)),
    );
    return async () => {
      await esbuildContext.rebuild();
      const updatedModules = await getUpdatedModules();
      await Promise.all(
        updatedModules.map((mod) =>
          fs.outputFile(
            path.join(destDir, path.relative(tempDir, mod).slice(0, -4)),
            requireModule(mod),
          ),
        ),
      );
    };
  }
  return async () => {
    await esbuild.build(esbuildOptions);
    await Promise.all(
      sources.map(async (src) =>
        fs.outputFile(
          path.join(destDir, src.slice(0, -3)),
          requireModule(path.join(tempDir, `${src.slice(0, -3)}.cjs`)),
        ),
      ),
    );
  };
}

async function createBuildScripts(
  context: Context,
): Promise<() => Promise<void>> {
  const { browser, debug, watch, srcDir, destDir } = context;
  const sources = [
    "scripts/background.ts",
    "scripts/content-script.tsx",
    "scripts/options.tsx",
    "scripts/popup.tsx",
    ...(watch && browser === "chrome"
      ? ["scripts/watch.ts", "scripts/watch-worker.ts"]
      : []),
  ];
  const esbuildOptions: esbuild.BuildOptions = {
    bundle: true,
    define: defineProcessEnv(context),
    entryPoints: sources.map((file) => path.join(srcDir, file)),
    format: "iife",
    jsx: "automatic",
    jsxDev: debug,
    // https://github.com/evanw/esbuild/issues/3418
    loader: { ".svg": "text" },
    logLevel: "silent",
    outbase: srcDir,
    outdir: destDir,
    sourcemap: debug,
  };
  if (watch) {
    const esbuildContext = await esbuild.context(esbuildOptions);
    return async () => {
      await esbuildContext.rebuild();
    };
  }
  return async () => {
    await esbuild.build(esbuildOptions);
  };
}

async function createBuild(context: Context): Promise<() => Promise<void>> {
  const { browser, watch, destDir } = context;
  const [copyFiles, buildJSON, buildScripts] = await Promise.all([
    createCopyFiles(context),
    createBuildJSON(context),
    createBuildScripts(context),
  ]);
  return async () => {
    if (watch) {
      process.stdout.write(`[${dayjs().format("HH:mm:ss")}] `);
    }
    process.stdout.write("Building... ");
    try {
      await Promise.all([copyFiles(), buildJSON(), buildScripts()]);
      if (watch && browser === "chrome") {
        await fs.outputFile(path.join(destDir, ".watch"), "");
      }
      process.stdout.write(chalk.green("✔\n"));
    } catch (error) {
      process.stdout.write(chalk.red("✘\n"));
      if (error instanceof Error) {
        process.stderr.write(`${error.toString()}\n`);
      }
      if (!watch) {
        process.exitCode = 1;
      }
    }
  };
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

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ublacklist-"));
  process.on("exit", () => {
    fs.removeSync(tempDir);
  });
  process.on("SIGINT", () => {
    process.exit();
  });

  const context = {
    browser,
    version,
    debug,
    watch,
    srcDir: "src",
    destDir: `dist/${browser}${debug ? "-debug" : ""}`,
    tempDir,
  };
  const build = await createBuild(context);
  await build();
  if (watch) {
    await new Promise((_resolve, reject) => {
      const limit = pLimit(1);
      chokidar
        .watch(context.srcDir, { ignoreInitial: true })
        .on("all", () => {
          if (limit.pendingCount === 0) {
            limit(build);
          }
        })
        .on("error", reject);
    });
  }
}

await main();
