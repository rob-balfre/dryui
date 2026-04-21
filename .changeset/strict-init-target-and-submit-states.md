---
'@dryui/cli': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
'@dryui/lint': patch
'@dryui/mcp': patch
'@dryui/primitives': patch
'@dryui/theme-wizard': patch
'@dryui/ui': patch
---

Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).
