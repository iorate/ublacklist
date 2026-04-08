# Ruleset Specification

Reference for the uBlacklist ruleset syntax. This document describes only the rule
language itself (what users type into the rule editor or publish as a subscription).

The authoritative grammar lives in `src/scripts/ruleset/ruleset.grammar`
(parsed via Lezer; generated output in `parser.generated.ts`).

## Overview

A ruleset is a newline-separated list of rules. Each rule is one of:

- A **match pattern** (optionally with an `@if(...)` guard)
- An **expression** (using variables, string matchers, regex, and logical operators)
- A **regular expression literal** (shorthand for `url =~ /.../`)
- An **unblock rule** (prefixed with `@`)
- A **highlight rule** (prefixed with `@N` where N = 1, 2, 3, ...)
- A **comment** (starting with `#`)

Empty lines and unparseable lines are effectively ignored, but explicit `#` comments
are preferred for forward compatibility.

## Match patterns

Match patterns are URLs containing wildcards, following the
[WebExtensions match pattern](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns)
specification.

| Pattern                  | Matches                                            |
| ------------------------ | -------------------------------------------------- |
| `*://example.com/*`      | URLs hosted at `example.com`                       |
| `*://*.example.net/*`    | `example.net` and any subdomain                    |
| `*://example.org/hoge/*` | `example.org` URLs whose path starts with `/hoge/` |

**Invalid:** `*://www.qinterest.*/` — `*` may not appear in the middle of the host.

### Match patterns with guards

Append `@if(<expression>)` to scope a match pattern to a condition:

```
*://*.amazon.com/* @if($category="images")
```

## Expressions

Expressions evaluate against the current search result.

### Variables

Built-in variables for the result URL and title:

- `url` — full URL
- `title` — result title
- `scheme`, `host`, `path` — URL parts

Built-in SERP-context variables (prefixed with `$`):

- `$site` — search engine identifier (e.g. `"google"`, `"bing"`)
- `$category` — result category (e.g. `"web"`, `"images"`)

```
url *= "example"           # URL contains "example"
title ^= "Something"       # Title starts with "Something"
scheme = "http"            # HTTP results
host $= ".example.com"     # Host ends with ".example.com"
path *= "blah" i           # Path contains "blah", case-insensitive
$site = "google" & host = "youtube.com"
$category = "images" & host = "www.amazon.com"
```

### String matchers

Modeled after CSS attribute selectors:

| Operator | Meaning        |
| -------- | -------------- |
| `=`      | exactly equals |
| `^=`     | starts with    |
| `$=`     | ends with      |
| `*=`     | contains       |

Append the `i` flag for case-insensitive matching:

```
title $= "domain" i
```

### Regular expressions

Use JavaScript regex **literals** (must be surrounded by `/`):

```
url =~ /example\.(net|org)/   # explicit
url /example\.(net|org)/      # "=~" omitted
/example\.(net|org)/          # "url =~" omitted
title =~ /example domain/i    # with flags
```

**Invalid:**

- `^https?:\/\/example\.com\/` — not surrounded by `/`
- `/^https?://example\.com//` — inner `/` must be escaped

### Logical operators

| Operator | Meaning |
| -------- | ------- |
| `!`      | not     |
| `&`      | and     |
| `\|`     | or      |

```
!scheme = "https"
$category = "images" & host = "www.amazon.com"
title *= "example" i | title *= "domain" i
```

## Unblock rules

A match pattern or regex prefixed with `@` _unblocks_ the matching results. Mainly
used to override entries pulled in by a subscription.

```
@*://example.com/*
@/example\.(net|org)/
```

## Highlight rules

A match pattern or regex prefixed with `@N` (N = 1, 2, 3, ...) highlights matching
results in color slot N. Color slots are configured in the options page; only `@1`
exists by default.

```
@1*://example.com/*
@2/example\.(net|org)/
```

## Comments

Lines starting with `#` are comments. Trailing `#` comments after a rule are also
allowed:

```
# Block example.com and its subdomains
*://*.example.com/*

/example\.(net|org)/ # Block example.net or example.org
```

Although any unparseable line is effectively ignored, prefer explicit `#` comments:

1. They are guaranteed to remain comments if new syntax is added later.
2. They can be placed inline after a rule.

## Subscription frontmatter

A ruleset published as a subscription may begin with a YAML frontmatter block. The
`name` field is recommended:

```
---
name: Your ruleset name
---
*://*.example.com/*
```
