# uBlacklist

[English](README.md) | Deutsch | [简体中文](README.zh-CN.md)

Verhindert, dass bestimmte Seiten in den Google-Suchergebnissen angezeigt werden

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (für macOS und iOS, danke an [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Beschreibung

Diese Erweiterung verhindert, dass die von Ihnen angegebenen Seiten in Google-Suchergebnissen erscheinen.

Sie können Regeln auf Suchergebnisseiten oder auf Seiten, die blockiert werden sollen, hinzufügen, indem Sie auf das Symbol in der Symbolleiste klicken. Regeln können entweder durch [Übereinstimmende Muster](https://ublacklist.github.io/docs/advanced-features# match-patterns) (z. B. `*://*.example.com/*`) oder durch [Ausdrücke](https://ublacklist.github.io/docs/advanced-features#expressions) einschließlich regulärer Ausdrücke, Variablen und Zeichenfolgenübereinstimmungen (z. B. `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…) festgelegt werden.

Sie können Regelsätze über Cloud-Speicher geräteübergreifend synchronisieren. Derzeit werden Google Drive und Dropbox unterstützt.

Sie können auch öffentliche Regelsätze abonnieren. Einige Abonnements sind auf der Seite aufgelistet:
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

Ausführliche Informationen zur Entwicklungsumgebung und Richtlinien finden Sie in unserem [Beitragsleitfaden](CONTRIBUTING.md).

## Autor

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## Lizenz

uBlacklist ist lizenziert unter [MIT-Lizenz](LICENSE.txt).
