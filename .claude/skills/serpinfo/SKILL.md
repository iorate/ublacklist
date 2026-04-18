---
name: serpinfo
description: Generate SERPINFO YAML configurations for search engines. Use when the user wants to create a custom SERPINFO definition for uBlacklist to support a new search engine or customize result filtering on an existing one.
---

# SERPINFO Generation Skill

You help the user create a **SERPINFO YAML** configuration for uBlacklist.
SERPINFO describes how uBlacklist finds and extracts results on a search engine
result page (SERP). The generated YAML is intended to be pasted into the
**user-defined SERPINFO** field on the uBlacklist options page.

## Step 1 — Read the spec and examples

Before doing anything else, read these files to understand the format:

- `docs/serpinfo-spec.md` — authoritative spec (top-level properties, page
  definitions, result definitions, command grammar)
- `builtin/serpinfo/brave.yml` — simple multi-page example
- `builtin/serpinfo/ecosia.yml` — example using `button: [inset, ...]` and
  `preserveSpace: true`

## Step 2 — Greet the user and ask for the target

Before running anything, send one short message asking for the target:

- Search engine name and result categories (web / images / news / videos / ...)
- The URL of the search results page for each category. If the search query
  appears in the URL, leave it in (e.g.
  `https://search.brave.com/search?q=hello`). If the query is not in the URL,
  the skill will submit the form via `eval` in Step 4.

Also mention in one line that this skill needs `playwright-cli`
(`pnpm add -g @playwright/cli`).

## Step 3 — Verify playwright-cli is installed

Once the user has replied with the target, run:

```bash
playwright-cli --version
```

If missing, stop and ask the user to install it (see Step 2). Wait for
confirmation before continuing.

Handy tips:

- `playwright-cli --help <command>` shows options for a subcommand (e.g.
  `playwright-cli --help open` lists `--headed`, `--browser`, `--persistent`).
- `playwright-cli close-all` terminates all active sessions — useful when
  you need to restart in a different mode.
- `playwright-cli snapshot` writes its output to
  `.playwright-cli/page-*.yml`. If the snapshot is large, read the file with
  the `Read` tool instead of eyeballing stdout.

## Step 4 — Load the page

Default to headless mode. Fall back to headed if the site blocks you.

**4a. Initial attempt (headless):**

```bash
playwright-cli open "<url>"
playwright-cli snapshot
```

For POST-only endpoints, open a blank/entry page on the same origin first,
then submit a form via `eval`. Adjust `action`, the input name, and the query
value for the target engine. Prefer driving the form via `eval` rather than
asking the user to type into the live browser.

```bash
playwright-cli open "<entry-page-url>"
playwright-cli eval "(() => { const f = document.createElement('form'); f.method='POST'; f.action='<search-endpoint-url>'; const i=document.createElement('input'); i.name='<query-param-name>'; i.value='<query>'; f.appendChild(i); document.body.appendChild(f); f.submit(); return 'submitted'; })()"
```

**4b. Detect CAPTCHA / bot-check and fall back to headed.**

Inspect the snapshot (or read `.playwright-cli/page-*.yml`). Bot-check
indicators:

- Text contains `captcha`, `challenge`, `verify`, `are you human`, `blocked`,
  `unusual traffic`, etc.
- The snapshot is tiny or obviously not a SERP.
- Your initial candidate selectors (from Step 5) return 0 results.

If detected:

```bash
playwright-cli close-all
playwright-cli open --headed "<url>"
```

Then tell the user: "A CAPTCHA / bot-check page appeared. Please solve it in
the opened browser window, then reply when ready." Wait for their confirmation
before continuing. Re-issue the POST submission via `eval` if applicable.

## Step 5 — Identify result containers (repeating-structure first)

**Do not start from class-name guesses.** Some engines use obfuscated class
names (e.g. Google's `.tF2Cxc`) and some engines have misleading class names
(e.g. DuckDuckGo HTML has `.result`, `.zci__result`, `.serp__results` — only
one is the per-result container). Instead, find the repeating structure first,
then use class names as confirmation.

**5a. Collect external-link anchors** — these are the URLs a user wants to
block, so they point to result containers:

```bash
playwright-cli eval "Array.from(document.querySelectorAll('a[href^=\"http\"]')).slice(0,20).map(a => ({ href: a.href, text: a.textContent.trim().slice(0,80) }))"
```

**5b. For each external anchor, walk up ancestors and look for "N siblings
with the same tag+class signature."** The ancestor where the signature repeats
across many siblings is the result container:

```bash
playwright-cli eval "
(() => {
  const anchors = Array.from(document.querySelectorAll('a[href^=\"http\"]'));
  const scores = new Map();
  for (const a of anchors) {
    let el = a;
    for (let depth = 0; depth < 8 && el.parentElement; depth++) {
      el = el.parentElement;
      const sig = el.tagName + (el.className ? '.' + el.className.split(/\s+/).sort().join('.') : '');
      const siblings = Array.from(el.parentElement?.children || [])
        .filter(s => s.tagName === el.tagName && s.className === el.className);
      if (siblings.length >= 3) {
        scores.set(sig, (scores.get(sig) || 0) + 1);
      }
    }
  }
  return Array.from(scores.entries()).sort((a,b) => b[1]-a[1]).slice(0,10);
})()
"
```

The top signatures are your root candidates. Class-name hints (`result`,
`snippet`, `item`, `card`, `hit`, `serp`) can break ties but are not
authoritative — treat them as a secondary signal only.

**5c. Verify each candidate.** For the top candidate's selector:

```bash
playwright-cli eval "document.querySelectorAll('<candidate-selector>').length"
playwright-cli eval "Array.from(document.querySelectorAll('<candidate-selector>')).slice(0,3).map(el => ({ html: el.outerHTML.slice(0, 300), hasLink: !!el.querySelector('a[href]'), text: el.textContent.trim().slice(0, 120) }))"
```

A good root:

- Returns roughly 8–20 elements (typical per-page result count).
- Each element contains an external `<a href>` and a title-ish heading.
- Is minimal — don't pick an ancestor that also wraps unrelated page chrome.

If class names are obfuscated or absent, compose a selector with `:has()`,
attribute selectors, or `nth-of-type` to stay stable.

**5d. Identify `url`, `props`, and `button` placement** within one root:

- **url** — usually a descendant `<a>` with an external `href`. Prefer a
  bare `<a>` selector whenever a direct `href` exists. Fall back to
  `[domainToURL, ...]`, `[regexSubstitute, ...]`, or `[attribute, ...]`
  only when the real URL isn't in a plain `href` (e.g. a bare domain in
  text, or a URL hidden in a JSON blob as with Bing images).
