declare module "goober" {
  import type { Properties } from "csstype";

  export interface CSSAttribute extends Properties {
    [key: string]: CSSAttribute | string | number | undefined | null;
  }

  export function css(
    tag: CSSAttribute | TemplateStringsArray | string,
    ...props: (string | number)[]
  ): string;

  export function glob(
    tag: CSSAttribute | TemplateStringsArray | string,
    ...props: (string | number)[]
  ): void;
}
