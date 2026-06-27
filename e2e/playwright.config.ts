import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  outputDir: "./test-results",
  reporter: process.env.CI ? "github" : "list",
  testDir: "./tests",
});
