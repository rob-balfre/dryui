---
'@dryui/ui': minor
'@dryui/primitives': patch
'@dryui/mcp': patch
---

- `@dryui/ui` AppFrame: add a styled wrapper around the primitive's windowed chrome. Renders macOS traffic-light dots, a centered title, and an optional actions slot above a content area, all built with scoped CSS grid and `--dry-*` tokens. Replaces the earlier styled wrapper that shipped briefly and was removed when CSS modules and flexbox were banned.
- `@dryui/mcp` component-catalog: promote AppFrame from primitive-only to a styled surface so `ask --scope component "AppFrame"` resolves to `@dryui/ui`.
