// @ts-check

/** @type { import('semantic-release').PluginSpec } */
const chrome = [
  'semantic-release-chrome',
  {
    asset: 'ublacklist-${nextRelease.gitTag}-chrome-mv3.zip',
    distFolder: 'dist/chrome-mv3/production',
    extensionId: 'pncfbmialoiaghdehhbnbhkkgmjanfhe',
  },
];

/** @type { import('semantic-release').PluginSpec } */
const firefox = [
  'semantic-release-amo',
  {
    addonId: 'ublacklist',
    addonDirPath: 'dist/firefox/production',
    addonZipPath: 'ublacklist-${nextRelease.gitTag}-firefox.zip',
    approvalNotes: `To build this add-on, Node.js and Yarn are required.
NOTE: Node.js 16 or later is required. Node.js 14 cannot build this add-on.
          
$ yarn
$ yarn build firefox production

The add-on will be built into dist/firefox/production.
`,
    compatibility: ['firefox', 'android'],
    submitReleaseNotes: true,
    submitSource: true,
  },
];

/** @type {import('semantic-release').Options } */
const config = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ...(process.env.RELEASE_CHROME === 'true' ? [chrome] : []),
    ...(process.env.RELEASE_FIREFOX === 'true' ? [firefox] : []),
    ['@semantic-release/github', { assets: ['*.zip'], addReleases: 'bottom' }],
  ],
};

module.exports = config;
