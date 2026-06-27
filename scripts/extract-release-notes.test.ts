import assert from "node:assert/strict";
import { test } from "node:test";
import { extractReleaseNotes } from "./extract-release-notes.ts";

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
