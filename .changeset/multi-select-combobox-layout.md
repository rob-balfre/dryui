---
'@dryui/ui': patch
---

Fix `MultiSelectCombobox` token layout and Button `icon-sm`/`icon-lg` sizing.

- `MultiSelectCombobox.Root`: tokens were stacking one-per-row instead of wrapping inline. Root cause: `grid-template-columns: repeat(auto-fill, minmax(min-content, max-content))` is invalid under the CSS Grid spec — `auto-fill`/`auto-fit` require a `<fixed-size>` min, and `min-content` isn't fixed, so the browser fell back to single-column layout. Replaced with `repeat(auto-fit, minmax(48px, max-content))` + `justify-content: start` so tokens pack from the left and empty tracks collapse.
- `Button` `icon-sm` and `icon-lg` sizes were both hardcoded to `height: var(--dry-space-12)` (48px), matching `icon`. Fixed so the three icon sizes mirror the pattern of `sm`/`md`/`lg`: icon-sm → 32px, icon → 48px, icon-lg → 56px. This makes the `×` close button inside `MultiSelectCombobox` and similar pill tokens render at an appropriate 32px instead of dominating the pill at 48px.
