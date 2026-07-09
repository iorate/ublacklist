# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

uBlacklist is a browser extension that blocks specific sites from appearing in search engine results. It supports Chrome, Firefox, Edge, and Safari, with cloud sync via Google Drive, Dropbox, WebDAV, and browser sync.

## Development Commands

```shell
# Install dependencies (pnpm >= 10 required)
pnpm install

# Build extension (outputs to dist/<browser>[-debug])
pnpm build [--browser=chrome|firefox|edge|safari] [--debug]

# Run all checks (biome, prettier, typescript)
pnpm check

# Run tests
pnpm test

# Fix linting/formatting issues
pnpm fix
```

## Verifying Changes

After editing, run `pnpm check` to verify (this runs biome, prettier, and tsgo together).

## Subsystem References

- Ruleset syntax: [ruleset specification](https://github.com/ublacklist/packages/blob/main/packages/ruleset/docs/spec.md) in ublacklist/packages
- SERPINFO format: [SERPINFO specification](https://github.com/ublacklist/packages/blob/main/packages/serpinfo/docs/spec.md) in ublacklist/packages

## Adding or Changing Messages

1. Edit `src/_locales/en/messages.json` (English is the source of truth; other locales are managed via Crowdin — do not edit them directly).
2. Run `pnpm generate:message-names` to regenerate message name constants.

## Related Repositories

uBlacklist is split across multiple repositories:

- [iorate/ublacklist](https://github.com/iorate/ublacklist) — this repository, the extension itself.
- [ublacklist/builtin](https://github.com/ublacklist/builtin) — built-in SERPINFO files (the extension downloads these periodically).
- [ublacklist/packages](https://github.com/ublacklist/packages) — npm packages (`@ublacklist/match-pattern`, `@ublacklist/ruleset`, `@ublacklist/serpinfo`) and the ruleset/SERPINFO format specifications.
- [ublacklist/store-assets](https://github.com/ublacklist/store-assets) — store listing descriptions and screenshots.
- [ublacklist/ublacklist.github.io](https://github.com/ublacklist/ublacklist.github.io) — website and documentation.

Changes to a specific subsystem belong in its repository.
