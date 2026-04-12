---
'@dryui/ui': patch
'@dryui/primitives': patch
---

Fix `Select.Trigger` content alignment — when the trigger stretches to fill its container, the value label now sits at the inline-start and the chevron indicator at the inline-end, instead of both being center-grouped. Implemented by wrapping the trigger `Button` in a grid root that sets `--dry-btn-justify: space-between` and `--dry-btn-align: center`.
