---
'@dryui/lint': minor
---

Two new diagnostics and a softening of the width rule:

- `dryui/no-width` now allows `ch`, `ex`, and `em` units. These track text content (typographic measure), not viewport layout, so `max-width: 55ch` for body copy is sanctioned. Pixel/viewport units (`px`, `rem`, `vw`, `%`, etc.) are still flagged.
- `dryui/no-flex` carves out `[data-chip-group]`. ChipGroup.Root is now the sanctioned home for `flex-wrap`, since chip/tag clusters need content-driven flow that grid cannot express cleanly.
- New `theme-import-order` rule (error) catches `+layout.svelte` and similar files that import local CSS BEFORE `@dryui/ui/themes/*.css`. Local `--dry-*` overrides only win when the theme defaults are imported first.
- New `partial-override` diagnostic (info) flags non-theme files that override 1-10 `--dry-*` tokens at `:root`. Suggests scoping the overrides under `.page`/`body`, moving them to a per-route component `<style>`, or promoting the file to a full theme via `*.theme.css` or a `/* @dryui-theme */` directive.
