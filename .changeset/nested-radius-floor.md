---
'@dryui/ui': patch
---

Floor `--dry-radius-nested` at `--dry-radius-sm` instead of `0px` so buttons inside Card, Alert, Dialog, Toast, DropdownMenu, and Popover never collapse to a square radius. With the default token pair (e.g. card radius `16px`, padding `32px`), the concentric-radius math `R − P` goes negative and previously clamped to `0`, making every nested `<Button>` square. The new floor preserves the concentric effect when `R > P` and falls back to the theme's `sm` radius otherwise.
