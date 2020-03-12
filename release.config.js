module.exports = {
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
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'ublacklist-chrome.zip',
          },
        ],
      },
    ],
  ],
};
