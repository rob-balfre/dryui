---
'@dryui/ui': patch
'@dryui/primitives': patch
---

Dialog and Drawer expose new CSS variable knobs so consumers can override the default scroll and sizing behaviour without forking the components:

- `Dialog.Content` exposes `--dry-dialog-overflow` and `--dry-dialog-max-block-size`, and now uses `place-content: center` so a constrained dialog stays centred inside the native `<dialog>` viewport.
- `Dialog.Body` exposes `--dry-dialog-body-overflow-y` (defaulting to `auto`), so an embedded scroller can opt into `hidden` when it owns its own scroll region.
- `Drawer.Content` forces the underlying `<dialog>` element's `max-width` to `none` at runtime, fixing a thin gutter that appeared next to edge drawers because of the user-agent default.
