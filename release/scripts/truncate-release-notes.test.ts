import assert from "node:assert/strict";
import { test } from "node:test";
import { truncateReleaseNotes } from "./truncate-release-notes.ts";

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
    "truncates at a paragraph boundary and appends a link to the full release notes",
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
