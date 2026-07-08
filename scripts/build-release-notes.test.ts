import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractReleaseNotes,
  truncateReleaseNotes,
} from "./build-release-notes.ts";

test("extractReleaseNotes", async (t) => {
  await t.test(
    "extracts the latest section without heading or blank lines",
    () => {
      const changelog = `# ublacklist

## 9.5.0

### Minor Changes

- abc1234: Add a feature

### Patch Changes

- def5678: Fix a bug


## 9.4.0

- old0001: Previous fix
`;
      assert.equal(
        extractReleaseNotes(changelog),
        `### Minor Changes

- abc1234: Add a feature

### Patch Changes

- def5678: Fix a bug`,
      );
    },
  );

  await t.test("handles the first release with no previous section", () => {
    const changelog = `# ublacklist

## 1.0.0

- abc1234: First release

`;
    assert.equal(extractReleaseNotes(changelog), "- abc1234: First release");
  });

  await t.test("does not treat a `### ` heading as a version heading", () => {
    const changelog = `# ublacklist

## 1.0.0

### Patch Changes

- abc1234: Fix
`;
    assert.equal(
      extractReleaseNotes(changelog),
      `### Patch Changes

- abc1234: Fix`,
    );
  });

  await t.test("throws when no version heading is present", () => {
    assert.throws(
      () => extractReleaseNotes("# ublacklist\n\nNothing here yet.\n"),
      /No version heading/,
    );
  });
});

test("truncateReleaseNotes", async (t) => {
  const url = "https://example.com/v1.0.0";
  const suffix = `[See the full release notes](${url})`;
  const one = `- ${"1".repeat(30)}`;
  const two = `- ${"2".repeat(30)}`;
  const three = `- ${"3".repeat(30)}`;

  await t.test("returns the notes unchanged when within the limit", () => {
    const notes = "### Minor Changes\n\n- Add a feature";
    assert.equal(truncateReleaseNotes(notes, notes.length, url), notes);
  });

  await t.test(
    "truncates at a paragraph boundary and appends a link to the full notes",
    () => {
      const notes = `### A\n\n${one}\n\n${two}\n\n${three}`;
      assert.equal(
        truncateReleaseNotes(notes, suffix.length + 41, url),
        `### A\n\n${one}\n\n${suffix}`,
      );
    },
  );

  await t.test("does not skip a long paragraph to keep a later one", () => {
    const long = `- ${"x".repeat(60)}`;
    const notes = `${one}\n\n${long}\n\n${two}`;
    assert.equal(
      truncateReleaseNotes(notes, suffix.length + 34, url),
      `${one}\n\n${suffix}`,
    );
  });
});
