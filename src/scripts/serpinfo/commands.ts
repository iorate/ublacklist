import stringHash from "@sindresorhus/string-hash";
import * as csstree from "css-tree";
import type { PropertiesHyphen } from "csstype";
import punycode from "punycode/";
import { z } from "zod";
import { tupleWithOptional } from "zod-tuple-with-optional";
import { type ButtonProps, createButton } from "./button.ts";
import * as C from "./constants.ts";
import { discriminatedTupleUnion } from "./discriminated-tuple-union.ts";
import * as GlobalStyles from "./global-styles.ts";

type ExtractArgs<C, K> = C extends [K, ...infer Args] ? Args : never;

export const selectorSchema = z.string().refine(
  (value) => {
    try {
      csstree.parse(value, { context: "selectorList" });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid selector" },
);

export const regexSchema = z.string().refine(
  (value) => {
    try {
      new RegExp(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid regular expression" },
);

function upward(
  element: Element,
  levelOrSelector: number | string,
): Element | null {
  if (typeof levelOrSelector === "number") {
    let parent: Element | null = element;
    for (let i = 0; i < levelOrSelector; ++i) {
      parent = parent.parentElement;
      if (parent == null) {
        return null;
      }
    }
    return parent;
  }
  const parent = element.parentElement;
  if (parent == null) {
    return null;
  }
  return parent.closest(levelOrSelector);
}

export type ElementCommand =
  | ["selector", string, ElementCommand?]
  | ["upward", number | string, ElementCommand?]
  | string;

export const elementCommandSchema: z.ZodType<ElementCommand> =
  discriminatedTupleUnion([
    tupleWithOptional([
      z.literal("selector"),
      selectorSchema,
      z.lazy(() => elementCommandSchema).optional(),
    ]),
    tupleWithOptional([
      z.literal("upward"),
      z.number().or(z.string()),
      z.lazy(() => elementCommandSchema).optional(),
    ]),
  ]).or(selectorSchema);

export type ElementCommandContext = { root: Element };

type ElementCommandImpl = {
  [K in Exclude<ElementCommand, string>[0]]: (
    context: ElementCommandContext,
    ...args: ExtractArgs<ElementCommand, K>
  ) => Element | null;
};

const elementCommandImpl: ElementCommandImpl = {
  selector(context, selector, rootCommand) {
    const root = getRoot(context, rootCommand);
    if (root == null) {
      return null;
    }
    return root.querySelector(selector);
  },
  upward(context, levelOrSelector, rootCommand) {
    const root = getRoot(context, rootCommand);
    if (root == null) {
      return null;
    }
    return upward(root, levelOrSelector);
  },
};

function getRoot(
  context: ElementCommandContext,
  rootCommand?: ElementCommand,
): Element | null {
  return rootCommand != null
    ? runElementCommand(context, rootCommand)
    : context.root;
}

export function runElementCommand(
  context: ElementCommandContext,
  command: ElementCommand,
): Element | null {
  if (typeof command === "string") {
    return elementCommandImpl.selector(context, command);
  }
  const [type, ...args] = command;
  return (
    elementCommandImpl[type] as (
      context: ElementCommandContext,
      ...args: readonly unknown[]
    ) => Element | null
  )(context, ...args);
}

export type RootsCommand =
  | ["selector", string]
  | ["upward", number | string, RootsCommand]
  | string;

export const rootsCommandSchema: z.ZodType<RootsCommand> =
  discriminatedTupleUnion([
    z.tuple([z.literal("selector"), selectorSchema]),
    z.tuple([
      z.literal("upward"),
      z.number().or(z.string()),
      z.lazy(() => rootsCommandSchema),
    ]),
  ]).or(selectorSchema);

type RootsCommandImpl = {
  [K in Exclude<RootsCommand, string>[0]]: (
    ...args: ExtractArgs<RootsCommand, K>
  ) => Element[];
};

const rootCommandImpl: RootsCommandImpl = {
  selector(selector) {
    return [...document.body.querySelectorAll(selector)];
  },
  upward(levelOrSelector, command) {
    return runRootsCommand(command).flatMap(
      (root) => upward(root, levelOrSelector) || [],
    );
  },
};

export function runRootsCommand(command: RootsCommand): Element[] {
  if (typeof command === "string") {
    return rootCommandImpl.selector(command);
  }
  const [type, ...args] = command;
  return (rootCommandImpl[type] as (...args: readonly unknown[]) => Element[])(
    ...args,
  );
}

export type PropertyCommand =
  | ["attribute", string, ElementCommand?]
  | ["const", string]
  | ["domainToURL", PropertyCommand]
  | ["or", PropertyCommand[], ElementCommand?]
  | ["property", string, ElementCommand?]
  | ["regexExclude", string, PropertyCommand]
  | ["regexInclude", string, PropertyCommand]
  | ["regexSubstitute", string, string, PropertyCommand]
  | string;

export const propertyCommandSchema: z.ZodType<PropertyCommand> =
  discriminatedTupleUnion([
    tupleWithOptional([
      z.literal("attribute"),
      z.string(),
      elementCommandSchema.optional(),
    ]),
    z.tuple([z.literal("const"), z.string()]),
    z.tuple([z.literal("domainToURL"), z.lazy(() => propertyCommandSchema)]),
    tupleWithOptional([
      z.literal("or"),
      z.lazy(() => propertyCommandSchema).array(),
      elementCommandSchema.optional(),
    ]),
    tupleWithOptional([
      z.literal("property"),
      z.string(),
      elementCommandSchema.optional(),
    ]),
    z.tuple([
      z.literal("regexExclude"),
      regexSchema,
      z.lazy(() => propertyCommandSchema),
    ]),
    z.tuple([
      z.literal("regexInclude"),
      regexSchema,
      z.lazy(() => propertyCommandSchema),
    ]),
    z.tuple([
      z.literal("regexSubstitute"),
      regexSchema,
      z.string(),
      z.lazy(() => propertyCommandSchema),
    ]),
  ]).or(selectorSchema);

export type PropertyCommandContext = ElementCommandContext;

type PropertyCommandImpl = {
  [K in Exclude<PropertyCommand, string>[0]]: (
    context: PropertyCommandContext,
    ...args: ExtractArgs<PropertyCommand, K>
  ) => string | null;
};

const propertyCommandImpl: PropertyCommandImpl = {
  attribute(context, name, rootCommand) {
    const root = getRoot(context, rootCommand);
    if (root == null) {
      return null;
    }
    return root.getAttribute(name);
  },
  const(_context, value) {
    return value;
  },
  domainToURL(context, command) {
    const text = runPropertyCommand(context, command);
    if (text == null) {
      return null;
    }
    // https://stackoverflow.com/questions/47514123/domain-name-regex-including-idn-characters-c-sharp
    const m = /(?:[\p{L}\p{N}][\p{L}\p{N}_-]*\.)+[\p{L}\p{N}]{2,}/u.exec(text);
    if (m == null) {
      return null;
    }
    return `https://${punycode.toASCII(m[0])}/`;
  },
  or(context, commands) {
    for (const command of commands) {
      const property = runPropertyCommand(context, command);
      if (property != null) {
        return property;
      }
    }
    return null;
  },
  property(context, name, rootCommand) {
    const root = getRoot(context, rootCommand);
    if (root == null) {
      return null;
    }
    const value = (root as unknown as Record<string, unknown>)[name];
    return typeof value === "string" ? value : null;
  },
  regexExclude(context, regex, command) {
    const text = runPropertyCommand(context, command);
    if (text == null) {
      return null;
    }
    return new RegExp(regex).test(text) ? null : text;
  },
  regexInclude(context, regex, command) {
    const text = runPropertyCommand(context, command);
    if (text == null) {
      return null;
    }
    return new RegExp(regex).test(text) ? text : null;
  },
  regexSubstitute(context, regex, replacement, command) {
    const text = runPropertyCommand(context, command);
    if (text == null) {
      return null;
    }
    const matches = new RegExp(regex).exec(text);
    if (matches == null) {
      return null;
    }
    return replacement.replaceAll(/\\\d/g, (p) => matches[Number(p[1])] ?? "");
  },
};

export function runPropertyCommand(
  context: PropertyCommandContext,
  command: PropertyCommand,
): string | null {
  if (typeof command === "string") {
    return propertyCommandImpl.property(context, "textContent", command);
  }
  const [type, ...args] = command;
  return (
    propertyCommandImpl[type] as (
      context: PropertyCommandContext,
      ...args: readonly unknown[]
    ) => string | null
  )(context, ...args);
}

export type ButtonCommand = z.infer<typeof buttonCommandSchema>;

const cssLengthPercentageSchema = z.literal(0).or(z.string());

function cssStringify(properties: PropertiesHyphen): string {
  return `{${Object.entries(properties)
    .map(([key, value]) => (value != null ? `${key}:${value};` : ""))
    .join("")}}`;
}

export const buttonCommandSchema = discriminatedTupleUnion([
  tupleWithOptional([
    z.literal("inset"),
    z
      .object({
        top: cssLengthPercentageSchema.optional(),
        right: cssLengthPercentageSchema.optional(),
        bottom: cssLengthPercentageSchema.optional(),
        left: cssLengthPercentageSchema.optional(),
        zIndex: z.number().optional(),
      })
      .optional(),
    elementCommandSchema.optional(),
  ]),
]);

export type ButtonCommandContext = ElementCommandContext & {
  buttonProps: ButtonProps;
};

type ButtonCommandImpl = {
  [K in Exclude<ButtonCommand, string>[0]]: (
    context: ButtonCommandContext,
    ...args: ExtractArgs<ButtonCommand, K>
  ) => (() => void) | null;
};

const buttonCommandImpl: ButtonCommandImpl = {
  inset(context, options = { top: 0, right: 0 }, rootCommand) {
    const BI = "data-ub-button-inset";
    const BPI = "data-ub-button-parent-inset";
    const R = C.RESULT_ATTRIBUTE;
    const OPACITY = 0.65;

    const parent = getRoot(context, rootCommand);
    if (parent == null) {
      return null;
    }
    if (!GlobalStyles.has("button-parent-inset")) {
      GlobalStyles.set("button-parent-inset", `[${BPI}]{position:relative;}`);
    }
    parent.setAttribute(BPI, "1");

    const button = createButton(context.buttonProps);
    button.setAttribute(C.BUTTON_ATTRIBUTE, "1");
    if (!GlobalStyles.has("button-inset")) {
      GlobalStyles.set(
        "button-inset",
        `[${BI}]{position:absolute;opacity:${OPACITY};}` +
          `@media (hover: hover){[${BI}]{opacity:0;}[${R}]:hover [${BI}],[${R}]:focus-within [${BI}]{opacity:${OPACITY};}}`,
      );
    }
    const buttonStyle = cssStringify({
      // property order is fixed for consistent CSS stringification
      top: options.top,
      right: options.right,
      bottom: options.bottom,
      left: options.left,
      "z-index": options.zIndex ?? 1,
    });
    const buttonStyleHash = stringHash(buttonStyle);
    if (!GlobalStyles.has(`button-inset-${buttonStyleHash}`)) {
      GlobalStyles.set(
        `button-inset-${buttonStyleHash}`,
        `[${BI}="${buttonStyleHash}"]${buttonStyle}`,
      );
    }
    button.setAttribute(BI, String(buttonStyleHash));
    parent.appendChild(button);

    return () => {
      parent.removeChild(button);
      parent.removeAttribute(BPI);
    };
  },
};

export function runButtonCommand(
  context: ButtonCommandContext,
  command: ButtonCommand,
): (() => void) | null {
  const [type, ...args] = command;
  return (
    buttonCommandImpl[type] as (
      context: ButtonCommandContext,
      ...args: readonly unknown[]
    ) => (() => void) | null
  )(context, ...args);
}
