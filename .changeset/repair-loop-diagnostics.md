---
'@dryui/mcp': minor
---

Ship the structured repair loop for agent-driven fixes (Plan Phase 4).

- New `@dryui/mcp/repair` subpath export with `DryUiRepairIssue`, `enrichDiagnostic`, `knownHintCodes`, and `runCheckStructured`.
- The `check` MCP tool now returns both the TOON summary (human-readable) and a second content block containing a JSON-fenced `dryui-diagnostics` array (machine-readable). Agents can parse the latter for repair loops.
- Diagnostics carry a namespaced `code` (`lint/dryui/*`, `theme/*`, `workspace/*`, `parse/*`), `hint` (prescriptive "do X" guidance, not just diagnostic prose), and `docsRef`. Hint registry covers all 15 DryUI lint rules, `project/theme-import-order`, 11 theme-checker codes, and a parse-error fallback. Unknown codes round-trip without a hint so agents degrade gracefully.
- New `self-correction` recipe in composition-data documenting the intended write, check, enrich-hint, edit, re-check loop.
