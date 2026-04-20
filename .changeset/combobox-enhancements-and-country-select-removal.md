---
'@dryui/primitives': minor
'@dryui/ui': minor
---

Combobox input + country-select removal.

- `Combobox.Input` gains `leading` / `trailing` snippets, `size` variants (`sm` / `md` / `lg`), typeahead and keyboard navigation (ArrowUp / ArrowDown / Home / End / Enter / Tab / Escape), `aria-activedescendant` wiring, and a `triggerEl` context entry so `Combobox.Content` can anchor to the wrapping label instead of the raw input.
- `Combobox.Item` supports an optional `icon` snippet and participates in the new keyboard nav via `data-highlighted` plus auto-scroll-into-view when active.
- `Combobox.Content` min-inline-size now honours the trigger width via CSS `anchor-size(inline)`, removing the need for a JS `ResizeObserver`.
- `Diagram` with `fit="contain"` now sets `width="100%"` on the SVG so it fills its grid track.
- `CountrySelect` (both `@dryui/primitives` and `@dryui/ui`) is removed. Use `Combobox.Root` / `Combobox.Input` / `Combobox.Content` directly, or wire your own flag + dial-code composition on top.
