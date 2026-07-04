declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    BROWSER: "chrome" | "edge" | "firefox" | "safari";
    DEBUG: "true" | "false";
    E2E: "true" | "false";
    DROPBOX_API_KEY: string;
    DROPBOX_API_SECRET: string;
    GOOGLE_DRIVE_API_KEY: string;
    GOOGLE_DRIVE_API_SECRET: string;
  }
}

// Commented out because webdav package pulls in @types/node, causing duplicate declaration.
// declare var process: { env: NodeJS.ProcessEnv };

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*/theme.css" {}

declare module "*/baseline.css" {}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.yml" {
  const content: string;
  export default content;
}
