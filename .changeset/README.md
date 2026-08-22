# Changesets

This directory holds changeset files recording pending changes to the packages
in this repository, managed by
[changesette](https://github.com/iorate/changesette).
`changesette add` creates a changeset here; `changesette version` consumes all
pending changesets to bump each released package's version and update its
CHANGELOG.md.
