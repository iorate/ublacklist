---
title: Advanced Features
sidebar_position: 2
---

## Rules {#rules}

You can edit rules to block sites in the options page, as well as in the "Block this site" dialog.

![rule editor](/img/advanced-features/rules-1.png)

You can write rules by [match patterns](#match-patterns) or [expressions](#expressions).

### Match patterns {#match-patterns}

Match patterns are URLs including wildcards. You can see the details in [MDN web docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns).

Here are examples of **valid** match patterns.

| Pattern                                                                                                | Example matches                                                 |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `*://example.com/*`<br /><br />(URLs hosted at `example.com`)                                          | `http://example.com/`<br /><br />`https://example.com/hoge`     |
| `*://*.example.net/*`<br /><br />(URLs hosted at `example.net` or its subdomain)                       | `http://example.net/`<br /><br />`https://foo.example.net/hoge` |
| `*://example.org/hoge/*`<br /><br />(URLs hosted at `example.org` and whose path starts with `/hoge/`) | `http://example.org/hoge/fuga.html`                             |

Here are examples of **invalid** match patterns.

| Invalid pattern        | Reason                   |
| ---------------------- | ------------------------ |
| `*://www.qinterest.*/` | `*` is not at the start. |

### Expressions {#expressions}

You can write rules by expressions.

#### Variables {#variables}

Currently, `url` and `title` are available in expressions.

```
# Search results which URLs include "example"
url *= "example"

# Search results which titles start with "Something"
title ^= "Something"
```

Parts of URL are also available: `scheme`, `host` and `path`.

```
# Search results which schemes are HTTP
scheme="http"

# Search results which hosts end with ".example.com"
host $= ".example.com"

# Search results which paths include "blah", case-insensitive
path*="blah"i
```

In addition, properties of search engine result pages are available. `$site` and `$category` are available for now.

```
# Block YouTube on Google Search
$site="google" & host="youtube.com"

# Block Amazon.com on image search
$category = "images" & host = "www.amazon.com"
```

#### String matchers {#string-matchers}

String matchers resemble [CSS attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).

```
# Titles which are exactly "Example Domain"
title = "Example Domain"

# Titles which start with "Example"
title ^= "Example"

# Titles which end with "Domain"
title $= "Domain"

# Titles which include "ple Dom"
title *= "ple Dom"
```

To perform case-insensitive comparison, use the `i` operator.

```
# Titles which end with "domain", case-insensitive
title $= "domain" i
```

#### Regular expressions {#regular-expressions}

You can write more flexible expressions by [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

```
# URLs which include "example.net" or "example.org"
url =~ /example\.(net|org)/

# "=~" can be omitted
url/example\.(net|org)/

# "url" can be omitted
/example\.(net|org)/

# Titles which include "example domain", case-insensitive
title =~ /example domain/i
```

Note that regular expressions shall be regular expression **literals** in JavaScript, surrounded by `/` (e.g. `/example\.(net|org)/`).

Here are examples of **valid** regular expressions.

| Regular expression                                                                          | Example matches                                                         |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/^https:\/\/www\.qinterest\./`<br /><br />(URLs starting with `https://www.qinterest.`)    | `https://www.qinterest.com/`<br /><br />`https://www.qinterest.jp/hoge` |
| `/^https?:\/\/([^/.]+\.)*?xn--/`<br /><br />(URLs including internationalized domain names) | `http://例.テスト/`                                                     |

Here are examples of **invalid** regular expressions.

| Invalid regular expressions  | Reason                     |
| ---------------------------- | -------------------------- |
| `^https?:\/\/example\.com\/` | Not surrounded by `/`.     |
| `/^https?://example\.com//`  | Inner `/` are not escaped. |

#### Logical operators {#logical-operators}

Logical "not" (`!`), "and" (`&`), and "or" (`|`) are supported.

```
# Block schemes other than HTTPS
!scheme="https"

# Block Amazon.com on image search
$category = "images" & host = "www.amazon.com"

# Titles including "example" or "domain", case-insensitive
title *= "example" i | title *= "domain" i
```

### Use expressions with match patterns {#use-expressions-with-match-patterns}

You can append `@if(expression)` to match patterns.

```
# Block Amazon.com on image search
*://*.amazon.com/* @if($category="images")
```

### Unblock rules {#unblock-rules}

Match patterns or regular expressions preceded by `@` mean that the specified sites are not blocked.

They can be used to unblock sites that are blocked by [subscriptions](#subscription). For example, if `http://example.com/` is blocked by a subscription, you can unblock it by `@*://example.com/*`.

### Highlighting rules {#highlighting-rules}

Match patterns or regular expressions preceded by `@N` (N=1,2,3,...) mean that the specified sites are highlighted.

For example, you can highlight GitHub by `@1*://github.com/*`.

![highlight GitHub](/img/advanced-features/highlight.png)

By default, only `@1` (blue) is available. To change or add highlighting colors, see the "Appearance" section in the options page.

### Comments {#comments}

Comments begin with `#`. Although any line that cannot be interpreted as a rule is effectively a comment, a `#` comment is better in two ways.

1. `#` comments are guaranteed to be comments even if new syntax is introduced in the future.
1. `#` comments can be placed after rules.

```
# Block pages which URLs are hosted at example.com or its subdomain
*://*.example.com/*

/example\.(net|org)/ # Block pages which URLs contain example.net or example.org
```

## Other search engines {#other-search-engines}

This extension supports [Bing](#bing), [Brave](#brave) (partially), [DuckDuckGo](#duckduckgo), [Ecosia](#ecosia) (partially), [Kagi](#kagi), [Qwant](#qwant), [SearX](#searx) (partially), [Startpage.com](#startpagecom), [Yahoo! JAPAN](#yahoo-japan) (partially) and [Yandex](#yandex) (partially). This feature is disabled by default and can be enabled in the options page.

![other search engines](/img/advanced-features/other-search-engines-1.png)

You can also enable it by clicking the toolbar icon when a search result page is open.

### Bing {#bing}

![bing](/img/advanced-features/bing.png)

### Brave {#brave}

![brave](/img/advanced-features/brave.png)

### DuckDuckGo {#duckduckgo}

![duckduckgo](/img/advanced-features/duckduckgo.png)

### Ecosia {#ecosia}

![ecosia](/img/advanced-features/ecosia.png)

### Kagi {#kagi}

![kagi](/img/advanced-features/kagi.png)

### Qwant {#qwant}

"Videos" search will only work if you disable qwant custom links by clicking on "Always read on Qwant.com".

With the lite version of Qwant, the extension only work with "Web" search.

### SearX {#searx}

![searx](/img/advanced-features/searx.png)

### Startpage.com {#startpagecom}

![startpage](/img/advanced-features/startpage.png)

### Yahoo! JAPAN {#yahoo-japan}

![yahoo-japan](/img/advanced-features/yahoo-japan.png)

### Yandex {#yandex}

![yandex](/img/advanced-features/yandex.png)

## Sync {#sync}

You can synchronize rulesets among devices using Google Drive or Dropbox.

To turn on sync, click the "Turn on sync" button in the options page and select a cloud.

![turn on sync](/img/advanced-features/sync-1.png)

Follow the instructions on the dialog to authenticate.

![authenticate](/img/advanced-features/sync-2.png)

Once authentication succeeds, your ruleset will be regularly synchronized with the selected cloud.

### Google Drive {#google-drive}

If you use Firefox or its derivative, you will be required to permit access to `https://www.googleapis.com`.

The ruleset is saved in the application data folder on your Google Drive. It is hidden from you, although you can delete it in the settings page of Google Drive.

### Dropbox {#dropbox}

The ruleset is saved in the `/Apps/uBlacklist/` folder on your Dropbox. The folder name may be different depending on your language.

## Subscription {#subscription}

You can subscribe to public rulesets. A list of known public subscription lists can be found on the [Subscriptions](/subscriptions) page.

To add a subscription, click the "Add subscription" button and enter the name and URL. You will be required to permit access to the origin of the URL.

![add subscription](/img/advanced-features/subscription-1.png)

You can show, update or remove a subscription.

![manage subscription](/img/advanced-features/subscription-2.png)

### Publish a subscription {#publish-subscription}

To publish a ruleset as a subscription, place a ruleset file encoded in UTF-8 on a suitable HTTP(S) server, and publish the URL.

You can prepend YAML frontmatter to your ruleset. It is recommended that you set the `name` variable.

```
---
name: Your ruleset name
---
*://*.example.com/*
```

It is a good idea to host your subscription on GitHub. Make sure that you publish the **raw** URL (e.g. https://raw.githubusercontent.com/iorate/ublacklist-example-subscription/master/uBlacklist.txt).

![raw url](/img/advanced-features/subscription-3.png)
