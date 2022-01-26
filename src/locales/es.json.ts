import { exportAsMessages } from './helpers';

exportAsMessages('_locales/es/messages.json', {
  extensionName: 'uBlacklist',

  extensionDescription:
    'Bloquea los sitios que especifiques para que no aparezcan en los resultados de búsqueda de Google',

  lang: 'es',

  error: 'Error: $1',

  unauthorizedError: 'No autorizado. Por favor, desactive la sincronización y vuelva a activarla.',

  cancelButton: 'Cancelar',

  okButton: 'Aceptar',

  content_singleSiteBlocked: 'uBlacklist ha bloqueado 1 sitio',

  content_multipleSitesBlocked: 'uBlacklist ha bloqueado $1 sitios',

  content_showBlockedSitesLink: 'Mostrar',

  content_hideBlockedSitesLink: 'Ocultar',

  content_blockSiteLink: 'Bloquear este sitio',

  content_unblockSiteLink: 'Desbloquear este sitio',

  popup_blockSiteTitle: 'Bloquear este sitio',

  popup_unblockSiteTitle: 'Desbloquear este sitio',

  popup_details: 'Detalles',

  popup_pageURLLabel: 'URL de la página',

  popup_pathDepth: 'Profundidad',

  popup_pageTitleLabel: 'Título de la página',

  popup_addedRulesLabel: 'Reglas a añadir',

  popup_removedRulesLabel: 'Reglas a eliminar',

  popup_blockSiteButton: 'Bloquear',

  popup_unblockSiteButton: 'Desbloquear',

  popup_openOptionsLink: 'Opciones',

  popup_active: 'uBlacklist está activo',

  popup_inactive: 'uBlacklist está inactivo',

  popup_activateButton: 'Activar',

  options_generalTitle: 'General',

  options_blacklistLabel:
    'Sitios bloqueados para que no aparezcan en los resultados de búsqueda de Google',

  options_blacklistHelper:
    'Puede utilizar [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) o [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).',

  options_blacklistExample: 'Ejemplo: $1',

  options_blockByTitle:
    'Para bloquear sitios por el título de la página, añada "title" a las expresiones regulares.',

  options_blacklistUpdated: 'Actualizado',

  options_reloadBlacklistButton: 'Recargar',

  options_importBlacklistButton: 'Importar',

  options_exportBlacklistButton: 'Exportar',

  options_saveBlacklistButton: 'Guardar',

  options_importBlacklistDialog_title: 'Importar',

  options_importBlacklistDialog_fromFile: 'Importar desde un archivo',

  options_importBlacklistDialog_selectFile: 'Seleccione un archivo',

  options_importBlacklistDialog_fromPB: 'Importar desde la lista de bloqueo personal',

  options_importBlacklistDialog_pbLabel: 'Dominios',

  options_importBlacklistDialog_append: 'Añadir a la lista existente',

  options_importBlacklistDialog_importButton: 'Importar',

  options_importBlacklistDialog_helper:
    'Pegue los dominios exportados de la lista de bloqueo personal.',

  options_otherSearchEngines: 'Otros motores de búsqueda',

  options_otherSearchEnginesDescription:
    'Puede utilizar esta extensión en los siguientes motores de búsqueda.',

  options_registerSearchEngine: 'Activar',

  options_searchEngineRegistered: 'Activado',

  options_skipBlockDialogLabel: 'Omitir el diálogo "Bloquear este sitio" ',

  options_hideBlockLinksLabel: 'Ocultar los enlaces "Bloquear este sitio" ',

  options_hideControlLabel: 'Ocultar el número de sitios bloqueados y el enlace "Mostrar" ',

  options_blockWholeSiteLabel: 'Añadir reglas que bloqueen sitios enteros por defecto',

  options_blockWholeSiteDescription:
    'Por ejemplo, para bloquear la página "https://a.b.example.uk.com/" se añadirá una regla "*://*.example.uk.com/*" ',

  options_appearanceTitle: 'Apariencia',

  options_linkColor: 'El color de los enlaces',

  options_blockColor: 'Color de los resultados de búsqueda bloqueados',

  options_colorUseDefault: 'Por defecto',

  options_colorSpecify: 'Personalizado',

  options_highlightColors: 'Colores de los resultados de búsqueda destacados',

  options_highlightDescription:
    'Para resaltar los resultados de la búsqueda con el color N, añada "@N" a las reglas.',

  options_highlightColorNth: 'Color $1',

  options_highlightColorAdd: 'Añadir',

  options_highlightColorRemove: 'Eliminar',

  options_dialogTheme: 'Tema del diálogo "Bloquear este sitio" en los resultados de búsqueda',

  options_dialogThemeDefault: 'Por defecto',

  options_dialogThemeLight: 'Claro',

  options_dialogThemeDark: 'Oscuro',

  options_syncTitle: 'Sincronizar',

  options_syncFeatureUpdated:
    'La función de sincronización ha sido actualizada. Para seguir utilizando la sincronización, pulse el botón "Activar la sincronización" ',

  options_syncFeature: 'Sincronización con la nube',

  options_syncFeatureDescription:
    'Puedes sincronizar las listas de filtros entre tus dispositivos a través de una nube.',

  options_turnOnSync: 'Activar la sincronización',

  options_turnOnSyncDialog_title: 'Activar la sincronización',

  options_turnOnSyncDialog_turnOnSyncButton: 'Activar',

  options_turnOnSyncDialog_altFlowDescription:
    'Es posible que se le pida permiso para acceder a $1 antes de la autenticación, pero su información personal NO se almacenará en ese dominio.',

  options_turnOnSyncDialog_altFlowAuthCodeLabel: 'Código de autorización',

  options_turnOffSync: 'Apagado',

  options_syncResult: 'Última sincronización',

  options_syncNever: 'No se ha sincronizado aún',

  options_syncRunning: 'Sincronizando...',

  options_syncReloadButton: 'Recargar',

  options_syncNowButton: 'Sincronizar ahora',

  options_syncCategories: '¿Qué quiere sincronizar?',

  options_syncBlocklist: 'Sitios bloqueados',

  options_syncGeneral: 'Ajustes generales',

  options_syncAppearance: 'Apariencia',

  options_syncSubscriptions: 'Suscripciones',

  options_syncInterval: 'Intervalo de sincronización',

  options_subscriptionTitle: 'Suscripción',

  options_subscriptionFeature: 'Suscribirse a las listas de filtros',

  options_subscriptionFeatureDescription:
    'Si añade una suscripción, las listas de filtros se descargarán regularmente desde la URL especificada.',

  options_addSubscriptionButton: 'Añadir una suscripción',

  options_subscriptionNameHeader: 'Nombre',

  options_subscriptionURLHeader: 'URL',

  options_subscriptionUpdateResultHeader: 'Última actualización',

  options_subscriptionMenuButtonLabel: 'Menú',

  options_noSubscriptionsAdded: 'No hay suscripciones añadidas',

  options_subscriptionUpdateRunning: 'Actualizando...',

  options_showSubscriptionMenu: 'Mostrar',

  options_updateSubscriptionNowMenu: 'Actualizar',

  options_removeSubscriptionMenu: 'Eliminar',

  options_updateAllSubscriptionsNowButton: 'Actualizar',

  options_addSubscriptionDialog_title: 'Añadir una suscripción',

  options_addSubscriptionDialog_nameLabel: 'Nombre',

  options_addSubscriptionDialog_urlLabel: 'URL',

  options_addSubscriptionDialog_addButton: 'Añadir',

  options_showSubscriptionDialog_blacklistLabel: 'Reglas',

  options_updateInterval: 'Intervalo de actualización',

  clouds_googleDriveSync: 'Sincronizar con Google Drive',

  clouds_googleDriveSyncDescription:
    'Se creará un archivo dentro de la carpeta de datos de la aplicación oculto para el usuario.',

  clouds_googleDriveSyncTurnedOn: 'Sincronizado con Google Drive',

  clouds_dropboxSync: 'Sincronizar con Dropbox',

  clouds_dropboxSyncDescription: 'Se creará un archivo dentro de "/Apps/uBlacklist/".',

  clouds_dropboxSyncTurnedOn: 'Sincronizado con Dropbox',

  searchEngines_googleName: 'Google',

  searchEngines_bingName: 'Bing',

  searchEngines_duckduckgoName: 'DuckDuckGo',

  searchEngines_ecosiaName: 'Ecosia',

  searchEngines_qwantName: 'Qwant',

  searchEngines_startpageName: 'Startpage.com',
});
