---
"@dryui/ui": minor
"@dryui/primitives": minor
"@dryui/mcp": minor
"@dryui/cli": minor
"@dryui/lint": minor
---

Review-driven improvements from dogfooding a flight search app.

**@dryui/ui**
- Add `LogoMark` component for brand marks, status indicators, and category badges
- Add `options` prop shorthand to `Select.Root` for simple dropdowns (`<Select.Root options={['A','B']} />`)

**@dryui/primitives**
- Add `options` and `placeholder` props to `SelectRootProps`

**@dryui/mcp**
- Add `tokens` tool for `--dry-*` CSS token discovery with category filtering
- Batch-friendly `info` tool — accepts comma-separated component names
- Smarter `prefer-grid-layout` reviewer suggestion — suppresses for complex grids (>3 tracks, named areas, subgrid, minmax, repeat)
- Add `aligned-card-list` composition recipe (CSS subgrid pattern)

**@dryui/cli**
- Add `tokens` command for `--dry-*` CSS token listing
- Batch-friendly `info` command — accepts comma-separated names

**@dryui/lint**
- Allow `display: inline-flex` (no longer flagged by `dryui/no-flex`)
- Add `/* dryui-allow flex */` comment to suppress flex violations per declaration
