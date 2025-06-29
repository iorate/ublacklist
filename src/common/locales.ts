export type Messages = {
  /** The name of the extension. */
  extensionName: string;
  /** The description of the extension. */
  extensionDescription: string;
  /** The language code. */
  lang: string;
  /** The locale code for the website. Do not translate this message until the website is translated. */
  websiteLocale: string;
  /** Error message. '$1' will be replaced with the actual error. */
  error: string;
  /** Error message shown when unauthorized to access a cloud service. */
  unauthorizedError: string;
  /** Text for the Cancel button. */
  cancelButton: string;
  /** Text for the OK button. */
  okButton: string;
  /** Label for the user's personal blocklist. */
  personalBlocklist: string;
  /** Message shown when one site is blocked. */
  content_singleSiteBlocked: string;
  /** Message shown when multiple sites are blocked. '$1' will be replaced with the count. */
  content_multipleSitesBlocked: string;
  /** Link text to show blocked sites. */
  content_showBlockedSitesLink: string;
  /** Link text to hide blocked sites. */
  content_hideBlockedSitesLink: string;
  /** Link text to block a site. */
  content_blockSiteLink: string;
  /** Link text to unblock a site. */
  content_unblockSiteLink: string;
  /** Title of the popup to block a site. */
  popup_blockSiteTitle: string;
  /** Title of the popup to unblock a site. */
  popup_unblockSiteTitle: string;
  /** Title of the details disclosure widget. */
  popup_details: string;
  /** Label for the textarea showing the page URL. */
  popup_pageURLLabel: string;
  /** Label for the input showing the path depth for rules to be added. */
  popup_pathDepth: string;
  /** Label for the textarea showing the page title. */
  popup_pageTitleLabel: string;
  /** Label for the textarea showing rules to be added. */
  popup_addedRulesLabel: string;
  /** Label for the textarea showing rules to be removed. */
  popup_removedRulesLabel: string;
  /** Text for the button to block a site. */
  popup_blockSiteButton: string;
  /** Text for the button to unblock a site. */
  popup_unblockSiteButton: string;
  /** Link text to open the options page. */
  popup_openOptionsLink: string;
  /** Message indicating the extension is active. */
  popup_active: string;
  /** Message indicating the extension is inactive. */
  popup_inactive: string;
  /** Text for the button to activate the extension. */
  popup_activateButton: string;
  /** Title of the disclosure widget containing matching rules information. */
  popup_matchingRules: string;
  /** Label for the textarea showing rules blocking the entry. */
  popup_blockingRulesLabel: string;
  /** Label for the textarea showing rules unblocking the entry. */
  popup_unblockingRulesLabel: string;
  /** Label for the textarea showing rules highlighting the entry. */
  popup_highlightingRulesLabel: string;
  /** Label for the switch to show blocked results. */
  popup_serpInfoMode_showBlockedResults: string;
  /** Title of the General section. */
  options_generalTitle: string;
  /** Label for the blacklist textarea. */
  options_blacklistLabel: string;
  /** Helper text for the blacklist textarea. */
  options_blacklistHelper: string;
  /** Example of a rule. '$1' will be replaced with an example rule. */
  options_blacklistExample: string;
  /** Description of the title blocking feature. */
  options_blockByTitle: string;
  /** Message indicating the blacklist has been updated. */
  options_blacklistUpdated: string;
  /** Text for the button to reload the blacklist. */
  options_reloadBlacklistButton: string;
  /** Text for the button to import a blacklist. */
  options_importBlacklistButton: string;
  /** Text for the button to export a blacklist. */
  options_exportBlacklistButton: string;
  /** Text for the button to save the blacklist. */
  options_saveBlacklistButton: string;
  /** Title of the import blacklist dialog. */
  options_importBlacklistDialog_title: string;
  /** Label for the option to import from a file. */
  options_importBlacklistDialog_fromFile: string;
  /** Text for the button to select a file to import. */
  options_importBlacklistDialog_selectFile: string;
  /** Label for the option to import from Personal Blocklist. */
  options_importBlacklistDialog_fromPB: string;
  /** Label for the textarea to import from Personal Blocklist (for accessibility). */
  options_importBlacklistDialog_pbLabel: string;
  /** Text for the checkbox to append to the existing blacklist. */
  options_importBlacklistDialog_append: string;
  /** Text for the import button in the import blacklist dialog. */
  options_importBlacklistDialog_importButton: string;
  /** Helper text for the textarea in the import blacklist dialog. */
  options_importBlacklistDialog_helper: string;
  /** Title of the section for other search engines. */
  options_otherSearchEngines: string;
  /** Description of the section for other search engines. */
  options_otherSearchEnginesDescription: string;
  /** Text for the button to enable a search engine. */
  options_registerSearchEngine: string;
  /** Message indicating a search engine is enabled. */
  options_searchEngineRegistered: string;
  /** Label for the switch to skip the block dialog. */
  options_skipBlockDialogLabel: string;
  /** Label for the switch to hide block buttons. */
  options_hideBlockButtonsLabel: string;
  /** Label for the switch to block the whole site by default. */
  options_blockWholeSiteLabel: string;
  /** Description of the block whole site feature. */
  options_blockWholeSiteDescription: string;
  /** Label for the switch to enable matching rules. */
  options_enableMatchingRules: string;
  /** Title of the Appearance section. */
  options_appearanceTitle: string;
  /** Color of blocked search results. */
  options_blockColor: string;
  /** Label for the radio button to use the default color. */
  options_colorUseDefault: string;
  /** Label for the radio button to specify a custom color. */
  options_colorSpecify: string;
  /** Colors for highlighted search results. */
  options_highlightColors: string;
  /** Description of the highlighting feature. */
  options_highlightDescription: string;
  /** Name of the nth highlight color. '$1' will be replaced with the color number. */
  options_highlightColorNth: string;
  /** Label for the button to add a highlight color. */
  options_highlightColorAdd: string;
  /** Label for the button to remove a highlight color. */
  options_highlightColorRemove: string;
  /** Dialog theme. */
  options_dialogTheme: string;
  /** Label for the radio button to use the default dialog theme. */
  options_dialogThemeDefault: string;
  /** Label for the radio button to use the light theme. */
  options_dialogThemeLight: string;
  /** Label for the radio button to use the dark theme. */
  options_dialogThemeDark: string;
  /** Title of the Sync section. */
  options_syncTitle: string;
  /** Message indicating the sync feature has been updated. */
  options_syncFeatureUpdated: string;
  /** Label for the switch to enable cloud sync. */
  options_syncFeature: string;
  /** Description of the cloud sync feature. */
  options_syncFeatureDescription: string;
  /** Text for the button to turn on sync. */
  options_turnOnSync: string;
  /** Title of the turn-on-sync dialog. */
  options_turnOnSyncDialog_title: string;
  /** Label for the switch to use the alternative authentication flow. */
  options_turnOnSyncDialog_useAltFlow: string;
  /** Description for the alternative authentication flow. '$1' will be replaced with the domain. */
  options_turnOnSyncDialog_altFlowDescription: string;
  /** Label for the input for the alternative authentication code. */
  options_turnOnSyncDialog_altFlowAuthCodeLabel: string;
  /** Text for the button to turn on sync in the dialog. */
  options_turnOnSyncDialog_turnOnSyncButton: string;
  /** Text for the button to turn off sync. */
  options_turnOffSync: string;
  /** Message indicating the result of the last sync. */
  options_syncResult: string;
  /** Message indicating sync has never been performed. */
  options_syncNever: string;
  /** Message indicating sync is running. */
  options_syncRunning: string;
  /** Text for the button to reload sync. */
  options_syncReloadButton: string;
  /** Text for the button to sync now. */
  options_syncNowButton: string;
  /** Label for the list to choose what to sync. */
  options_syncCategories: string;
  /** Label for the switch to sync the blocklist. */
  options_syncBlocklist: string;
  /** Label for the switch to sync general settings. */
  options_syncGeneral: string;
  /** Label for the switch to sync appearance. */
  options_syncAppearance: string;
  /** Label for the switch to sync subscriptions. */
  options_syncSubscriptions: string;
  /** Label for the switch to sync SERPINFO. */
  options_syncSerpInfo: string;
  /** Label for the select to choose a sync interval. */
  options_syncInterval: string;
  /** Title of the Subscription section. */
  options_subscriptionTitle: string;
  /** Text for the button to enable ruleset subscription links. */
  options_enableRulesetSubscriptionURL: string;
  /** Description for the ruleset subscription URL feature. '$1' will be replaced with the domain. */
  options_enableRulesetSubscriptionURLDescription: string;
  /** Text for the button to enable ruleset subscription URL. */
  options_enableRulesetSubscriptionURLButton: string;
  /** Message indicating ruleset subscription links are enabled. */
  options_rulesetSubscriptionURLIsEnabled: string;
  /** Label for the subscription feature. */
  options_subscriptionFeature: string;
  /** Description of the subscription feature. */
  options_subscriptionFeatureDescription: string;
  /** Text for the button to add a subscription. */
  options_addSubscriptionButton: string;
  /** Header text for the name column in the subscriptions table. */
  options_subscriptionNameHeader: string;
  /** Header text for the URL column in the subscriptions table. */
  options_subscriptionURLHeader: string;
  /** Header text for the update result column in the subscriptions table. */
  options_subscriptionUpdateResultHeader: string;
  /** Label for the checkbox in the subscriptions table. */
  options_subscriptionCheckBoxLabel: string;
  /** Label for the menu buttons in the subscriptions table. */
  options_subscriptionMenuButtonLabel: string;
  /** Message indicating no subscriptions have been added. */
  options_noSubscriptionsAdded: string;
  /** Message indicating an update is running. */
  options_subscriptionUpdateRunning: string;
  /** Text for the menu item to show a subscription. */
  options_showSubscriptionMenu: string;
  /** Text for the menu item to update a subscription now. */
  options_updateSubscriptionNowMenu: string;
  /** Text for the menu item to remove a subscription. */
  options_removeSubscriptionMenu: string;
  /** Text for the button to update all subscriptions now. */
  options_updateAllSubscriptionsNowButton: string;
  /** Title of the add subscription dialog. */
  options_addSubscriptionDialog_title: string;
  /** Label for the name input in the add subscription dialog. */
  options_addSubscriptionDialog_nameLabel: string;
  /** Label for the URL input in the add subscription dialog. */
  options_addSubscriptionDialog_urlLabel: string;
  /** Label for the alternative name input in the add subscription dialog. */
  options_addSubscriptionDialog_altNameLabel: string;
  /** Helper text for the alternative name input in the add subscription dialog. */
  options_addSubscriptionDialog_altNameDescription: string;
  /** Text for the add button in the add subscription dialog. */
  options_addSubscriptionDialog_addButton: string;
  /** Label for the textarea in the show subscription dialog. */
  options_showSubscriptionDialog_blacklistLabel: string;
  /** Label for the select to choose an update interval. */
  options_updateInterval: string;
  /** Title of the Backup and Restore section. */
  options_backupRestoreTitle: string;
  /** Label for backup settings. */
  options_backupSettingsLabel: string;
  /** Text for the button to backup settings. */
  options_backupSettingsButton: string;
  /** Label for restore settings. */
  options_restoreSettingsLabel: string;
  /** Text for the button to restore settings. */
  options_restoreSettingsButton: string;
  /** Error message shown when the backup file is invalid. */
  options_restoreSettingsInvalidFile: string;
  /** Label for reset settings. */
  options_resetSettingsLabel: string;
  /** Text for the button to reset settings. */
  options_resetSettingsButton: string;
  /** Confirmation message to reset settings. */
  options_resetSettingsConfirmation: string;
  /** Title of the About section. */
  options_aboutTitle: string;
  /** Label for the version. */
  options_aboutVersion: string;
  /** Text for the link to the documentation. */
  options_aboutDocumentation: string;
  /** Text for the link to the release notes. */
  options_aboutReleaseNotes: string;
  /** Text for the link to the privacy policy. */
  options_aboutPrivacyPolicy: string;
  /** Text for the link to third-party notices. */
  options_aboutThirdPartyNotices: string;
  /** Title of the Experimental section. */
  options_experimentalSectionTitle: string;
  /** Label for SERPINFO. */
  options_serpInfoLabel: string;
  /** Text for the button to open SERPINFO options. */
  options_openSerpInfoOptionsButton: string;
  /** Title of the Basic Settings section for SERPINFO. */
  options_serpInfoBasicSettingsSection: string;
  /** Label for the switch to enable SERPINFO. */
  options_enableSerpInfo: string;
  /** Text for the button to enable SERPINFO subscription URL. */
  options_enableSerpInfoSubscriptionURL: string;
  /** Description for the SERPINFO subscription URL feature. '$1' will be replaced with the domain. */
  options_enableSerpInfoSubscriptionURLDescription: string;
  /** Text for the button to enable SERPINFO subscription URL. */
  options_enableSerpInfoSubscriptionURLButton: string;
  /** Message indicating SERPINFO subscription links are enabled. */
  options_serpInfoSubscriptionURLIsEnabled: string;
  /** Label for the access permission. */
  options_accessPermissionLabel: string;
  /** Description for the access permission. */
  options_accessPermissionDescription: string;
  /** Text for the button to update access permission. */
  options_accessPermissionButton: string;
  /** Title of the Remote SERPINFO section. */
  options_remoteSerpInfoSection: string;
  /** Version of remote SERPINFO. */
  options_remoteSerpInfoVersion: string;
  /** Last modified date of remote SERPINFO. */
  options_remoteSerpInfoLastModified: string;
  /** Homepage of remote SERPINFO. */
  options_remoteSerpInfoHomepage: string;
  /** Text for the button to show remote SERPINFO. */
  options_showRemoteSerpInfoButton: string;
  /** Text for the button to remove remote SERPINFO. */
  options_removeRemoteSerpInfoButton: string;
  /** Text for the button to update all remote SERPINFO. */
  options_updateAllRemoteSerpInfoButton: string;
  /** Message shown when remote SERPINFO update is done. */
  options_remoteSerpInfoUpdateDone: string;
  /** Text for the button to add remote SERPINFO. */
  options_addRemoteSerpInfoButton: string;
  /** Title of the add SERPINFO dialog. */
  options_addRemoteSerpInfoDialog_title: string;
  /** Label for the input in the add SERPINFO dialog. */
  options_addRemoteSerpInfoDialog_urlLabel: string;
  /** Text for the add button in the add SERPINFO dialog. */
  options_addRemoteSerpInfoDialog_addButton: string;
  /** Title of the User SERPINFO section. */
  options_userSerpInfoSection: string;
  /** Link to the documentation for SERPINFO. */
  options_userSerpInfoDocumentationLink: string;
  /** Text for the button to save user SERPINFO. */
  options_saveUserSerpInfo: string;
  /** Label for the radio button to sync with Google Drive. */
  clouds_googleDriveSync: string;
  /** Description for Google Drive sync. */
  clouds_googleDriveSyncDescription: string;
  /** Message indicating Google Drive sync is turned on. */
  clouds_googleDriveSyncTurnedOn: string;
  /** Label for the radio button to sync with Dropbox. */
  clouds_dropboxSync: string;
  /** Description for Dropbox sync. */
  clouds_dropboxSyncDescription: string;
  /** Message indicating Dropbox sync is turned on. */
  clouds_dropboxSyncTurnedOn: string;
};

export type MessageName = keyof Messages;

export type MessageName1 =
  | "error"
  | "content_multipleSitesBlocked"
  | "options_blacklistExample"
  | "options_highlightColorNth"
  | "options_turnOnSyncDialog_altFlowDescription"
  | "options_enableRulesetSubscriptionURLDescription"
  | "options_enableSerpInfoSubscriptionURLDescription";

export type MessageName0 = Exclude<MessageName, MessageName1>;