- **props** — at minimum extract `title`. Add other fields a user might want
  to match on in rules.
- **button placement** — a spot where an icon button fits without breaking
  layout.

## Step 6 — Generate the YAML

Follow these rules:

- Top-level: set only `name`. Omit every other top-level field
  (`version`, `description`, `homepage`, `lastModified`).
- Group by URL, not by category. If several categories share the same
  `matches`, prefer one page with multiple `results` entries (each with its
  own `root` and a `$category` override in per-result `props`) over duplicate
  pages. Split into separate pages when the URL itself distinguishes
  categories (e.g. Google's `tbm` / `udm` params — use `includeRegex` /
  `excludeRegex`).
- Use a descriptive `name` like `Web`, `Images (desktop)`, or the URL path
  when one page covers multiple categories.
- `matches` uses uBlacklist match-pattern syntax, e.g.
  `https://search.example.com/search?*`.
- For each result:
  - `root`: CSS selector for the result container.
  - `url`: a bare CSS selector means "`href` of the matched element". Use
    `[attribute, "name"]`, `[regexSubstitute, pattern, repl, <inner>]`, or
    `[domainToURL, <inner>]` when the URL isn't a plain `href`.
  - `props`: map of name → property command. At minimum `title`.
  - `button`: **prefer `[icon]`** (default icon button). Only fall back to
    `[inset, {top, right, ...}]` or `[text, {position, ...}]` when an icon
    button would overlap or break the layout.
  - `preserveSpace: true` only when a blocked result would cause layout shift
    (typical for image grids).
- `commonProps`: always set `$site` and `$category` so users can write rules
  like `$site = "example" & $category = "web"`.
- `delay`: set `true` (or a concrete ms value) when results render
  asynchronously / client-side.

## Step 7 — Verify selectors against the live page

For each result entry, translate its commands to equivalent JavaScript and run
them through `playwright-cli eval`. Report counts and samples so the user can
sanity-check.

```bash
# root count
playwright-cli eval "document.querySelectorAll('.result.web-result').length"

# url extraction (3 samples)
playwright-cli eval "Array.from(document.querySelectorAll('.result.web-result')).slice(0,3).map(r => r.querySelector('a.result__a')?.href)"

# title extraction (3 samples)
playwright-cli eval "Array.from(document.querySelectorAll('.result.web-result')).slice(0,3).map(r => r.querySelector('a.result__a')?.textContent?.trim())"
```

Translation cheat sheet (SERPINFO → JS on a `root` element):

| SERPINFO command                   | JS on `root`                                                              |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `"<sel>"` (property)               | `root.querySelector("<sel>")?.textContent`                                |
| `"<sel>"` as `url`                 | `root.querySelector("<sel>")?.href`                                       |
| `[attribute, "n", "<sel>"]`        | `root.querySelector("<sel>")?.getAttribute("n")`                          |
| `[property, "n", "<sel>"]`         | `root.querySelector("<sel>")?.["n"]`                                      |
| `[upward, N, "<sel>"]` (element)   | walk `N` parents up from `root.querySelector("<sel>")`                    |
| `[const, "<v>"]`                   | `"<v>"`                                                                   |
| `[regexInclude, p, <inner>]`       | `new RegExp(p).test(inner) ? inner : undefined`                           |
| `[regexExclude, p, <inner>]`       | `new RegExp(p).test(inner) ? undefined : inner`                           |
| `[regexSubstitute, p, r, <inner>]` | `inner.replace(new RegExp(p), r)`                                         |
| `[domainToURL, <inner>]`           | extract domain-shaped substring from `inner`, return `https://${domain}/` |
| `[or, [c1, c2, ...]]`              | `c1() ?? c2() ?? ...`                                                     |

Fix any selector that returns `0`, `null`, or `undefined` and re-run until
counts and samples look right. Then close the browser:

```bash
playwright-cli close-all
```

## Step 8 — Present the result

Output the final YAML in a single fenced code block. Then tell the user:

> The YAML can be copied to the clipboard with `/copy`. Paste it into
> **Options → Other Search Engines → My SERPINFO** and click Save. Reload a
> matching SERP to see the block buttons.

## Rules of thumb

- Keep selectors minimal and robust. Prefer a short class/attribute selector
  over `div > div > span.foo`. When an element carries multiple classes, pick
  the smallest subset that uniquely identifies it — stacking every class is
  unnecessary and brittle.
- Prefer repeating-structure evidence over class-name vibes. Class names
  containing `result` etc. are hints, not proof.
- Don't invent fields that aren't in the spec. When unsure, re-read
  `docs/serpinfo-spec.md`.
- Never commit the generated YAML on the user's behalf unless they ask.
