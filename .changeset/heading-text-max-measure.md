---
'@dryui/ui': minor
'@dryui/mcp': minor
---

Add `maxMeasure` prop to `Heading` and `Text` for ergonomic headline and body widths in ch units (narrow | default | wide | false). Heading.narrow caps at ~22ch for editorial hero headlines; Text presets are wider for body copy. Existing consumers (no prop) render identically.

MCP: surface prop-level notes on component queries and add two recipes. `ask --scope component "Heading"` now warns that `variant="display"` inherits `--dry-font-sans` unless `--dry-font-display` is overridden. `ask --scope recipe "serif display"` walks through importing Newsreader and scoping the override to `body` (never `:root`). `ask --scope recipe "narrow headline"` replaces the legacy grid-wrapper hack with `<Heading maxMeasure="narrow">`.
