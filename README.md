# uBlacklist
Removes specific sites from Google search results

## Description
This Chrome extension prevents blacklisted sites from appearing in Google search results.

The same function is already provided by [Personal Blocklist (by Google)](https://chrome.google.com/webstore/detail/personal-blocklist-by-goo/nolijncfnkgaikbjbdaogikpmpbdcdef). At least in my environment, however, sites blocked by Personal Blocklist appear in search results for a moment and then disappear, which annoys me. uBlacklist does not allow blacklisted sites to appear even for a moment.

Rules can be specified either by [urls with wildcards](https://developer.chrome.com/apps/match_patterns) (e.g. `*://*.example.com/*`) or by regular expressions (e.g. `/example\.(net|org)/`). You can add rules in search result pages.

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
uBlacklist is licensed under [MIT License](LICENSE.txt).

The icon is from [Material Design Icons](https://material.io/tools/icons/) by Google. It is licensed under [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).
