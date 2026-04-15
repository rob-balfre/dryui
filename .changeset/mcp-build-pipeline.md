---
'@dryui/mcp': patch
---

The `@dryui/mcp` build now runs `generate-architecture`, `generate-contract`, `generate-llms`, and `generate-theme-tokens` in parallel after `generate-spec` has produced the shared input, cutting MCP build time on a clean install. `generate-architecture.ts` was simplified to write `architecture.json` directly (the old multi-artifact writer was unused after the docs architecture panel was removed), and the `architecture.test.ts` regression test was deleted alongside the dropped panel. The architecture and spec snapshots regenerate cleanly to `1.1.3` against the current published `@dryui/ui`.
