# @dryui/lint

## 1.0.0

### Major Changes

- [`84d4fe8`](https://github.com/rob-balfre/dryui/commit/84d4fe80964c3cbfcb14c317ff0e7e45a18892aa) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Delegate design guidance to impeccable.

  DryUI no longer ships design opinion. All design-quality flows (brief, critique, polish, visual review, anti-pattern detection) are delegated to [impeccable](https://impeccable.style), an Apache-2.0 design skill + CLI. DryUI keeps its core: components, tokens, contracts, a11y mechanics, framework patterns.

  ### Breaking changes
  - `@dryui/mcp`: removed `check-vision` tool (visual rendered critique), `runVisionCheck`, `analyzeDesignBrief`, `loadDesignBrief`, the reviewer/rubric engine, and design-focused diagnostic enrichment. `check` no longer accepts `--polish` / `--no-polish` / `visualUrl`. `ask` no longer has an anti-pattern scope.
  - `@dryui/lint`: removed all 14 `polish/*` rules (raw-heading, raw-paragraph, raw-img, raw-icon-conditional, badge-plural-mismatch, page-header-meta-mixed-variants, raw-ref-id-needs-wrap, ad-hoc-enter-keyframe, keyframes-on-interactive, solid-border-on-raised, symmetric-exit-animation, nested-radius-mismatch, numeric-without-tabular, inter-tabular-warning, missing-theme-smoothing). Correctness and a11y rules unchanged.
  - `@dryui/cli`: `dryui check --visual` and `--polish` flags removed. `dryui check` runs contracts / a11y / tokens / CSS discipline only. `dryui init` now prompts to install impeccable alongside DryUI.
  - `@dryui/ui` + `@dryui/plugin`: `design-brief.md` and `design.md` rule files removed from the skill bundle; canonical `SKILL.md` pipeline rewritten from 8 steps to 4 (brief → lookup → implementation → deterministic check) with a pointer to `/impeccable` for design flows.
  - `@dryui/feedback-server`: removed `FEEDBACK_POLISH_PROMPT_STEP` and `FEEDBACK_VISUAL_PROMPT_STEP`; feedback prompt templates collapsed to 7 steps.
  - `PRODUCT.md` and `DESIGN.md` at the project root are now impeccable-owned. DryUI tools no longer read or write them.

  ### Migration
  1. In a DryUI project: run `npx impeccable skills install` (or re-run `dryui init` in an existing project).
  2. Replace `dryui check --visual <url>` calls with `/impeccable critique <target>` or `/impeccable polish <target>` invoked from your AI harness.
  3. Replace `dryui check --polish` with `npx impeccable detect <path>` for static anti-pattern detection.
  4. If your workflow read `DESIGN.md` via DryUI tooling, migrate to `/impeccable teach` to scaffold both `PRODUCT.md` and `DESIGN.md` under impeccable's ownership.

  See the repo `NOTICE.md` for attribution. See [impeccable.style/cheatsheet](https://impeccable.style/cheatsheet) for the full command catalog.

### Patch Changes

- [`fa70e67`](https://github.com/rob-balfre/dryui/commit/fa70e67805142402cd4e1060f789270e014e7448) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `hasAllowComment` now walks back through CSS continuation lines and also accepts allow markers placed inline before the violation on the same line. Previously, multi-line declarations like `box-shadow:\n\tinset 0 1px 0 ...,\n\tinset 0 -1px 0 ...;` ignored a `/* dryui-allow inset-shadow */` written above the property, because the property declarator and the matched `inset` keywords sat on different lines. Trailing CSS comments no longer mask the `;` / `{` / `}` terminator that gates which declaration an allow comment applies to.

## 0.7.1

### Patch Changes

- [#30](https://github.com/rob-balfre/dryui/pull/30) [`b0d3b1e`](https://github.com/rob-balfre/dryui/commit/b0d3b1e8200d5a2e0cad10c5dafdcbf7f510eaf6) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Introduce the DESIGN.md brief pipeline: `check-vision` auto-discovers the nearest `DESIGN.md` and threads it into the visual rubric, `check` diagnoses brief structure, and the dryui/plugin/ui skills document a user-brief → DESIGN.md → component-lookup → polish → check loop so design identity stays visible instead of implicit in agent taste.

## 0.7.0

### Minor Changes

- [#28](https://github.com/rob-balfre/dryui/pull/28) [`ed72d91`](https://github.com/rob-balfre/dryui/commit/ed72d91d5919fb00d24727ef438b0945dec84a4c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Close the gap between the static linter and how UIs actually render. Two parallel tracks: structural component fixes that make four classes of design bugs impossible at the source, and a new vision-critique tool that catches the residue.

  **Components (`@dryui/ui`, `@dryui/primitives`)**
  - `Badge`: container switched from `inline-grid; place-items: center` to `inline-grid; grid-auto-flow: column; align-items: center; gap`. Children with both an `<Icon>` and a text node now sit inline instead of stacking icon-above-text. The icon-only fast path is unchanged.
  - `Badge`: now reads `variant`, `color`, and `size` from `PAGE_HEADER_META_CONTEXT` when no explicit value is passed, so consumers can hoist the variant decision to the row.
  - New `<Pluralize count={n} singular="hotel" plural="hotels" />` (or shorthand `noun="pax"`). Renders with `tabular-nums` + `nowrap`. Eliminates `1 hotels` mismatches at the source.
  - New `<RefId>` (optional `prefix` prop). Wraps reference IDs in `nowrap` + tabular-nums + monospace so tokens like `BA-3490221` never break mid-token.
  - `PageHeader.Meta` accepts optional `variant` / `color` / `size` props that propagate to descendant `Badge` instances via context. Also enforces a wrapping chip flow row at the layout level.

  **Lint rules (`@dryui/lint`)**
  - `polish/badge-plural-mismatch`: flags `{count} word` patterns inside `<Badge>` that risk plural mismatch; suggests `<Pluralize>`.
  - `polish/page-header-meta-mixed-variants`: flags `<PageHeader.Meta>` rows that mix Badge variants without a parent variant; suggests hoisting the variant.
  - `polish/raw-ref-id-needs-wrap`: flags raw `[A-Z]{2,4}-\d{5,}` literals not wrapped in `<RefId>`.

  **Vision-critique tool (`@dryui/mcp`, `@dryui/cli`)**
  - New MCP tool `check-vision` and CLI subcommand `dryui check-vision <url>`. Renders the URL in headless Chromium, screenshots it, and sends the PNG plus a taste rubric (chip wrap, plural mismatch, variant mix, mid-token break, contrast, alignment, orphan, spacing rhythm) to the Codex CLI. Returns TOON findings + JSON.
  - Requires the Codex CLI on PATH and an authenticated Codex session.
  - `@dryui/mcp` reviewer's `prefer-grid-layout` rule now respects the same `[data-chip-group]` selector carve-out and `/* dryui-allow flex */` per-declaration opt-out that `@dryui/lint`'s `dryui/no-flex` already honors, so the two surfaces agree.

  The static linter has a hard ceiling: it cannot see runtime wrap, plural agreement, contrast against live data, or alignment drift. This pair (component-layer impossibility + VLM critique) covers the gap.

## 0.6.0

### Minor Changes

- [`5e82614`](https://github.com/rob-balfre/dryui/commit/5e8261432d89625774e6ca528b216e62deddff66) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Bake Jakub Krehel's 11 interface-polish principles into DryUI: new concentric-radius / motion / numeric / optical tokens; `--dry-shadow-{sm,md,lg,xl}` redefined with a 3-layer edge + contact + ambient recipe (plus `-hover` variants and dark/midnight/aurora/terminal overrides); Card drops its default 1px border in favour of shadow-only chrome (with `bordered` escape hatch); Separator gains `variant="shadow"`; Image + Avatar switch inset box-shadow to outline; Button gains optical `:has()` padding trim + `data-dry-icon` marker on Icon; Field.Root gains `nestRadius`; Badge gains `numeric`; RelativeTime + FormatDate pick up tabular-nums via `--dry-numeric-variant`; overlay radii (Dialog, Popover, DropdownMenu, ContextMenu, Menubar, Toast, Tooltip, Drawer, CommandPalette) consume per-container tokens.

  New primitives: `<IconSwap>`, `<Numeric>`, `<Enter>`, `<Exit>`, `<Stagger>` components plus `enter` / `leave` Svelte transition functions exported from `@dryui/ui/motion`.

  Check surface: `@dryui/lint` gains a `category: 'polish' | 'correctness' | 'a11y'` field on `RuleCatalogEntry`, 12 new `polish/*` rules (raw-heading, raw-paragraph, raw-img, raw-icon-conditional, nested-radius-mismatch, missing-theme-smoothing, numeric-without-tabular, inter-tabular-warning, keyframes-on-interactive, ad-hoc-enter-keyframe, symmetric-exit-animation, solid-border-on-raised), a `checkTheme()` export for theme-file polish rules, and `checkSvelteFile` / `checkStyle` / `checkMarkup` / `checkScript` all accept a `categoryFilter`. The `@dryui/lint` preprocessor now filters by severity so only `error`-severity violations block the build; suggestion/warning/info print but don't fail CI. `@dryui/mcp` `check` accepts `scope: 'polish' | 'no-polish'`, and `renderTheme` omits the coverage field from its header when the theme-correctness audit is scope-skipped.

  Docs: new `/docs/polish-pass` page and ten composition recipes (typography, concentric-radius, icon-swap, numeric-display, interactive-motion, stagger-entrance, exit-animation, shadow-as-border, icon-in-button, image-edge).

## 0.5.1

### Patch Changes

- [`eca0978`](https://github.com/rob-balfre/dryui/commit/eca0978a6b6625b0ce2f6e7f8a63164d1c606734) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Declare `files: ["dist"]` explicitly. Without it, `npm pack` inside the workspace excluded `dist/` because the repo-level `.gitignore` ignores it — a hygiene hole that `publint`/`attw` now catch via the new `check:publish-hygiene` gate.

## 0.5.0

### Minor Changes

- [`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Two new diagnostics and a softening of the width rule:
  - `dryui/no-width` now allows `ch`, `ex`, and `em` units. These track text content (typographic measure), not viewport layout, so `max-width: 55ch` for body copy is sanctioned. Pixel/viewport units (`px`, `rem`, `vw`, `%`, etc.) are still flagged.
  - `dryui/no-flex` carves out `[data-chip-group]`. ChipGroup.Root is now the sanctioned home for `flex-wrap`, since chip/tag clusters need content-driven flow that grid cannot express cleanly.
  - New `theme-import-order` rule (error) catches `+layout.svelte` and similar files that import local CSS BEFORE `@dryui/ui/themes/*.css`. Local `--dry-*` overrides only win when the theme defaults are imported first.
  - New `partial-override` diagnostic (info) flags non-theme files that override 1-10 `--dry-*` tokens at `:root`. Suggests scoping the overrides under `.page`/`body`, moving them to a per-route component `<style>`, or promoting the file to a full theme via `*.theme.css` or a `/* @dryui-theme */` directive.

## 0.4.3

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

## 0.4.2

### Patch Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

## 0.4.1

### Patch Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

## 0.4.0

### Minor Changes

- [`b61f462`](https://github.com/rob-balfre/dryui/commit/b61f462239c87eb7633430637ea29ff766691715) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Collapse the DryUI MCP runtime surface from the old multi-tool menu to two tools: `ask` and `check`.

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

## 0.3.0

### Minor Changes

- [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add shared state tokens: `--dry-focus-ring` and `--dry-state-disabled-opacity` (duration tokens `--dry-duration-fast`/`--dry-duration-normal`/`--dry-duration-slow` and `--dry-ease-default` already existed and are now the single source of truth).

  Migrated 37 focus-ring sites, 17 disabled-state sites, and 11 raw-duration sites in `@dryui/ui` to consume these tokens (the two flip-card sites intentionally retain `var(--dry-flip-card-duration, 0.6s)` for the long flip animation). Consumers can now restyle focus and disabled state by overriding a single CSS variable.

  `@dryui/lint` gains a new `dryui/prefer-focus-ring-token` rule that flags any new occurrences of `outline: 2px solid var(--dry-color-focus-ring)` literals in scoped styles.

## 0.2.0

### Minor Changes

- [`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Review-driven improvements from dogfooding a flight search app.

  **@dryui/ui**
  - Add `LogoMark` component for brand marks, status indicators, and category badges
  - Add `options` prop shorthand to `Select.Root` for simple dropdowns (`<Select.Root options={['A','B']} />`)

  **@dryui/primitives**
  - Add `options` and `placeholder` props to `SelectRootProps`

  **@dryui/mcp**
  - Add `tokens` tool for `--dry-*` CSS token discovery with category filtering
  - Batch-friendly `info` tool — accepts comma-separated component names
  - Smarter `prefer-grid-layout` reviewer suggestion — suppresses for complex grids (>3 tracks, named areas, subgrid, minmax, repeat)
  - Add `aligned-card-list` composition recipe (CSS subgrid pattern)

  **@dryui/cli**
  - Add `tokens` command for `--dry-*` CSS token listing
  - Batch-friendly `info` command — accepts comma-separated names

  **@dryui/lint**
  - Allow `display: inline-flex` (no longer flagged by `dryui/no-flex`)
  - Add `/* dryui-allow flex */` comment to suppress flex violations per declaration

## 0.1.0

### Minor Changes

- [`161f077`](https://github.com/rob-balfre/dryui/commit/161f077c053f1755c585932487e92f5ff289ba9b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `dryui/no-global` lint rule that bans `:global()` selectors in `<style>` blocks. Use scoped styles, `data-*` attributes, CSS variables, or component props instead.
