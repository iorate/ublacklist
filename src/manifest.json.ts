import { GOOGLE_MATCHES } from "./common/google-matches.ts";

export default {
  [process.env.BROWSER === "chrome" ? "action" : "browser_action"]: {
    default_icon: {
      32:
        process.env.BROWSER === "safari"
          ? "icons/template-icon-32.png"
          : "icons/icon-32.png",
    },
    default_popup: "pages/popup.html",
  },

  background: {
    ...(process.env.BROWSER === "chrome"
      ? {
          service_worker: "scripts/background.js",
        }
      : {
          persistent: process.env.BROWSER === "firefox",
          scripts: ["scripts/background.js"],
        }),
  },

  ...(process.env.BROWSER === "firefox"
    ? {
        browser_specific_settings: {
          gecko: {
            id: "@ublacklist",
          },
          gecko_android: {},
        },
      }
    : {}),

  content_scripts: [
    {
      matches: GOOGLE_MATCHES,
      js: [
        process.env.BROWSER === "safari"
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

  ...(process.env.BROWSER === "chrome"
    ? {
        key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm+2y1Q2VH/S9rGxa/2kzRRspyxcA8R5QBa49JK/wca2kqyfpI/traqNnNY8SfRzOugtVP+8/WbyOY44wgr427VYws6thZ//cV2NDadEMqUF5dba9LR26QHXPFUWdbUyCtNHNVP4keG/OeGJ6thOrKUlxYorK9JAmdG1szucyOKt8+k8HNVfZFTi2UHGLn1ANLAsu6f4ykb6Z0QNNCysWuNHqtFEy4j0B4T+h5VZ+Il2l3yf8uGk/zAbJE7x0C7SIscBrWQ9jcliS/e25C6mEr5lrMhQ+VpVVsRVGg7PwY7xLywKHZM8z1nzLdpMs7egEqV25HiA/PEcaQRWwDKDqwQIDAQAB",
      }
    : {}),

  manifest_version: process.env.BROWSER === "chrome" ? 3 : 2,

  name: "__MSG_extensionName__",

  [process.env.BROWSER === "chrome"
    ? "optional_host_permissions"
    : "optional_permissions"]: ["*://*/*"],

  options_ui: {
    ...(process.env.BROWSER === "firefox"
      ? {
          browser_style: false,
        }
      : {}),
    ...(process.env.BROWSER !== "safari"
      ? {
          open_in_tab: true,
        }
      : {}),
    page: "pages/options.html",
  },

  permissions: [
    "activeTab",
    "alarms",
    "declarativeNetRequestWithHostAccess",
    ...(process.env.BROWSER !== "safari" ? ["identity"] : []),
    "scripting",
    "storage",
    "unlimitedStorage",
  ],

  version: process.env.VERSION,

  ...(process.env.BROWSER === "chrome"
    ? {
        web_accessible_resources: [
          {
            matches: ["*://*/*"],
            resources: ["pages/options.html", "pages/serpinfo/options.html"],
          },
          ...(process.env.DEBUG === "true"
            ? [
                {
                  matches: ["*://*/*"],
                  resources: ["scripts/serpinfo/content-script.js.map"],
                },
              ]
            : []),
        ],
      }
    : process.env.BROWSER === "firefox"
      ? {
          web_accessible_resources: [
            "pages/options.html",
            "pages/serpinfo/options.html",
          ],
        }
      : {
          web_accessible_resources: [
            "pages/options.html",
            "pages/serpinfo/options.html",
            "scripts/serpinfo/content-script.js",
          ],
        }),
};
