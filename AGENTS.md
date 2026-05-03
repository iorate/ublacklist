# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

uBlacklist is a browser extension that blocks specific sites from appearing in search engine results. It supports Chrome, Firefox, and Safari, with cloud sync via Google Drive, Dropbox, WebDAV, and browser sync.

## Development Commands

```shell
# Install dependencies (pnpm >= 10 required)
pnpm install

# Build extension (outputs to dist/<browser>[-debug])
pnpm build [--browser=chrome|firefox|safari] [--debug]

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

- Ruleset syntax: `docs/ruleset-spec.md`
- SERPINFO format: `docs/serpinfo-spec.md`

## Adding or Changing Messages

1. Edit `src/_locales/en/messages.json` (English is the source of truth; other locales are managed via Crowdin — do not edit them directly).
2. Run `pnpm generate:message-names` to regenerate message name constants.

## Related Repositories

uBlacklist is split across multiple repositories:

- [iorate/ublacklist](https://github.com/iorate/ublacklist) — this repository, the extension itself.
- [ublacklist/builtin](https://github.com/ublacklist/builtin) — built-in SERPINFO files (the extension downloads these periodically).
- [ublacklist/ublacklist.github.io](https://github.com/ublacklist/ublacklist.github.io) — website and documentation.
- [ublacklist/store-assets](https://github.com/ublacklist/store-assets) — store listing descriptions and screenshots.

Changes to a specific subsystem belong in its repository.
