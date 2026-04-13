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

Since those reports were written, several of the duplicated implementation paths have already been collapsed in the current tree. The biggest open DRY work is now:

1. replace prose parsing and hand-maintained inventories with structured metadata
2. make install/setup documentation come from one source
3. unify the token contract used by official themes and the theme checker
4. reduce the remaining exact-copy shell components and thin wrappers
5. extract the remaining repeated CLI command and test scaffolding

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
| `validate-spec-coverage.ts` parses prose and manual inventories        | No          | Yes             | `Open`                                             |
| Theme checker and first-party themes disagree on token contract        | No          | Yes             | `Open`                                             |
| Dead layout primitives (`Flex`, `Grid`, `Stack`)                       | Yes         | Yes             | `Resolved` (`8e84d36b`)                            |
| Exact-copy primitive shells / thin wrappers                            | Light       | Yes             | `Open`                                             |
| CLI relative imports into `packages/mcp/src`                           | Yes         | No              | `Resolved` (`44874edd`)                            |
| Workspace-audit dual export (`scanWorkspace` / `buildWorkspaceReport`) | Yes         | No              | `Resolved` (`44874edd`)                            |
| Browser test boilerplate repeated across suites                        | Yes         | No              | `In Progress` — 26/28 migrated (`3074b82e`)        |
| CLI command/test skeleton repetition                                   | No          | Yes             | `Open`                                             |
| `CLAUDE.md` / `AGENTS.md` setup duplication                            | Yes         | Yes             | `Resolved` (`a263757e`)                            |
| `README.md` setup duplication                                          | Yes         | Yes             | `Open` — not touched by audit-fix wave             |
| Workflow setup duplication                                             | Yes         | No              | `Resolved` + new `validate.yml` (`5ae29aab`)       |
| Near-identical `tsconfig` files                                        | Yes         | Yes             | `In Progress` — 6 of 8 migrated (`a986ff29`)       |
| Theme wizard redirect duplicates                                       | No          | Yes             | `Open`                                             |
| Documentation drift (`apps/playground`, `bun run publish`, token docs) | No          | Yes             | `Open`                                             |
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

## P0. Structured Metadata Still Does Not Own The Component Contract

Status: `Open`

This is now the most important remaining DRY problem.

[`scripts/validate-spec-coverage.ts`](../scripts/validate-spec-coverage.ts) still derives correctness from multiple manually-maintained surfaces:

- `COMPONENT_META` in `packages/mcp/src/generate-spec.ts`
- docs navigation in [`apps/docs/src/lib/nav.ts`](../apps/docs/src/lib/nav.ts)
- the exact English sentence `Compound components include ...` in [`packages/ui/skills/dryui/SKILL.md`](../packages/ui/skills/dryui/SKILL.md)
- stale-pattern checks for removed layout guidance

Concrete evidence:

- line 164 matches `Compound components include ([^.]+)\.`
- lines 166-167 throw if that exact phrase changes
- line 28 points directly at `apps/docs/src/lib/nav.ts`
- line 31 hardcodes banned layout components

This is a synchronization ring, not a single source of truth.

### Recommendation

Create one structured component manifest and generate from it:

- spec metadata
- docs-nav leaf inventory
- compound-component skill inventory
- deprecated aliases
- architecture/audit mismatch checks

Suggested fields:

| Field        | Purpose                          |
| ------------ | -------------------------------- |
| `name`       | public component name            |
| `dir`        | source directory                 |
| `exported`   | public, latent, or private       |
| `compound`   | structured compound status       |
| `docs`       | docs visibility and category     |
| `skill`      | include in skill guidance or not |
| `deprecated` | old names and migration aliases  |

## P0. Install And Setup Content Still Has No Canonical Source

Status: `In Progress` — `CLAUDE.md` and `AGENTS.md` deduped (`a263757e`). `README.md` not yet touched.

The repo still repeats the same setup commands across markdown and docs code, but the surface has shrunk.

Resolved in the audit-fix wave:

- [`CLAUDE.md`](../CLAUDE.md) MCP / Quick setup section now keeps only the canonical Claude Code plugin install and points at [`apps/docs/src/lib/ai-setup.ts`](../apps/docs/src/lib/ai-setup.ts) for everything else
- [`AGENTS.md`](../AGENTS.md) keeps only the canonical Codex install (its primary audience) plus the repo-local plugin flow, with the same pointer
- Verified zero `npx` / `bunx` drift across `CLAUDE.md`, `AGENTS.md`, `apps/docs/static/get-started.txt`, and `ai-setup.ts` — every MCP reference is `npx -y @dryui/mcp`

