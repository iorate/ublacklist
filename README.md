# uBlacklist

English | [简体中文](README.zh-CN.md)

Blocks specific sites from appearing in Google search results

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (for macOS and iOS, thanks to [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Description

This extension prevents the sites you specify from appearing in Google search results.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://ublacklist.github.io/docs/advanced-features#match-patterns) (e.g. `*://*.example.com/*`) or by [expressions](https://ublacklist.github.io/docs/advanced-features#expressions) including regular expressions, variables and string matchers (e.g. `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…).

You can synchronize rulesets across devices via cloud storage. At the moment, Google Drive and Dropbox are supported.

You can also subscribe to public rulesets. Some subscriptions are listed on the website:
https://ublacklist.github.io/subscriptions

## Browser support policy

uBlacklist supports the following browser versions:

- **Chrome**: Latest stable version only
- **Firefox**: Latest stable version and latest ESR only
- **Safari**: Latest stable version only (macOS and iOS)

However, community contributions for older browser versions or browsers based on Chromium/Firefox are welcome.

## Supported search engines

This extension is available in the below search engines.

|              | Web                | Images             | Videos             | News               |
| ------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| Google       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Bing         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Brave        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| DuckDuckGo   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Ecosia       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Kagi         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| SearXNG      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Startpage    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Yahoo! JAPAN | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                    |
| Yandex       | :heavy_check_mark: |                    | :heavy_check_mark: |                    |

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

## Contributing

See our [Contributing Guide](CONTRIBUTING.md) for detailed development setup and guidelines.

## Author

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## License

uBlacklist is licensed under [MIT License](LICENSE.txt).
