---
'@dryui/ui': patch
---

Stretch interactive `List.Item` content to fill the row width. The item renders its contents inside a `<Button>`, whose grid used `justify-content: center; place-items: center`, shrinking the icon-and-text surface to its intrinsic width and centering it inside the row. Interactive list items now set `--dry-btn-justify: stretch` and `--dry-btn-align: stretch` so the surface fills the row and the icon sits at the start, matching non-interactive items and subheaders.
