---
"ublacklist": patch
---

Made Google Drive and Dropbox sync more robust: it now supports refresh token rotation, tolerates token responses without an expiration time, and renews access tokens shortly before they expire. This prevents sync from being unexpectedly disconnected if the provider changes its token endpoint behavior.
