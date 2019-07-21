# uBlacklist
Blocks specific sites from appearing in Google search results

[Chrome Web Store](https://chrome.google.com/webstore/detail/ublacklist/pncfbmialoiaghdehhbnbhkkgmjanfhe) / [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ublacklist/)

## Description
This browser extension prevents blacklisted sites from appearing in Google search results.

The same function is already provided by [Personal Blocklist (by Google)](https://chrome.google.com/webstore/detail/personal-blocklist-by-goo/nolijncfnkgaikbjbdaogikpmpbdcdef) for Chrome. However, sites blocked by Personal Blocklist appear in search results for a moment and then disappear, which annoys me. uBlacklist prevents blacklisted sites from appearing in search results as far as possible.

You can add rules on search result pages, or on sites to be blocked by clicking the toolbar icon. Rules can be specified either by [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) (e.g. `*://*.example.com/*`) or by [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) (e.g. `/example\.(net|org)/`).

### Subscription
Subscription was implemented in version 3. If you add a subscription, a blacklist will be regularly downloaded from the specified URL.

To publish a blacklist as a subscription, place a blacklist file encoded in UTF-8 on a suitable HTTP(S) server, and publish the URL. Here is [an example](https://raw.githubusercontent.com/iorate/uBlacklist/master/Example.uBlacklist.txt) hosted on GitHub.

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
uBlacklist is licensed under [MIT License](LICENSE.txt).
