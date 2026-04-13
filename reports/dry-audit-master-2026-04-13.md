# DryUI DRY Audit — Merged Master Report

Date: 2026-04-13

Sources:

- [dry-audit-2026-04-13.md](./dry-audit-2026-04-13.md)
- [dry-principle-audit-2026-04-13.md](./dry-principle-audit-2026-04-13.md)

Refresh note: this report is not a blind concatenation. It dedupes both source audits and re-checks the highest-risk findings against the current working tree so parallel agents do not repeat work that has already landed.

## Executive Summary

Both source audits were broadly right. They overlapped most heavily in four areas:

1. release and publish had too many authoritative paths
2. skills and setup instructions existed in multiple living copies
3. dead or duplicate component shells were still being hand-maintained
4. docs and repo metadata were repeating operational facts instead of generating them

Since those reports were written, the major structural DRY items have now been collapsed in the current tree as well. The remaining follow-up work is narrower and mostly non-mechanical:

1. decide whether the two raw browser tests should remain documented exemptions or move under a shared harness wrapper
2. finish the last 4 form-control-family migrations only after design review of their intentional visual divergences
3. keep `tsconfig` template work bounded to packages that genuinely share compiler semantics

## Update Log — 2026-04-13 (audit-fix wave)

After this master report was merged, an agentic team was dispatched against every actionable item in [`dry-audit-2026-04-13.md`](./dry-audit-2026-04-13.md). Ten commits landed on `main`. This section is a delta on the rest of the document — every status callout below references one of these SHAs.

### Fully resolved

- **Release script duplication** — `scripts/release.ts` deleted, `scripts/lib/export-swap.ts` extracted, `publish.ts` + `prepack-exports.ts` + `postpack-exports.ts` rewritten to share it. Backup format is byte-equal raw text so restore round-trips lossless. `CLAUDE.md` Releasing section rewritten to describe the actual changesets-action flow. `998351b8`
- **CLI relative imports + dual workspace-audit name** — All 10 `../../../mcp/src/*.js` imports in `packages/cli/src/commands` replaced with `@dryui/mcp/<subpath>`. `scanWorkspace` / `buildWorkspaceReport` collapsed to a single canonical export. Regression guard `check:cli-imports` added to `scripts/validate.ts`. `44874edd`
- **Dead `Flex` / `Stack` / `Grid` primitives** — Seven source files deleted, major-bump changeset added. Fixed-group means `@dryui/primitives` and `@dryui/ui` will both major together. `8e84d36b`
- **GitHub workflow setup duplication** — `.github/actions/setup-dryui/action.yml` composite action extracted; `release.yml` and `deploy-docs.yml` (renamed from `ci.yml`) both consume it; new `validate.yml` runs on `pull_request` to close the no-PR-validation gap that `CLAUDE.md` previously documented as a known weakness. `5ae29aab`
- **Skill sync drift** — `scripts/sync-skills.ts` now uses an explicit bytes-based copy and runs `verifySyncedTree()` post-sync, byte-comparing every target file against source and `process.exit(1)`-ing on any mismatch, missing, or orphan. Idempotent. `fb99cd07`
- **`CLAUDE.md` / `AGENTS.md` install snippet duplication** — Both files now point at `apps/docs/src/lib/ai-setup.ts` as the canonical source for per-tool setup, keeping only the one canonical install command for their primary audience (Claude Code for `CLAUDE.md`, Codex for `AGENTS.md`). `a263757e`

### Partially resolved (P2 → still open but downgraded)

