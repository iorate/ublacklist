import { exportAsMessages } from './helpers';

exportAsMessages('_locales/zh_CN/messages.json', {
  extensionName: 'uBlacklist',
  extensionDescription: '在谷歌的搜索结果中屏蔽特定的网站显示。',
  lang: 'zh-cn',
  error: '出现错误: $1',
  unauthorizedError: '未授权的操作。请尝试先关闭同步后，再开启同步。',
  cancelButton: '取消',
  okButton: '确定',
  content_singleSiteBlocked: 'uBlacklist 已经屏蔽了 1 个网站',
  content_multipleSitesBlocked: 'uBlacklist 已经屏蔽了 $1 个网站',
  content_showBlockedSitesLink: '显示',
  content_hideBlockedSitesLink: '隐藏',
  content_blockSiteLink: '加入黑名单',
  content_unblockSiteLink: '不再屏蔽这个网站',
  popup_blockSiteTitle: '将该网站加入黑名单',
  popup_unblockSiteTitle: '不再屏蔽这个网站',
  popup_details: '详情',
  popup_pageURLLabel: '页面地址',
  popup_pathDepth: '深度',
  popup_pageTitleLabel: '页面标题',
  popup_addedRulesLabel: '要添加的规则',
  popup_removedRulesLabel: '要移除的规则',
  popup_blockSiteButton: '确定',
  popup_unblockSiteButton: '移除',
  popup_openOptionsLink: '选项',
  popup_active: 'uBlacklist 已启用',
  popup_inactive: 'uBlacklist 已禁用',
  popup_activateButton: '启用',
  options_generalTitle: '常规',
  options_blacklistLabel: '在谷歌的搜索结果中将不会显示以下网站',
  options_blacklistHelper:
    '你可以使用 [匹配模式](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) 或 [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)。',
  options_blacklistExample: '例如: $1',
  options_blockByTitle: '要使用页面标题来屏蔽网站，请在正则表达式前添加「title」。',
  options_blacklistUpdated: '黑名单已更新',
  options_reloadBlacklistButton: '重新加载',
  options_importBlacklistButton: '导入',
  options_exportBlacklistButton: '导出',
  options_saveBlacklistButton: '保存',
  options_importBlacklistDialog_title: '导入',
  options_importBlacklistDialog_fromFile: '从文件中导入',
  options_importBlacklistDialog_selectFile: '选择一个文件',
  options_importBlacklistDialog_fromPB: '贴上从 Personal Blocklist 导出的网站黑名单',
  options_importBlacklistDialog_pbLabel: '域名',
  options_importBlacklistDialog_append: '附加到现有列表之后',
  options_importBlacklistDialog_importButton: '导入',
  options_importBlacklistDialog_helper: '贴上你从 Personal Blocklist 导出的的网站黑名单',
  options_otherSearchEngines: '其他搜索引擎',
  options_otherSearchEnginesDescription:
    '当前还支持以下搜索引擎（需要手动开启，并同意读取和更改网页数据）',
  options_registerSearchEngine: '启用',
  options_searchEngineRegistered: '已启用',
  options_skipBlockDialogLabel: '加入黑名单时不显示确认提示框。',
  options_hideBlockLinksLabel: '不在搜索结果中显示「加入黑名单」按钮',
  options_hideControlLabel: '不在搜索结果页面顶部显示已被屏蔽的网站数量和「显示」按钮',
  options_blockWholeSiteLabel: '默认添加屏蔽整个网站的规则',
  options_blockWholeSiteDescription:
    '例如屏蔽 "https://a.b.example.uk.com/", 会添加 "*://*.example.uk.com/*" 规则',
  options_appearanceTitle: '外观',
  options_linkColor: '链接的颜色',
  options_blockColor: '被屏蔽的搜索结果的颜色',
  options_colorUseDefault: '默认',
  options_colorSpecify: '自定义',
  options_highlightColors: '高亮显示的搜索结果的颜色',
  options_highlightDescription: '要使用「颜色 N」来高亮显示某个搜索结果，请在规则前加上「@N」',
  options_highlightColorNth: '颜色 $1',
  options_highlightColorAdd: '增加',
  options_highlightColorRemove: '移除',
  options_dialogTheme: '「加入黑名单」弹窗的主题',
  options_dialogThemeDefault: '默认',
  options_dialogThemeLight: '浅色',
  options_dialogThemeDark: '深色',
  options_syncTitle: '同步',
  options_syncFeatureUpdated: '同步功能已更新。需要继续使用同步功能，请点击「开启同步」按钮。',
  options_syncFeature: '通过云端服务同步',
  options_syncFeatureDescription: '可以通过云端服务在不同的设备之间同步你的黑名单数据。',
  options_turnOnSync: '开启同步',
  options_turnOnSyncDialog_title: '开启同步',
  options_turnOnSyncDialog_turnOnSyncButton: '开启',
  options_turnOnSyncDialog_useAltFlow: '在新标签页中打开认证页面',
  options_turnOnSyncDialog_altFlowDescription:
    '在认证之前，您可能会被要求获得访问 $1 的许可，但您的个人信息不会被存储在该域中。',
  options_turnOnSyncDialog_altFlowAuthCodeLabel: '认证码',
  options_turnOffSync: '关闭同步',
  options_syncResult: '最近同步',
  options_syncNever: '从未同步',
  options_syncRunning: '正在同步中...',
  options_syncReloadButton: '重新加载',
  options_syncNowButton: '立即同步',
  options_syncCategories: '同步选项',
  options_syncBlocklist: '屏蔽列表',
  options_syncGeneral: '常规设置',
  options_syncAppearance: '外观设置',
  options_syncSubscriptions: '订阅设置',
  options_syncInterval: '同步间隔',
  options_subscriptionTitle: '订阅',
  options_subscriptionFeature: '订阅黑名单列表',
  options_subscriptionFeatureDescription: '如果你添加了订阅，黑名单将会定期从指定的订阅源更新。',
  options_addSubscriptionButton: '添加订阅',
  options_subscriptionNameHeader: '名称',
  options_subscriptionURLHeader: '订阅源地址',
  options_subscriptionUpdateResultHeader: '最近更新',
  options_subscriptionCheckBoxLabel: '启用',
  options_subscriptionMenuButtonLabel: '菜单',
  options_noSubscriptionsAdded: '未添加任何订阅',
  options_subscriptionUpdateRunning: '正在更新...',
  options_showSubscriptionMenu: '显示黑名单',
  options_updateSubscriptionNowMenu: '立即更新',
  options_removeSubscriptionMenu: '移除此订阅',
  options_updateAllSubscriptionsNowButton: '立即更新',
  options_addSubscriptionDialog_title: '添加订阅',
  options_addSubscriptionDialog_nameLabel: '名称',
  options_addSubscriptionDialog_urlLabel: '订阅源地址',
  options_addSubscriptionDialog_addButton: '添加',
  options_showSubscriptionDialog_blacklistLabel: '规则',
  options_updateInterval: '更新间隔',
  options_aboutTitle: '关于 uBlacklist',
  options_aboutVersion: '版本',
  options_aboutDocumentation: '[文档](https://iorate.github.io/ublacklist/docs)',
  options_aboutReleaseNotes: '发行说明',
  options_aboutPrivacyPolicy: '[隐私政策](https://iorate.github.io/ublacklist/privacy-policy)',
  options_aboutThirdPartyNotices: '第三方声明',
  clouds_googleDriveSync: '使用 Google Drive 同步',
  clouds_googleDriveSyncDescription: '同步文件将会保存在一个用户不可见的应用程序数据文件夹中。',
  clouds_googleDriveSyncTurnedOn: '已使用 Google Drive 同步',
  clouds_dropboxSync: '使用 Dropbox 同步',
  clouds_dropboxSyncDescription: '同步文件将会保存在 /Apps/uBlacklist/',
  clouds_dropboxSyncTurnedOn: '已使用 Dropbox 同步',
  searchEngines_googleName: '谷歌',
  searchEngines_bingName: '必应',
  searchEngines_braveName: 'Brave',
  searchEngines_duckduckgoName: 'DuckDuckGo',
  searchEngines_ecosiaName: 'Ecosia',
  searchEngines_qwantName: 'Qwant',
  searchEngines_searxngName: 'SearXNG',
  searchEngines_startpageName: 'Startpage.com',
});
