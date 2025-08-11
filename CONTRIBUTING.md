# Contributing to uBlacklist

This document provides guidelines for contributing to the project.

## Getting Started

### Before Creating Issues

**Please start with [GitHub Discussions](https://github.com/iorate/ublacklist/discussions) instead of creating issues directly.**

- **🐛 [Bugs](https://github.com/iorate/ublacklist/discussions/new?category=bugs)** - Raise a bug report
- **💡 [Ideas](https://github.com/iorate/ublacklist/discussions/new?category=ideas)** - Suggest your feature idea

Issues are created from discussions after verification and approval.

### Before Creating Pull Requests

**For major changes, please start with a discussion first.**

For simple contributions like translations, documentation improvements, or obvious bug fixes, you can create a pull request directly.

## Development

### Prerequisites

[pnpm](https://pnpm.io/) >= 10 is required.

### Installation

```shell
git clone --recurse-submodules https://github.com/iorate/ublacklist.git
cd ublacklist
pnpm install
```

### Build

```shell
# Usage: pnpm build [--browser BROWSER] [--version VERSION] [--debug] [--watch]
pnpm build
pnpm build --browser=firefox
```

### Check

Run all checks and tests before submitting a pull request:

```shell
pnpm check
pnpm test
```

### Environment Variables

For developing sync features, create a `.env` file with your API keys:

```
DROPBOX_API_KEY=...
DROPBOX_API_SECRET=...
GOOGLE_DRIVE_API_KEY=...
GOOGLE_DRIVE_API_SECRET=...
```

## Adding a New Locale

To add support for a new language:

1. **Determine the language code**: Use an ISO language code from [kLanguageInfoTable](https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc) (e.g., `en`, `ja`, `de`).

2. **Create translation file**: Copy `src/_locales/en/messages.json.ts` to `src/_locales/${languageCode}/messages.json.ts` and translate all entries.

3. **Add dayjs locale**: Open `src/scripts/dayjs-locales.ts` and import the corresponding dayjs locale.

4. **Add web store assets** (optional): Create `web-store-assets/${languageCode}/` and add:
   - `description.txt` - Translated extension description
   - Screenshots (1280x800, Chrome Web Store only)

## License

By contributing to uBlacklist, you agree that your contributions will be licensed under the [MIT License](LICENSE.txt).
