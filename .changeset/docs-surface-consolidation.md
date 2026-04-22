---
'@dryui/mcp': minor
---

Consolidate docs, skills, and plugin parity surfaces (Plan Phase 6).

New `@dryui/mcp/docs-surface` subpath export with:

- `AGENT_IDS`: canonical list of supported editor-setup agent IDs (claude-code, codex, gemini, opencode, copilot, cursor, windsurf, zed). `apps/docs/src/lib/ai-setup.ts` now derives its `AiAgentId` type from this.
- `DOCS_ROUTES` / `DOCS_ROUTE_PATHS`: first-party docs routes with label + description + keywords. Consumed by `search.ts` and the llms.txt generator.
- `DOCS_ALLOWLIST`: re-exported from the existing ai-surface prompt bundle so consumers hit one import.

`apps/docs/src/lib/search.ts` was silently broken by Phase 2 (it imported `componentMeta` from the trimmed catalog); it now reads from `spec.json` directly so the docs build stays green.

`generate-llms-txt.ts` includes a new "First-party docs" section pulled from `DOCS_ROUTES`, so llms.txt keeps agents pointed at the authoritative route list.

Three parity tests in `tests/unit/`:

- `docs-surface.test.ts`: every `DOCS_ROUTE` has a matching `+page.svelte`, no duplicate route paths, agent IDs are unique.
- `ai-setup-contract.test.ts`: `ai-setup.ts` declares a setup card for every `AGENT_IDS` entry and does not name unknown agent IDs.
- `plugin-manifest-contract.test.ts`: plugin manifests stay under the 30-line budget and do not inline long setup blocks.
