import * as Goober from "goober";

export type { CSSAttribute } from "goober";

export const css: typeof Goober.css = (tag, ...props) =>
  Goober.css.bind({ target: document.head })(tag, ...props);

export const glob: typeof Goober.glob = (tag, ...props) =>
  Goober.css.bind({ g: 1, target: document.head })(tag, ...props);
