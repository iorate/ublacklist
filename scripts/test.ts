import child_process from "node:child_process";
import { globby } from "globby";

async function main() {
  const cp = child_process.spawn(
    process.execPath,
    ["--import", "tsx", "--test", ...(await globby("src/**/*.test.ts"))],
    { stdio: "inherit" },
  );
  process.exitCode = await new Promise<number>((resolve, reject) => {
    cp.on("close", resolve);
    cp.on("error", reject);
  });
}

await main();
