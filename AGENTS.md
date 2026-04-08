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

# Generate files
pnpm generate:ruleset-parser    # Rebuild Lezer parser from grammar
pnpm generate:message-names     # Generate message name constants
```

## Architecture

### Entry Points

- `src/scripts/background.ts` - Service worker / background script
- `src/scripts/serpinfo/content-script.ts` - Content script injected into SERPs
- `src/scripts/options.tsx` - Options page (React)
- `src/scripts/popup.tsx` - Browser action popup (React)

### Key Subsystems

**Ruleset Engine** (`src/scripts/ruleset/`):

- Uses Lezer parser generated from `ruleset.grammar`
- Supports match patterns (`*://*.example.com/*`) and expressions with regex, variables, string matchers
- Parser output is `parser.generated.ts` - regenerate with `pnpm generate:ruleset-parser`
- Syntax reference: `docs/ruleset-spec.md`

**SERPINFO System** (`src/scripts/serpinfo/`):

- Declarative system for defining how to find/filter results on different search engines
- `filter.ts` - Core filtering logic using MutationObserver
- `schemas.ts` - Zod schemas for SERP configuration
- User-defined configurations stored via `storage-store.ts`
- Format reference: `docs/serpinfo-spec.md`

## Code Style

- Use `.ts` import extensions (enforced by linter)
- React components use goober for CSS-in-JS styling
- State management via Zustand stores

## Localization

- Translations managed via Crowdin - do not edit `src/_locales/` directly
- Message names generated from English messages - run `pnpm generate:message-names` after changing
