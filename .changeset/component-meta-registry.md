---
'@dryui/mcp': minor
---

Migrate component metadata to per-component `<name>.meta.ts` sibling files (Plan Phase 2).

- New `@dryui/mcp/define` subpath export exposes `defineComponent` (Zod-validated config) and `createLibrary` (indexed by name, category, tag, surface) for downstream tooling and generators.
- New `load-component-meta.ts` glob-scans `packages/ui/src/**/*.meta.ts` and `packages/primitives/src/**/*.meta.ts` and returns the same `Record<string, ComponentMetaEntry>` shape the old `componentMeta` catalog exported.
- `generate-spec.ts` now loads meta files as the single source of truth; `spec.json` and `agent-contract.v1.json` are byte-stable after the migration.
- `component-catalog.ts` trimmed from 1119 to 293 lines: the 160-entry `componentMeta` record and the `primitiveComponentNames` helper are gone. Nav curation (`docsNavCategories` / `docsNavComponentNames`) and the skill compound list (`skillCompoundComponents`) remain as they are authoritative for a different surface.
- `scripts/generate-component-meta.ts` regenerates the `.meta.ts` files from the current component set; re-runnable and idempotent.

No runtime behaviour changes for consumers; this is a build-time refactor that kills the catalog drift risk called out in the plan.
