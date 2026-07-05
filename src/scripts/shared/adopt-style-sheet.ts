export function adoptStyleSheet(
  target: Document | ShadowRoot,
  sheet: CSSStyleSheet,
): void {
  if (process.env.BROWSER === "firefox") {
    // Firefox <153 rejects modifying the Xray-wrapped adoptedStyleSheets;
    // reach the page-side array through wrappedJSObject instead.
    // https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153#changes_for_add-on_developers
    const adoptedStyleSheets = target.adoptedStyleSheets as CSSStyleSheet[] & {
      wrappedJSObject?: CSSStyleSheet[];
    };
    (adoptedStyleSheets.wrappedJSObject ?? adoptedStyleSheets).push(sheet);
  } else {
    target.adoptedStyleSheets.push(sheet);
  }
}
