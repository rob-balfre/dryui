---
'@dryui/primitives': patch
'@dryui/ui': patch
'@dryui/feedback': patch
---

Extract `tryShowPopover`/`tryHidePopover` into `@dryui/primitives` so toast providers, context menus, and the feedback toast layer share one guarded popover-toggle helper instead of repeating inline try/catch + `:popover-open` checks.
