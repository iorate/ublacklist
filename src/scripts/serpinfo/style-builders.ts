import {
  type CssNode,
  clone,
  generate,
  type List,
  type ListItem,
  parse,
  type Selector,
  string,
  walk,
} from "css-tree";
import { defaultBlockColor } from "../constants.ts";
import { attributes as a } from "./constants.ts";
import type { CSSProperties } from "./css-stringify.ts";

const specificityBoost = ":not(#ub-never)";

export function expandExtraSelector(
  extraSelector: string,
  rootSelector: string,
): string[] {
  try {
    const extraNode = parse(extraSelector, { context: "selectorList" });
    if (extraNode.type !== "SelectorList") {
      throw new Error("extraSelector must be a selector list");
    }
    const rootNode = parse(rootSelector, { context: "selector" });
    if (rootNode.type !== "Selector") {
      throw new Error("rootSelector must be a selector");
    }
    const nestings: [ListItem<CssNode>, List<CssNode>][] = [];
    walk(extraNode, (node, item, list) => {
      if (node.type === "NestingSelector") {
        nestings.push([item, list]);
      }
    });
    for (const [item, list] of nestings) {
      const replacement = clone(rootNode) as Selector;
      list.replace(item, replacement.children);
    }
    const selectors: string[] = [];
    extraNode.children.forEach((selector) => {
      selectors.push(generate(selector));
    });
    return selectors;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function buildSelector(
  extraSelectors: readonly string[],
  rootSelector: string,
  prefix = "",
  suffix = "",
): string {
  return [
    `${prefix}${rootSelector}${specificityBoost}${suffix}`,
    ...extraSelectors.flatMap((extraSelector) =>
      expandExtraSelector(
        extraSelector,
        `[${a.extraSelector}=${string.encode(extraSelector)}]${rootSelector}${specificityBoost}`,
      ).map((selector) => `${prefix}${selector}${suffix}`),
    ),
  ].join(", ");
}

export function buildHideStyle(
  extraSelectors: readonly string[],
): CSSProperties {
  const displayRoot = `[${a.block}]:not([${a.preserveSpace}])`;
  const visibilityRoot = `[${a.block}][${a.preserveSpace}]`;
  const hidePrefix = `[${a.hideBlockedResults}] `;
  return {
    [buildSelector(extraSelectors, displayRoot, hidePrefix)]: {
      display: "none !important",
    },
    [`${buildSelector(extraSelectors, visibilityRoot, hidePrefix)}, ${buildSelector(extraSelectors, visibilityRoot, hidePrefix, " *")}`]:
      {
        visibility: "hidden !important" as "hidden",
      },
  };
}

export function buildBlockStyle(
  extraSelectors: readonly string[],
  color: string,
): CSSProperties {
  const blockColorRoot = `[${a.block}]`;
  return {
    [buildSelector(extraSelectors, blockColorRoot)]: {
      backgroundColor: `${color !== "default" ? color : defaultBlockColor} !important`,
    },
    [buildSelector(extraSelectors, blockColorRoot, "", " *")]: {
      backgroundColor: "transparent !important",
    },
  };
}

export function buildHighlightStyle(
  extraSelectors: readonly string[],
  colors: readonly string[],
): CSSProperties {
  let properties: CSSProperties = {};
  for (const [index, color] of colors.entries()) {
    const highlightRoot = `[${a.highlight}="${index + 1}"]`;
    properties = {
      ...properties,
      [buildSelector(extraSelectors, highlightRoot)]: {
        backgroundColor: `${color} !important`,
      },
      [buildSelector(extraSelectors, highlightRoot, "", " *")]: {
        backgroundColor: "transparent !important",
      },
    };
  }
  return properties;
}
