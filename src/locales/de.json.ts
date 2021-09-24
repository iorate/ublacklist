import { exportAsMessages } from './helpers';

exportAsMessages('_locales/de/messages.json', {
  // The extension name.
  extensionName: 'uBlacklist',

  // The extension description.
  extensionDescription: 'Blockiert Seiten damit diese nicht in den Suchergebnissen von Google auftauchen',

  // The language code.
  lang: 'de',

  // The text that means an error occurred.
  // '$1' is expanded to the message.
  error: 'Fehler: $1',

  // The error message shown when unauthorized to access a cloud.
  unauthorizedError: 'Nicht autorisiert. Bitte Synchronisation aus- und wieder einschalten.',

  // The text of a cancel button.
  cancelButton: 'Abbrechen',

  // The text of an OK button.
  okButton: 'OK',

  // The text that means one site has been blocked.
  content_singleSiteBlocked: 'uBlacklist hat eine Seite blockiert',

  // The text that means multiple sites have been blocked.
  // '$1' is expanded to the count.
  content_multipleSitesBlocked: 'uBlacklist hat $1 Seiten blockiert',

  // The text of the link to show blocked sites.
  content_showBlockedSitesLink: 'Anzeigen',

  // The text of the link to hide blocked sites.
  content_hideBlockedSitesLink: 'Ausblenden',

  // The text of a link to block a site.
  content_blockSiteLink: 'Diese Seite blockieren',

  // The text of a link to unblock a site.
  content_unblockSiteLink: 'Diese Seite nicht blockieren',

  // The title of a popup to block a site.
  popup_blockSiteTitle: 'Diese Seite blockieren',

  // The title of a popup to unblock a site.
  popup_unblockSiteTitle: 'Diese Seite nicht blockieren',

  // The title of the disclosure widget that contains the details.
  popup_details: 'Details',

  // The label for the textarea that shows the page URL.
  popup_pageURLLabel: 'Seiten-URL',

  // The label for the input that shows a path depth of rules to be added.
  popup_pathDepth: 'Pfadtiefe',

  // The label for the textarea that shows the page title.
  popup_pageTitleLabel: 'Seitentitel',

  // The label for the textarea that shows rules to be added.
  popup_addedRulesLabel: 'Regeln die hinzugefügt werden',

  // The label for the textarea that shows rules to be removed.
  popup_removedRulesLabel: 'Regeln die entfernt werden',

  // The text of the button to block a site.
  popup_blockSiteButton: 'Blockieren',

  // The text of the button to unblock a site.
  popup_unblockSiteButton: 'Aufheben',

  // The text of the link to the options page.
  popup_openOptionsLink: 'Optionen',

  // The title of the general section.
  options_generalTitle: 'Allgemein',

  // The label for the blacklist textarea.
  options_blacklistLabel: 'Seiten die in den Suchergebnissen von Google blockiert sind',

  // The helper text for the blacklist textarea.
  options_blacklistHelper:
    'Sie können [Muster](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) oder [reguläre Ausdrücke](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) verwenden.',

  // The helper text to show an example rule.
  // '$1' is expanded to the example.
  options_blacklistExample: 'Beispiel: $1',

  // The helper text to explain how to block sites by page title.
  options_blockByTitle: 'Um Seiten über deren Seitentitel zu blockieren, müssen Sie "title" vor reguläre Ausdrücke voranstellen.',

  // The text indicating that the blacklist is update outside the options page.
  options_blacklistUpdated: 'Aktualisiert',

  // The text of the button to reload the blacklist.
  options_reloadBlacklistButton: 'Neu laden',

  // The text of the button to import a blacklist.
  options_importBlacklistButton: 'Importieren',

  // The text of the button to export a blacklist.
  options_exportBlacklistButton: 'Exportieren',

  // The text of the button to save a blacklist.
  options_saveBlacklistButton: 'Speichern',

  // The title of the import-blacklist dialog.
  options_importBlacklistDialog_title: 'Importieren',

  // The label for the select to import from a file.
  options_importBlacklistDialog_fromFile: 'Aus Datei importieren',

  // The text of the button to import from a file.
  options_importBlacklistDialog_selectFile: 'Datei auswählen',

  // The label for the select to import from Personal Blocklist.
  options_importBlacklistDialog_fromPB: 'Von persönlicher Sperrliste importieren',

  // The label for the textarea to import from Personal Blocklist (for a11y only).
  options_importBlacklistDialog_pbLabel: 'Domänen',

  // The text of the checkbox to append to the existing blacklist
  options_importBlacklistDialog_append: 'An existierende Liste anhängen',

  // The text of the import button on the import-blacklist dialog.
  options_importBlacklistDialog_importButton: 'Importieren',

  // The helper text for the textarea on the import-blacklist dialog.
  options_importBlacklistDialog_helper:'Einfügen der von der persönlichen Sperrliste exportierten Domänen.',

  // Other search engines support.
  options_otherSearchEngines: 'Andere Suchmaschinen',

  // The details for other search engines support.
  options_otherSearchEnginesDescription: 'Sie können diese Erweiterung auf den nachfolgenden Suchmaschinen verwenden.',

  // The text of the button to enable this extension on a search engine.
  options_registerSearchEngine: 'Aktivieren',

  // The text of the button to indicate that this extension is enabled on a search engine.
  options_searchEngineRegistered: 'Aktiviert',

  // The label for the switch whether to skip the 'Block this site' dialog
  options_skipBlockDialogLabel: '"Diese Seite blockieren"-Dialog überspringen',

  // The label for the switch whether to hide the 'Block this site' links.
  options_hideBlockLinksLabel: '"Diese Seite blockieren"-Links ausblenden',

  // The label for the switch whether to hide the number of blocked sites and the 'Show' link.
  options_hideControlLabel: 'Anzahl der blockierten Seiten und den "Anzeigen"-Link ausblenden',

  // The title of the appearance section.
  options_appearanceTitle: 'Aussehen',

  // The color of links.
  options_linkColor: 'Die Farbe von Links',

  // The color of blocked search results.
  options_blockColor: 'Die Farbe von blockierten Suchergebnissen',

  // The label of radio buttons to use the default color.
  options_colorUseDefault: 'Standard',

  // The label of radio buttons to specify the color.
  options_colorSpecify: 'Benutzerdefiniert',

  // The colors of highlighted search results.
  options_highlightColors: 'Die Farbe von hervorgehobenen Suchergebnissen',

  // The description of the highlighting feature.
  options_highlightDescription: 'Um Suchergebnisse mit der Farbe N hervorzuheben, müssen Sie "@N" der Regel voranstellen.',

  // The name of the nth color.
  options_highlightColorNth: 'Farbe $1',

  // The label of the button to add a highlight color (for a11y only).
  options_highlightColorAdd: 'Hinzufügen',

  // The label of the button to remove a highlight color (for a11y only).
  options_highlightColorRemove: 'Entfernen',

  // The dialog theme.
  options_dialogTheme: 'Das Thema des "Diese Seite blockieren"-Dialog in den Suchergebnissen',

  // The label of a radio button to use the default dialog theme.
  options_dialogThemeDefault: 'Standard',

  // The label of a radio button to use the light theme.
  options_dialogThemeLight: 'Hell',

  // The label of a radio button to use the dark theme.
  options_dialogThemeDark: 'Dunkel',

  // The title of the sync section.
  options_syncTitle: 'Synchronisieren',

  // The text to indicate that the sync feature has been updated (version 3 -> 4).
  options_syncFeatureUpdated: 
    'Die Funktion für das Synchronisieren wurde aktualisiert. Um die Synchronisation weiter verwenden zu können, drücken Sie auf "Synchronisation einschalten".',

  // The sync feature.
  options_syncFeature: 'Mit Cloud synchronisieren',

  // The description of the sync feature.
  options_syncFeatureDescription: 
    'Sie können Ihre Sperrlisten über die Cloud mit all Ihren Geräte synchronisieren.',

  // The text of the button to turn on sync.
  options_turnOnSync: 'Synchronisation einschalten',

  // The title of the dialog to turn on sync.
  options_turnOnSyncDialog_title: 'Synchronisation einschalten',

  // The text of the button to turn on sync.
  options_turnOnSyncDialog_turnOnSyncButton: 'Einschalten',

  // The text to explain permission requests in the 'alternative' web auth flow.
  // Currently it is used only in Safari.
  // '$1' is expanded to 'iorate.github.io'.
  options_turnOnSyncDialog_altFlowDescription:
    'Sie werden vor der Authentifizierung möglicherweise nach Berechtigtungen für den Zugriff auf $1 geafragt. Ihre persönlichen Daten werden jedoch NICHT unter der Domäne gespeichert.',

  // The label for the textarea to input the authorization code returned by the 'alternative' web auth flow.
  // Currently it is used only in Safari (probably only on iOS and iPadOS).
  options_turnOnSyncDialog_altFlowAuthCodeLabel: 'Autorisationsschlüssel',

  // The text of the button to turn off sync.
  options_turnOffSync: 'Ausschalten',

  // The text that means the result of the last sync.
  options_syncResult: 'Letzte Synchronisation',

  // The text that means sync has been never performed.
  options_syncNever: 'Noch nie synchronisiert',

  // The text that means sync is running right now.
  options_syncRunning: 'Synchronisiere...',

  // The text of the button to reload the options page after settings are downloaded from a cloud.
  options_syncReloadButton: 'Neu laden',

  // The text of the button to sync now.
  options_syncNowButton: 'Jetzt synchronisieren',

  // The label of the list to choose what to sync.
  options_syncCategories: 'Was synchronisiert wird',

  // The label of the switch to sync the blocklist.
  options_syncBlocklist: 'Blockierte Seiten',

  // The label of the switch to sync the general settings.
  options_syncGeneral: 'Allgemeine Einstellungen',

  // The label of the switch to sync the appearance.
  options_syncAppearance: 'Aussehen',

  // The label of the switch to sync the subscriptions.
  options_syncSubscriptions: 'Abonnements',

  // The label of the select to select a sync interval.
  options_syncInterval: 'Synchronisationsintervall',

  // The title of the subscription section.
  options_subscriptionTitle: 'Abonnement',

  // The subscription feature.
  options_subscriptionFeature: 'Sperrlisten abonnieren',

  // The description of the subscription feature.
  options_subscriptionFeatureDescription:
    'Wenn Sie ein Abonnement hinzufügen, werdne die Sperrlisten regelmäßig von der festgelegten URL heruntergeladen.',

  // The text of the button to add a subscription.
  options_addSubscriptionButton: 'Add a subscription',

  // The header text of the name row of the subscriptions table.
  options_subscriptionNameHeader: 'Name',

  // The header text of the URL row of the subscriptions table.
  options_subscriptionURLHeader: 'URL',

  // The header text of the update-result row of the subscriptions table.
  options_subscriptionUpdateResultHeader: 'Letzte Aktualisierung',

  // The label for the menu buttons of the subscriptions table (for a11y only).
  options_subscriptionMenuButtonLabel: 'Menü',

  // The text that means no subscriptions have been added.
  options_noSubscriptionsAdded: 'Keine Abonnements hinzugefügt',

  // The text that means update is running right now.
  options_subscriptionUpdateRunning: 'Aktualisiere...',

  // The text of a menu item to show a subscription.
  options_showSubscriptionMenu: 'Anzeigen',

  // The text of a menu item to update a subscription now.
  options_updateSubscriptionNowMenu: 'Jetzt aktualisieren',

  // The text of a menu item to remove a subscription.
  options_removeSubscriptionMenu: 'Entfernen',

  // The text of the button to update all subscriptions now.
  options_updateAllSubscriptionsNowButton: 'Jetzt aktualisieren',

  // The title of the add-subscription dialog.
  options_addSubscriptionDialog_title: 'Abonnement hinzufügen',

  // The label for the name input on the add-subscription dialog.
  options_addSubscriptionDialog_nameLabel: 'Name',

  // The label for the URL input on the add-subscription dialog.
  options_addSubscriptionDialog_urlLabel: 'URL',

  // The text of the add button on the add-subscription dialog.
  options_addSubscriptionDialog_addButton: 'Hinzufügen',

  // The label for the textarea on the show-subscription dialog (for a11y only).
  options_showSubscriptionDialog_blacklistLabel: 'Regeln',

  // The label of the select to select an update interval.
  options_updateInterval: 'Aktualisierungsintervall',

  // The label of the radio button to sync with Google Drive.
  clouds_googleDriveSync: 'Mit Google Drive synchronisieren',

  // The text to describe the behavior of sync with Google Drive.
  clouds_googleDriveSyncDescription:
    'Im Datenverzeichnis der Anwendung wird eine vor dem Benutzer versteckte Datei erstellt.',

  // The text indicating that sync with Google Drive is turned on.
  clouds_googleDriveSyncTurnedOn: 'Mit Google Drive synchronisiert',

  // The text indicating syncing with Dropbox.
  clouds_dropboxSync: 'Mit Dropbox synchronisieren',

  // The text to describe the behavior of sync with Dropbox.
  clouds_dropboxSyncDescription: 'Unter "/Apps/uBlacklist/" wird eine Datei erstellt.',

  // The label of the radio button to sync with Dropbox.
  clouds_dropboxSyncTurnedOn: 'Mit Dropbox synchronisiert',

  // The localized name of Google (not used).
  searchEngines_googleName: 'Google',

  // The localized name of Bing.
  searchEngines_bingName: 'Bing',

  // The localized name of DuckDuckGo.
  searchEngines_duckduckgoName: 'DuckDuckGo',

  // The localized name of Ecosia.
  searchEngines_ecosiaName: 'Ecosia',

  // The localized name of Startpage.
  searchEngines_startpageName: 'Startpage.com',
});
