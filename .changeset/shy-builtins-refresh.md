---
"ublacklist": patch
---

Fixed an issue where built-in SERPINFOs that were not enabled never received updates, so the popup could fail to detect search result pages supported by newer versions. They are now refreshed from the content shipped with the extension when it is newer than the stored one.
