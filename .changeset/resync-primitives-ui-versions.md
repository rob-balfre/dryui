---
'@dryui/primitives': patch
'@dryui/ui': patch
---

Re-sync `@dryui/primitives` and `@dryui/ui` versions and lock them together via the `fixed` changesets config.

Previously the packages were under `linked: [["@dryui/primitives", "@dryui/ui"]]`, which only enforces equal versions _when both packages are already being bumped in the same release_. Earlier releases that listed only `@dryui/ui` in a changeset left `@dryui/primitives` behind, so they drifted (ui was at `0.5.0` while primitives was still at `0.4.0`).

This release:

- Moves the pair to `fixed: [["@dryui/primitives", "@dryui/ui"]]`, which forces both packages to bump together even if a future changeset only lists one of them.
- Bumps both packages so they realign on the same version and `@dryui/ui`'s internal `@dryui/primitives` dep range is refreshed to the new major.minor.
