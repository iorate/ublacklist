// #if CHROME
export { CSSAttribute, css, glob } from 'goober';
/* #else
import * as goober from 'goober';

export { CSSAttribute } from 'goober';

export const css: typeof goober.css = (tag, ...props) =>
  goober.css.bind({ target: document.head })(tag, ...props);

export const glob: typeof goober.glob = (tag, ...props) =>
  goober.css.bind({ g: 1, target: document.head })(tag, ...props);
*/
// #endif
