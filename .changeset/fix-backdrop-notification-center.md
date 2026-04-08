---
"@dryui/primitives": patch
"@dryui/ui": patch
---

Fix backdrop centering and notification center panel positioning

- Backdrop: use align-items instead of place-items so children can control their own inline sizing
- NotificationCenter: use popovertarget on trigger instead of manual toggle handler
- NotificationCenter panel: nudge into viewport when anchor positioning overflows
- NotificationCenter panel: responsive width via min(), hide when not popover-open
- NotificationCenter: replace hardcoded color fallbacks with theme tokens
- NotificationCenter: use color-mix for unread item background
- NotificationCenter trigger: add cursor pointer
