declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    BROWSER: "chrome" | "firefox" | "safari";
    VERSION: string;
    DEBUG: "true" | "false";
    WATCH: "true" | "false";
    DROPBOX_API_KEY: string;
    DROPBOX_API_SECRET: string;
    GOOGLE_DRIVE_API_KEY: string;
    GOOGLE_DRIVE_API_SECRET: string;
  }
}
