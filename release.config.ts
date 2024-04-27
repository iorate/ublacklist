import type { Options, PluginSpec } from "semantic-release";

const chromePluginSpec: PluginSpec = [
  "semantic-release-chrome",
  {
    asset: "ublacklist-${nextRelease.gitTag}-chrome.zip",
    distFolder: "dist/chrome",
    extensionId: "pncfbmialoiaghdehhbnbhkkgmjanfhe",
  },
];

const amoPluginSpec: PluginSpec = [
  "semantic-release-amo",
  {
    addonId: "ublacklist",
    addonDirPath: "dist/firefox",
    addonZipPath: "ublacklist-${nextRelease.gitTag}-firefox.zip",
    approvalNotes: `To build this add-on, Node.js >= 18 is required.

$ cat << EOF > .env
DROPBOX_API_KEY=${process.env.DROPBOX_API_KEY}
DROPBOX_API_SECRET=${process.env.DROPBOX_API_SECRET}
GOOGLE_DRIVE_API_KEY=${process.env.GOOGLE_DRIVE_API_KEY}
GOOGLE_DRIVE_API_SECRET=${process.env.GOOGLE_DRIVE_API_SECRET}
EOF

$ corepack enable

$ pnpm install

$ pnpm build --browser firefox --version \${nextRelease.version}

The add-on will be built into dist/firefox.
`,
    compatibility: ["firefox", "android"],
    submitReleaseNotes: true,
    submitSource: true,
  },
];

const config: Options = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ...(process.env.DEPLOY_CHROME === "true" ? [chromePluginSpec] : []),
    ...(process.env.DEPLOY_FIREFOX === "true" ? [amoPluginSpec] : []),
    ["@semantic-release/github", { assets: ["*.zip"], addReleases: "bottom" }],
  ],
};

export default config;
