# REVIEW.md — DryUI fresh-eyes audit

**Reviewer:** Claude Opus 4.7 (1M context).
**Date:** 2026-04-17.
**Method:** two rounds, 14 parallel Explore agents covering UI / primitives,
CLI / MCP, build pipeline, documentation, tests, repo hygiene, accessibility,
bundle / zero-dep claim, theming, docs app, code quality (Svelte 5 + TS),
CI / release, `@dryui/lint` rule coverage, feedback + plugin bundling.
**Lens:** does a library called "DryUI" actually practice DRY internally,
where is the dead code, and what will materially improve the project?

---

## TL;DR

1. **The library's own DRY story is weaker than its name suggests, but the
   surrounding platform is strong.** Keyboard/dismiss logic, variant-prop
   plumbing, and positioned-popover glue are copy-pasted across 7+
   components; Dialog/Drawer/AlertDialog are ~95% identical. Estimated
   ~2000 lines reducible.
2. **Documented-but-unenforced: `!important`.** CLAUDE.md lists it as a
   hard rule; `@dryui/lint` has no rule for it. That is the single highest
   trust defect — the rule catalog enforces 13/14 CSS discipline rules
   correctly; the 14th is the one that promised a guarantee it can't keep.
3. **CLAUDE.md says `check` replaced `review/diagnose/lint/doctor` — the
   CLI still ships full parallel implementations of all four.** Biggest
   dead-code delete in the repo.
4. **Test coverage is ~19%.** 29 of 150 UI components have browser tests;
   Button, Input, Dialog, Select, Checkbox, Textarea, Tabs, Table are
   among the untested. Largest correctness risk.