Still open:

- [`README.md`](../README.md) was deliberately **not** touched in the audit-fix wave (out of agent scope) and still owns:
  - the same Claude Code / Codex / Cursor / Copilot install snippets
  - the stale `bun run publish` reference (the root `package.json` defines `publish:packages` and `release`, not `publish`)
  - publish-token guidance that also lives in `AGENTS.md` and `CLAUDE.md`

### Recommendation

Create one install/setup manifest, for example:

- `packages/mcp/src/install-surface.ts`

Then render or generate from it:

- docs setup cards
- `README.md` snippets
- `AGENTS.md` pointers (already mostly link-only after `a263757e`)
- `CLAUDE.md` pointers (already mostly link-only after `a263757e`)

The remaining work is `README.md` and the publish-token guidance triplet.

## P1. The Theme Token Contract Is Still Split Across Tooling And Theme Files

Status: `Open`

The token story still does not have one source of truth.

A fresh `dryui doctor` run over the repo reported:

- 177 errors
- 214 warnings
- top rule: `theme/unknown-component-token` with 210 occurrences

That keeps the source-report conclusion intact: the theme checker and the official themes are not reading from the same token registry.

This matters because first-party files should not fail first-party contract checks unless the checker is intentionally stricter and documented as such.

### Recommendation

Create a token registry that both sides consume:

- official themes
- theme checker
- spec generation
- any token docs surfaced in the docs app

Then make first-party theme files a hard CI check against that registry.

## P1. Exact-Copy Primitive Shells And Thin Wrappers Still Exist

Status: `Open`

The dead layout files were removed, but the broader shell-duplication problem remains.

A current duplicate scan of `packages/primitives/src/**/*.svelte` still shows 10 exact duplicate groups. The largest group contains 16 byte-for-byte identical passthrough shells:

- `alert-dialog-body`
- `alert-dialog-footer`
- `card-content`
- `card-footer`
- `card-header`
- `container`
- `dialog-body`
- `dialog-footer`
- `drawer-body`
- `drawer-footer`
- `empty-state-action`
- `empty-state-root`
- `footer-brand`
- `footer-copyright`
- `hero-actions`
- `tags-input-list`

Other exact-copy groups still include:

- menu separators across `command-palette`, `context-menu`, `dropdown-menu`, `menubar`
- labels across `context-menu`, `dropdown-menu`, `menubar`
- several small shell pairs in `table`, `data-grid`, `sidebar`, `timeline`, `skeleton`, `spacer`

The latest [architecture-audit.md](./architecture-audit.md) still reports:

- 64 thin wrapper candidates
- 15 primitive exports missing spec metadata

### Recommendation

Do not collapse the public API. Instead:

1. generate zero-logic shells from a small template
2. keep hand-authored files only where semantics, behavior, or styling differ
3. review the 15 primitive exports missing spec metadata and decide whether they are:
   - real public primitives
   - latent/internal
   - candidates for removal

## P1. CLI Plumbing Still Repeats The Same Command Shape

Status: `Open`

The relative-import problem appears fixed, but the structural repetition remains.

Current evidence from `packages/cli/src/commands`:

- many commands still repeat `resolveOutputMode(...)`
- many commands still repeat `switch (mode)`
- many commands still end with `runCommand(...)`

The `doctor` / `lint` pair is the clearest example:

- [`packages/cli/src/commands/doctor.ts`](../packages/cli/src/commands/doctor.ts)
- [`packages/cli/src/commands/lint.ts`](../packages/cli/src/commands/lint.ts)

Both call the same `scanWorkspace(...)` backend and both reproduce near-identical output-mode plumbing.

The same pattern appears in `detect`, `install`, `review`, `diagnose`, `tokens`, `compose`, `list`, and `info`.

### Recommendation

Extract a small internal command factory:

- `defineCommand(...)`
- `defineWorkspaceCommand(...)`
- shared helpers for help text and output mode routing

Then collapse repeated CLI test harness code in:

- `packages/cli/src/__tests__/project-planner.test.ts`
- `packages/cli/src/__tests__/workspace-audit.test.ts`
- matching MCP-side tests where fixture builders are mirrored

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

## P2. Documentation Drift Is Still Visible In Canonical Files

Status: `Open`

Fresh verification still found live drift in `README.md`:

- line 234 references `apps/playground`
- line 281 tells contributors to run `bun run publish`

The repo root `package.json` does not define a `publish` script. It defines:

- `publish:packages`
- `release`

Publish-token guidance is also still repeated in:

