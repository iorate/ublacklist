declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    BROWSER: "chrome" | "firefox" | "safari";
    DEBUG: "true" | "false";
    VERSION: string;
    DROPBOX_API_KEY: string;
    DROPBOX_API_SECRET: string;
    GOOGLE_DRIVE_API_KEY: string;
    GOOGLE_DRIVE_API_SECRET: string;
  }
}
