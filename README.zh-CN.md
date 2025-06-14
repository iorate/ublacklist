# uBlacklist

[English](README.md)

在搜索结果中屏蔽指定的网站

[Chrome 应用商店](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox 扩展](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/) / [App Store](https://apps.apple.com/us/app/ublacklist-for-safari/id1547912640) (支持 macOS 和 iOS，特别鸣谢 [Group-Leafy](https://github.com/HoneyLuka/uBlacklist/tree/safari-port/safari-project))

## 介绍

此扩展可防止您指定的网站出现在 Google 和其他的一些搜索引擎中。

您可以为搜索结果添加规则或点击工具栏图标以屏蔽指定的网站。规则可以通过以下方式指定：[匹配模式](https://developer.mozilla.org/zh-CN/docs/mozilla/add-ons/webextensions/match_patterns) (示例：`*://*.example.com/*`) 或使用[正则表达式](https://developer.mozilla.org/zh-CN/docs/web/javascript/guide/regular_expressions) (示例：`/example\.(net|org)/`).

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
| SearXNG      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Startpage    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Yahoo! JAPAN | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                    |
| Yandex       | :heavy_check_mark: |                    | :heavy_check_mark: |                    |

## 发布订阅

要将规则集发布为订阅，请将以 UTF-8 编码的规则集文件放在合适的 HTTP(S) 服务器上，然后发布 URL。 这是托管在 GitHub 上的示例:<br>
https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt

你可以在规则集前放置 YAML frontmatter。建议设定 `name` 变量。

```
---
name: Your ruleset name
---
*://*.example.com/*
```

## 开发者

### 构建

为了构建这个扩展，你需要下载并安装 [pnpm](https://pnpm.io/)>=10。

```shell
git clone --recurse-submodules https://github.com/iorate/ublacklist.git

cd ublacklist

pnpm install

# Usage: pnpm build [--browser BROWSER] [--version VERSION] [--debug] [--watch]
pnpm build
```

在您提交 Pull Request 之前，您需要确保 `pnpm check` 通过测试。

```shell
pnpm check

# 一些lint错误会被自动修复
pnpm fix
```

**注意:** 同步功能的 API Key 和 Secret 不包含在此存储库中。 要开发同步功能，请在 `.env` 文件中设置您自己的 API Key 和 Secret。

```
DROPBOX_API_KEY=...
DROPBOX_API_SECRET=...
GOOGLE_DRIVE_API_KEY=...
GOOGLE_DRIVE_API_SECRET=...
```

### 本地化

要添加一个语言，

1. 确定所要添加语言的 ISO 代码，例如 `en`，参见 [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc).
1. 复制 `src/_locales/en/messages.json.ts` 到 `src/_locales/${languageCode}/messages.json.ts` 并翻译条目.
1. 打开 `src/scripts/dayjs-locales.ts` 并导入 dayjs 语言环境.
1. 要本地化网上商店的描述和屏幕截图，请创建 `web-store-assets/${languageCode}/` 并添加文件。
   - 屏幕截图本地化仅在 Chrome 网上应用店可用。
   - 屏幕截图应为 1280x800。

## 作者

[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## 许可证

uBlacklist 基于 [MIT License](LICENSE.txt) 开源。
