# ublacklist

## 10.0.1

### Patch Changes

- [#967](https://github.com/iorate/ublacklist/pull/967) [`5263cbc`](https://github.com/iorate/ublacklist/commit/5263cbcf58c04fe83e556c5463d63646d74b6210) - Google Drive and Dropbox sync now uses PKCE when authorizing, improving the security of the sign-in flow. Existing connections keep working without re-authorization.

- [#968](https://github.com/iorate/ublacklist/pull/968) [`4a0b84b`](https://github.com/iorate/ublacklist/commit/4a0b84b9ff8627aba20bd73a95c07423cd8a188f) - Updated the German translation.

- [#953](https://github.com/iorate/ublacklist/pull/953) [`acaa62e`](https://github.com/iorate/ublacklist/commit/acaa62e534401f77030b4af5fcf5d47d9927967a) - Updated the Russian translation.

- [#951](https://github.com/iorate/ublacklist/pull/951) [`ac6e253`](https://github.com/iorate/ublacklist/commit/ac6e2532050dbbebd3daa41e7466fa8bf4372506) - Updated the Chinese (China) translation.

- [#953](https://github.com/iorate/ublacklist/pull/953) [`acaa62e`](https://github.com/iorate/ublacklist/commit/acaa62e534401f77030b4af5fcf5d47d9927967a) - Updated the Chinese (Taiwan) translation.

## 10.0.0

### Major Changes

- [#922](https://github.com/iorate/ublacklist/pull/922) [`64e81e9`](https://github.com/iorate/ublacklist/commit/64e81e956e9ce7e0b9087789ddcbf176f8a97f15) - uBlacklist now blocks the whole site by default when you block a search result, and all sync categories are now enabled by default. You can change these in the options page. These new defaults also apply to existing users who have never changed them.

- [#920](https://github.com/iorate/ublacklist/pull/920) [`c0597b5`](https://github.com/iorate/ublacklist/commit/c0597b5e80effcaf706cdc068eb7b37c2c596c1f) - The subscription update interval is now set in days, and update checks run at most once a day even if a shorter interval was configured before. The sync interval can now be set to any number of minutes (minimum five).

### Minor Changes

- [#918](https://github.com/iorate/ublacklist/pull/918) [`a069c75`](https://github.com/iorate/ublacklist/commit/a069c7548a4ed3dba1c125658040a092d96d1dda) - Increased the base font size from 13px to 14px. On touch devices, text fields use a 16px font size without changing their height, which also prevents Safari on iOS from zooming in when focusing them.

- [#917](https://github.com/iorate/ublacklist/pull/917) [`c6ab6f3`](https://github.com/iorate/ublacklist/commit/c6ab6f321f28f4b138e9a7384cbba82779dc5fbb) - Sync and subscription updates now respect the configured interval across browser restarts, instead of always running at every startup. In Firefox, they still run at every browser startup as before, because Firefox does not persist alarms across restarts.

- [#905](https://github.com/iorate/ublacklist/pull/905) [`4ca2b01`](https://github.com/iorate/ublacklist/commit/4ca2b0166be85ce32ecd8ce73e474f770ecc72ed) - The options page now reflects settings changed by sync in real time, so the "Reload" button that used to appear after a sync has been removed. The blocklist editor still shows a notice when the blocklist is updated by sync, to protect your unsaved edits.

- [#905](https://github.com/iorate/ublacklist/pull/905) [`72d12d2`](https://github.com/iorate/ublacklist/commit/72d12d2e963c90f938c850ceb79f7c40c2d005dc) - Rebuilt the user interface on top of Base UI, a library of accessible React components. Dialogs, menus, and form controls across the options page and the popup should now be more consistent and more accessible, especially when using a keyboard or a screen reader.

- [#905](https://github.com/iorate/ublacklist/pull/905) [`72d12d2`](https://github.com/iorate/ublacklist/commit/72d12d2e963c90f938c850ceb79f7c40c2d005dc) - Reduced the size of the script loaded on search result pages by about 35% (from 2.2 MB to 1.4 MB). The dialog for blocking a site is now loaded on demand when it is opened.

### Patch Changes

- [#919](https://github.com/iorate/ublacklist/pull/919) [`ac0a2f1`](https://github.com/iorate/ublacklist/commit/ac0a2f111d0aad084a03273a7eb638f1f5952d07) - Fixed the block buttons on search result pages appearing unstyled when the page has a strict Content Security Policy (such as lite.duckduckgo.com) in Firefox and Safari.

- [#938](https://github.com/iorate/ublacklist/pull/938) [`dc01a4c`](https://github.com/iorate/ublacklist/commit/dc01a4cc48c9351a1029620605adf76e3ef17534) - Fixed an issue where reloading the options page opened via a subscription link showed the "Add a subscription" dialog again, by removing the query parameters from the address bar after they are read.

- [#923](https://github.com/iorate/ublacklist/pull/923) [`0f1d8d9`](https://github.com/iorate/ublacklist/commit/0f1d8d9be6306366068d249f2dfb1968757e68a0) - Updated the German translation.

- [#939](https://github.com/iorate/ublacklist/pull/939) [`b47ee39`](https://github.com/iorate/ublacklist/commit/b47ee3958b4a7e463b6dbe07ac239e9e1a5e310c) - Fixed an issue where the options page did not offer to reload the blacklist when it was saved on another options page.

- [#932](https://github.com/iorate/ublacklist/pull/932) [`31acf14`](https://github.com/iorate/ublacklist/commit/31acf1416714c22797de4c2411505b6d4ea98ddb) - Fixed an issue where built-in SERPINFOs that were not enabled never received updates, so the popup could fail to detect search result pages supported by newer versions. They are now refreshed from the content shipped with the extension when it is newer than the stored one.

- [#905](https://github.com/iorate/ublacklist/pull/905) [`ecc7c51`](https://github.com/iorate/ublacklist/commit/ecc7c518be4aa924f8e21b7cd5595c2baa63a575) - Fixed the accessibility label of the button to remove a highlight color in the options page, which was incorrectly announced as "Add" by screen readers.

- [#937](https://github.com/iorate/ublacklist/pull/937) [`7c859dd`](https://github.com/iorate/ublacklist/commit/7c859dd63693577812eb1d0e9d7c670b935a56be) - Fixed an issue in Safari where the popup did not focus its default button when opened, leaving keyboard focus on the first control instead.
