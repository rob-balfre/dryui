---
'@dryui/mcp': major
'@dryui/plugin': minor
'@dryui/lint': minor
'@dryui/cli': patch
---

Collapse the DryUI MCP runtime surface from the old multi-tool menu to two tools: `ask` and `check`.

MCP migration:

- `info <Name>` → `ask --scope component "<Name>"`
- `list` → `ask --scope list ""`
- `tokens` → `ask --scope list "" --kind token`
- `compose "<query>"` → `ask --scope recipe "<query>"`
- `detect_project` → `ask --scope setup ""`
- `plan_install` → `ask --scope setup ""`
- `plan_add <Name>` → `ask --scope component "<Name>"`
- `review file.svelte` → `check file.svelte`
- `diagnose theme.css` → `check theme.css`
- `doctor` → `check`
- `lint` → `check`
- `get` remains a CLI command only; it was never a real MCP tool

`@dryui/lint` now exports a shared `./rule-catalog` surface so the lint preprocessor, reviewer, and theme checker use the same rule metadata.

`@dryui/plugin` inherits the new MCP surface from `@dryui/mcp`; no plugin manifest schema changed.

`@dryui/cli` keeps its existing targeted commands and only changes its internal metadata wiring.

Robustness fixes shipped alongside the collapse:

- `ask --scope component "<Name>"` now returns anti-patterns for the exact component only. Previously it fuzzy-matched through `searchComposition` and flattened anti-patterns from every match, so `ask Button` surfaced guidance about `<select>`, `<input type="range">`, and other unrelated components.
- Both `ask` and `check` MCP tools now accept an optional `cwd` parameter. Setup plans and component install plans resolve against that directory instead of the MCP server's process cwd, so monorepo targeting no longer points agents at the wrong workspace.
- The `dryui-ask` and `dryui-check` MCP prompts now return `StructuredToolError` payloads as TOON text in the assistant message instead of throwing through the transport, matching the tool handlers.
- The collapsed tools reuse TOON render helpers from `packages/mcp/src/toon.ts` (exported `esc`, `header`, `row`, `truncateField`) rather than maintaining local copies. The local `row()` implementations were also missing comma escaping, which would have silently broken TOON parsing on any message containing a comma.
- `reviewer.ts` now strips `<script>`/`<style>` blocks and builds line offsets once per review instead of six times.
- `theme-checker.ts` strips CSS comments once per diagnosis instead of twice.
- `@dryui/lint`'s banned-layout-component regex is now precompiled (runs on every Svelte file in dev), and `formatRuleText` short-circuits templates that have no `{placeholder}`.