- **`tsconfig` consolidation** — `tsconfig.svelte-package.json` and `tsconfig.node.json` templates added at the repo root. Six packages (`primitives`, `ui`, `theme-wizard`, `feedback`, `lint`, `feedback-server`) now extend them. `cli` and `mcp` deliberately untouched (genuine overrides). TypeScript's `include` resolution semantics cap the savings — `include` and `paths` cannot be centralized. `a986ff29`
- **Browser test boilerplate** — `tests/browser/_harness.ts` extracted with shared `render()` and `afterEach` cleanup. 26 of 28 `*.browser.test.ts` files migrated. Two intentional skips: `browser-smoke.browser.test.ts` (raw DOM, no Svelte component to mount) and `theme-bootstrap.browser.test.ts` (executes an extracted inline script). `_harness` header documents the skips. `3074b82e`
- **Install / setup canonical source** — `CLAUDE.md` and `AGENTS.md` deduped against `apps/docs/src/lib/ai-setup.ts`. `README.md` was **not touched** in this wave and still owns its own setup snippets plus the stale `bun run publish` reference noted under P2 below. The P0 finding is half-closed.

### New audit-fix work (not in either original report)

- **CSS state tokens and `--dry-form-control-*` family** — `4508c6a8`
  - Added `--dry-focus-ring`, `--dry-state-disabled-opacity`, and a 9-token `--dry-form-control-{bg,border,border-hover,color,color-placeholder,radius,font-size,padding-block,padding-inline}` family to `packages/ui/src/themes/default.css`.
  - Migrated 37 focus-ring sites, 17 disabled-state sites, and 11 of 13 raw-duration sites across `packages/ui/src/`.
  - Migrated `input` / `textarea` / `combobox-input` / `color-picker-input` to consume the form-control family. `select-trigger` / `phone-input-select` / `file-select-root` / `pin-input-cell` deliberately deferred — they have pre-existing `border-focus` (solid vs translucent) and `bg-disabled` (tint vs opacity) divergences flagged for design review rather than papered over.
  - Added `dryui/prefer-focus-ring-token` lint rule in `packages/lint/src/rules.ts` with two unit tests so the raw pattern cannot regress.
  - Two changesets: `css-state-tokens.md` (minor on primitives + ui + lint) and `form-control-token-family.md` (minor on ui).

### Verification at the end of the wave

- `bun run --filter '@dryui/primitives' build` — exit 0
- `bun run --filter '@dryui/ui' build` — exit 0
- `bun run --filter '@dryui/mcp' build` — exit 0
- `bun run --filter '@dryui/cli' build` — exit 0
- `bun run validate --no-test` — fails **only** on a pre-existing in-progress alert refactor (`packages/ui/src/alert/alert.svelte`: `title: Snippet` vs `HTMLAttributes['title']: string` conflict). Verified pre-existing via `git stash` round-trip — not introduced by any audit-fix commit. Unblocking `check:ui` requires a separate fix to the alert refactor; the audit team intentionally did not touch it.

## Update Log — 2026-04-13 (completion sweep)

After the audit-fix wave, the remaining mechanical DRY items were also completed in the live tree:

- manifest-backed component metadata now drives spec/nav/skill/audit surfaces
- the theme token contract is shared through `packages/mcp/src/theme-tokens.ts`
- exact-copy primitive shells were collapsed into shared internal implementations
- CLI entry plumbing now shares help/output-mode handling
- `README.md`, `AGENTS.md`, and `CLAUDE.md` now point at canonical setup/release docs instead of repeating the full guidance
- theme-wizard redirects now share one loader helper

The wave-specific notes above are preserved as historical context. The matrix and status callouts below reflect the current tree.

## Status Key

- `Open`: still present in the current tree
- `In Progress`: current tree already contains part of the fix, but the DRY problem is not fully closed
- `Resolved In Current Tree`: source-report finding was valid, but current worktree already addresses it

## Deduped Findings Matrix

Status legend: `Resolved` = fully closed by the audit-fix wave or current tree · `In Progress` = partially closed · `Open` = no fix yet · `New` = added by the audit-fix wave (not in either source audit).

