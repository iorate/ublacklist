import { spawn } from "node:child_process";
import { globSync } from "node:fs";

const cp = spawn(process.execPath, ["--test", ...globSync("**/*.test.ts")], {
  stdio: "inherit",
});
cp.on("close", (code) => {
  process.exit(code ?? 1);
});
