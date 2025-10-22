import punycode from "punycode/";
import { z } from "zod";
import iconSVG from "../../icons/icon.svg";
import { discriminatedTupleUnion } from "../zod/discriminated-tuple-union.ts";
import { attributes as a, classes as c } from "./constants.ts";
import { cssStringify } from "./css-stringify.ts";
import { setStaticGlobalStyle } from "./global-styles.ts";
import {
  cssDeclarationListSchema,
  cssSelectorListSchema,
  cssValueSchema,
  regexSchema,
} from "./schemas.ts";

/* Element Commands */

export type ElementCommand =
  | ["selector", string, (ElementCommand | undefined)?]
  | ["upward", number | string, (ElementCommand | undefined)?]
  | string;

export const elementCommandSchema: z.ZodType<ElementCommand> =
  discriminatedTupleUnion([
    z.tuple([
      z.literal("selector"),
      cssSelectorListSchema,
      z.lazy(() => elementCommandSchema).optional(),
    ]),
    z.tuple([
      z.literal("upward"),
      z.number().or(z.string()),
      z.lazy(() => elementCommandSchema).optional(),
    ]),
  ]).or(cssSelectorListSchema);

export type ElementCommandContext = { root: Element };

type ElementCommandImpl = {
  [K in Exclude<ElementCommand, string>[0]]: (
    context: ElementCommandContext,
    ...args: ExtractArgs<ElementCommand, K>
  ) => Element | null;
};

type ExtractArgs<C, K> = C extends [K, ...infer Args] ? Args : never;

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

/* Root Commands */

export type RootCommand =
  | ["selector", string]
  | ["upward", number | string, RootCommand]
  | string;

export const rootCommandSchema: z.ZodType<RootCommand> =
  discriminatedTupleUnion([
    z.tuple([z.literal("selector"), cssSelectorListSchema]),
    z.tuple([
      z.literal("upward"),
      z.number().or(z.string()),
      z.lazy(() => rootCommandSchema).nonoptional(),
    ]),
  ]).or(cssSelectorListSchema);

type RootCommandImpl = {
  [K in Exclude<RootCommand, string>[0]]: (
    ...args: ExtractArgs<RootCommand, K>
  ) => Element[];
};

const rootCommandImpl: RootCommandImpl = {
  selector(selector) {
    return [...document.body.querySelectorAll(selector)];
  },
  upward(levelOrSelector, command) {
    return runRootCommand(command).flatMap(
      (root) => upward(root, levelOrSelector) || [],
    );
  },
};

export function runRootCommand(command: RootCommand): Element[] {
  if (typeof command === "string") {
    return rootCommandImpl.selector(command);
  }
  const [type, ...args] = command;
  return (rootCommandImpl[type] as (...args: readonly unknown[]) => Element[])(
    ...args,
  );
}

/* Proprety Commands */

export type PropertyCommand =
  | ["attribute", string, (ElementCommand | undefined)?]
  | ["const", string]
  | ["domainToURL", PropertyCommand]
  | ["or", PropertyCommand[], (ElementCommand | undefined)?]
  | ["property", string, (ElementCommand | undefined)?]
  | ["regexExclude", string, PropertyCommand]
  | ["regexInclude", string, PropertyCommand]
  | ["regexSubstitute", string, string, PropertyCommand]
  | string;

export const propertyCommandSchema: z.ZodType<PropertyCommand> =
  discriminatedTupleUnion([
    z.tuple([
      z.literal("attribute"),
      z.string(),
      elementCommandSchema.optional(),
    ]),
    z.tuple([z.literal("const"), z.string()]),
    z.tuple([
      z.literal("domainToURL"),
      z.lazy(() => propertyCommandSchema).nonoptional(),
    ]),
    z.tuple([
      z.literal("or"),
      z.lazy(() => propertyCommandSchema).array(),
      elementCommandSchema.optional(),
    ]),
    z.tuple([
      z.literal("property"),
      z.string(),
      elementCommandSchema.optional(),
    ]),
    z.tuple([
      z.literal("regexExclude"),
      regexSchema,
      z.lazy(() => propertyCommandSchema).nonoptional(),
    ]),
    z.tuple([
      z.literal("regexInclude"),
      regexSchema,
      z.lazy(() => propertyCommandSchema).nonoptional(),
    ]),
    z.tuple([
      z.literal("regexSubstitute"),
      regexSchema,
      z.string(),
      z.lazy(() => propertyCommandSchema).nonoptional(),
    ]),
  ]).or(cssSelectorListSchema);

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

/* Button Commands */

export type ButtonCommand = z.infer<typeof buttonCommandSchema>;

