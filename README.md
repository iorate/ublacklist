# uBlacklist
Blocks specific sites from appearing in Google search results

## Description
This Chrome extension prevents blacklisted sites from appearing in Google search results.

The same function is already provided by [Personal Blocklist (by Google)](https://chrome.google.com/webstore/detail/personal-blocklist-by-goo/nolijncfnkgaikbjbdaogikpmpbdcdef). However, sites blocked by Personal Blocklist appear in search results for a moment and then disappear, which annoys me. uBlacklist prevents blacklisted sites from appearing in search results as far as possible.

Rules can be specified either by [match patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) (e.g. `*://*.example.com/*`) or by [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) (e.g. `/example\.(net|org)/`). You can also add rules on search result pages, or on sites to be blocked by clicking the toolbar icon.

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
uBlacklist is licensed under [MIT License](LICENSE.txt).

The icon is from [Material Design Icons](https://material.io/tools/icons/) by Google. It is licensed under [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).