5. **Theme tokens are 74% dead.** 74 of 101 semantic color tokens in
   `default.css` are unused by components. Dark mode drifts from light
   (utilities only defined once, dark adds tokens light doesn't).
   Component tokens (`--dry-toggle-*`, `--dry-beam-*`) hardcode brand
   values instead of referencing semantic tokens — brownfield overrides
   silently don't apply.
6. **Docs coverage mirrors test coverage.** 115+ components lack demo
   pages. Two orphan route directories (`/changelog/`, `/layouts/`).
7. **Build pipeline double-compiles.** `build:packages` and
   `build:docs:deps` rebuild lint/primitives/ui/feedback/mcp. Tree-shaking
   is silently broken — no `sideEffects: false` on any package, so subpath
   exports can't deliver their promise to consumers.
8. **Svelte 5 / TypeScript hygiene is genuinely excellent.** Zero legacy
   `export let`, `$:`, `<slot>`, `onMount`, `createEventDispatcher`. Three
   `@ts-ignore` / `@ts-expect-error` in the whole of `primitives` + `ui`,
   each load-bearing for browser APIs not yet in the TS lib (CSS Anchor
   Positioning, EyeDropper). This is the best-kept room in the house.
9. **`init` skill has no source of truth.** Only exists inside
   `packages/plugin/skills/init/`; `scripts/sync-skills.ts` handles
   `dryui` and `live-feedback` but not `init`. Any edit there will either
   drift from nothing or be stomped by a future sync extension.
10. **Repo hygiene is mostly good.** `.gitignore` covers the cruft; five
    `tmp-borderbeam-*.png` files at root are untracked but visible noise.

**The repo is in good shape overall.** The Svelte 5 rewrite is clean, the
theming architecture is thoughtful, the MCP surface is minimal, the lint
preprocessor is the right choice, and the CI has been simplified to two
workflows. Most findings below are consolidations: collapse
documented-but-drifted, delete superseded-but-still-wired, and factor
internal duplication out of the component layer.

---

## Meta observation: the DRY claim

The project name sets an expectation. The platform around the library lives
up to it — one `spec.json`, one `composition-data.ts` consumed by CLI and
MCP, one skill source synced to plugin + cursor, one `validate.ts`
orchestrating the dependency graph. The public story is coherent.

Inside `packages/ui`, the picture inverts. Each content component carries
its own escape handler, its own dismiss logic, its own `data-variant` /
`data-size` / `data-color` plumbing. A primitive exists for positioning
popovers, but every consumer re-wraps it with identical lifecycle glue.
Three modal components share 95% of their implementation and are shipped
as three components. The theme side repeats the pattern at a smaller
scale: 74 declared-but-unreferenced color tokens, with component-level
tokens hardcoding brand values instead of referencing the semantic tier
they're one `var()` away from using.

The refactor is mechanical, not architectural. Factor the repeated
behavior into primitives + helpers, and UI components shrink to thin
composition.

---

## What's working well

These patterns are the foundation of the rest of the review — preserve and
extend them, do not disrupt.

- **Svelte 5 migration is pristine.** 782 `children?: Snippet` + `{@render}`
  instances, zero `<slot>`; 50+ `$bindable()` usages; no `export let`,
  no `$:`, no `createEventDispatcher`, no `onMount`. This is a
  reference-grade Svelte 5 codebase.
- **TypeScript strictness is at the top of the industry.** Root
  `tsconfig.json` has `strict: true`, `noUncheckedIndexedAccess: true`,
  `exactOptionalPropertyTypes: true`. Only three escape hatches in the
  entire library, all load-bearing for experimental browser APIs.
- **Prop naming is unusually consistent.** `size`, `variant`, `color`,
  `disabled`, `class: className`, `onValueChange` / `onSelect` / `onDismiss`
  callbacks — the 150-component API feels designed, not accreted.
- **`validate.ts` orchestration.** Four-phase dependency graph,
  fail-fast on lint, parallel where safe, no internal rebuild duplication.
- **`composition-data.ts` is a genuine single source of truth.** Both CLI
  and MCP consume it cleanly. No parallel rule tables.
- **MCP surface is exactly `ask` + `check`.** No legacy drift. TOON
  formatter lives in one place (`packages/mcp/src/toon.ts`) and is reused.
- **Skill sync is safe and verified.** One-way from source to plugin +
  cursor; `verifySyncedTree` catches drift.
- **`@dryui/lint` catalog is 13/14 correct.** Well-tested, line-indexed,
  comment-aware, directory-scoped. The one missing rule is the most
  frequently documented rule in the repo — see C4.
- **Theme wizard engine is sound.** Deterministic HSB→HSL→RGB, APCA
  contrast hand-rolled and tested (1572 lines), zero dependencies.
- **Test harness is clean.** `tests/browser/_harness.ts` is a single
  well-typed mount/cleanup. Adding missing tests is mechanical.
- **Feedback end-to-end flow is cleanly wired.** Browser → HTTP →
  SQLite → MCP → agent. No gaps in the chain.
- **CI is minimal.** Two workflows (`validate.yml`, `release.yml`) with
  the recent deploy-docs consolidation. No obvious over-engineering.

---

## Findings by severity

### Critical — fix first

**C1. Legacy CLI commands still shipping as full parallel implementations.**
`packages/cli/src/index.ts:165-176` wires up `review`, `diagnose`, `lint`,
`doctor` with separate command files (`packages/cli/src/commands/review.ts`,
`diagnose.ts`, `lint.ts`, `doctor.ts`). Each reaches into the MCP tool layer
with its own TOON-formatting path, duplicating what
`packages/mcp/src/tools/check.ts:103-224` now does. CLAUDE.md already
documents `check` as the replacement. Options:

- Alias all four to `check` with path routing (`.svelte` → component
  review, `.css` → theme diagnose, no path → workspace scan), or
- Delete all four — the repo is pre-alpha and CLAUDE.md says "prefer
  current behavior over legacy compatibility".

**C2. `!important` rule is documented-but-unenforced.**
CLAUDE.md CSS Discipline: _"Never use `!important` — fix specificity at
the source"_. `@dryui/lint` has no such rule in `rule-catalog.ts`, and
`rules.ts` contains no regex for it. The other 13 CSS rules are all
implemented and tested. This one rule is the only
documented-but-unenforced guarantee in the catalog. Add
`dryui/no-important` (regex against `!important` outside comments); it's
an afternoon's work and closes the biggest trust defect in the review.

**C3. Test coverage ~19% on the flagship artefact.** 120+ components in
`packages/ui/src/` have no browser test. Untested list includes the most
basic and most-imported: Button, Input, Checkbox, Dialog, Drawer, Select,
Textarea, Radio, Tabs, Table, Pagination, Card. The 29 covered components
share a single clean harness (`tests/browser/_harness.ts`). Prioritize
Button, Input, Checkbox, Select, Dialog first.

**C4. Keyboard / dismiss / escape logic reimplemented across 7+
components.** Found in `popover-content`, `mega-menu-root`,
`menubar-button-trigger`, `context-menu-content`, `hover-card-content`,
`combobox-input`, `navigation-menu-trigger-button`. No shared
`createEscapeHandler()` / `createDismiss()` export from primitives.
Arrow-key menu navigation is separately duplicated in
`dropdown-menu-content`, `context-menu-content`, `menubar-content` with
identical `focusItem()` clamping. This is the DRY-inside-DryUI hotspot.

**C5. `init` skill has no source of truth.**
`packages/plugin/skills/init/` exists; `scripts/sync-skills.ts` handles
`packages/ui/skills/dryui/` → plugin and `packages/feedback/skills/live-feedback/`
→ plugin, but **init is plugin-native** with nothing upstream. A future
sync extension or regeneration will silently erase it, and right now there
is no repository convention for where to edit it. Either move it to a
source location (e.g. `packages/cli/skills/init/`) and extend
`sync-skills.ts`, or explicitly document it as plugin-native.

**C6. No `sideEffects: false` on any package — tree-shaking is a false
promise.** `packages/primitives/package.json` and `packages/ui/package.json`
define ~150 subpath exports each, implicitly promising that
`import { Button } from '@dryui/ui'` (or the subpath form) won't pull the
whole library. Without `"sideEffects": false`, bundlers can't prove
removal safety and ship everything. This silently inflates every
consumer's bundle. Add the field; verify with a real-world bundle test.

### Significant

**S1. Positioned-popover setup boilerplate duplicated across 6
consumers.** Primitives export `createPositionedPopover`, but `popover`,
`dropdown-menu`, `tooltip`, `hover-card`, `link-preview`, `context-menu`
each wrap it with identical `$effect()` lifecycle glue. Make the primitive
a compound component that owns the effect.

**S2. Variant-prop plumbing is copy-pasted.** Button, Badge, Chip, and
essentially every styled element manually sets `data-variant`,
`data-size`, `data-color` with the same conditional shape. A tiny
`applyVariantAttrs(node, { variant, size, color })` action or
`<VariantRoot>` wrapper removes the repetition without affecting the
scoped-styles rule.

**S3. Build pipeline double-compiles.** `package.json:11-14` has
`build:packages` compile lint/primitives/ui/feedback/mcp/feedback-server/
cli sequentially, and `build:docs:deps` then re-compiles lint/primitives/
ui/feedback/mcp/theme-wizard. `bun run build` calls both, so the shared
subset rebuilds twice. Consolidate into one `build:packages` that
includes theme-wizard; have `build:docs` depend on it.

**S4. Dialog / Drawer / AlertDialog are ~95% identical.** Each re-declares
click-outside + escape logic. Drawer adds one `side` prop; AlertDialog
specializes button semantics. A single `<Modal>` primitive with side-sheet
mode as a variant would collapse three components to one, with
Dialog/Drawer/AlertDialog as thin presets.

**S5. 74% of color tokens are dead surface.** `packages/ui/src/themes/default.css`
declares 101 semantic color tokens; only 27 are referenced by components.
Entire brand family (lines 38–49), most semantic extensions (56–93), and
component-specific toggles (95–106) are unused. Audit and delete or
explicitly document as reserved.

**S6. Component tokens hardcode brand instead of referencing semantics.**
`--dry-toggle-track-bg: rgba(0, 21, 128, 0.04)` in `default.css:95-106` and
the matching dark.css block are literal copies, not `var(--dry-color-fill-brand-weak)`.
This silently breaks the documented brownfield override story: a consumer
who overrides `--dry-color-fill-brand` will get brand-coloured buttons
and blue toggles. Fix each `--dry-toggle-*`, `--dry-beam-*`, and sibling
to reference the semantic tier.

**S7. 115+ components are missing docs demo pages.** Gap includes
AffixGroup, AppFrame, ChatMessage, EmptyState, Footer, Hero, LogoCloud,
PageHeader, StatCard, Surface, WaveDivider, Tooltip, Toolbar, Toast,
Tree, Typography, VirtualList, etc. The component catalog has dead links
where demos don't yet exist, and new components added to `spec.json`
aren't paired with demo pages by any build step. This is the adoption
risk: a component library's docs coverage is its product.

**S8. Accessibility defects in shared infrastructure.** Each one is small
in isolation; together they affect most overlay components:

- `packages/ui/src/internal/close-button-base.svelte:20` — icon-only
  close button renders `&times;` with `aria-hidden="true"` and no
  `aria-label`. Used by Alert, Dialog, Drawer, AlertDialog, and more. One
  line fixes many components.
- `packages/ui/src/tree/tree-item-label.svelte:17` — `<div role="button"
tabindex={0}>` with manual keyboard handling. Should be `<button>`.
- `packages/ui/src/tabs/tabs-content.svelte:22` — `tabindex={0}` on
  `[hidden]` tabpanel puts hidden content in the tab order.
- Multiple components (`accordion-button-trigger`, `dialog-content`,
  `drawer-dialog-content`, `alert-dialog-content`, `dropdown-menu-content`)
  have `transition:` / `transform:` without a
  `@media (prefers-reduced-motion: reduce)` rule. The library already
  shows this pattern is respected in ~30 other components, so adding it
  here is copy-paste work.
- `packages/ui/src/hover-card/hover-card-content.svelte:54` — `role="dialog"`
  on a hover-triggered popover with no keyboard dismissal path. Either
  drop the role or support keyboard.

**S9. Documentation says the CSS discipline rules in four places.**
`CLAUDE.md:212-227`, `AGENTS.md:36-42`, `CONTRIBUTING.md:30-38`, and
`packages/ui/skills/dryui/SKILL.md` all carry versions. The skill source
is correctly the canonical copy (synced to `.cursor/rules/` and
`packages/plugin/skills/`). Replace the three duplicates with cross-links.
Same pattern applies to CLI install snippets (README, CLAUDE.md,
AGENTS.md, `llms.txt` all repeat them; `apps/docs/src/lib/ai-setup.ts` is
already correctly canonical).

**S10. Lint tests live outside the package they test.** `check:lint` runs
`tests/unit/lint-rules.test.ts` and `tests/unit/lint-preprocessor.test.ts`
against `@dryui/lint`. Colocate next to the existing
`packages/lint/src/rule-catalog.test.ts`.

**S11. Undisclosed `lucide-svelte` peer dependency in "zero-dep"
packages.** `packages/theme-wizard/package.json` and
`packages/feedback/package.json` both declare `"lucide-svelte": ">=1.0.1"`
as a peer dep. The README headlines "zero-dependency Svelte 5 components"
— that claim is true for `@dryui/primitives` and `@dryui/ui`, false for
theme-wizard and feedback. Either remove the icon dep (re-export an icon
component from `@dryui/ui`, or use inline SVG) or update the headline
claim to name the scope.

**S12. Orphan routes in the docs app.** `apps/docs/src/routes/changelog/`
and `apps/docs/src/routes/layouts/` exist as empty directories with no
`+page.svelte`. Either build the pages or delete the directories; right
now they're nav 404s waiting to happen.

### Minor / hygiene

**M1. `check:lint` is orphaned.** `package.json:31` defines it but the
main `check` target uses `check:lint:violations` instead. Either fold
in or rename to `check:lint:unit`.

**M2. `scripts/publish.ts` vs `scripts/publish-packages.ts`.** Two
publish scripts, same helpers. Only `publish-packages.ts` is wired into
the release flow. Delete `publish.ts` or document the manual-publish
use case.

**M3. `packages/cli/src/format.ts` is largely vestigial.** CLI commands
import `toonWorkspaceReport` directly from MCP and only use
`severityLabel()` / `formatCssVarList()` from `format.ts`. Inline or
rename to reflect the narrow role.

**M4. CLI reaches into `packages/mcp/src/spec.json` directly.** Add
`"./spec.json": "./src/spec.json"` to `packages/mcp/package.json`
exports and import as `@dryui/mcp/spec.json`.

**M5. Root-level PNGs.** Five `tmp-borderbeam-*.png` files at the repo
root, each 300–600 KB. Untracked, visible in `ls`. Delete.

**M6. Orphan top-level directories.** `benchmarks/`, `diagram-samples/`,
`theme-inspo/`, `vendor/`, `test-projects/`, `reports/` — none tracked
as cruft, but none justified by a 1-line README either. Decide per-
directory.

**M7. Manual audit scripts not in CI.** `benchmark-visual-checks.ts`,
`dogfood-audit.ts`, `export-figma-file-inventory.ts`,
`generate-component-screenshots.ts`. Either wire into `validate` / a
cron, or explicitly document as manual in CONTRIBUTING.

**M8. 19 primitives are exported but not wrapped by UI.** `AffixGroup`,
`SelectableTileGroup`, `AppFrame`, `Surface`, `Footer`, `PageHeader`,
`Hero`, `LogoCloud`, `WaveDivider`, and siblings. May be intentional
headless-for-consumers exports, but if so, document it. Otherwise drop.

**M9. Marketplace schema divergence.** `.claude-plugin/marketplace.json`
and `.agents/plugins/marketplace.json` both point to `packages/plugin`
but use different schemas (owner, metadata fields, source format). Each
works today; a future marketplace engine version may not. Standardize
the shared portion.

**M10. CLI ↔ feedback-server transitive dep is structurally fragile.**
`packages/cli/package.json` hard-requires `"@dryui/feedback-server":
"^0.3.5"`. Recent commit history (`3930288c fix(cli): bump to force
re-resolve of feedback-server transitive dep`) shows this has bitten
already. Make the dep optional (lazy-load when the live-feedback flow
runs), or document why it must be a hard runtime dep.

**M11. Docs app has no shared `<DocsDemo>` / `<Example>` wrapper.** Every
component demo rolls its own grid scaffolding. Factor one wrapper, apply
it across demos. This is DRY inside the docs app, mirroring the DRY
inside the library.

**M12. `init` skill missing description metadata.** `packages/plugin/
skills/init/SKILL.md` has `name: init` but no `description:` frontmatter,
falling back to a generic string in `sync-skills.ts`. Cosmetic but the
only skill in the repo with this gap.

**M13. Mapbox token hard-gates the whole docs build for one component.**
`PUBLIC_MAPBOX_TOKEN` is required for `build:docs`; only `Map.svelte`
uses it. Make the dep optional (conditional import + fallback render),
or clearly document the local-dev workaround.

**M14. Export-swap publish machinery is complex and fragile.**
`scripts/publish-packages.ts` + `scripts/lib/export-swap.ts` work around
changesets not running `prepack`. The recent `fix(release): rebuild
feedback-server + verify every dist before publish` commit reads as a
near-miss. Consider (a) moving `swapExportsForPublish` outside the
try/catch so partial swaps fail loud, (b) verifying dist before swap
rather than after, and (c) a pre-publish CI check that no published
tarball contains `workspace:*`.

**M15. Dark-mode theme tokens drift from light.** `dark.css` has 150+
tokens not in `default.css` (glass, glow, gradient, grain, scrollbar
extras); `default.css` has 130+ utility tokens (`--dry-space-*`,
`--dry-radius-*`, `--dry-font-*`) not duplicated into `dark.css`. The
non-color utilities are mode-independent and shouldn't be mode-gated;
the dark-mode extensions should be documented. Move shared utility
tokens into a separate import, keep mode files for color-only overrides.

---

## Recommended action order

Ordered by leverage (impact ÷ effort), not severity alone. Items 1–4 are
same-day wins; 5–9 are week-scale cleanups; 10+ are ongoing quality work.

1. **Add `dryui/no-important` to `@dryui/lint` (C2).** Close the trust
   defect. ~1 hour.
2. **Add `"sideEffects": false` to primitives + ui package.json (C6).**
   Verify with a consumer-bundle smoke test. ~1 hour.
3. **Resolve the `init` skill source-of-truth (C5).** Move it to a source
   dir and teach `sync-skills.ts`, or add a README clarifying plugin-native.
   ~1 hour.
4. **Delete the five root-level `tmp-borderbeam-*.png` files + decide on
   orphan dirs (M5, M6, S12).** 15 minutes.
5. **Remove or alias the legacy CLI commands (C1).** Biggest single
   dead-code delete in the repo. ~2 hours.
6. **Extract shared keyboard/dismiss/popover primitives (C4, S1).** Start
   with `createEscapeHandler` and `createMenuNavigation`; then the compound
   positioned-popover. Halves the surface area to maintain. ~half-day per
   primitive.
7. **Fix the a11y defects in shared infrastructure (S8).** CloseButtonBase
   `aria-label`, tree-item `<button>`, Tabs `tabindex` guard, reduced-motion
   on modal transitions. Single-line fixes each, ~1–2 hours total.
8. **Consolidate build pipeline (S3).** One `build:packages`, have
   `build:docs` depend on it. ~1 hour.
9. **Collapse CSS-discipline + install-snippet docs (S9).** Replace
   duplicates with cross-links. ~1 hour.
10. **Audit theme tokens (S5, S6, M15).** Delete 74 unused tokens,
    rewrite `--dry-toggle-*` / `--dry-beam-*` as `var()` references,
    separate utility tokens from mode-specific ones. ~half-day.
11. **Browser tests for the core-ten components (C3).** Button, Input,
    Checkbox, Select, Dialog, Drawer, Textarea, Radio, Tabs, Card.
    ~1 day.
12. **Docs demo pages for the highest-value untested components (S7).**
    Start with the 30 most-searched-for. Consider a scaffold generator
    wired into `check:docs` so adding a component to spec.json without a
    demo fails the build. ~1 week of authoring.
13. **Collapse Dialog/Drawer/AlertDialog (S4).** Bigger refactor;
    schedule after the primitive extraction.
14. **Move lint tests into `packages/lint/src/` (S10).** ~1 hour.
15. **Address theme-wizard / feedback peer-dep disclosure (S11).** Either
    remove the `lucide-svelte` peer dep (export icons from `@dryui/ui` or
    inline SVGs) or update the "zero-dep" claim to scope it precisely.
    ~half-day.
16. **Minor hygiene (M1–M4, M7, M9–M14).** Folded into normal maintenance.

---

## What I still didn't cover

- **Real bundle measurements.** Flagged sideEffects, didn't measure
  actual treeshake loss. A single browser-bundle smoke test on a
  representative subset would quantify the win.
- **Performance.** Nothing ran; any O(n²) rendering in Table / DataGrid /
  Tree / VirtualList hasn't been proven.
- **Visual-regression drift.** `screenshots:components` + docs visual
  tests exist but don't run in CI; no empirical statement about
  regressions.
- **Contract test of `generateSpec → spec.json → CLI consumption`.**
  Individual pieces are tested; the round trip isn't gated.

These are follow-ups, not prerequisites for shipping any of the
recommendations above.

---

_End of review._
