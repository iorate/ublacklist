const manifest = {
  default_locale: 'en',
  description: '__MSG_extensionDescription__',
  manifest_version: 2,
  name: '__MSG_extensionName__',
  optional_permissions: ['*://*/*'],
  permissions: ['identity', 'storage'],
  version: '3.0.0',
/// #if BROWSER === 'chrome'
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm+2y1Q2VH/S9rGxa/2kzRRspyxcA8R5QBa49JK/wca2kqyfpI/traqNnNY8SfRzOugtVP+8/WbyOY44wgr427VYws6thZ//cV2NDadEMqUF5dba9LR26QHXPFUWdbUyCtNHNVP4keG/OeGJ6thOrKUlxYorK9JAmdG1szucyOKt8+k8HNVfZFTi2UHGLn1ANLAsu6f4ykb6Z0QNNCysWuNHqtFEy4j0B4T+h5VZ+Il2l3yf8uGk/zAbJE7x0C7SIscBrWQ9jcliS/e25C6mEr5lrMhQ+VpVVsRVGg7PwY7xLywKHZM8z1nzLdpMs7egEqV25HiA/PEcaQRWwDKDqwQIDAQAB',
  oauth2: {
    client_id: '304167046827-ordtvt68qt83fabg1k7blqeagicu68du.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  },
/// #elif BROWSER === 'firefox'
  browser_specific_settings: {
    gecko: {
      id: '@ublacklist'
    }
  },
/// #endif
};

module.exports = () => ({
  code: JSON.stringify(manifest, null, 2)
});
