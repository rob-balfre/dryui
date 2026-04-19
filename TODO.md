# TODO

Audit and remove the remaining live `<!-- svelte-ignore ... -->` suppressions in `.svelte` files.

Summary:

- 16 live suppressions
- 14 files
- 8 entries in `packages/primitives/src`
- 8 entries in `packages/ui/src`

Notes:

- This list excludes docs, lint rules, snapshots, and test fixtures.
- Most entries suppress `a11y_no_noninteractive_tabindex`.

## packages/primitives/src

- [ ] `packages/primitives/src/color-picker/color-picker-swatch.svelte:48` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/data-grid/data-grid-column.svelte:166` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/data-grid/data-grid-column.svelte:167` - `a11y_no_noninteractive_element_interactions`
- [ ] `packages/primitives/src/drag-and-drop/drag-and-drop-item.svelte:61` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/flip-card/flip-card-root.svelte:35` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/list/list-item.svelte:27` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/scroll-area/scroll-area.svelte:29` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/primitives/src/splitter/splitter-handle.svelte:69` - `a11y_no_noninteractive_tabindex`

## packages/ui/src

- [ ] `packages/ui/src/color-picker/color-picker-swatch.svelte:45` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/data-grid/data-grid-button-input-column.svelte:170` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/data-grid/data-grid-button-input-column.svelte:171` - `a11y_no_noninteractive_element_interactions`
- [ ] `packages/ui/src/drag-and-drop/drag-and-drop-item.svelte:70` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/flip-card/flip-card-root.svelte:36` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/list/list-item.svelte:34` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/scroll-area/scroll-area.svelte:25` - `a11y_no_noninteractive_tabindex`
- [ ] `packages/ui/src/splitter/splitter-handle.svelte:69` - `a11y_no_noninteractive_tabindex`
