declare module 'dialog-polyfill' {
  namespace dialogPolyfill {
    function registerDialog(dialog: HTMLDialogElement): void;
  }
  export = dialogPolyfill;
}

declare module '*/google-matches' {
  const _default: string[];
  export default _default;
}

declare module '!!raw-loader!extract-loader!css-loader!sass-loader!*.scss' {
  const _default: string;
  export default _default;
}
