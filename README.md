# uBlacklist

[简体中文](README.zh-CN.md)

Blocks specific sites from appearing in Google search results

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (for macOS and iOS, thanks to [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Description

This extension prevents the sites you specify from appearing in Google search results.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://ublacklist.github.io/docs/advanced-features#match-patterns) (e.g. `*://*.example.com/*`) or by [expressions](https://ublacklist.github.io/docs/advanced-features#expressions) including regular expressions, variables and string matchers (e.g. `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…).

You can synchronize rulesets across devices via cloud storage. At the moment, Google Drive and Dropbox are supported.

You can also subscribe to public rulesets. Some subscriptions are listed on the website:
https://ublacklist.github.io/subscriptions

## Supported search engines

This extension is available in the below search engines.

|              | Web                | Images             | Videos             | News               |
| ------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| Google       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Bing         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Brave \*3    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| DuckDuckGo   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Ecosia       | :heavy_check_mark: |                    |                    |                    |
| Kagi         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Qwant        | :heavy_check_mark: | :heavy_check_mark: | \*1                | :heavy_check_mark: |
| SearX \*2    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Startpage    | :heavy_check_mark: |                    | :heavy_check_mark: | :heavy_check_mark: |
| Yahoo! JAPAN | :heavy_check_mark: |                    |                    |                    |
| Yandex       | :heavy_check_mark: |                    |                    |                    |

\*1 Only if "Always play videos on Qwant.com" is turned off<br>
\*2 Only certain public instances are supported. If you want to add support for your own SearX/SearXNG search engine, edit `src/common/search-engines.ts` and build the extension manually<br>
\*3 Due to the difficulty in obtaining the full URLs of image links, this extension does not support per-subdomain blocking in Brave Image Search. (For example, if the link is to "www.example.com", it will block the entire "example.com").

## For subscription providers

To publish a ruleset as a subscription, place a ruleset file encoded in UTF-8 on a suitable HTTP(S) server, and publish the URL. Here is an example hosted on GitHub:

https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt

You can prepend YAML frontmatter to your ruleset. It is recommended that you set the `name` variable.

```
---
name: Your ruleset name
---
*://*.example.com/*
```

### Subscription links

**NOTE:** This feature is available in v8.11.0 or later. Users need to explicitly enable this feature by turning on "Enable ruleset subscription links" in the extension's options page.

**NOTE:** This feature does not work in Safari at the moment.

Subscription links are available to make it easier for users to add your ruleset. To create a subscription link for your ruleset, use the following format:

```
https://ublacklist.github.io/rulesets/subscribe?url=<url-encoded-url>
```

For the above example:

https://ublacklist.github.io/rulesets/subscribe?url=https%3A%2F%2Fraw.githubusercontent.com%2Fiorate%2Fublacklist-example-subscription%2Fmaster%2FuBlacklist.txt

When users click this link, they will be directed to the extension's options page with your subscription pre-filled.

## For developers

### Build

To build this extension, [pnpm](https://pnpm.io/)>=9.7.0 is required.

```shell
git clone --recurse-submodules https://github.com/iorate/ublacklist.git

cd ublacklist

pnpm install

# Usage: pnpm build [--browser BROWSER] [--version VERSION] [--debug] [--watch]
pnpm build
```

Before opening a pull request, you should make sure that `pnpm check` passes.

```shell
pnpm check

# Some lint errors can be fixed automatically
pnpm fix
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
1. Copy `src/locales/en/messages.json.ts` to `src/locales/${languageCode}/messages.json.ts` and translate entries.
1. Open `src/scripts/dayjs-locales.ts` and import the dayjs locale.
1. To localize description and screenshots on web stores, create `web-store-assets/${languageCode}/` and add files.
   - Screenshot localization is available only on Chrome Web Store.
   - Screenshots should be 1280x800.

## Author

[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License

uBlacklist is licensed under [MIT License](LICENSE.txt).
