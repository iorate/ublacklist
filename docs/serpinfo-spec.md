# SERPINFO Specification

Reference for the SERPINFO YAML format used to describe how uBlacklist parses search
engine result pages (SERPs).

The authoritative schema lives in `src/scripts/serpinfo/schemas.ts` (Zod). Filtering
logic that consumes a parsed SERPINFO is in `src/scripts/serpinfo/filter.ts`.

## File format

A SERPINFO file is a YAML document with this shape:

```yaml
name: SearchEngineName
version: 1.0.0
homepage: https://example.com/
lastModified: 2023-09-01T00:00:00Z

pages:
  - name: PageType
    matches:
      - https://search.example.com/search?*
    results:
      - root: .result-selector
        url: a.link
        props:
          title: .title
    commonProps:
      $site: example
      $category: web
```

## Top-level properties

| Required | Property       | Type   | Description                      |
| :------: | -------------- | ------ | -------------------------------- |
|    ✓     | `name`         | string | Name of the SERPINFO             |
|    ✓     | `pages`        | array  | Array of page definitions        |
|          | `version`      | string | Version of the SERPINFO          |
|          | `description`  | string | Description                      |
|          | `homepage`     | string | Homepage URL                     |
|          | `lastModified` | string | Last modification time, ISO 8601 |

## Page definition

Each entry in `pages` describes a category of SERP (web, images, news, ...).

| Required | Property         | Type              | Description                                                                  |
| :------: | ---------------- | ----------------- | ---------------------------------------------------------------------------- |
|    ✓     | `name`           | string            | Name of the page definition                                                  |
|    ✓     | `matches`        | array             | Match patterns to include pages                                              |
|    ✓     | `results`        | array             | Result definitions                                                           |
|          | `excludeMatches` | array             | Match patterns to exclude pages                                              |
|          | `includeRegex`   | string            | Regex to include pages                                                       |
|          | `excludeRegex`   | string            | Regex to exclude pages                                                       |
|          | `userAgent`      | string            | `"any"`, `"desktop"`, or `"mobile"`                                          |
|          | `commonProps`    | object            | Properties merged into every result on this page (e.g. `$site`, `$category`) |
|          | `delay`          | number or boolean | ms delay after page load, or boolean to enable/disable                       |

## Result definition

Each entry in `results` describes how to extract a single result from a page.

| Required | Property        | Type             | Description                                              |
| :------: | --------------- | ---------------- | -------------------------------------------------------- |
|    ✓     | `root`          | root command     | Locates result root elements                             |
|    ✓     | `url`           | property command | Extracts the result URL                                  |
|          | `name`          | string           | Name of the result definition                            |
|          | `props`         | object           | Map of property name → property command (e.g. `title`)   |
|          | `button`        | button command   | Adds a block button to each result                       |
|          | `preserveSpace` | boolean          | Keep blocked result's layout space to avoid layout shift |

## Commands

Commands are written either as a bare CSS selector string or as a YAML array whose
first element is the command name. Commands fall into four categories.

### Root commands

Locate the set of result root elements within the page.

- `<css-selector>` — shorthand for `[selector, <css-selector>]`
- `[selector, <css-selector>]` — find all elements matching the selector
- `[upward, <level>, <root-command>]` — for each element found by the inner root
  command, walk `<level>` ancestors up the DOM

### Element commands

Resolve a single element relative to the current root element.

- `<css-selector>` — shorthand for `[selector, <css-selector>]`
- `[selector, <css-selector>, <element-command>?]` — query within the optional inner
  element (defaults to the current root)
- `[upward, <level>, <element-command>?]` — walk `<level>` ancestors up

When the trailing `<element-command>` is omitted, the current root element is used.

### Property commands

Produce a string value (or filter/transform an existing one). Used for `url` and for
each entry in `props`.

- `<css-selector>` — shorthand: `textContent` of the matched element, or `href` when
  used as the `url` extractor
- `[attribute, <name>, <element-command>?]` — element attribute value
- `[property, <name>, <element-command>?]` — JS property value
- `[const, <value>]` — constant string
- `[domainToURL, <property-command>]` — convert a bare domain into a URL
- `[regexInclude, <pattern>, <property-command>]` — keep only if it matches
- `[regexExclude, <pattern>, <property-command>]` — drop if it matches
- `[regexSubstitute, <pattern>, <replacement>, <property-command>]` — regex replace
- `[or, [<property-command>*], <element-command>?]` — try commands in order, take
  the first that yields a value

When the trailing `<element-command>` is omitted, the current root element is used.

### Button commands

Add a block button to each matched result.

- `[icon, <options>?, <element-command>?]` — icon button
  - `style`: inline CSS (e.g. `"top: 16px; right: 32px; --ub-icon-size: 16px;"`)
- `[text, <options>?, <element-command>?]` — text button
  - `position`: `"beforebegin"` | `"afterbegin"` | `"beforeend"` (default) | `"afterend"`
  - `style`: inline CSS
- `[inset, <options>?, <element-command>?]` — absolutely-positioned button inside the
  target element
  - `top`, `right`, `bottom`, `left`: CSS length or percentage
  - `zIndex`: z-index (default `1`)

When the trailing `<element-command>` is omitted, the current root element is used.

## Interaction with the rule language

`commonProps` (and per-result `props`) populate the variables that ruleset
expressions can match against. Variables prefixed with `$` (e.g. `$site`,
`$category`) are conventionally set from `commonProps` so users can write rules
like:

```
$site = "google" & host = "youtube.com"
$category = "images" & host = "www.amazon.com"
```

See `docs/ruleset-spec.md` for the rule language.

## Example

Bing image search:

```yaml
name: Bing
version: 0.1.0
homepage: https://github.com/ublacklist/builtin#readme
license: MIT
lastModified: 2023-04-05T11:11:20Z

pages:
  - name: Images (desktop)
    matches:
      - https://www.bing.com/images/search?*
    userAgent: desktop
    results:
      - root: [upward, 1, ".iuscp"]
        url:
          - regexSubstitute
          - '"purl":"([^"]+)'
          - "\\1"
          - [attribute, "m", ".iusc"]
        props:
          title: [attribute, "title", "li > a"]
        button: [inset, { top: "32px", right: 0 }, ".iuscp"]
    commonProps:
      $site: bing
      $category: images
```
