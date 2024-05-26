import { type Browser, browser } from "./browser.ts";

async function getLastModified(): Promise<number> {
  const root = await (
    browser.runtime as Browser.Runtime.Static & {
      getPackageDirectoryEntry: () => Promise<FileSystemDirectoryEntry>;
    }
  ).getPackageDirectoryEntry();
  return new Promise((resolve, reject) => {
    root.getFile(
      ".watch",
      {},
      (dotWatch) => {
        (dotWatch as FileSystemFileEntry).file(({ lastModified }) =>
          resolve(lastModified),
        );
      },
      reject,
    );
  });
}

async function main() {
  const lastModified = await getLastModified();
  const worker = new Worker("../scripts/watch-worker.js");
  worker.onmessage = async () => {
    if ((await getLastModified()) !== lastModified) {
      browser.runtime.reload();
    }
  };
}

void main();
