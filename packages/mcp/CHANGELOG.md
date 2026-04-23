# @dryui/mcp

## 2.4.0

### Minor Changes

- [`e1b4091`](https://github.com/rob-balfre/dryui/commit/e1b4091d641048b4db8844c3956da59c74fad9e6) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Migrate component metadata to per-component `<name>.meta.ts` sibling files (Plan Phase 2).
  - New `@dryui/mcp/define` subpath export exposes `defineComponent` (Zod-validated config) and `createLibrary` (indexed by name, category, tag, surface) for downstream tooling and generators.
  - New `load-component-meta.ts` glob-scans `packages/ui/src/**/*.meta.ts` and `packages/primitives/src/**/*.meta.ts` and returns the same `Record<string, ComponentMetaEntry>` shape the old `componentMeta` catalog exported.
  - `generate-spec.ts` now loads meta files as the single source of truth; `spec.json` and `agent-contract.v1.json` are byte-stable after the migration.
  - `component-catalog.ts` trimmed from 1119 to 293 lines: the 160-entry `componentMeta` record and the `primitiveComponentNames` helper are gone. Nav curation (`docsNavCategories` / `docsNavComponentNames`) and the skill compound list (`skillCompoundComponents`) remain as they are authoritative for a different surface.
  - `scripts/generate-component-meta.ts` regenerates the `.meta.ts` files from the current component set; re-runnable and idempotent.

  No runtime behaviour changes for consumers; this is a build-time refactor that kills the catalog drift risk called out in the plan.

- [`954fcab`](https://github.com/rob-balfre/dryui/commit/954fcab90d767b79261e384e8185fdd9a2907616) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Consolidate docs, skills, and plugin parity surfaces (Plan Phase 6).

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

- [`0a51dd8`](https://github.com/rob-balfre/dryui/commit/0a51dd88a3cdd645f73fde30e0e39d002433bc95) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the structured repair loop for agent-driven fixes (Plan Phase 4).
  - New `@dryui/mcp/repair` subpath export with `DryUiRepairIssue`, `enrichDiagnostic`, `knownHintCodes`, and `runCheckStructured`.
  - The `check` MCP tool now returns both the TOON summary (human-readable) and a second content block containing a JSON-fenced `dryui-diagnostics` payload (machine-readable). Agents can parse the latter for repair loops. The JSON block is `{ summary, diagnostics }`, where `summary` exposes `hasBlockers`, `autoFixable`, and per-severity `counts` computed from the enriched diagnostics so it agrees with the TOON header.
  - Diagnostics carry a namespaced `code` (`lint/dryui/*`, `theme/*`, `workspace/*`, `parse/*`), `hint` (prescriptive "do X" guidance, not just diagnostic prose), and `docsRef`. Hint registry covers all 15 DryUI lint rules, `project/theme-import-order`, 11 theme-checker codes, and a parse-error fallback. Unknown codes round-trip without a hint so agents degrade gracefully.
  - New `self-correction` recipe in composition-data documenting the intended write, check, enrich-hint, edit, re-check loop.

### Patch Changes

- Updated dependencies [[`eca0978`](https://github.com/rob-balfre/dryui/commit/eca0978a6b6625b0ce2f6e7f8a63164d1c606734)]:
  - @dryui/lint@0.5.1

## 2.3.1

### Patch Changes

- [`54d061d`](https://github.com/rob-balfre/dryui/commit/54d061d19c464d9ea45f1ed46d2c92495da59a47) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add generated agent contract artifacts and a minimal `dryui prompt --component` command.

## 2.3.0

### Minor Changes

- [`f16e759`](https://github.com/rob-balfre/dryui/commit/f16e7598da88d5d4ddf313c27c3db1b822dad596) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `maxMeasure` prop to `Heading` and `Text` for ergonomic headline and body widths in ch units (narrow | default | wide | false). Heading.narrow caps at ~22ch for editorial hero headlines; Text presets are wider for body copy. Existing consumers (no prop) render identically.

  MCP: surface prop-level notes on component queries and add two recipes. `ask --scope component "Heading"` now warns that `variant="display"` inherits `--dry-font-sans` unless `--dry-font-display` is overridden. `ask --scope recipe "serif display"` walks through importing Newsreader and scoping the override to `body` (never `:root`). `ask --scope recipe "narrow headline"` replaces the legacy grid-wrapper hack with `<Heading maxMeasure="narrow">`.

### Patch Changes

- Updated dependencies [[`0b4a533`](https://github.com/rob-balfre/dryui/commit/0b4a5335e03a6cdb153f65187df7f7fae690d981)]:
  - @dryui/lint@0.5.0

## 2.2.7

### Patch Changes

- [`4935108`](https://github.com/rob-balfre/dryui/commit/49351088643822ca03e4000afddd7f6e3320ed73) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Starting a feedback session from a directory with no Svelte/SvelteKit project no longer crashes when the descendant project walk hits an unreadable folder (e.g. `~/.Trash` on macOS). The walker skips inaccessible directories, and the interactive feedback menu now shows a brief notice explaining why the dev server was not auto-started before falling back to the dashboard-only URL.

## 2.2.6

### Patch Changes

- [`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Anchor `dryui init <path>` to the explicit target so it no longer walks up into a parent workspace's `package.json`, and surface a richer feedback submit flow (`waiting-for-capture` / `capturing` / `uploading`) with clearer cancel and unavailable-API messages.

  Also tightens the MCP reviewer's `theme-in-style` check to flag only real `--dry-*` declarations (skipping comments and token consumption) and report the correct source line, refines the matching lint message, adds a `suggestedFix` for it, parses multi-line interface props in the spec generator, adds subpath `publishConfig.exports` for `@dryui/mcp`, and bumps toolchain deps (svelte, typescript, vite, wrangler, bun-types, vitest, mapbox-gl).

- Updated dependencies [[`2afee28`](https://github.com/rob-balfre/dryui/commit/2afee28ba3888b9e961098209226236738d5ac1e)]:
  - @dryui/lint@0.4.3

## 2.2.5

### Patch Changes

- [`9921ae4`](https://github.com/rob-balfre/dryui/commit/9921ae4df796a6b18980f99c5d2429b038a343c1) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Keep component review line numbers aligned after multiline `<script>` blocks and cover `BorderBeam` as a known DryUI component in MCP check regressions.

## 2.2.4

### Patch Changes

- [`49fa611`](https://github.com/rob-balfre/dryui/commit/49fa6116ebc9570b830e80b2df9529643a8219e2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Internal cleanup across the workspace: un-export symbols only consumed
  inside their own module, modernize RegExp iteration to `str.matchAll`,
  and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
  lucide-svelte, adapter-static). No public API changes for documented
  entry points.

## 2.2.3

### Patch Changes

- [`ddfdd05`](https://github.com/rob-balfre/dryui/commit/ddfdd051b32d0a2b312cd3b049e067c18ac8f188) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Polish motion, radius, and typography details across `@dryui/ui` primitives.

  New public tokens and utilities: `--dry-stagger-step` / `--dry-stagger-max` / `--dry-stagger-delay` with a `[data-dry-stagger]` attribute utility (nth-child(1..12) fallback so lists animate in order without JS), a shared `[data-dry-icon-reveal]` primitive that animates opacity/scale/blur with `--dry-ease-spring-snappy`, and a `--dry-image-edge` semantic token for subtle 10% rings on image-shaped surfaces. Container surfaces (card, modal/dialog, alert, popover, toast, dropdown-menu, alert-dialog) now set `--dry-btn-radius` to `--dry-radius-nested` so nested controls inherit the concentric outer-minus-padding radius.

  Button press uses `scale(0.98)` for tactile feedback and `icon-sm` is bumped to 40px so icon-only controls (including the dialog close) meet a 40x40 hit target. Enter/exit timing is now asymmetric on dialog, drawer, alert-dialog, tooltip, popover, and dropdown-menu: exits use `--dry-duration-fast` + `--dry-ease-out` for a snappier close. `[data-dry-stagger]` wires into accordion, select, combobox, command-palette, dropdown-menu, context-menu, menubar, and toast; `[data-dry-icon-reveal]` wires into checkbox, radio, theme-toggle, and the select chevron. `Text` gets `text-wrap: pretty` and `tabular-nums` is applied to number-input, slider value label, progress label, pin-input, chart y-axis labels, and data-grid number/end-aligned cells. Optical alignment: play triangle in video-embed nudged `translateX(1px)`, nav-arrow-button prev/next nudged +-0.5px (flows to pagination and carousel nav). All changes honor `prefers-reduced-motion`.

## 2.2.2

### Patch Changes

- [`3ae293a`](https://github.com/rob-balfre/dryui/commit/3ae293a0b691e773b35154caa9b2a915a4c58487) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `ThemeToggle` component plus `createThemeController` and `themeFlashScript` helpers to `@dryui/ui`. `ThemeToggle` wraps the existing `Toggle` with bundled sun/moon SVG icons, supports Alt-click / Escape to return to system mode, persists the explicit pick under a configurable `storageKey` (default `'dryui-theme'`), and accepts an optional pre-built controller so multiple surfaces can share state. `createThemeController` exposes `mode`, `isDark`, `setMode`, `cycle`, and `reset` for custom triggers, and `themeFlashScript` returns the inline IIFE to embed in `<head>` so the stored preference applies synchronously before first paint.

## 2.2.1

### Patch Changes

- [`8e4aeba`](https://github.com/rob-balfre/dryui/commit/8e4aeba80edc2dd5597895cc70bb94a26494d97c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add first-class support for the official Svelte MCP (`@sveltejs/mcp`) as a recommended companion.
  - `dryui setup --install` now also registers `@sveltejs/mcp` alongside the DryUI servers for Copilot, Cursor, OpenCode, Windsurf, and Zed. Pass `--no-svelte-mcp` to opt out.
  - Interactive `dryui setup` asks before writing the svelte server to the MCP config (default yes) and surfaces `svelte-mcp: registered for …` in the menu status.
  - Each printed `dryui setup --editor <id>` guide now includes a "Svelte MCP (recommended companion)" section with the paste-in snippet for editors where auto-install is not supported (Claude Code, Codex, Gemini CLI).
  - The DryUI skill gains a new rule directing agents to use `svelte-autofixer` / `get-documentation` from `@sveltejs/mcp` for Svelte 5 and SvelteKit questions, keeping DryUI focused on component APIs.
  - Docs getting-started page renders a new companion block per agent with the exact snippet for that tool's config file.

## 2.2.0

### Minor Changes

- [`c5010c5`](https://github.com/rob-balfre/dryui/commit/c5010c5925639d8851956b5aaa1e1f5402c3408d) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/mcp` project detection: `ProjectDetection` now reports `dependencies.feedback` and `feedback.layoutPath` (path of the first `+layout.svelte` under `src/routes/` that imports `@dryui/feedback`). Detection is gated on the package being installed and the layout search depth is capped at two levels to cover grouped routes without walking the full tree.
  - `@dryui/cli` feedback session: when the user-project launcher opens the dashboard, it now emits a `Feedback widget:` note if `@dryui/feedback` is not installed or the `<Feedback />` component is not mounted in any layout. The launch still proceeds so the dashboard stays useful for reviewing submission history.

## 2.1.5

### Patch Changes

- [`8971b0e`](https://github.com/rob-balfre/dryui/commit/8971b0e4dca6de0be282f6710ad5ceefb31e921a) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/ui` AppFrame: add a styled wrapper around the primitive's windowed chrome. Renders macOS traffic-light dots, a centered title, and an optional actions slot above a content area, all built with scoped CSS grid and `--dry-*` tokens. Replaces the earlier styled wrapper that shipped briefly and was removed when CSS modules and flexbox were banned.
  - `@dryui/mcp` component-catalog: promote AppFrame from primitive-only to a styled surface so `ask --scope component "AppFrame"` resolves to `@dryui/ui`.

## 2.1.4

### Patch Changes

- [`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ship the unreleased April 17-18 work across the published packages.
  - `@dryui/primitives` + `@dryui/ui`: collapse Dialog/Drawer/AlertDialog into a shared `ModalContent` primitive, extract `escape`/`dismiss`/`menu-nav`/`anchored-popover` helpers and migrate 12 consumers, replace the `useThemeOverride` hook with a scoped `TokenScope` component, portal layered overlays so stacked modals nest cleanly, harden anchored positioning, pause offscreen border-beams, polish mega-menu, shimmer, and tabs surfaces, and align the Timeline (centred line on dots, line stretched across the gap, line-width offset baked into `line-left`, `Timeline.Root` no longer shadows consumer overrides for dot size, gap, and color, and dot numerals forced to sans).
  - `@dryui/feedback` + `@dryui/feedback-server`: add agent dispatch with toolbar picker, persistence, and bridge; restructure the detail view with a prompt-copy column and notes column; add Codex, Gemini CLI, Ghostty, and Windows (`wt.exe`) dispatch surfaces; refresh dashboard list/detail layout.
  - `@dryui/lint`: REVIEW.md hygiene wave — add the `!important` rule and a11y / `variantAttrs` / theme-semantics catalogue updates.
  - `@dryui/cli`: REVIEW.md hygiene wave — clean up `diagnose`, `doctor`, `lint`, `list`, `project-planner`, `review`, `tokens`, and `workspace-args` command surfaces, plus shared format helpers.
  - `@dryui/mcp`: regenerate the architecture / contract / spec / theme-token catalogues against the new component and lint surface.
  - `@dryui/theme-wizard`: tidy `WizardShell` against the REVIEW.md pass.

- Updated dependencies [[`ff5ef41`](https://github.com/rob-balfre/dryui/commit/ff5ef412bba2f2f927dcc30d11d4d52324131e48)]:
  - @dryui/lint@0.4.2

## 2.1.3

### Patch Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

- Updated dependencies []:
  - @dryui/lint@0.4.1

## 2.1.2

### Patch Changes

- [`9ec102f`](https://github.com/rob-balfre/dryui/commit/9ec102f597c1ecd5cd82432f887c61f789d4a9b8) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Hook into Codex marketplace (0.121.0+) so the install flow mirrors Claude Code: `codex marketplace add rob-balfre/dryui`. Update setup guides, llms.txt, and skill docs with the new command.

## 2.1.1

### Patch Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Added `dryui setup`, an interactive onboarding flow that walks through editor integration (Claude Code, Codex, Copilot, Cursor, Windsurf, Zed) and the optional Claude SessionStart hook, and can open feedback tooling at the end. Bare `dryui` now opens the same flow when run outside a DryUI project on a TTY, while still printing the project dashboard inside DryUI projects and the feedback launcher inside the monorepo. Per-editor snippets are shared between the CLI guide and the docs setup data. The MCP `ai-surface` manifest, `spec.json`, and `contract.v1.json` advertise the new `setup` command, and shared CLI helpers (`hasFlag`, `getFlag`, `isInteractiveTTY`) moved into `run.ts` so feedback, launcher, install-hook, and setup share one parser.

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - The `@dryui/mcp` build now runs `generate-architecture`, `generate-contract`, `generate-llms`, and `generate-theme-tokens` in parallel after `generate-spec` has produced the shared input, cutting MCP build time on a clean install. `generate-architecture.ts` was simplified to write `architecture.json` directly (the old multi-artifact writer was unused after the docs architecture panel was removed), and the `architecture.test.ts` regression test was deleted alongside the dropped panel. The architecture and spec snapshots regenerate cleanly to `1.1.3` against the current published `@dryui/ui`.

## 2.1.0

### Minor Changes

- [`7ad699c`](https://github.com/rob-balfre/dryui/commit/7ad699c581e2d9c7c4e2004ead841e6b6932e2fc) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `detectProject` (and by extension `dryui ask --scope project` / `dryui detect`) now auto-selects a unique nested Svelte or SvelteKit project when the provided path resolves to a non-Svelte parent directory (e.g. running detection from a monorepo root that hosts a single SvelteKit app under `apps/`). When multiple candidates are present the detector warns and stays at the original root so users can rerun against the intended app. Explicit `package.json` paths are still honored without descent.

## 2.0.2

### Patch Changes

- Manual `bun publish` to actually resolve the `@dryui/lint: workspace:*` dep in the published tarball. `changeset publish` (used by the CI release workflow at the time) does not run `prepack`/`postpack` lifecycle scripts, so the hooks added in 2.0.1 never fired. `bun publish` does run them, so publishing by hand from `packages/mcp` produces a tarball with `"@dryui/lint": "^0.4.0"` as intended. At the time of this release, the CI release flow still needed a structural fix so future releases would not require a manual step.

## 2.0.1

### Patch Changes

- [`9e2c71c`](https://github.com/rob-balfre/dryui/commit/9e2c71c2f8da47fa08186c6dc720251cde590867) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Wire the shared `prepack`/`postpack` hooks into `@dryui/mcp` so its `workspace:*` dependency on `@dryui/lint` gets rewritten to a concrete `^x.y.z` range before `npm pack` builds the publish tarball. Without these hooks, `@dryui/mcp@2.0.0` shipped with an unresolved `"@dryui/lint": "workspace:*"` dep, which breaks `bun add @dryui/mcp` outside the monorepo.

## 2.0.0

### Major Changes

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

### Patch Changes

- Updated dependencies [[`b61f462`](https://github.com/rob-balfre/dryui/commit/b61f462239c87eb7633430637ea29ff766691715)]:
  - @dryui/lint@0.4.0

## 1.0.3

### Patch Changes

- [`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli`: Adds `dryui launcher` (the default no-arg command inside the repo) for opening the feedback dashboard and `dryui feedback ui` / `dryui feedback-ui-build` for building and serving it. Shared launch helpers deduped into `launch-utils.ts`.
  - `@dryui/feedback-server`: Ships a new Vite-built Svelte dashboard UI and launcher page served directly by the HTTP server, with supporting endpoints and store/client updates.
  - `@dryui/mcp`: Adds an `interactive-card-wrapper` reviewer rule plus minor tweaks to `architecture.ts` and `utils.ts`.
  - `@dryui/ui`: `AccordionButtonTrigger` now sets `--dry-btn-justify="space-between"` and `--dry-btn-radius="0"` so the chevron sits flush-right and the trigger aligns cleanly with its panel.

## 1.0.2

### Patch Changes

- [`b67f1dd`](https://github.com/rob-balfre/dryui/commit/b67f1dd0dadd98e31f888f2959250d799b095521) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/primitives`: `parseKeys` now accepts a `mod` / `$mod` modifier that matches `Cmd` on macOS and `Ctrl` elsewhere.
  - `@dryui/ui`: `Diagram` exposes themeable node padding, gap, and font-size custom properties (`--dry-diagram-node-padding`, `--dry-diagram-node-gap`, `--dry-diagram-node-label-size`, etc.). `CodeBlock` copy button now drives its text color through `--dry-btn-color` so it inherits hover/copied states cleanly.
  - `@dryui/feedback`: `Feedback` accepts a `scrollRoot` prop (`string | HTMLElement`) for scoping annotation positioning to a custom scroll container. Toolbar and overlay layout refined.
  - `@dryui/mcp`: Regenerated `spec.json` / `contract.v1.json` to reflect the new `--dry-btn-color` css var on `CodeBlock`.

## 1.0.1

### Patch Changes

- [#13](https://github.com/rob-balfre/dryui/pull/13) [`6f60494`](https://github.com/rob-balfre/dryui/commit/6f604949c14692885ef9b3b3487ebae2af8c17f9) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `@dryui/cli install --json` failing with `ENOENT: ../@dryui/ui/src/themes/default.css`
  in published builds. The theme token registry is now generated at build time into
  `theme-tokens.generated.json` and bundled with `@dryui/mcp`, so the CLI no longer
  tries to read CSS files from `@dryui/ui`'s source tree (which is not shipped with
  the published tarball).

## 1.0.0

### Major Changes

- [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42) Thanks [@rob-balfre](https://github.com/rob-balfre)! - **Breaking:** Remove `OptionSwatchGroup` — use `OptionPicker` instead. `OptionPicker.Preview` replaces `OptionSwatchGroup.Swatch` and supports the same color/shape props, so the migration is a mechanical rename:

  ```svelte
  <!-- before -->
  <OptionSwatchGroup.Root bind:value={color}>
  	<OptionSwatchGroup.Item value="sage">
  		<OptionSwatchGroup.Swatch color="#7da174" />
  		<OptionSwatchGroup.Label>Sage</OptionSwatchGroup.Label>
  	</OptionSwatchGroup.Item>
  </OptionSwatchGroup.Root>

  <!-- after -->
  <OptionPicker.Root bind:value={color}>
  	<OptionPicker.Item value="sage">
  		<OptionPicker.Preview color="#7da174" />
  		<OptionPicker.Label>Sage</OptionPicker.Label>
  	</OptionPicker.Item>
  </OptionPicker.Root>
  ```

  The shared selection context has moved from `option-swatch-group/context.svelte` to `option-picker/context.svelte` (exported as `setOptionPickerCtx` / `getOptionPickerCtx`). Consumers that only used the public compound API are unaffected.

## 0.5.0

### Minor Changes

- [`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `OptionPicker` compound component and refactor theme wizard controls.
  - **New `OptionPicker`** — a selectable-tile compound component with `Root` / `Item` / `Preview` / `Label` / `Description` / `Meta` parts. Supports vertical/horizontal orientation, a `columns` prop, per-item `layout="stacked"` and `size="visual" | "compact"` variants, and preview slots for presets, fonts, and shape hints.
  - **`OptionSwatchGroup`** — add `columns` prop on `Root` (1–4), a `size="compact"` variant on `Item` for swatch-only grids, and refactor the swatch color wiring onto an `{@attach}` instead of an `$effect` on raw `style.cssText`.
  - **`Button`** — expose `--dry-btn-trigger-open-bg` / `-color` / `-border` CSS vars so trigger buttons can be styled independently when `aria-expanded="true"`.
  - **`MegaMenu`** — panel background is now themable via `--dry-mega-menu-panel-bg`, and `MegaMenu.Link` renders hover/selected states (`data-selected`, `aria-pressed="true"`, `aria-current="true"`) with matching `--dry-mega-menu-link-{hover,selected}-{bg,border,shadow}` hooks.
  - **`Sidebar`** — `sidebar-item` switches from `grid-auto-flow: column` to an explicit `max-content 1fr max-content` template so items can render a leading icon, a flex label, and an optional trailing element (e.g. an external-link glyph).
  - **MCP spec** — register `OptionPicker` metadata so it appears in `spec.json`, `contract.v1.json`, and `llms*.txt` (145 components total).

## 0.4.1

### Patch Changes

- [`738ffe7`](https://github.com/rob-balfre/dryui/commit/738ffe709a6addd735fb921ce7e518cf7ef1f91f) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix Feedback Hotkey handler prop and MCP binary execute permissions

## 0.4.0

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

## 0.3.0

### Minor Changes

- [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Enhanced `dryui init` to bootstrap SvelteKit + DryUI projects from scratch. Works for greenfield, brownfield, and existing SvelteKit projects. The MCP `plan_install` tool now returns scaffold steps instead of blocking for unsupported projects.

## 0.2.2

### Patch Changes

- Add base CSS resets to default theme — importing default.css now sets box-sizing, margin, background, color, and min-height automatically. No separate reset CSS needed.

## 0.2.1

### Patch Changes

- Native plugin/skill install for all major AI coding tools
  - Claude Code plugin: `claude plugin marketplace add rob-balfre/dryui && claude plugin install dryui@rob-balfre/dryui`
  - Codex: `$skill-installer install` with MCP dependency in agents/openai.yaml
  - Copilot/Cursor/Windsurf: `npx degit` for Agent Skills + MCP config
  - Zed: AGENTS.md + MCP config
  - Updated docs tools page with 6 agent tabs

## 0.2.0

### Minor Changes

- [`79e3d4c`](https://github.com/rob-balfre/dryui/commit/79e3d4cc7f4cd67272042f4007f2acbc3271b537) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add AXI-inspired TOON output format for agent-optimized tool responses
  - New TOON (Token-Optimized Output) format: ~40% fewer tokens than JSON for all MCP tool output
  - CLI: --toon and --full flags on all commands (info, list, compose, review, diagnose, doctor, lint, detect, install)
  - Content truncation: compose snippets, workspace findings, component examples capped with hints
  - Pre-computed aggregates: hasBlockers, autoFixable (review), coverage % (diagnose), top-rule (workspace)
  - Contextual next-step suggestions appended to every response
  - Definitive empty states: issues[0]: clean, findings[0]: clean
  - Structured errors with suggestions for agent consumption
  - Content-first no-arg: `dryui` with no args shows project status in DryUI projects
  - Ambient context hook (packages/cli/src/ambient.ts) for Claude Code session integration
  - New shared module: composition-search.ts (extracted duplicated search logic from MCP and CLI)

## 0.1.3

### Patch Changes

- fix(mcp): improve install plan snippets for LLM reliability
  - Root layout create-file step now includes `{@render children()}` so pages render
  - Edit-file descriptions are prescriptive: specify where to insert and how to merge
  - app.html snippet includes example with preserved lang attribute
  - Theme import snippet tells LLMs to add to existing `<script>` block, not create a duplicate

## 0.1.2

### Patch Changes

- [`7d1f488`](https://github.com/rob-balfre/dryui/commit/7d1f4885665297036c3d06b3d123bce37fd73eda) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add missing Node shebang to bin entry so `npx @dryui/mcp` works as an MCP server command

## 0.1.1

### Patch Changes

- Improve button-group with context-based orientation, enhance rich-text-editor with placeholder and data attributes, refine virtual-list defaults, and clean up stale data attributes from map, file-upload, date-range-picker, and range-calendar components.

## 0.1.0

### Minor Changes

- [`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Initial public release of @dryui/mcp, @dryui/feedback-server, and @dryui/cli
