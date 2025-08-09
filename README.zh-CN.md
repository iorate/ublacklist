# uBlacklist

[English](README.md)

在搜索结果中屏蔽指定的网站

[Chrome 应用商店](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox 扩展](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (支持 macOS 和 iOS，特别鸣谢 [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## 介绍

此扩展可防止您指定的网站出现在 Google 和其他的一些搜索引擎中。

您可以为搜索结果添加规则或点击工具栏图标以屏蔽指定的网站。规则可以通过以下方式指定：[匹配模式](https://ublacklist.github.io/docs/advanced-features#match-patterns) (示例：`*://*.example.com/*`) 或使用[表达式](https://ublacklist.github.io/docs/advanced-features#expressions)包括正则表达式、变量和字符串匹配器 (示例：`/example\.(net|org)/`, `path*="example"i`, `$category = "images" & title ^= "Example"`…)。

您可以通过云存储跨设备同步规则集。目前，支持 Google Drive 和 Dropbox。

您还可以订阅公共规则集。该网站列出了一些订阅：
https://ublacklist.github.io/subscriptions

## 支持的搜索引擎

此扩展支持以下搜索引擎。

|              | 网页               | 图片               | 视频               | 新闻               |
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

## 发布订阅

要将规则集发布为订阅，请将以 UTF-8 编码的规则集文件放在合适的 HTTP(S) 服务器上，然后发布 URL。这是托管在 GitHub 上的示例：

https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt

你可以在规则集前放置 YAML frontmatter。建议设定 `name` 变量。

```
---
name: Your ruleset name
---
*://*.example.com/*
```

## 贡献

详细的开发设置和指南请参阅我们的[贡献指南](CONTRIBUTING.md)。

## 作者

[iorate](https://github.com/iorate) ([X](https://x.com/iorate))

## 许可证

uBlacklist 基于 [MIT License](LICENSE.txt) 开源。
