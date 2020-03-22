# uBlacklist
Blocks specific sites from appearing in Google search results

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/)

## Description
This browser extension prevents blacklisted sites from appearing in Google search results.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) (e.g. `*://*.example.com/*`) or by [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) (e.g. `/example\.(net|org)/`).

## For subscription providers
To publish a blacklist as a subscription, place a blacklist file encoded in UTF-8 on a suitable HTTP(S) server, and publish the URL. Here is [an example](https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt) hosted on GitHub.

## For developers

### Build
To build this extension, [Node.js](https://nodejs.org/en/) is required.

```shell
git clone https://github.com/iorate/uBlacklist.git

cd uBlacklist

npm ci

npm run build:firefox:production
```

### Engine
To add support for a search engine other than Google,

1. Create `src/scripts/engines/${engineId}.ts` and define `window.ubContentHandlers` referring to `src/scripts/content-handlers.ts`.
1. Create `src/styles/engines/${engineId}.scss` and define styles.
1. Open `src/scripts/engines.ts` and update `ENGINES`.
1. Open `webpack.config.js` and update `ENGINE_IDS`.

### Locale
To add a locale,

1. Determine an ISO language code such as `en` referring to [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc).
1. Copy `src/_locales/en/messages.json` to `src/_locales/${languageCode}/messages.json` and translate `message` entries.
1. If necessary, open `src/scripts/dayjs-locales.ts` and import a dayjs locale.

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
uBlacklist is licensed under [MIT License](LICENSE.txt).
