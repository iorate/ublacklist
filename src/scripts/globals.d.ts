declare module '*.scss';

declare module 'dialog-polyfill' {
  namespace dialogPolyfill {
    function registerDialog(dialog: HTMLDialogElement): void;
  }
  export = dialogPolyfill;
}