| Finding                                                                | `dry-audit` | `dry-principle` | Current status                                     |
| ---------------------------------------------------------------------- | ----------- | --------------- | -------------------------------------------------- |
| Release / publish had multiple authoritative paths                     | Yes         | Yes             | `Resolved` (`998351b8`)                            |
| Skill copies drift                                                     | Yes         | Yes             | `Resolved` (`fb99cd07`, post-sync verifier)        |
| `validate-spec-coverage.ts` parses prose and manual inventories        | No          | Yes             | `Resolved` — manifest-backed in current tree       |
| Theme checker and first-party themes disagree on token contract        | No          | Yes             | `Resolved` — shared registry in current tree       |
| Dead layout primitives (`Flex`, `Grid`, `Stack`)                       | Yes         | Yes             | `Resolved` (`8e84d36b`)                            |
| Exact-copy primitive shells / thin wrappers                            | Light       | Yes             | `Resolved` — internal shells + zero duplicate scan |
| CLI relative imports into `packages/mcp/src`                           | Yes         | No              | `Resolved` (`44874edd`)                            |
| Workspace-audit dual export (`scanWorkspace` / `buildWorkspaceReport`) | Yes         | No              | `Resolved` (`44874edd`)                            |
| Browser test boilerplate repeated across suites                        | Yes         | No              | `In Progress` — 26/28 migrated (`3074b82e`)        |
| CLI command/test skeleton repetition                                   | No          | Yes             | `Resolved` — shared CLI entry helpers              |
| `CLAUDE.md` / `AGENTS.md` setup duplication                            | Yes         | Yes             | `Resolved` (`a263757e`)                            |
| `README.md` setup duplication                                          | Yes         | Yes             | `Resolved` — now points at canonical docs/code     |
| Workflow setup duplication                                             | Yes         | No              | `Resolved` + new `validate.yml` (`5ae29aab`)       |
| Near-identical `tsconfig` files                                        | Yes         | Yes             | `In Progress` — 6 of 8 migrated (`a986ff29`)       |
| Theme wizard redirect duplicates                                       | No          | Yes             | `Resolved` — shared redirect loader                |
| Documentation drift (`apps/playground`, `bun run publish`, token docs) | No          | Yes             | `Resolved` — canonical release/setup docs          |
| Repeated focus-ring / disabled / raw-duration CSS literals             | New         | New             | `Resolved` — 65 sites migrated + lint (`4508c6a8`) |
| Form-control private-token proliferation                               | New         | New             | `In Progress` — 4 of 8 form controls (`4508c6a8`)  |

## Already Addressed In The Current Tree

These were real findings in the source reports, but they should not be re-opened as new audit work unless the current implementation proves inadequate.

### Release script duplication is fully resolved

Status callout: `Resolved` (commit `998351b8`).

Current tree changes:

- `scripts/release.ts` deleted
- shared swap logic lives in [`scripts/lib/export-swap.ts`](../scripts/lib/export-swap.ts)
- [`scripts/publish.ts`](../scripts/publish.ts), [`scripts/prepack-exports.ts`](../scripts/prepack-exports.ts), and [`scripts/postpack-exports.ts`](../scripts/postpack-exports.ts) all import from that shared helper
- backup format is byte-equal raw text (read/write/restore round-trips lossless, no key-order changes)
- [`CLAUDE.md`](../CLAUDE.md) "Releasing" section rewritten to describe the actual `changesets/action@v1` → `changeset publish` → `npm pack` → prepack/postpack flow (the previous prose described the deleted `release.ts`)

Documentation and ownership are now also clean. No remaining work in this area.

### Workflow setup duplication is fully resolved + new PR validation

Status callout: `Resolved` (commit `5ae29aab`).

Current tree changes:

- shared workflow bootstrap lives in [`.github/actions/setup-dryui/action.yml`](../.github/actions/setup-dryui/action.yml) — wraps `oven-sh/setup-bun@v2`, `actions/cache@v5` keyed on `bun.lock`, and `bun install --frozen-lockfile`
- the misnamed `ci.yml` was renamed to [`.github/workflows/deploy-docs.yml`](../.github/workflows/deploy-docs.yml) (its actual purpose)
- both `release.yml` and `deploy-docs.yml` now consume the composite via `uses: ./.github/actions/setup-dryui`
- new [`.github/workflows/validate.yml`](../.github/workflows/validate.yml) runs on `pull_request` to `main`: composite setup → `bun run validate --no-test` → Playwright install → `test:browser`. Closes the no-PR-validation gap that `CLAUDE.md` previously documented as a known weakness.

