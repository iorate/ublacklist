# uBlacklist

Blocks specific sites from appearing in Google search results

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [Mac App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (by [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Description

This browser extension prevents blacklisted sites from appearing in Google search results.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) (e.g. `*://*.example.com/*`) or by [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) (e.g. `/example\.(net|org)/`).

## For subscription providers

To publish a blacklist as a subscription, place a blacklist file encoded in UTF-8 on a suitable HTTP(S) server, and publish the URL. Here is [an example](https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt) hosted on GitHub.

## For developers

### Build

To build this extension, [Node.js](https://nodejs.org/en/) and [Yarn](https://classic.yarnpkg.com/en/) are required.

```shell
git clone https://github.com/iorate/uBlacklist.git

cd uBlacklist

yarn

yarn build:firefox:production
```

Before opening a pull request, you should make sure that 'build', 'lint' and 'test' pass.

```shell
yarn build

yarn lint
# Some lint errors can be fixed automatically
# yarn lintfix

yarn test
```

**NOTE:** The API keys and secrets for the sync feature are not included in this repository. To develop the sync feature, set your own API keys and secrets in the `.env` file.

```
DROPBOX_API_KEY=...
DROPBOX_API_SECRET=...
GOOGLE_DRIVE_API_KEY=...
GOOGLE_DRIVE_API_SECRET=...
```

### Locale

To add a locale,

1. Determine an ISO language code such as `en` referring to [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc).
1. Copy `src/locales/en.json.ts` to `src/locales/${languageCode}.json.ts` and translate entries.
1. Open `src/scripts/dayjs-locales.ts` and import the dayjs locale.
1. To localize description and screenshots on Chrome Web Store and Firefox Add-ons, create `web-store-assets/${languageCode}/` and add files.

## Author

[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License

uBlacklist is licensed under [MIT License](LICENSE.txt).
