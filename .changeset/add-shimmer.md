---
'@dryui/ui': minor
'@dryui/primitives': minor
---

Add `Shimmer` — a warm highlight sweep that animates across wrapped text and inline icons together. Uses a duplicated-content streak layer with an animated `mask-image: linear-gradient()` so the effect paints uniformly over glyphs and `currentColor` SVG strokes (e.g. lucide icons) in a single element. Exposes `color` and `duration` props plus `--dry-shimmer-{color,duration,gap}` CSS custom properties. Automatically freezes under `prefers-reduced-motion: reduce`.
