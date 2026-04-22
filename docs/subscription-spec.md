# Subscription Specification

Reference for uBlacklist subscriptions. A subscription is a remote list of rules
that uBlacklist downloads periodically and applies in addition to the user's
personal ruleset.

## Formats

A subscription can be in one of two formats, selected per subscription.

### Ruleset (default)

The URL returns a uBlacklist ruleset as described in
[`ruleset-spec.md`](./ruleset-spec.md). The response body is used verbatim.

### Domains

The URL returns a plain list of domains, one per line. Each valid line is
converted to the match pattern `*://*.<domain>/*`, which blocks the domain and
all of its subdomains.

Accepted line formats:

- A single domain: `example.com`
- A blank line
- A comment starting with `#` (leading whitespace is allowed)

A domain is considered valid when it:

- consists only of ASCII letters, digits, `.`, and `-`
  (IDNs must be supplied in Punycode form, e.g. `xn--fsq.xn--zckzah`)
- contains at least one `.`
- has no empty, leading-hyphen, or trailing-hyphen labels
- is at most 253 characters overall, with each label at most 63 characters

Invalid lines (including `hosts(5)`-style lines with an IP prefix such as
`0.0.0.0 example.com`, or lines containing anything other than a single domain)
are ignored.

Example input:

```
# Block example.com and example.net
example.com
sub.example.net
```

Is converted to:

```
*://*.example.com/*

*://*.sub.example.net/*
```

Line numbers are preserved across the conversion so that the original line is
shown when a matched rule is displayed.

## Subscription links

An options page link can be published as:

```
https://ublacklist.github.io/rulesets/subscribe?url=<URL>[&name=<NAME>][&type=<TYPE>]
```

Query parameters:

| Parameter | Required | Description                                                      |
| --------- | -------- | ---------------------------------------------------------------- |
| `url`     | Yes      | URL of the subscription content.                                 |
| `name`    | No       | Initial name shown in the "Add a subscription" dialog.           |
| `type`    | No       | `ruleset` (default) or `domains`. Selects the subscription type. |

Visiting such a link opens the uBlacklist options page with the "Add a
subscription" dialog pre-filled.
