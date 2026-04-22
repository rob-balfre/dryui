---
'@dryui/primitives': minor
'@dryui/ui': minor
---

`ChipGroup` grows three knobs and a new subcomponent:

- `gap` (`'sm' | 'md' | 'lg'`, default `'md'`) maps onto `--dry-space-{1,2,3}` tokens.
- `justify` (`'start' | 'center' | 'end' | 'between'`, default `'start'`) controls inline alignment.
- `ChipGroup.Label` renders a label slot inside the group, positioned alongside items.

The root now uses `display: flex; flex-wrap: wrap` so Badge/Chip/tag clusters wrap naturally on responsive layouts (the previous `inline-grid` approach forced single-line content into awkward column tracks). This is the only sanctioned use of flex-wrap in the design system; the `dryui/no-flex` lint rule has a matching carve-out for `[data-chip-group]`.

Existing `<ChipGroup.Root>` and `<ChipGroup.Item>` consumers render unchanged unless they were relying on the old grid-track wrapping behaviour.
