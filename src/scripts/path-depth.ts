import type { AltURL } from "./utilities.ts";

export class PathDepth {
  private readonly scheme: string;
  private readonly host: string;
  private readonly dirs: string[];

  constructor(url: AltURL) {
    this.scheme = url.scheme;
    this.host = url.host;
    this.dirs = url.path.split("?", 1)[0].split("/").slice(1, -1);
  }

  maxDepth(): number {
    return this.dirs.length;
  }

  suggestMatchPattern(depth: number, unblock: boolean): string {
    if (depth < 0 || depth > this.maxDepth()) {
      throw new Error("Invalid depth");
    }
    const at = unblock ? "@" : "";
    const scheme =
      this.scheme === "http" || this.scheme === "https" ? "*" : this.scheme;
    const host = this.host;
    const path = ["", ...this.dirs.slice(0, depth), "*"].join("/");
    return `${at}${scheme}://${host}${path}`;
  }
}
