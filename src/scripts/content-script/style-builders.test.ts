import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultBlockColor } from "../shared/constants.ts";
import {
  buildBlockStyle,
  buildHideStyle,
  buildHighlightStyle,
  expandExtraSelector,
} from "./style-builders.ts";

test("expandExtraSelector", async (t) => {
  await t.test("replaces a single nesting selector", () => {
    assert.deepEqual(expandExtraSelector("& + tr", "[data-ub-block]"), [
      "[data-ub-block]+tr",
    ]);
  });

  await t.test("returns one selector per top-level selector", () => {
    assert.deepEqual(
      expandExtraSelector("& + tr, & + tr + tr", "[data-ub-block]"),
      ["[data-ub-block]+tr", "[data-ub-block]+tr+tr"],
    );
  });

  await t.test("replaces every nesting selector in a selector", () => {
    assert.deepEqual(expandExtraSelector("& + & + &", ".r"), [".r+.r+.r"]);
  });

  await t.test("replaces a nesting selector nested in :has()", () => {
    assert.deepEqual(
      expandExtraSelector(".header:has(+ &)", "[data-ub-block]"),
      [".header:has(+[data-ub-block])"],
    );
  });

  await t.test("returns an empty array for an invalid selector", () => {
    assert.deepEqual(expandExtraSelector("&[", "[data-ub-block]"), []);
  });
});

test("buildHideStyle", async (t) => {
  await t.test("without extra selectors", () => {
    assert.deepEqual(buildHideStyle([]), {
      "[data-ub-hide-blocked-results] [data-ub-block]:not([data-ub-preserve-space]):not(#ub-never)":
        { display: "none !important" },
      "[data-ub-hide-blocked-results] [data-ub-block][data-ub-preserve-space]:not(#ub-never), [data-ub-hide-blocked-results] [data-ub-block][data-ub-preserve-space]:not(#ub-never) *":
        { visibility: "hidden !important" },
    });
  });

  await t.test("with an extra selector", () => {
    const style = buildHideStyle(["& + tr"]);
    const keys = Object.keys(style);
    assert.equal(
      keys[0],
      '[data-ub-hide-blocked-results] [data-ub-block]:not([data-ub-preserve-space]):not(#ub-never), [data-ub-hide-blocked-results] [data-ub-extra-selector="& + tr"][data-ub-block]:not([data-ub-preserve-space]):not(#ub-never)+tr',
    );
    assert.equal(
      keys[1],
      '[data-ub-hide-blocked-results] [data-ub-block][data-ub-preserve-space]:not(#ub-never), [data-ub-hide-blocked-results] [data-ub-extra-selector="& + tr"][data-ub-block][data-ub-preserve-space]:not(#ub-never)+tr, [data-ub-hide-blocked-results] [data-ub-block][data-ub-preserve-space]:not(#ub-never) *, [data-ub-hide-blocked-results] [data-ub-extra-selector="& + tr"][data-ub-block][data-ub-preserve-space]:not(#ub-never)+tr *',
    );
  });
});

test("buildBlockStyle", async (t) => {
  await t.test("resolves the default color", () => {
    assert.deepEqual(buildBlockStyle([], "default"), {
      "[data-ub-block]:not(#ub-never)": {
        backgroundColor: `${defaultBlockColor} !important`,
      },
      "[data-ub-block]:not(#ub-never) *": {
        backgroundColor: "transparent !important",
      },
    });
  });

  await t.test("uses an explicit color and includes extra selectors", () => {
    const style = buildBlockStyle(["& + tr"], "#abcdef");
    const keys = Object.keys(style);
    assert.equal(
      keys[0],
      '[data-ub-block]:not(#ub-never), [data-ub-extra-selector="& + tr"][data-ub-block]:not(#ub-never)+tr',
    );
    assert.deepEqual(style[keys[0]], {
      backgroundColor: "#abcdef !important",
    });
  });
});

test("buildHighlightStyle", async (t) => {
  await t.test("one rule pair per color", () => {
    assert.deepEqual(buildHighlightStyle([], ["#aaa", "#bbb"]), {
      '[data-ub-highlight="1"]:not(#ub-never)': {
        backgroundColor: "#aaa !important",
      },
      '[data-ub-highlight="1"]:not(#ub-never) *': {
        backgroundColor: "transparent !important",
      },
      '[data-ub-highlight="2"]:not(#ub-never)': {
        backgroundColor: "#bbb !important",
      },
      '[data-ub-highlight="2"]:not(#ub-never) *': {
        backgroundColor: "transparent !important",
      },
    });
  });

  await t.test("includes extra selectors", () => {
    const style = buildHighlightStyle(["& + tr"], ["#aaa"]);
    assert.ok(
      Object.keys(style).some((key) =>
        key.includes(
          '[data-ub-extra-selector="& + tr"][data-ub-highlight="1"]:not(#ub-never)+tr',
        ),
      ),
    );
  });
});
