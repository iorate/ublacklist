import { exportAsMessages } from './helpers';

exportAsMessages('_locales/ru/messages.json', {
  extensionName: 'uBlacklist',
  extensionDescription: 'Блокирует сайты в поисковой выдаче Google',
  lang: 'ru',
  error: 'Ошибка: $1',
  unauthorizedError: 'Ошибка авторизации. Пожалуйста, выключите синхронизацию и включите снова.',
  cancelButton: 'Отмена',
  okButton: 'ОК',
  content_singleSiteBlocked: 'uBlacklist заблокировал 1 сайт',
  content_multipleSitesBlocked: 'uBlacklist заблокировал $1 сайт(ов)',
  content_showBlockedSitesLink: 'Показать',
  content_hideBlockedSitesLink: 'Скрыть',
  content_blockSiteLink: 'Заблокировать сайт',
  content_unblockSiteLink: 'Разблокировать сайт',
  popup_blockSiteTitle: 'Заблокировать сайт',
  popup_unblockSiteTitle: 'Разблокировать сайт',
  popup_details: 'Подробности',
  popup_pageURLLabel: 'URL страницы',
  popup_pathDepth: 'глубина',
  popup_pageTitleLabel: 'Заголовок страницы',
  popup_addedRulesLabel: 'Правила, которые будут добавлены',
  popup_removedRulesLabel: 'Правила, которые будут удалены',
  popup_blockSiteButton: 'Заблокировать',
  popup_unblockSiteButton: 'Разблокировать',
  popup_openOptionsLink: 'Настройки',
  popup_active: 'uBlacklist включен',
  popup_inactive: 'uBlacklist выключен',
  popup_activateButton: 'Включить',
  options_generalTitle: 'Общие',
  options_blacklistLabel: 'Выбранные сайты не будут отображаться в поисковой выдаче Google',
  options_blacklistHelper:
    'Вы можете использовать [шаблоны совпадения](https://developer.mozilla.org/ru/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) или [регулярные выражения](https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_Expressions).',
  options_blacklistExample: 'Пример: $1',
  options_blockByTitle:
    'Чтобы блокировать сайты по заголовку страницы, добавьте «title» к регулярным выражениям.',
  options_blacklistUpdated: 'Внесены изменения',
  options_reloadBlacklistButton: 'Обновить список',
  options_importBlacklistButton: 'Импорт',
  options_exportBlacklistButton: 'Экспорт',
  options_saveBlacklistButton: 'Сохранить',
  options_importBlacklistDialog_title: 'Импорт',
  options_importBlacklistDialog_fromFile: 'Импорт из файла',
  options_importBlacklistDialog_selectFile: 'Выбрать файл',
  options_importBlacklistDialog_fromPB: 'Импорт из Personal Blocklist',
  options_importBlacklistDialog_pbLabel: 'Список доменов',
  options_importBlacklistDialog_append: 'Добавить в конец текущего списка',
  options_importBlacklistDialog_importButton: 'Импортировать',
  options_importBlacklistDialog_helper: 'Вставьте список доменов из Personal Blocklist.',
  options_otherSearchEngines: 'Поисковые системы',
  options_otherSearchEnginesDescription:
    'Вы можете использовать расширение с другими поисковыми системами.',
  options_registerSearchEngine: 'Включить',
  options_searchEngineRegistered: 'Включено',
  options_skipBlockDialogLabel: 'Пропустить диалог "Заблокировать сайт"',
  options_hideBlockLinksLabel: 'Не показывать ссылки "Заблокировать сайт"',
  options_hideControlLabel: 'Скрывать количество заблокированных сайтов и ссылку "Показать"',
  options_blockWholeSiteLabel: 'Добавить правила, блокирующие целые сайты по умолчанию',
  options_blockWholeSiteDescription:
    'Например, для блокировки страницы "https://a.b.example.uk.com/", необходимо добавить правило "*://*.example.uk.com/*".',
  options_appearanceTitle: 'Внешний вид',
  options_linkColor: 'Цвет ссылок',
  options_blockColor: 'Цвет заблокированных результатов поиска',
  options_colorUseDefault: 'По умолчанию',
  options_colorSpecify: 'Пользовательский',
  options_highlightColors: 'Цвет выделенных результатов поиска',
  options_highlightDescription:
    'Чтобы выделить результаты поиска цветом N, добавьте к правилам "@N".',
  options_highlightColorNth: 'Цвет $1',
  options_highlightColorAdd: 'Добавить цвет',
  options_highlightColorRemove: 'Удалить цвет',
  options_dialogTheme: 'Тема диалога "Заблокировать сайт" в результатах поиска',
  options_dialogThemeDefault: 'По умолчанию',
  options_dialogThemeLight: 'Светлая',
  options_dialogThemeDark: 'Темная',
  options_syncTitle: 'Синхронизация',
  options_syncFeatureUpdated:
    'Функция синхронизации была обновлена. Чтобы продолжить использование синхронизации, нажмите кнопку "Включить синхронизацию".',
  options_syncFeature: 'Синхронизация с облаком',
  options_syncFeatureDescription:
    'Вы можете синхронизировать чёрные списки между Вашими устройствами.',
  options_turnOnSync: 'Включить синхронизацию',
  options_turnOnSyncDialog_title: 'Включить синхронизацию',
  options_turnOnSyncDialog_turnOnSyncButton: 'Включить',
  options_turnOnSyncDialog_altFlowDescription:
    'У Вас могут попросить разрешение на доступ к $1 перед аутентификацией, но ваша личная информация НЕ будет храниться в этом домене.',
  options_turnOnSyncDialog_altFlowAuthCodeLabel: 'Код авторизации',
  options_turnOffSync: 'Отключить',
  options_syncResult: 'Последняя синхронизация',
  options_syncNever: 'Синхронизация отключена',
  options_syncRunning: 'Синхронизируем...',
  options_syncReloadButton: 'Обновить',
  options_syncNowButton: 'Синхронизировать',
  options_syncCategories: 'Что синхронизировать',
  options_syncBlocklist: 'Заблокированные сайты',
  options_syncGeneral: 'Общие настройки',
  options_syncAppearance: 'Внешний вид',
  options_syncSubscriptions: 'Подписки',
  options_syncInterval: 'Интервал синхронизации',
  options_subscriptionTitle: 'Подписки',
  options_subscriptionFeature: 'Подписаться на чёрные списки',
  options_subscriptionFeatureDescription:
    'Если Вы добавите подписку, то список блокируемых сайтов будет регулярно загружаться по указанному URL.',
  options_addSubscriptionButton: 'Добавить подписку',
  options_subscriptionNameHeader: 'Название',
  options_subscriptionURLHeader: 'URL',
  options_subscriptionUpdateResultHeader: 'Последнее обновление',
  options_subscriptionMenuButtonLabel: 'Меню подписок',
  options_noSubscriptionsAdded: 'Нет подписок',
  options_subscriptionUpdateRunning: 'Обновляем...',
  options_showSubscriptionMenu: 'Показать',
  options_updateSubscriptionNowMenu: 'Обновить',
  options_removeSubscriptionMenu: 'Удалить',
  options_updateAllSubscriptionsNowButton: 'Обновить все подписки',
  options_addSubscriptionDialog_title: 'Добавить подписку',
  options_addSubscriptionDialog_nameLabel: 'Название',
  options_addSubscriptionDialog_urlLabel: 'URL',
  options_addSubscriptionDialog_addButton: 'Добавить',
  options_showSubscriptionDialog_blacklistLabel: 'Список правил подписки',
  options_updateInterval: 'Интервал обновления',
  clouds_googleDriveSync: 'Синхронизировать с Google Диском',
  clouds_googleDriveSyncDescription:
    'Файл будет создан в папке данных приложения, скрытой от пользователя.',
  clouds_googleDriveSyncTurnedOn: 'Синхронизирован с Google Диском',
  clouds_dropboxSync: 'Синхронизировать с Dropbox',
  clouds_dropboxSyncDescription: 'Файл будет создан в папке "/Apps/uBlacklist/".',
  clouds_dropboxSyncTurnedOn: 'Синхронизирован с Dropbox',
  searchEngines_googleName: 'Google',
  searchEngines_bingName: 'Bing',
  searchEngines_duckduckgoName: 'DuckDuckGo',
  searchEngines_ecosiaName: 'Ecosia',
  searchEngines_startpageName: 'Startpage.com',
});
