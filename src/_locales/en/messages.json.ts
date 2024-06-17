import { exportAsMessages } from "../helpers.ts";

export default exportAsMessages({
  // The extension name.
  extensionName: "uBlacklist",

  // The extension description.
  extensionDescription:
    "Blocks sites you specify from appearing in Google search results",

  // The language code.
  lang: "en",

  // The locale of the website.
  // Do not translate this message until you have translated the website.
  websiteLocale: "en",

  // The text that means an error occurred.
  // '$1' is expanded to the message.
  error: "Error: $1",

  // The error message shown when unauthorized to access a cloud.
  unauthorizedError: "Unauthorized. Please turn sync off and on again.",

  // The text of a cancel button.
  cancelButton: "Cancel",

  // The text of an OK button.
  okButton: "OK",

  // The text that means one site has been blocked.
  content_singleSiteBlocked: "uBlacklist has blocked 1 site",

  // The text that means multiple sites have been blocked.
  // '$1' is expanded to the count.
  content_multipleSitesBlocked: "uBlacklist has blocked $1 sites",

  // The text of the link to show blocked sites.
  content_showBlockedSitesLink: "Show",

  // The text of the link to hide blocked sites.
  content_hideBlockedSitesLink: "Hide",

  // The text of a link to block a site.
  content_blockSiteLink: "Block this site",

  // The text of a link to unblock a site.
  content_unblockSiteLink: "Unblock this site",

  // The title of a popup to block a site.
  popup_blockSiteTitle: "Block this site",

  // The title of a popup to unblock a site.
  popup_unblockSiteTitle: "Unblock this site",

  // The title of the disclosure widget that contains the details.
  popup_details: "Details",

  // The label for the textarea that shows the page URL.
  popup_pageURLLabel: "Page URL",

  // The label for the input that shows a path depth of rules to be added.
  popup_pathDepth: "Depth",

  // The label for the textarea that shows the page title.
  popup_pageTitleLabel: "Page title",

  // The label for the textarea that shows rules to be added.
  popup_addedRulesLabel: "Rules to be added",

  // The label for the textarea that shows rules to be removed.
  popup_removedRulesLabel: "Rules to be removed",

  // The text of the button to block a site.
  popup_blockSiteButton: "Block",

  // The text of the button to unblock a site.
  popup_unblockSiteButton: "Unblock",

  // The text of the link to the options page.
  popup_openOptionsLink: "Options",

  // The text to indicate that this extension is active.
  popup_active: "uBlacklist is active",

  // The text to indicate that this extension is inactive.
  popup_inactive: "uBlacklist is inactive",

  // The text of the button to activate this extension.
  popup_activateButton: "Activate",

  // The title of the general section.
  options_generalTitle: "General",

  // The label for the blacklist textarea.
  options_blacklistLabel:
    "Sites blocked from appearing in Google search results",

  // The helper text for the blacklist textarea.
  options_blacklistHelper:
    "You can use [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) and [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).",

  // The helper text to show an example rule.
  // '$1' is expanded to the example.
  options_blacklistExample: "Example: $1",

  // The helper text to explain how to block sites by page title.
  options_blockByTitle:
    'To block sites by page title, prepend "title" to regular expressions.',

  // The text indicating that the blacklist is update outside the options page.
  options_blacklistUpdated: "Updated",

  // The text of the button to reload the blacklist.
  options_reloadBlacklistButton: "Reload",

  // The text of the button to import a blacklist.
  options_importBlacklistButton: "Import",

  // The text of the button to export a blacklist.
  options_exportBlacklistButton: "Export",

  // The text of the button to save a blacklist.
  options_saveBlacklistButton: "Save",

  // The title of the import-blacklist dialog.
  options_importBlacklistDialog_title: "Import",

  // The label for the select to import from a file.
  options_importBlacklistDialog_fromFile: "Import from a file",

  // The text of the button to import from a file.
  options_importBlacklistDialog_selectFile: "Select a file",

  // The label for the select to import from Personal Blocklist.
  options_importBlacklistDialog_fromPB: "Import from Personal Blocklist",

  // The label for the textarea to import from Personal Blocklist (for a11y only).
  options_importBlacklistDialog_pbLabel: "Domains",

  // The text of the checkbox to append to the existing blacklist
  options_importBlacklistDialog_append: "Append to the existing list",

  // The text of the import button on the import-blacklist dialog.
  options_importBlacklistDialog_importButton: "Import",

  // The helper text for the textarea on the import-blacklist dialog.
  options_importBlacklistDialog_helper:
    "Paste the domains exported from Personal Blocklist.",

  // Other search engines support.
  options_otherSearchEngines: "Other search engines",

  // The details for other search engines support.
  options_otherSearchEnginesDescription:
    "You can use this extension on the following search engines.",

  // The text of the button to enable this extension on a search engine.
  options_registerSearchEngine: "Enable",

  // The text of the button to indicate that this extension is enabled on a search engine.
  options_searchEngineRegistered: "Enabled",

  // The label for the switch whether to skip the 'Block this site' dialog
  options_skipBlockDialogLabel: 'Skip the "Block this site" dialog',

  // The label for the switch whether to hide the 'Block this site' links.
  options_hideBlockLinksLabel: 'Hide the "Block this site" links',

  // The label for the switch whether to hide the number of blocked sites and the 'Show' link.
  options_hideControlLabel:
    'Hide the number of blocked sites and the "Show" link',

  // The label for the switch whether to block a whole site by default.
  options_blockWholeSiteLabel: "Add rules blocking whole sites by default",

  // The example of blocking a whole site.
  options_blockWholeSiteDescription:
    'For example, to block the page "https://a.b.example.uk.com/", a rule "*://*.example.uk.com/*" will be added.',

  // The title of the appearance section.
  options_appearanceTitle: "Appearance",

  // The color of links.
  options_linkColor: "The color of links",

  // The color of blocked search results.
  options_blockColor: "The color of blocked search results",

  // The label of radio buttons to use the default color.
  options_colorUseDefault: "Default",

  // The label of radio buttons to specify the color.
  options_colorSpecify: "Custom",

  // The colors of highlighted search results.
  options_highlightColors: "The colors of highlighted search results",

  // The description of the highlighting feature.
  options_highlightDescription:
    'To highlight search results with Color N, prepend "@N" to rules.',

  // The name of the nth color.
  options_highlightColorNth: "Color $1",

  // The label of the button to add a highlight color (for a11y only).
  options_highlightColorAdd: "Add",

  // The label of the button to remove a highlight color (for a11y only).
  options_highlightColorRemove: "Remove",

  // The dialog theme.
  options_dialogTheme:
    'The theme of the "Block this site" dialog on search results',

  // The label of a radio button to use the default dialog theme.
  options_dialogThemeDefault: "Default",

  // The label of a radio button to use the light theme.
  options_dialogThemeLight: "Light",

  // The label of a radio button to use the dark theme.
  options_dialogThemeDark: "Dark",

  // The title of the sync section.
  options_syncTitle: "Sync",

  // The text to indicate that the sync feature has been updated (version 3 -> 4).
  options_syncFeatureUpdated:
    'The sync feature has been updated. To continue using sync, press the "Turn on sync" button.',

  // The sync feature.
  options_syncFeature: "Sync with a cloud",

  // The description of the sync feature.
  options_syncFeatureDescription:
    "You can synchronize rulesets across your devices through a cloud.",

  // The text of the button to turn on sync.
  options_turnOnSync: "Turn on sync",

  // The title of the dialog to turn on sync.
  options_turnOnSyncDialog_title: "Turn on sync",

  // The text of the button to turn on sync.
  options_turnOnSyncDialog_turnOnSyncButton: "Turn on",

  // The label of the check box whether to use the 'alternative' web auth flow.
  // In this flow, the authentication page will be opened not in a new window, but in a new tab.
  options_turnOnSyncDialog_useAltFlow:
    "Open the authentication page in a new tab",

  // The text to explain permission requests in the 'alternative' web auth flow.
  // '$1' is expanded to 'iorate.github.io'.
  options_turnOnSyncDialog_altFlowDescription:
    "You may be asked for permission to access $1 before authentication, but your personal information will NOT be stored in that domain.",

  // The label for the textarea to input the authorization code returned by the 'alternative' web auth flow.
  // Currently it is used only in Safari (probably only on iOS and iPadOS).
  options_turnOnSyncDialog_altFlowAuthCodeLabel: "Authorization code",

  // The text of the button to turn off sync.
  options_turnOffSync: "Turn off",

  // The text that means the result of the last sync.
  options_syncResult: "Last sync",

  // The text that means sync has been never performed.
  options_syncNever: "Never synced",

  // The text that means sync is running right now.
  options_syncRunning: "Syncing…",

  // The text of the button to reload the options page after settings are downloaded from a cloud.
  options_syncReloadButton: "Reload",

  // The text of the button to sync now.
  options_syncNowButton: "Sync now",

  // The label of the list to choose what to sync.
  options_syncCategories: "What to sync",

  // The label of the switch to sync the blocklist.
  options_syncBlocklist: "Blocked sites",

  // The label of the switch to sync the general settings.
  options_syncGeneral: "General settings",

  // The label of the switch to sync the appearance.
  options_syncAppearance: "Appearance",

  // The label of the switch to sync the subscriptions.
  options_syncSubscriptions: "Subscriptions",

  // The label of the select to select a sync interval.
  options_syncInterval: "Sync interval",

  // The title of the subscription section.
  options_subscriptionTitle: "Subscription",

  // The subscription feature.
  options_subscriptionFeature: "Subscribe to rulesets",

  // The description of the subscription feature.
  options_subscriptionFeatureDescription:
    "If you add a subscription, rulesets will be regularly downloaded from the specified URL.",

  // The text of the button to add a subscription.
  options_addSubscriptionButton: "Add a subscription",

  // The header text of the name row of the subscriptions table.
  options_subscriptionNameHeader: "Name",

  // The header text of the URL row of the subscriptions table.
  options_subscriptionURLHeader: "URL",

  // The header text of the update-result row of the subscriptions table.
  options_subscriptionUpdateResultHeader: "Last update",

  // The label for the check box of the subscription table (for a11y only).
  options_subscriptionCheckBoxLabel: "Enabled",

  // The label for the menu buttons of the subscriptions table (for a11y only).
  options_subscriptionMenuButtonLabel: "Menu",

  // The text that means no subscriptions have been added.
  options_noSubscriptionsAdded: "No subscriptions added",

  // The text that means update is running right now.
  options_subscriptionUpdateRunning: "Updating…",

  // The text of a menu item to show a subscription.
  options_showSubscriptionMenu: "Show",

  // The text of a menu item to update a subscription now.
  options_updateSubscriptionNowMenu: "Update now",

  // The text of a menu item to remove a subscription.
  options_removeSubscriptionMenu: "Remove",

  // The text of the button to update all subscriptions now.
  options_updateAllSubscriptionsNowButton: "Update now",

  // The title of the add-subscription dialog.
  options_addSubscriptionDialog_title: "Add a subscription",

  // UNUSED
  // The label for the name input on the add-subscription dialog.
  options_addSubscriptionDialog_nameLabel: "Name",

  // The label for the URL input on the add-subscription dialog.
  options_addSubscriptionDialog_urlLabel: "URL",

  // The label for the alternative name input on the add-subscription dialog.
  options_addSubscriptionDialog_altNameLabel: "Alternative name (optional)",

  // The helper text for the alternative name input on the add-subscription dialog.
  options_addSubscriptionDialog_altNameDescription:
    "The alternative name used when a downloaded ruleset does not contain a name.",

  // The text of the add button on the add-subscription dialog.
  options_addSubscriptionDialog_addButton: "Add",

  // The label for the textarea on the show-subscription dialog (for a11y only).
  options_showSubscriptionDialog_blacklistLabel: "Rules",

  // The label of the select to select an update interval.
  options_updateInterval: "Update interval",

  // The title of the backup and restore section.
  options_backupRestoreTitle: "Backup and restore",

  // Backup settings.
  options_backupSettingsLabel: "Backup settings",

  // The text of the button to backup settings.
  options_backupSettingsButton: "Backup",

  // Restore settings.
  options_restoreSettingsLabel: "Restore settings",

  // The text of the button to restore settings.
  options_restoreSettingsButton: "Restore",

  // The error message that is shown when the backup file is invalid.
  options_restoreSettingsInvalidFile: "The file format is invalid.",

  // Initialize settings.
  options_initializeSettingsLabel: "Reset settings",

  // The text of the button to initialize settings.
  options_initializeSettingsButton: "Reset",

  // The confirmation message to initialize settings.
  options_initializeSettingsConfirmation:
    "Do you really want to reset your settings?",

  // The title of the about section.
  options_aboutTitle: "About uBlacklist",

  // Version.
  options_aboutVersion: "Version",

  // The text of the link to the documentation.
  options_aboutDocumentation: "Documentation",

  // The text of the link to the release notes.
  options_aboutReleaseNotes: "Release Notes",

  // The text of the link to the privacy policy.
  options_aboutPrivacyPolicy: "Privacy Policy",

  // The text of the link to the third-party notices.
  options_aboutThirdPartyNotices: "Third-Party Notices",

  // The label of the radio button to sync with Google Drive.
  clouds_googleDriveSync: "Sync with Google Drive",

  // The text to describe the behavior of sync with Google Drive.
  clouds_googleDriveSyncDescription:
    "A file will be created within the application data folder hidden from the user.",

  // The text indicating that sync with Google Drive is turned on.
  clouds_googleDriveSyncTurnedOn: "Synced with Google Drive",

  // The text indicating syncing with Dropbox.
  clouds_dropboxSync: "Sync with Dropbox",

  // The text to describe the behavior of sync with Dropbox.
  clouds_dropboxSyncDescription:
    'A file will be created within "/Apps/uBlacklist/".',

  // The label of the radio button to sync with Dropbox.
  clouds_dropboxSyncTurnedOn: "Synced with Dropbox",

  // The localized name of Google (not used).
  searchEngines_googleName: "Google",

  // The localized name of Bing.
  searchEngines_bingName: "Bing",

  // The description for Bing in Firefox.
  searchEngines_bingDescription_firefox:
    'Turn off "Open links from search results in a new tab or window".',

  // The localized name of Brave
  searchEngines_braveName: "Brave",

  // The localized name of DuckDuckGo.
  searchEngines_duckduckgoName: "DuckDuckGo",

  // The localized name of Ecosia.
  searchEngines_ecosiaName: "Ecosia",

  // The localized name of Kagi.
  searchEngines_kagiName: "Kagi",

  // The localized name of Qwant.
  searchEngines_qwantName: "Qwant",

  // The localized name of SearX.
  searchEngines_searxName: "SearX",

  // The description for Qwant.
  searchEngines_qwantDescription: 'Turn off "Always play videos on Qwant.com".',

  // The localized name of Startpage.
  searchEngines_startpageName: "Startpage.com",

  // The localized name of Yahoo! JAPAN.
  searchEngines_yahooJapanName: "Yahoo! JAPAN",

  // The localized name of Yandex.
  searchEngines_yandexName: "Yandex",
});
