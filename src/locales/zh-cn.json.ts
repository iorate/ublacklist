import { exportAsMessages } from './helpers';

exportAsMessages('_locales/zh_CN/messages.json', {
  // The extension name.
  extensionName: 'uBlacklist',

  // The extension description.
  extensionDescription: '在谷歌的搜索结果中屏蔽特定的网站显示。',

  // The language code.
  lang: 'zh-cn',

  // The text that means an error occurred.
  // '$1' is expanded to the message.
  error: '出现错误: $1',

  // The error message shown when unauthorized to access a cloud.
  unauthorizedError: '未授权的操作。请尝试先关闭同步后，再开启同步。',

  // The text of a cancel button.
  cancelButton: '取消',

  // The text of an OK button.
  okButton: '确定',

  // The text that means one site has been blocked.
  content_singleSiteBlocked: 'uBlacklist 已经屏蔽了 1 个网站',

  // The text that means multiple sites have been blocked.
  // '$1' is expanded to the count.
  content_multipleSitesBlocked: 'uBlacklist 已经屏蔽了 $1 个网站',

  // The text of the link to show blocked sites.
  content_showBlockedSitesLink: '显示',

  // The text of the link to hide blocked sites.
  content_hideBlockedSitesLink: '隐藏',

  // The text of a link to block a site.
  content_blockSiteLink: '加入黑名单',

  // The text of a link to unblock a site.
  content_unblockSiteLink: '不再屏蔽这个网站',

  // The title of a popup to block a site.
  popup_blockSiteTitle: '将该网站加入黑名单',

  // The title of a popup to unblock a site.
  popup_unblockSiteTitle: '不再屏蔽这个网站',

  // The title of the disclosure widget that contains the details.
  popup_details: '详情',

  // The label for the textarea that shows the page URL.
  popup_pageURLLabel: '页面地址',

  // The label for the input that shows a path depth of rules to be added.
  popup_pathDepth: '深度',

  // The label for the textarea that shows the page title.
  popup_pageTitleLabel: '页面标题',

  // The label for the textarea that shows rules to be added.
  popup_addedRulesLabel: '要添加的规则',

  // The label for the textarea that shows rules to be removed.
  popup_removedRulesLabel: '要移除的规则',

  // The text of the button to block a site.
  popup_blockSiteButton: '确定',

  // The text of the button to unblock a site.
  popup_unblockSiteButton: '移除',

  // The text of the link to the options page.
  popup_openOptionsLink: '选项',

  // The title of the general section.
  options_generalTitle: '常规',

  // The label for the blacklist textarea.
  options_blacklistLabel: '在谷歌的搜索结果中将不会显示以下网站：',

  // The helper text for the blacklist textarea.
  options_blacklistHelper:
    '你可以使用 [匹配模式](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) 或 [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)。',

  // The helper text to show an example rule.
  // '$1' is expanded to the example.
  options_blacklistExample: '例如：$1',

  // The helper text to explain how to block sites by page title.
  options_blockByTitle: '要使用页面标题来屏蔽网站，请在正则表达式前添加「title」。',

  // The text indicating that the blacklist is update outside the options page.
  options_blacklistUpdated: '黑名单已更新',

  // The text of the button to reload the blacklist.
  options_reloadBlacklistButton: '重新加载',

  // The text of the button to import a blacklist.
  options_importBlacklistButton: '导入',

  // The text of the button to export a blacklist.
  options_exportBlacklistButton: '导出',

  // The text of the button to save a blacklist.
  options_saveBlacklistButton: '保存',

  // The title of the import-blacklist dialog.
  options_importBlacklistDialog_title: '导入',

  // The label for the select to import from a file.
  options_importBlacklistDialog_fromFile: '从文件中导入',

  // The text of the button to import from a file.
  options_importBlacklistDialog_selectFile: '选择一个文件',

  // The label for the select to import from Personal Blocklist.
  options_importBlacklistDialog_fromPB: '贴上从 Personal Blocklist 导出的网站黑名单',

  // The label for the textarea to import from Personal Blocklist (for a11y only).
  options_importBlacklistDialog_pbLabel: '域名',

  // The text of the checkbox to append to the existing blacklist
  options_importBlacklistDialog_append: '附加到现有列表之后',

  // The text of the import button on the import-blacklist dialog.
  options_importBlacklistDialog_importButton: '导入',

  // The helper text for the textarea on the import-blacklist dialog.
  options_importBlacklistDialog_helper: '贴上你从 Personal Blocklist 导出的的网站黑名单',

  // Other search engines support.
  options_otherSearchEngines: '其他搜索引擎',

  // The details for other search engines support.
  options_otherSearchEnginesDescription: '当前还支持以下搜索引擎（需要手动开启，并同意读取和更改网页数据）',

  // The text of the button to enable this extension on a search engine.
  options_registerSearchEngine: '启用',

  // The text of the button to indicate that this extension is enabled on a search engine.
  options_searchEngineRegistered: '已启用',

  // The label for the switch whether to skip the 'Block this site' dialog
  options_skipBlockDialogLabel: '加入黑名单时不显示确认提示框。',

  // The label for the switch whether to hide the 'Block this site' links.
  options_hideBlockLinksLabel: '不在搜索结果中显示「加入黑名单」按钮',

  // The label for the switch whether to hide the number of blocked sites and the 'Show' link.
  options_hideControlLabel: '不在搜索结果页面顶部显示已被屏蔽的网站数量和「显示」按钮',

  // The title of the appearance section.
  options_appearanceTitle: '外观',

  // The color of links.
  options_linkColor: '链接的颜色',

  // The color of blocked search results.
  options_blockColor: '被屏蔽的搜索结果的颜色',

  // The label of radio buttons to use the default color.
  options_colorUseDefault: '默认',

  // The label of radio buttons to specify the color.
  options_colorSpecify: '自定义',

  // The colors of highlighted search results.
  options_highlightColors: '高亮显示的搜索结果的颜色',

  // The description of the highlighting feature.
  options_highlightDescription: '要使用「颜色 N」来高亮显示某个搜索结果，请在规则前加上「@N」',

  // The name of the nth color.
  options_highlightColorNth: '颜色 $1',

  // The label of the button to add a highlight color (for a11y only).
  options_highlightColorAdd: '增加',

  // The label of the button to remove a highlight color (for a11y only).
  options_highlightColorRemove: '移除',

  // The dialog theme.
  options_dialogTheme: '「加入黑名单」弹窗的主题',

  // The label of a radio button to use the default dialog theme.
  options_dialogThemeDefault: '默认',

  // The label of a radio button to use the light theme.
  options_dialogThemeLight: '浅色',

  // The label of a radio button to use the dark theme.
  options_dialogThemeDark: '深色',

  // The title of the sync section.
  options_syncTitle: '同步',

  // The text to indicate that the sync feature has been updated (version 3 -> 4).
  options_syncFeatureUpdated:
    '同步功能已更新。需要继续使用同步功能，请点击「开启同步」按钮。',

  // The sync feature.
  options_syncFeature: '通过云端服务同步',

  // The description of the sync feature.
  options_syncFeatureDescription:
    '可以通过云端服务在不同的设备之间同步你的黑名单数据。',

  // The text of the button to turn on sync.
  options_turnOnSync: '开启同步',

  // The title of the dialog to turn on sync.
  options_turnOnSyncDialog_title: '开启同步',

  // The text of the button to turn on sync.
  options_turnOnSyncDialog_turnOnSyncButton: '开启',

  // The text of the button to turn off sync.
  options_turnOffSync: '关闭同步',

  // The text that means the result of the last sync.
  options_syncResult: '最近同步',

  // The text that means sync has been never performed.
  options_syncNever: '从未同步',

  // The text that means sync is running right now.
  options_syncRunning: '正在同步中...',

  // The text of the button to sync now.
  options_syncNowButton: '立即同步',

  // The label of the list to choose what to sync.
  options_syncCategories: '同步选项',

  // The label of the switch to sync the blocklist.
  options_syncBlocklist: '屏蔽列表',

  // The label of the switch to sync the general settings.
  options_syncGeneral: '常规设置',

  // The label of the switch to sync the appearance.
  options_syncAppearance: '外观设置',

  // The label of the switch to sync the subscriptions.
  options_syncSubscriptions: '订阅设置',

  // The label of the select to select a sync interval.
  options_syncInterval: '同步间隔',

  // The title of the subscription section.
  options_subscriptionTitle: '订阅',

  // The subscription feature.
  options_subscriptionFeature: '订阅黑名单列表',

  // The description of the subscription feature.
  options_subscriptionFeatureDescription:
    '如果你添加了订阅，黑名单将会定期从指定的订阅源更新。',

  // The text of the button to add a subscription.
  options_addSubscriptionButton: '添加订阅',

  // The header text of the name row of the subscriptions table.
  options_subscriptionNameHeader: '名称',

  // The header text of the URL row of the subscriptions table.
  options_subscriptionURLHeader: '订阅源地址',

  // The header text of the update-result row of the subscriptions table.
  options_subscriptionUpdateResultHeader: '最近更新',

  // The label for the menu buttons of the subscriptions table (for a11y only).
  options_subscriptionMenuButtonLabel: '菜单',

  // The text that means no subscriptions have been added.
  options_noSubscriptionsAdded: '未添加任何订阅',

  // The text that means update is running right now.
  options_subscriptionUpdateRunning: '正在更新...',

  // The text of a menu item to show a subscription.
  options_showSubscriptionMenu: '显示黑名单',

  // The text of a menu item to update a subscription now.
  options_updateSubscriptionNowMenu: '立即更新',

  // The text of a menu item to remove a subscription.
  options_removeSubscriptionMenu: '移除此订阅',

  // The text of the button to update all subscriptions now.
  options_updateAllSubscriptionsNowButton: '立即更新',

  // The title of the add-subscription dialog.
  options_addSubscriptionDialog_title: '添加订阅',

  // The label for the name input on the add-subscription dialog.
  options_addSubscriptionDialog_nameLabel: '名称',

  // The label for the URL input on the add-subscription dialog.
  options_addSubscriptionDialog_urlLabel: '订阅源地址',

  // The text of the add button on the add-subscription dialog.
  options_addSubscriptionDialog_addButton: '添加',

  // The label for the textarea on the show-subscription dialog (for a11y only).
  options_showSubscriptionDialog_blacklistLabel: '规则',

  // The label of the select to select an update interval.
  options_updateInterval: '更新间隔',

  // The label of the radio button to sync with Google Drive.
  clouds_googleDriveSync: '使用 Google Drive 同步',

  // The text to describe the behavior of sync with Google Drive.
  clouds_googleDriveSyncDescription:
    '同步文件将会保存在一个用户不可见的应用程序数据文件夹中。',

  // The text indicating that sync with Google Drive is turned on.
  clouds_googleDriveSyncTurnedOn: '已使用 Google Drive 同步',

  // The text indicating syncing with Dropbox.
  clouds_dropboxSync: '使用 Dropbox 同步',

  // The text to describe the behavior of sync with Dropbox.
  clouds_dropboxSyncDescription: '同步文件将会保存在 /Apps/uBlacklist/',

  // The label of the radio button to sync with Dropbox.
  clouds_dropboxSyncTurnedOn: '已使用 Dropbox 同步',

  // The localized name of Google (not used).
  searchEngines_googleName: '谷歌',

  // The localized name of Bing.
  searchEngines_bingName: '必应',

  // The localized name of DuckDuckGo.
  searchEngines_duckduckgoName: 'DuckDuckGo',

  // The localized name of Ecosia.
  searchEngines_ecosiaName: 'Ecosia',

  // The localized name of Startpage.
  searchEngines_startpageName: 'Startpage.com',
});