export const buttonCommandSchema = discriminatedTupleUnion([
  z.tuple([
    z.literal("icon"),
    z.object({ style: cssDeclarationListSchema.optional() }).optional(),
    elementCommandSchema.optional(),
  ]),
  z.tuple([
    z.literal("inset"),
    z
      .object({
        top: cssValueSchema.or(z.literal(0)).optional(),
        right: cssValueSchema.or(z.literal(0)).optional(),
        bottom: cssValueSchema.or(z.literal(0)).optional(),
        left: cssValueSchema.or(z.literal(0)).optional(),
        zIndex: cssValueSchema.or(z.number().int()).optional(),
      })
      .optional(),
    elementCommandSchema.optional(),
  ]),
  z.tuple([
    z.literal("text"),
    z
      .object({
        position: z
          .enum(["afterbegin", "afterend", "beforebegin", "beforeend"])
          .optional(),
        style: cssDeclarationListSchema.optional(),
      })
      .optional(),
    elementCommandSchema.optional(),
  ]),
]);

export type ButtonCommandContext = ElementCommandContext & {
  buttonProps: ButtonProps;
};

export type ButtonProps = {
  blockLabel: string;
  unblockLabel: string;
  onClick: () => void;
};

type ButtonCommandImpl = {
  [K in Exclude<ButtonCommand, string>[0]]: (
    context: ButtonCommandContext,
    ...args: ExtractArgs<ButtonCommand, K>
  ) => (() => void) | null;
};

const buttonCommandImpl: ButtonCommandImpl = {
  icon(context, options = {}, rootCommand) {
    const parent = getRoot(context, rootCommand);
    if (parent == null || !context.root.contains(parent)) {
      return null;
    }
    setStaticGlobalStyle("icon-button-parent", {
      [`[${a.iconButtonParent}]`]: {
        position: "relative",
      },
    });
    parent.setAttribute(a.iconButtonParent, "1");

    const button = document.createElement("div");
    setStaticButtonStyle();
    button.classList.add(c.button);
    setStaticGlobalStyle("icon-button", {
      [`.${c.iconButton}`]: {
        position: "absolute",
        zIndex: 1,
        top: 0,
        right: 0,
        height: "max-content",
        width: "max-content",
        opacity: 0.65,
      },
      "@media (hover: hover)": {
        [`[${a.result}]:not(:hover):not(:focus-within) .${c.iconButton}`]: {
          opacity: 0,
        },
      },
    });
    button.classList.add(c.iconButton);
    if (options.style) {
      button.style = options.style;
    }

    const shadowRoot = button.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>${cssStringify(
        {
          ":host": {
            "--ub-icon-size": "24px",
          },
          button: {
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            height: "max(var(--ub-icon-size), 40px)",
            justifyContent: "center",
            padding: 0,
            width: "max(var(--ub-icon-size), 40px)",
          },
          span: {
            display: "block",
            height: "var(--ub-icon-size)",
            width: "var(--ub-icon-size)",
          },
        },
        2,
      )}</style>
      <button type="button">
        <span part="block" aria-label=${context.buttonProps.blockLabel}>
          ${iconSVG}
        </span>
        <span part="unblock" aria-label=${context.buttonProps.unblockLabel}>
          ${iconSVG}
        </span>
      </button>
    `;
    shadowRoot.querySelector("button")?.addEventListener("click", (event) => {
      event.stopPropagation();
      context.buttonProps.onClick();
    });

    parent.appendChild(button);

    return () => {
      parent.removeChild(button);
      parent.removeAttribute(a.iconButtonParent);
    };
  },

  inset(context, options = { top: 0, right: 0 }, rootCommand) {
    return this.icon(
      context,
      { style: cssStringify({ top: "auto", right: "auto", ...options }) },
      rootCommand,
    );
  },

  text(context, options = {}, rootCommand) {
    const parent = getRoot(context, rootCommand);
    if (
      parent == null ||
      !context.root.contains(parent) ||
      (parent === context.root &&
        (options.position === "beforebegin" || options.position === "afterend"))
    ) {
      return null;
    }

    const button = document.createElement("div");
    setStaticButtonStyle();
    button.classList.add(c.button);
    setStaticGlobalStyle("text-button", {
      [`.${c.textButton}`]: {
        display: "inline",
      },
    });
    button.classList.add(c.textButton);
    if (options.style) {
      button.style = options.style;
    }

    const shadowRoot = button.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>${cssStringify(
        {
          ":host": {
            fontSize: "12px",
          },
          button: {
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            font: "inherit",
            padding: 0,
          },
          "button:hover": {
            textDecoration: "underline",
          },
        },
        2,
      )}</style>
      <button type="button">
        <span part="block">
          ${context.buttonProps.blockLabel}
        </span>
        <span part="unblock">
          ${context.buttonProps.unblockLabel}
        </span>
      </button>
    `;
    shadowRoot.querySelector("button")?.addEventListener("click", (event) => {
      event.stopPropagation();
      context.buttonProps.onClick();
    });

    parent.insertAdjacentElement(options.position ?? "beforeend", button);

    return () => {
      button.parentElement?.removeChild(button);
    };
  },
};

function setStaticButtonStyle() {
  setStaticGlobalStyle("button", {
    [`[${a.result}][${a.block}] .${c.button}::part(block)`]: {
      display: "none",
    },
    [`[${a.result}]:not([${a.block}]) .${c.button}::part(unblock)`]: {
      display: "none",
    },
  });
}

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
