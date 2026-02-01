# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

uBlacklist is a browser extension that blocks specific sites from appearing in search engine results. It supports Chrome, Firefox, and Safari, with cloud sync via Google Drive, Dropbox, WebDAV, and browser sync.

## Development Commands

```shell
# Install dependencies (pnpm >= 10 required)
pnpm install

# Build extension (outputs to dist/<browser>[-debug])
pnpm build                      # Chrome (default)
pnpm build --browser=firefox    # Firefox
pnpm build --browser=safari     # Safari
pnpm build --debug              # Debug build with sourcemaps

# Run all checks (biome, prettier, tsc)
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

- `src/scripts/background.ts` - Service worker/background script handling sync, subscriptions, cloud connections, and content script registration
- `src/scripts/serpinfo/content-script.ts` - Content script injected into search engine result pages (SERPs) to filter/block results
- `src/scripts/options.tsx` - Options page React application
- `src/scripts/popup.tsx` - Browser action popup React application

### Key Subsystems

**Ruleset Engine** (`src/scripts/ruleset/`):

- Uses Lezer parser generated from `ruleset.grammar`
- Supports match patterns (`*://*.example.com/*`) and expressions with regex, variables, string matchers
- Parser output is `parser.generated.ts` - regenerate with `pnpm generate:ruleset-parser`

**SERP Info System** (`src/scripts/serpinfo/`):

- Declarative system for defining how to find/filter results on different search engines
- `filter.ts` - Core filtering logic using MutationObserver
- `schemas.ts` - Zod schemas for SERP configuration
- User-defined configurations stored via `storage-store.ts`

**Cloud Sync** (`src/scripts/clouds/`):

- `google-drive.ts`, `dropbox.ts`, `webdav.ts`, `browser-sync.ts` - Provider implementations
- `helpers.ts` - OAuth flow helpers with browser-specific handling

**Storage** (`src/scripts/background/`):

- `raw-storage.ts` - Low-level browser storage access
- `local-storage.ts` - Application state management
- `sync.ts` - Cloud synchronization logic

### Build System

- `scripts/build.ts` - esbuild-based bundler
- `src/manifest.ts` - Generates browser-specific manifest.json
- Environment variables for cloud API keys loaded from `.env` or `.env.local`

### TypeScript Configuration

- `tsconfig.browser.json` - For extension code
- `tsconfig.node.json` - For build scripts
- Uses project references with root `tsconfig.json`

## Code Style

- Biome for linting/formatting TypeScript
- Prettier for markdown/YAML only
- Use `.ts` import extensions (enforced by linter)
- React components use goober for CSS-in-JS styling
- State management via Zustand stores

## Localization

- Translations managed via Crowdin - do not edit `src/_locales/` directly
- Message names generated from English messages - run `pnpm generate:message-names` after changing
