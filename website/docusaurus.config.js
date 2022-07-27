// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'uBlacklist',
  url: 'https://iorate.github.io',
  baseUrl: '/ublacklist/',
  favicon: 'img/icon.svg',
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  tagline: 'Block the sites you specify from appearing in Google search results',
  organizationName: 'iorate',
  projectName: 'ublacklist',
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'uBlacklist',
        logo: {
          alt: 'uBlacklist',
          src: 'img/icon.svg',
        },
        items: [
          {
            label: 'docs',
            to: 'docs',
          },
          {
            label: 'subscriptions',
            to: 'subscriptions',
          },
          {
            label: 'privacyPolicy',
            to: 'privacy-policy',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          // https://github.com/facebook/docusaurus/issues/2634#issuecomment-1159596930
          {
            'aria-label': 'GitHub repository',
            className: 'header-github-link',
            href: 'https://github.com/iorate/ublacklist',
            position: 'right',
          },
        ],
        hideOnScroll: true,
      },
      footer: {
        style: 'dark',
      },
      prism: {
        theme: require('prism-react-renderer/themes/github'),
        darkTheme: require('prism-react-renderer/themes/dracula'),
      },
    }),
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: 'https://github.com/iorate/ublacklist/edit/master/website/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
};

module.exports = config;