- [`README.md`](../README.md)
- [`AGENTS.md`](../AGENTS.md)
- [`CLAUDE.md`](../CLAUDE.md)

This is exactly the kind of operational duplication that causes expensive confusion.

### Recommendation

Move operational facts into one canonical reference page and link to it from the three top-level markdown files. Keep those files short and role-specific.

## P2. Small Structural Duplicates Remain Easy Wins

Status: `Open`

### Theme wizard redirects

These four files are still identical:

- [`apps/docs/src/routes/theme-wizard/colour/+page.server.ts`](../apps/docs/src/routes/theme-wizard/colour/+page.server.ts)
- [`apps/docs/src/routes/theme-wizard/preview/+page.server.ts`](../apps/docs/src/routes/theme-wizard/preview/+page.server.ts)
- [`apps/docs/src/routes/theme-wizard/shape/+page.server.ts`](../apps/docs/src/routes/theme-wizard/shape/+page.server.ts)
- [`apps/docs/src/routes/theme-wizard/typography/+page.server.ts`](../apps/docs/src/routes/theme-wizard/typography/+page.server.ts)

They should be collapsed into one helper or replaced with a route strategy that does not need four cloned redirect loaders.

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

Reordered after the audit-fix wave landed. The first three are the same — they were not in the wave's scope. The rest reflect what's now actually open.

1. **Canonicalize component metadata** so `validate-spec-coverage.ts` stops parsing prose and the spec / nav / skill inventories all derive from one structured manifest. Still the highest-leverage win.
2. **Unify the token registry** used by first-party themes, the theme checker, and the spec generator. Currently `dryui doctor` reports 177 errors / 214 warnings on first-party files — first-party files should not fail first-party contract checks.
3. **Template the zero-logic primitive shells** (still 10 exact-duplicate groups, the largest of 16 byte-identical passthroughs) and triage the 15 primitive exports missing spec metadata.
4. **Finish install / setup canonicalization** by replacing `README.md`'s setup snippets and stale `bun run publish` reference with pointers into `apps/docs/src/lib/ai-setup.ts` (the same model already used by `CLAUDE.md` and `AGENTS.md` after `a263757e`).
5. **Extract CLI command factories** (`defineCommand`, `defineWorkspaceCommand`) and shared CLI test helpers. The 10 commands still repeat `resolveOutputMode` / `switch (mode)` / `runCommand` plumbing even after the import fix.
6. **Finish the form-control token migration** for the 4 deferred controls (`select-trigger`, `phone-input-select`, `file-select-root`, `pin-input-cell`) — but only after design review of the `border-focus` (solid vs translucent) and `bg-disabled` (tint vs opacity) divergences flagged by the audit-fix wave.
7. **Clean the remaining theme-wizard redirect duplicates** (`colour`, `preview`, `shape`, `typography` `+page.server.ts` are still byte-identical) and unblock the pre-existing in-progress alert refactor (`packages/ui/src/alert/alert.svelte` `title: Snippet` type conflict) so `bun run validate` is green again.

## Bottom Line

The merged view's priorities have shifted further up the stack after the audit-fix wave.

What's gone from the open list:

- release script duplication (`998351b8`)
- CLI relative imports + workspace-audit dual export (`44874edd`)
- dead `Flex` / `Stack` / `Grid` primitives (`8e84d36b`)
- workflow setup duplication + missing PR validation (`5ae29aab`)
- skill sync drift + the silent-failure bug behind it (`fb99cd07`)
- `CLAUDE.md` and `AGENTS.md` install snippet duplication (`a263757e`)
- 65 repeated focus-ring / disabled / raw-duration CSS literals + a lint rule to keep them out (`4508c6a8`)

What's been downgraded but not closed:

- `tsconfig` consolidation — templates exist; remaining work is bounded by TypeScript's `include` semantics
- browser test boilerplate — 26 / 28 migrated; two intentional documented exempt files
- form-control private-token proliferation — 4 / 8 form controls migrated; remaining 4 need design review first
- install / setup canonical source — `CLAUDE.md` and `AGENTS.md` deduped; `README.md` still owns its own copies

What's still genuinely open and now matters most:

- one structured component contract (`validate-spec-coverage.ts` parsing prose)
- one token registry (theme checker disagreeing with first-party themes)
- fewer hand-authored primitive shell wrappers (10 exact-duplicate groups)
- CLI command factory extraction
- the remaining `README.md` operational drift

These are the changes that will remove long-term drift. The audit-fix wave handled every actionable item the previous reports surfaced — what's left is the structural work that needs design judgment, not mechanical migration.
