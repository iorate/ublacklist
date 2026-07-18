declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    BROWSER: "chrome" | "edge" | "firefox" | "safari";
    DEBUG: "true" | "false";
    E2E: "true" | "false";
    DROPBOX_APP_KEY: string;
    DROPBOX_APP_SECRET: string;
    GOOGLE_DRIVE_CLIENT_ID: string;
    GOOGLE_DRIVE_CLIENT_SECRET: string;
  }
}

// "*.module.css" must be declared before "*.css" because TypeScript prefers
// the earlier declaration when wildcard patterns tie (implementation detail).
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.yml" {
  const content: string;
  export default content;
}
