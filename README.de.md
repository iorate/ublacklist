# uBlacklist

[English](README.md) | Deutsch | [简体中文](README.zh-CN.md)

Verhindert, dass bestimmte Seiten in den Google-Suchergebnissen angezeigt werden

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (for macOS and iOS, thanks to [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Beschreibung

Diese Erweiterung verhindert, dass die von Ihnen angegebenen Seiten in Google-Suchergebnissen erscheinen.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://ublacklist.github.io/docs/advanced-features#match-patterns) (e.g. `*://*.example.com/*`) or by [expressions](https://ublacklist.github.io/docs/advanced-features#expressions) including regular expressions, variables and string matchers (e.g. `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…).

Sie können Regelsätze über Cloud-Speicher geräteübergreifend synchronisieren. Derzeit werden Google Drive und Dropbox unterstützt.

You can also subscribe to public rulesets. Some subscriptions are listed on the website:
https://ublacklist.github.io/subscriptions

## Browser-Unterstützungsrichtlinie

uBlacklist unterstützt folgende Browserversionen:

- **Chrome**: Nur die neueste stabile Version
- **Firefox**: Nur die neueste stabile Version und die neueste ESR
- **Safari**: Nur die neueste stabile Version (macOS und iOS)

Beiträge der Community für ältere Browserversionen oder Browser auf Basis von Chromium/Firefox sind jedoch willkommen.

## Unterstützte Suchmaschinen

Diese Erweiterung ist in den folgenden Suchmaschinen verfügbar.

<!-- prettier-ignore-start -->

|  | Web | Bilder | Videos | Neuigkeiten |
| --- | --- | --- | --- | --- |
| Google | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Bing | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Brave | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| DuckDuckGo | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Ecosia | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Kagi | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| SearXNG | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Startpage | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Yahoo! JAPAN | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |  |
| Yandex | :heavy_check_mark: |  | :heavy_check_mark: |  |

<!-- prettier-ignore-end -->

## Für Anbieter von Abonnements

Um einen Regelsatz als Abonnement zu veröffentlichen, legen Sie eine in UTF-8 codierte Regelsatzdatei auf einem geeigneten HTTP(S)-Server ab und veröffentlichen Sie die URL. Hier ist ein Beispiel, das auf GitHub gehostet wird:

https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt

Sie können Ihrem Regelsatz YAML-Frontmatter voranstellen. Es wird empfohlen, die Variable `name` festzulegen.

```
---
name: Your ruleset name
---
*://*.example.com/*
```

## Beitrag leisten

See our [Contributing Guide](CONTRIBUTING.md) for detailed development setup and guidelines.

## Autor

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## Lizenz

uBlacklist ist lizenziert unter [MIT-Lizenz](LICENSE.txt).
