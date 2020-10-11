import { exportMessages } from '../../locale';

export default exportMessages({
  // The extension name.
  extensionName: 'uBlacklist',

  // The extension description.
  extensionDescription: 'Blocks sites you specify from appearing in Google search results',

  // The locale for 'dayjs'. See https://github.com/iamkun/dayjs/tree/dev/src/locale and select a proper locale.
  dayjsLocale: 'en',

  // The text that means an error occurred.
  // '$1' is expanded to the message.
  error: 'Error: $1',

  // The error message shown when unauthorized to access a cloud.
  unauthorizedError: 'Unauthorized. Please turn sync off and on again.',

  // The text of a cancel button.
  cancelButton: 'Cancel',

  // The text of an OK button.
  okButton: 'OK',

  // The text that means one site has been blocked.
  content_singleSiteBlocked: 'uBlacklist has blocked 1 site',

  // The text that means multiple sites have been blocked.
  // '$1' is expanded to the count.
  content_multipleSitesBlocked: 'uBlacklist has blocked $1 sites',

  // The text of the link to show blocked sites.
  content_showBlockedSitesLink: 'Show',

  // The text of the link to hide blocked sites.
  content_hideBlockedSitesLink: 'Hide',

  // The text of a link to block a site.
  content_blockSiteLink: 'Block this site',

  // The text of a link to unblock a site.
  content_unblockSiteLink: 'Unblock this site',

  // The title of a popup to block a site.
  popup_blockSiteTitle: 'Block this site',

  // The title of a popup to unblock a site.
  popup_unblockSiteTitle: 'Unblock this site',

  // The title of the disclosure widget that contains the details.
  popup_details: 'Details',

  // The label for the input that shows a page URL.
  popup_pageURLLabel: 'Page URL',

  // The label for the input that shows a path depth of rules to be added.
  popup_pathDepth: 'Depth',

  // The label for the textarea that shows rules to be added.
  popup_addedRulesLabel: 'Rules to be added',

  // The label for the textarea that shows rules to be removed.
  popup_removedRulesLabel: 'Rules to be removed',

  // The text of the button to block a site.
  popup_blockSiteButton: 'Block',

  // The text of the button to unblock a site.
  popup_unblockSiteButton: 'Unblock',

  // The text of the link to the options page.
  popup_openOptionsLink: 'Options',

  // The title of the general section.
  options_generalTitle: 'General',

  // The label for the blacklist textarea.
  options_blacklistLabel: 'Sites blocked from appearing in Google search results',

  // The helper text for the blacklist textarea.
  options_blacklistHelper:
    'You can use [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) or [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).',

  // The helper text to show an example rule.
  // '$1' is expanded to the example.
  options_blacklistExample: 'Example: $1',

  // The text indicating that the blacklist is update outside the options page.
  options_blacklistUpdated: 'Updated',

  // The text of the button to reload the blacklist.
  options_reloadBlacklistButton: 'Reload',

  // The text of the button to import a blacklist.
  options_importBlacklistButton: 'Import',

  // The text of the button to export a blacklist.
  options_exportBlacklistButton: 'Export',

  // The text of the button to save a blacklist.
  options_saveBlacklistButton: 'Save',

  // The title of the import-blacklist dialog.
  options_importBlacklistDialog_title: 'Import',

  // The label for the radio to import from a file.
  options_importBlacklistDialog_fromFile: 'Import from a file',

  // The text of the button to import from a file.
  options_importBlacklistDialog_selectFile: 'Select a file',

  // The label for the radio to import from Personal Blocklist.
  options_importBlacklistDialog_fromPB: 'Import from Personal Blocklist',

  // The text of the checkbox to append to the existing blacklist
  options_importBlacklistDialog_append: 'Append to the existing list',

  // The text of the import button on the import-blacklist dialog.
  options_importBlacklistDialog_importButton: 'Import',

  // Other search engines support.
  options_otherSearchEngines: 'Other search engines',

  // The details for other search engines support.
  options_otherSearchEnginesDescription: 'You can use this extension on the below search engines.',

  // The text of the button to enable this extension on a search engine.
  options_registerSearchEngine: 'Enable',

  // The text of the button to indicate that this extension is enabled on a search engine.
  options_searchEngineRegistered: 'Enabled',

  // The label for the switch whether to skip the 'Block this site' dialog
  options_skipBlockDialogLabel: 'Skip the "Block this site" dialog',

  // The label for the switch whether to hide the 'Block this site' links.
  options_hideBlockLinksLabel: 'Hide the "Block this site" links',

  // The label for the switch whether to hide the number of blocked sites and the 'Show' link.
  options_hideControlLabel: 'Hide the number of blocked sites and the "Show" link',

  // The title of the sync section.
  options_syncTitle: 'Sync',

  // The text to indicate that the sync feature has been updated (version 3 -> 4).
  options_syncFeatureUpdated:
    'The sync feature has been updated. To continue using sync, press the "Turn on sync" button.',

  // The sync feature.
  options_syncFeature: 'Sync with a cloud',

  // The description of the sync feature.
  options_syncFeatureDescription:
    'You can synchronize blacklists across your devices through a cloud.',

  // The text of the button to turn on sync.
  options_turnOnSync: 'Turn on sync',

  // The title of the dialog to turn on sync.
  options_turnOnSyncDialog_title: 'Turn on sync',

  // The text of the button to turn on sync.
  options_turnOnSyncDialog_turnOnSyncButton: 'Turn on',

  // The text of the button to turn off sync.
  options_turnOffSync: 'Turn off',

  // The text that means the result of the last sync.
  options_syncResult: 'Last sync',

  // The text that means sync has been never performed.
  options_syncNever: 'Never synced',

  // The text that means sync is running right now.
  options_syncRunning: 'Syncing...',

  // The text of the button to sync now.
  options_syncNowButton: 'Sync now',

  // The label of the select to select a sync interval.
  options_syncInterval: 'Sync interval',

  // The title of the subscription section.
  options_subscriptionTitle: 'Subscription',

  // The subscription feature.
  options_subscriptionFeature: 'Subscribe to blacklists',

  // The description of the subscription feature.
  options_subscriptionFeatureDescription:
    'If you add a subscription, blacklists will be regularly downloaded from the specified URL.',

  // The text of the button to add a subscription.
  options_addSubscriptionButton: 'Add subscription',

  // The header text of the name row of the subscriptions table.
  options_subscriptionNameHeader: 'Name',

  // The header text of the URL row of the subscriptions table.
  options_subscriptionURLHeader: 'URL',

  // The header text of the update-result row of the subscriptions table.
  options_subscriptionUpdateResultHeader: 'Last update',

  // The text that means no subscriptions have been added.
  options_noSubscriptionsAdded: 'No subscriptions added',

  // The text that means update is running right now.
  options_subscriptionUpdateRunning: 'Updating...',

  // The text of a menu item to show a subscription.
  options_showSubscriptionMenu: 'Show',

  // The text of a menu item to update a subscription now.
  options_updateSubscriptionNowMenu: 'Update now',

  // The text of a menu item to remove a subscription.
  options_removeSubscriptionMenu: 'Remove',

  // The text of the button to update all subscriptions now.
  options_updateAllSubscriptionsNowButton: 'Update now',

  // The title of the add-subscription dialog.
  options_addSubscriptionDialog_title: 'Add a subscription',

  // The label for the name input on the add-subscription dialog.
  options_addSubscriptionDialog_nameLabel: 'Name',

  // The label for the URL input on the add-subscription dialog.
  options_addSubscriptionDialog_urlLabel: 'URL',

  // The text of the add button on the add-subscription dialog.
  options_addSubscriptionDialog_addButton: 'Add',

  // The label of the select to select an update interval.
  options_updateInterval: 'Update interval',

  // The label of the radio button to sync with Google Drive.
  clouds_googleDriveSync: 'Sync with Google Drive',

  // The text to describe the behavior of sync with Google Drive.
  clouds_googleDriveSyncDescription:
    'A file will be created within the application data folder hidden from the user.',

  // The text indicating that sync with Google Drive is turned on.
  clouds_googleDriveSyncTurnedOn: 'Synced with Google Drive',

  // The text indicating syncing with Dropbox.
  clouds_dropboxSync: 'Sync with Dropbox',

  // The text to describe the behavior of sync with Dropbox.
  clouds_dropboxSyncDescription: 'A file will be created within "/Apps/uBlacklist/".',

  // The label of the radio button to sync with Dropbox.
  clouds_dropboxSyncTurnedOn: 'Synced with Dropbox',

  // The localized name of DuckDuckGo
  searchEngines_duckduckgoName: 'DuckDuckGo',

  // The localized name of Startpage.com
  searchEngines_startpageName: 'Startpage.com',
});
