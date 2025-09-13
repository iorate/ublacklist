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

For simple contributions like typo fixes, you can create a pull request directly.

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

## Translation

**Please use [Crowdin](https://crowdin.com/project/ublacklist) for all translations.**

Do not submit pull requests directly to `src/_locales/`. All translation work should be done through Crowdin.

## License

By contributing to uBlacklist, you agree that your contributions will be licensed under the [MIT License](LICENSE.txt).
