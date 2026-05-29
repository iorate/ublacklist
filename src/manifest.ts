import { GOOGLE_MATCHES } from "./common/google-matches.ts";

export type ManifestContext = {
  browser: "chrome" | "edge" | "firefox" | "safari";
  version: string;
  debug: boolean;
};

export function getManifest(context: ManifestContext) {
  const { browser, version, debug } = context;
  return {
    action: {
      default_icon: {
        32:
          browser === "safari"
            ? "icons/template-icon-32.png"
            : "icons/icon-32.png",
      },
      default_popup: "pages/popup.html",
    },

    background: {
      ...(browser === "firefox"
        ? { scripts: ["scripts/background.js"] }
        : { service_worker: "scripts/background.js" }),
    },

    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: { id: "@ublacklist" },
            gecko_android: {},
          },
        }
      : {}),

    content_scripts: [
      {
        matches: browser === "safari" ? ["*://*/*"] : GOOGLE_MATCHES,
        js: [
          browser === "safari"
            ? "scripts/import-content-script.js"
            : "scripts/serpinfo/content-script.js",
        ],
        run_at: "document_start",
      },
    ],

    default_locale: "en",

    description: "__MSG_extensionDescription__",

    icons: {
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },

    ...(browser === "chrome"
      ? {
          key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm+2y1Q2VH/S9rGxa/2kzRRspyxcA8R5QBa49JK/wca2kqyfpI/traqNnNY8SfRzOugtVP+8/WbyOY44wgr427VYws6thZ//cV2NDadEMqUF5dba9LR26QHXPFUWdbUyCtNHNVP4keG/OeGJ6thOrKUlxYorK9JAmdG1szucyOKt8+k8HNVfZFTi2UHGLn1ANLAsu6f4ykb6Z0QNNCysWuNHqtFEy4j0B4T+h5VZ+Il2l3yf8uGk/zAbJE7x0C7SIscBrWQ9jcliS/e25C6mEr5lrMhQ+VpVVsRVGg7PwY7xLywKHZM8z1nzLdpMs7egEqV25HiA/PEcaQRWwDKDqwQIDAQAB",
        }
      : browser === "edge"
        ? {
            key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApHmUo0Lm4MLiXUB3qzfI0uwtiU3T77zYc2/oTKC8CwcUPaMAwro92p7Q2Iup9kmUWgXCy6hbiH3aU0sjwHojwSPQhlJW0IXe8OtgEK8raUBcvUhrBZhkZN4yDjwo62GPnBBiH0hFFOYfh0wyJML7g01K2MMvJbMGstnvcabN8NrUD/Ux+g05QchfNOM4J8e65Aq+nI3c77jQYj/Es5013WJLEFO/KQfn7dPSKY9CKvbvBXDtcjmZRr8cEM94IxwyBhwHwCE7hlk8wfQ+ChK3FnbQE5mUu3kP9XAKKvcrA9dlJPrJJdycVPfViacfSeK6/iCQGNIUaBAgJEBaKuFISwIDAQAB",
          }
        : {}),

    manifest_version: 3,

    name: "__MSG_extensionName__",

    optional_host_permissions: ["*://*/*"],

    options_ui: {
      ...(browser !== "safari" ? { open_in_tab: true } : {}),
      page: "pages/options.html",
    },

    permissions: [
      "activeTab",
      "alarms",
      "declarativeNetRequestWithHostAccess",
      ...(browser !== "safari" ? ["identity"] : []),
      "scripting",
      "storage",
      "unlimitedStorage",
    ],

    version,

    web_accessible_resources: [
      {
        matches: ["*://*/*"],
        resources: [
          "pages/options.html",
          "pages/serpinfo/options.html",
          ...(browser === "safari"
            ? ["scripts/serpinfo/content-script.js"]
            : []),
          ...(debug && (browser === "chrome" || browser === "edge")
            ? ["scripts/serpinfo/content-script.js.map"]
            : []),
        ],
      },
    ],
  };
}
