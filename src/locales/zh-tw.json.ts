import { exportAsMessages } from './helpers';

exportAsMessages('_locales/zh_TW/messages.json', {
  extensionName: 'uBlacklist',
  extensionDescription: '封鎖來自於 Google 搜尋結果中的特定網站',
  lang: 'zh-tw',
  error: '錯誤: $1',
  unauthorizedError: '未經授權。請關閉同步，然後再次開啟。',
  cancelButton: '取消',
  okButton: '確定',
  content_singleSiteBlocked: 'uBlacklist 已經封鎖 1 個網站',
  content_multipleSitesBlocked: 'uBlacklist 已經封鎖 $1 個網站',
  content_showBlockedSitesLink: '顯示',
  content_hideBlockedSitesLink: '隱藏',
  content_blockSiteLink: '封鎖這個網站',
  content_unblockSiteLink: '解除封鎖這個網站',
  popup_blockSiteTitle: '封鎖這個網站',
  popup_unblockSiteTitle: '解除封鎖這個網站',
  popup_details: '詳細',
  popup_pageURLLabel: '網頁 URL',
  popup_pathDepth: '深度',
  popup_pageTitleLabel: '網頁標題',
  popup_addedRulesLabel: '要加入的規則',
  popup_removedRulesLabel: '要刪除的規則',
  popup_blockSiteButton: '封鎖',
  popup_unblockSiteButton: '解除封鎖',
  popup_openOptionsLink: '選項',
  popup_active: 'uBlacklist 已啟用',
  popup_inactive: 'uBlacklist 已禁用',
  popup_activateButton: '啟用',
  options_generalTitle: '一般',
  options_blacklistLabel: '在 Google 搜尋結果中被封鎖的網站',
  options_blacklistHelper:
    '您可以使用 [匹配模式](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) 或 [正規表達式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)。',
  options_blacklistExample: '舉例: $1',
  options_blockByTitle: '要使用網頁標題來封鎖網站，請在正則表示式前新增「title」。',
  options_blacklistUpdated: '封鎖清單已更新',
  options_reloadBlacklistButton: '重載',
  options_importBlacklistButton: '匯入',
  options_exportBlacklistButton: '匯出',
  options_saveBlacklistButton: '儲存',
  options_importBlacklistDialog_title: '匯入',
  options_importBlacklistDialog_fromFile: '從檔案匯入',
  options_importBlacklistDialog_selectFile: '選擇一個檔案',
  options_importBlacklistDialog_fromPB: '貼上從 Personal Blocklist 匯出的網域清單',
  options_importBlacklistDialog_append: '附加到現有清單',
  options_importBlacklistDialog_importButton: '匯入',
  options_importBlacklistDialog_helper: '貼上從 Personal Blocklist 匯出的網域清單。',
  options_otherSearchEngines: '支援額外的網站',
  options_otherSearchEnginesDescription:
    '你可以開啟以下網站的支援，請注意你必須允許此擴充功能存取你要支援的網站',
  options_registerSearchEngine: '啟用',
  options_searchEngineRegistered: '已啟用',
  options_skipBlockDialogLabel: '加入封鎖清單時不顯示確定提示。',
  options_hideBlockLinksLabel: '隱藏「封鎖這個網站」的連結',
  options_hideControlLabel: '不在搜尋結果網頁頂部顯示已被封鎖的網站數量和「顯示」的連結',
  options_blockWholeSiteLabel: '預設情況下新增封鎖整個網站的規則',
  options_blockWholeSiteDescription:
    '例如封鎖 "https://a.b.example.uk.com/", 會新增 "*://*.example.uk.com/*" 規則',
  options_appearanceTitle: '外觀',
  options_linkColor: '連結的顏色',
  options_blockColor: '被封鎖的搜尋結果的顏色',
  options_colorUseDefault: '預設',
  options_colorSpecify: '自訂',
  options_highlightColors: '高亮顯示的搜尋結果的顏色',
  options_highlightDescription: '要使用「顏色 N」來高亮顯示某個搜尋結果，請在規則前加上「@N」',
  options_highlightColorNth: '顏色 $1',
  options_highlightColorAdd: '增加',
  options_highlightColorRemove: '刪除',
  options_dialogTheme: '「封鎖這個網站」對話框的主题',
  options_dialogThemeDefault: '預設',
  options_dialogThemeLight: '淺色',
  options_dialogThemeDark: '深色',
  options_syncTitle: '同步',
  options_syncFeatureUpdated: '同步功能已更新。繼續使用同步功能，請點選「開啟同步」。',
  options_syncFeature: '與雲同步',
  options_syncFeatureDescription: '可以通過雲服務在不同的電腦之間同步你的黑名單資料。',
  options_turnOnSync: '啟用同步',
  options_turnOnSyncDialog_title: '啟用同步',
  options_turnOnSyncDialog_turnOnSyncButton: '啟用',
  options_turnOnSyncDialog_altFlowDescription:
    '在認證之前，您可能會被要求獲得訪問 $1 的許可，但您的個人資訊不會被儲存在該域中。',
  options_turnOnSyncDialog_altFlowAuthCodeLabel: '認證碼',
  options_turnOffSync: '關閉',
  options_syncResult: '最近同步',
  options_syncNever: '從未同步',
  options_syncRunning: '同步中...',
  options_syncReloadButton: '重新載入',
  options_syncNowButton: '立即同步',
  options_syncInterval: '同步間隔',
  options_subscriptionTitle: '訂閱',
  options_subscriptionFeature: '訂閱黑名單',
  options_subscriptionFeatureDescription: '如果您加入訂閱，將從指定的 URL 定期下載黑名單。',
  options_addSubscriptionButton: '加入訂閱',
  options_subscriptionNameHeader: '名稱',
  options_subscriptionURLHeader: 'URL 網址',
  options_subscriptionUpdateResultHeader: '最近更新',
  options_subscriptionCheckBoxLabel: '啟用',
  options_noSubscriptionsAdded: '沒有加入訂閱',
  options_subscriptionUpdateRunning: '更新中...',
  options_showSubscriptionMenu: '顯示',
  options_updateSubscriptionNowMenu: '立即更新',
  options_removeSubscriptionMenu: '移除',
  options_updateAllSubscriptionsNowButton: '立即更新',
  options_addSubscriptionDialog_title: '加入一個訂閱',
  options_addSubscriptionDialog_nameLabel: '名稱',
  options_addSubscriptionDialog_urlLabel: 'URL 網址',
  options_addSubscriptionDialog_addButton: '加入',
  options_updateInterval: '更新間隔',
  clouds_googleDriveSync: '與 Google Drive 同步',
  clouds_googleDriveSyncDescription: '同步檔案將會儲存在一個使用者不可見的應用程式資料夾中。',
  clouds_googleDriveSyncTurnedOn: '已與 Google Drive 同步',
  clouds_dropboxSync: '與 Dropbox 同步',
  clouds_dropboxSyncDescription: '同步檔案將會儲存在 /Apps/uBlacklist/',
  clouds_dropboxSyncTurnedOn: '已與 Dropbox 同步',
});