`actions/checkout` is intentionally left in each calling workflow (composite actions can't reliably run it themselves) and `release.yml` still keeps `actions/setup-node` for npm registry auth.

### Dead layout primitives have already been removed

The source reports were right to call out the contradiction between the documented CSS rules and shipped layout primitives. In the current tree:

- `packages/primitives/src/flex/` is deleted
- `packages/primitives/src/grid/` is deleted
- `packages/primitives/src/stack/` is deleted

That closes the highest-priority “banned-but-shipped” contradiction.

### CLI relative imports into `packages/mcp/src` are fixed

Status callout: `Resolved` (commit `44874edd`).

All ten relative imports were replaced with the matching `@dryui/mcp/<subpath>` (review → `/reviewer`, diagnose → `/theme-checker`, detect/install/add/init/project-planner → `/project-planner`, doctor/lint/workspace-args → `/workspace-audit`). A fresh `rg "from ['\\\"]\\.\\.\\/\\.\\.\\/\\.\\.\\/mcp" packages/cli` returns zero matches.

A grep guard `check:cli-imports` was added to [`scripts/validate.ts`](../scripts/validate.ts) so the relative import pattern cannot regrow without failing the validate pipeline.

While in this file: the dual `scanWorkspace` / `buildWorkspaceReport` exports in [`packages/mcp/src/workspace-audit.ts`](../packages/mcp/src/workspace-audit.ts) were collapsed to a single canonical `scanWorkspace` (only two callers — both already in the import-fix batch).

### Skill drift on `OptionPicker` is fixed and the sync mechanism is hardened

Status callout: `Resolved` (commit `fb99cd07`).

`OptionPicker` is now consistently named in:

- [`packages/ui/skills/dryui/SKILL.md`](../packages/ui/skills/dryui/SKILL.md)
- [`.claude/skills/dryui/SKILL.md`](../.claude/skills/dryui/SKILL.md)
- [`.codex/skills/dryui/SKILL.md`](../.codex/skills/dryui/SKILL.md)
- [`apps/docs/src/lib/nav.ts`](../apps/docs/src/lib/nav.ts)
- [`packages/ui/src/index.ts`](../packages/ui/src/index.ts)

Beyond the one-off sync, [`scripts/sync-skills.ts`](../scripts/sync-skills.ts) was hardened so the same drift cannot recur silently:

- copy is now an explicit `Bun.file(src).bytes()` + `Bun.write(dest, bytes)` (no streaming-ref footguns)
- new `verifySyncedTree()` walks every synced target post-sync, byte-compares each file against source, and `process.exit(1)`s with per-file reasons on any mismatch, missing, or orphan
- `IGNORED_NAMES` set extracted so `.DS_Store` filtering is consistent across copy / stale / verify phases
- second consecutive run is idempotent and reports `verified N target tree(s) — all in sync`

The earlier drift finding is now historical context.

### CSS state tokens, disabled state, and form-control family added

Status callout: `Resolved` for state tokens · `In Progress` for form-control family (commit `4508c6a8`). New finding — not in either source audit.

Three CSS literals were spread across `packages/ui/src/` with no shared token, blocking single-source-of-truth restyling: 37 sites of `outline: 2px solid var(--dry-color-focus-ring)`, 17 sites of `opacity: 0.5; cursor: not-allowed`, and 13 sites of raw transition duration literals. Form controls each defined 4-6 nearly-identical private `--_dry-<name>-*` tokens for the same semantic roles.

Resolved:

- New `--dry-focus-ring`, `--dry-state-disabled-opacity` tokens in [`packages/ui/src/themes/default.css`](../packages/ui/src/themes/default.css)
- 37 focus-ring sites migrated across 34 `.svelte` files plus `packages/ui/src/tour/tour-root.css`
- 17 paired disabled-state sites migrated (unpaired `opacity: 0.5` left intentionally alone)
- 11 of 13 raw-duration sites migrated to `--dry-duration-*` tokens; the two intentional 600 ms `flip-card` overrides preserved
- New `dryui/prefer-focus-ring-token` lint rule in [`packages/lint/src/rules.ts`](../packages/lint/src/rules.ts) with two unit tests in [`tests/unit/lint-rules.test.ts`](../tests/unit/lint-rules.test.ts) so the raw pattern cannot regress

In progress (form-control family):

- New 9-token `--dry-form-control-{bg,border,border-hover,color,color-placeholder,radius,font-size,padding-block,padding-inline}` family in `default.css`
- 4 of 8 form controls migrated: `input`, `textarea`, `combobox-input`, `color-picker-input`
- Deferred (flagged for design review, not papered over): `select-trigger`, `phone-input-select`, `file-select-root`, `pin-input-cell` — they have pre-existing `border-focus` (solid vs translucent) and `bg-disabled` (tint vs opacity) divergences that are not safe to silently unify

Per-component `--_dry-<name>-*` consumer override surfaces preserved throughout — consumers can still restyle individual controls without affecting the whole family.

## Priority Findings Still Open

## P0. Structured Metadata Now Owns The Component Contract

Status: `Resolved in current tree`

The component contract now derives from [`packages/mcp/src/component-catalog.ts`](../packages/mcp/src/component-catalog.ts) instead of prose parsing and duplicated inventories.

Current tree changes:

- [`packages/mcp/src/generate-spec.ts`](../packages/mcp/src/generate-spec.ts) imports manifest-backed metadata
- [`scripts/validate-spec-coverage.ts`](../scripts/validate-spec-coverage.ts) reads the structured manifest instead of parsing `SKILL.md` prose and docs nav text
- [`apps/docs/src/lib/nav.ts`](../apps/docs/src/lib/nav.ts), [`packages/ui/skills/dryui/SKILL.md`](../packages/ui/skills/dryui/SKILL.md), and [`packages/mcp/src/architecture.ts`](../packages/mcp/src/architecture.ts) all consume the same structured inventory
- spec, architecture, contract, and `llms*.txt` artifacts were regenerated from that shared source

Verification:

- `bun run scripts/validate-spec-coverage.ts` — exit 0
- `packages/mcp/src/architecture.json` now has zero `UseThemeOverride` mismatches and zero primitive `spec-missing` mismatches

## P0. Install And Setup Content Now Has A Canonical Source

Status: `Resolved in current tree`

The setup and release surfaces are now reduced to canonical sources plus role-specific examples.

Current tree changes:

- [`apps/docs/src/lib/ai-setup.ts`](../apps/docs/src/lib/ai-setup.ts) remains the single source of truth for client-specific install snippets and MCP config shapes
- [`README.md`](../README.md) now points at `ai-setup.ts` and the docs getting-started page instead of carrying the full client matrix
- [`AGENTS.md`](../AGENTS.md) and [`CLAUDE.md`](../CLAUDE.md) keep only the one canonical example for their primary audience plus links to the shared setup source
- new [`RELEASING.md`](../RELEASING.md) is the canonical source for release flow and npm-token rotation guidance; README, AGENTS, and CLAUDE now link to it instead of copying the operational details

## P1. The Theme Token Contract Is Now Shared

Status: `Resolved in current tree`

The token registry now lives in [`packages/mcp/src/theme-tokens.ts`](../packages/mcp/src/theme-tokens.ts), which parses the first-party light and dark theme files once and exports the shared contract.

Current tree changes:

- [`packages/mcp/src/tokens.ts`](../packages/mcp/src/tokens.ts) consumes the shared registry instead of reparsing theme CSS independently
- [`packages/mcp/src/theme-checker.ts`](../packages/mcp/src/theme-checker.ts) uses the shared required-token, surface-token, and pairing lists
- [`apps/docs/src/lib/theme-wizard/sidebar-contract.ts`](../apps/docs/src/lib/theme-wizard/sidebar-contract.ts) and [`apps/docs/src/lib/theme-wizard/docs-theme.ts`](../apps/docs/src/lib/theme-wizard/docs-theme.ts) consume the same token names and pickers

Verification:

- `bun test packages/mcp/src/theme-checker.test.ts` — exit 0
- `bunx tsc -p packages/mcp/tsconfig.json --noEmit` — exit 0
- `bun run --filter '@dryui/mcp' build` — exit 0

## P1. Exact-Copy Primitive Shells Were Collapsed

Status: `Resolved in current tree`

The remaining exact-copy shell groups were replaced with shared internal primitives while preserving the public API.

Current tree changes:

- repeated passthrough shells now re-export shared implementations from `packages/primitives/src/internal/`
- duplicate menu separators, labels, table wrappers, sidebar wrappers, timeline wrappers, and other exact-copy shells were collapsed into those shared internals
- the public `index.ts` entrypoints remain stable, so the consumer-facing API did not change

Verification:

- duplicate scan over `packages/primitives/src/**/*.svelte` now reports `TOTAL_GROUPS 0`
- `bun run --filter '@dryui/primitives' build` — exit 0
- [architecture-audit.md](./architecture-audit.md) no longer reports primitive `spec-missing` drift

## P1. CLI Plumbing Now Uses Shared Entry Helpers

Status: `Resolved in current tree`

The CLI layer now shares both test scaffolding and command entry plumbing instead of repeating the same help/output-mode boilerplate.

Current tree changes:

- [`packages/cli/src/run.ts`](../packages/cli/src/run.ts) now exposes `printCommandHelp(...)` and `runStandardCommand(...)` alongside the shared result renderers
- repeated command entrypoints (`detect`, `install`, `review`, `diagnose`, `compose`, `info`) now route through the shared helper instead of each reimplementing help/mode/positional handling
- shared test helpers live in [`packages/cli/src/__tests__/helpers.ts`](../packages/cli/src/__tests__/helpers.ts) and are exercised by dedicated tests

Verification:

- `bun test packages/cli/src/__tests__` — exit 0
- `bun run --filter '@dryui/cli' build` — exit 0

## P1. Browser Test Boilerplate Is Mostly Fixed, But Not Fully Closed

Status: `In Progress` — 26 of 28 migrated (`3074b82e`).

[`tests/browser/_harness.ts`](../tests/browser/_harness.ts) now exports `render(Component, props?, options?) => { instance, target }` plus `createBodyTarget()`, with a single module-level `afterEach` that unmounts everything and clears `document.body`. 26 of 28 `*.browser.test.ts` files were migrated to use it; ~280 lines of duplicated boilerplate removed.

Two intentional skips, both documented in the `_harness.ts` header:

- [`tests/browser/browser-smoke.browser.test.ts`](../tests/browser/browser-smoke.browser.test.ts) — uses raw DOM, never mounts a Svelte component
- [`tests/browser/theme-bootstrap.browser.test.ts`](../tests/browser/theme-bootstrap.browser.test.ts) — executes an extracted inline script, also no Svelte mount

Tests that legitimately need extra cleanup (theme reset, localStorage, motion mocks) keep their own additional `afterEach` hooks; only the component unmount delegates to the shared harness.

What remains:

- decide whether the two skipped files should be marked exempt in a top-level test config or eventually go through the harness anyway. The audit-fix wave's call was "exempt + documented" — that's the lower-risk choice but it does leave two non-conforming files.
- a small number of pre-existing test failures (`toggle`, `code-block`, `visual-benchmark`) were verified pre-existing via `git stash` round-trip — they are unrelated to the harness migration but still need a separate fix to get `bun run test:browser` green.

## P2. Documentation Drift Was Removed From Canonical Files

Status: `Resolved in current tree`

Fresh verification after the completion sweep shows:

- [`README.md`](../README.md) no longer references `apps/playground`
- [`README.md`](../README.md) no longer references the nonexistent `bun run publish` script
- publish-token guidance now lives in [`RELEASING.md`](../RELEASING.md) instead of being repeated across README, AGENTS, and CLAUDE

## P2. Small Structural Duplicates Remain Bounded

Status: `In Progress`

### Theme wizard redirects

Resolved in the current tree:

- the four duplicated redirect loaders now re-export [`apps/docs/src/routes/theme-wizard/redirect.server.ts`](../apps/docs/src/routes/theme-wizard/redirect.server.ts)

### `tsconfig` presets

Status: `In Progress` — templates added and 6 of 8 packages migrated (`a986ff29`).

Resolved in the audit-fix wave:

- New [`tsconfig.svelte-package.json`](../tsconfig.svelte-package.json) and [`tsconfig.node.json`](../tsconfig.node.json) at the repo root
- [`packages/primitives/tsconfig.json`](../packages/primitives/tsconfig.json), [`packages/ui/tsconfig.json`](../packages/ui/tsconfig.json), [`packages/theme-wizard/tsconfig.json`](../packages/theme-wizard/tsconfig.json), and [`packages/feedback/tsconfig.json`](../packages/feedback/tsconfig.json) extend the svelte template
- [`packages/lint/tsconfig.json`](../packages/lint/tsconfig.json) and [`packages/feedback-server/tsconfig.json`](../packages/feedback-server/tsconfig.json) extend the node template
- All six affected package builds verified `exit 0`

Still open by design:

- [`packages/cli/tsconfig.json`](../packages/cli/tsconfig.json) and [`packages/mcp/tsconfig.json`](../packages/mcp/tsconfig.json) deliberately untouched — they have unique compiler options and a distinct build pipeline (mcp ships a separate `tsconfig.build.json`)
- TypeScript's `include` resolution semantics cap the savings — `include` and `paths` cannot be centralized because TS resolves them relative to the file that declares them, not the inheriting package. Per-package files still own their `include`, `paths`, and any genuine compiler-option overrides.

What's left in this finding is the optional `tsconfig.build.json` from the source-report recommendation — has not been added because no package needed a third role beyond svelte / node.

## Recommended Next PR Order

After the completion sweep, the remaining work is limited to the intentionally deferred or judgment-heavy items:

1. **Decide whether the two raw browser tests should stay documented exemptions** or be wrapped in a shared harness helper despite not mounting Svelte components.
2. **Finish the form-control family migration** only after design review of the composite-control divergences in `phone-input`, `file-select`, and `pin-input`.
3. **Keep `tsconfig` template work bounded** unless another genuinely shared compiler role emerges.

## Bottom Line

The merged view's priorities have shifted further up the stack after the audit-fix wave.

What's now fully gone from the open list:

- release script duplication (`998351b8`)
- CLI relative imports + workspace-audit dual export (`44874edd`)
- dead `Flex` / `Stack` / `Grid` primitives (`8e84d36b`)
- workflow setup duplication + missing PR validation (`5ae29aab`)
- skill sync drift + the silent-failure bug behind it (`fb99cd07`)
- install/setup/release doc drift across README, AGENTS, and CLAUDE
- 65 repeated focus-ring / disabled / raw-duration CSS literals + a lint rule to keep them out (`4508c6a8`)
- manifest-backed component metadata
- shared token registry across theme files, tooling, and docs
- exact-copy primitive shell duplication
- shared CLI command entry helpers
- theme-wizard redirect duplication

What's been downgraded but not closed:

- `tsconfig` consolidation — templates exist; remaining work is bounded by TypeScript's `include` semantics
- browser test boilerplate — 26 / 28 migrated; two intentional documented exempt files
- form-control private-token proliferation — 4 of the simple controls migrated; the remaining composite controls need design review rather than a blind token swap

What's still active now is the narrower follow-up work that requires judgment rather than mechanical dedupe:

- the two raw browser-test exemptions
- the remaining composite form-control family decisions
- optional `tsconfig` template follow-through if another shared role appears

The audit-fix wave plus the completion sweep handled the structural DRY work. What's left is deliberately smaller and should only move with design or tooling justification.
