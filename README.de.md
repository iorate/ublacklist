# uBlacklist

[English](README.md) | Deutsch | [简体中文](README.zh-CN.md)

Verhindert, dass bestimmte Seiten in den Google-Suchergebnissen angezeigt werden

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/de/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/de/app/ublacklist-for-safari/id1547912640) (für macOS und iOS, Dank an [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## Beschreibung

Diese Erweiterung verhindert, dass die von Ihnen angegebenen Seiten in Google-Suchergebnissen erscheinen.

Sie können Regeln auf Suchergebnisseiten oder auf Seiten, die blockiert werden sollen, hinzufügen, indem Sie auf das Symbol in der Symbolleiste klicken. Regeln können entweder durch [Übereinstimmende Muster](https://ublacklist.github.io/de/docs/advanced-features#match-patterns) (z. B. `*://*.example.com/*`) oder durch [Ausdrücke](https://ublacklist.github.io/de/docs/advanced-features#expressions) einschließlich regulärer Ausdrücke, Variablen und Zeichenfolgenübereinstimmungen (z. B. `/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…) festgelegt werden.

Sie können Regelsätze geräteübergreifend über Cloud-Speicher (Google Drive, Dropbox, WebDAV) oder die Browser-Synchronisation synchronisieren.

Sie können auch öffentliche Regelsätze abonnieren. Einige öffentliche Regelsätze sind auf der Website aufgeführt:
https://ublacklist.github.io/rulesets

## Browser-Unterstützungsrichtlinie

uBlacklist unterstützt folgende Browserversionen:

- **Chrome**: Nur die neueste stabile Version
- **Firefox**: Nur die neueste stabile Version und die neueste ESR
- **Safari**: Nur die neueste stabile Version (macOS und iOS)

Die Unterstützung für Browser, die nicht in der obigen Liste aufgeführt sind, hängt von Beiträgen der Community ab. Bitte eröffnen Sie eine [Diskussion](https://github.com/iorate/ublacklist/discussions) mit einem konkreten Umsetzungsvorschlag – Meldungen ohne einen solchen Vorschlag werden wahrscheinlich nicht bearbeitet.

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

Eine zusätzliche Unterstützung für integrierte Suchmaschinen ist nicht geplant. Sie können [SERPINFO](https://ublacklist.github.io/docs/serpinfo) nutzen, um die Unterstützung für beliebige Suchmaschinen selbst hinzuzufügen.

## Zugehörige Repositorys

- [ublacklist/builtin](https://github.com/ublacklist/builtin) – Integrierte SERPINFO-Dateien. Die Erweiterung lädt regelmäßig die neuesten SERPINFO-Daten von dieser Seite herunter.
- [ublacklist/ublacklist.github.io](https://github.com/ublacklist/ublacklist.github.io) – Website und Dokumentation (https://ublacklist.github.io)
- [ublacklist/store-assets](https://github.com/ublacklist/store-assets) – Beschreibungen und Screenshots für Store-Einträge

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

Ausführliche Informationen zur Entwicklungsumgebung und Richtlinien finden Sie in unserem [Leitfaden für Mitwirkende](CONTRIBUTING.md).

## Autor

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## Lizenz

uBlacklist ist lizenziert unter [MIT-Lizenz](LICENSE.txt).
