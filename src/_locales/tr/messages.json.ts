import { exportAsMessages } from "../helpers.ts";

export default exportAsMessages({
  extensionName: "uBlacklist",
  extensionDescription:
    "Seçili sitelerin Google arama sonuçlarında görünmesini engeller",
  lang: "tr",
  okButton: "Tamam",
  content_singleSiteBlocked: "uBlacklist 1 siteyi engelledi",
  content_multipleSitesBlocked: "uBlacklist $1 siteyi engelledi",
  content_showBlockedSitesLink: "Göster",
  content_hideBlockedSitesLink: "Gizle",
  content_blockSiteLink: "Bu siteyi engelle",
  content_unblockSiteLink: "Bu sitenin engelini kaldır",
  popup_blockSiteTitle: "Bu siteyi engelle",
  popup_unblockSiteTitle: "Bu sitenin engelini kaldır",
  options_blacklistLabel:
    "Google arama sonuçlarında görünmesi engellenen siteler",
  options_blacklistHelper:
    "[Eşleşme desenleri](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) veya [düzenli ifadeler](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) kullanabilirsiniz.",
  options_importBlacklistDialog_importButton: "İçe aktar",
  options_importBlacklistDialog_helper:
    "Personal Blocklist eklentisinden dışa aktarılmış alan adı listesini yapıştırın.",
  options_turnOnSync: "Senkronizasyonu etkinleştir",
  clouds_googleDriveSync: "Google Drive ile senkronize et",
  clouds_dropboxSync: "Dropbox ile senkronize et",
});
