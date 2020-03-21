module.exports = {
  branches: ['production'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      'semantic-release-chrome',
      {
        asset: 'ublacklist-chrome.zip',
        distFolder: 'dist/chrome/production',
        extensionId: 'pncfbmialoiaghdehhbnbhkkgmjanfhe',
      },
    ],
    [
      'semantic-release-firefox-add-on',
      {
        channel: 'listed',
        extensionId: '@ublacklist',
        sourceDir: 'dist/firefox/production',
        targetXpi: 'ublacklist-firefox.xpi',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'ublacklist-chrome.zip',
            name: 'ublacklist-${nextRelease.gitTag}-chrome.zip',
          },
          {
            path: 'artifacts/ublacklist-firefox.xpi',
            name: 'ublacklist-${nextRelease.gitTag}-firefox.xpi',
          },
        ],
      },
    ],
  ],
};
