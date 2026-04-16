# @dryui/cli

## 0.7.0

### Minor Changes

- Ship the unreleased April 16 feature wave across the published packages.
  - `@dryui/cli`: rewrite `dryui setup` into an interactive TUI with arrow-key menus, a unified setup/feedback hub, and the new default no-arg TTY flow. Session-start context now stays on `dryui ambient` instead of the separate `dryui-ambient` bin.
  - `@dryui/primitives` + `@dryui/ui`: add the new `BorderBeam` component/export, add the `Slider` pill variant and `valueLabel` snippet prop, and tighten dialog/drawer scroll-lock behavior.
  - `@dryui/feedback` + `@dryui/feedback-server`: add scroll-vs-viewport drawing spaces so annotations stay aligned in more host layouts, and refresh the feedback dashboard list/detail UI.
  - `@dryui/theme-wizard`: add the Wireframe preset and persist `adjust` filter values through recipe URL encoding/decoding and saved wizard state.
  - `@dryui/lint` + `@dryui/mcp`: allow `/* dryui-allow width */` escape hatches for intentional width usage and refresh generated catalog/spec metadata for the new component and slider surface.

### Patch Changes

- Updated dependencies []:
  - @dryui/feedback-server@0.3.3
  - @dryui/mcp@2.1.3

## 0.6.1

### Patch Changes

- [`9ec102f`](https://github.com/rob-balfre/dryui/commit/9ec102f597c1ecd5cd82432f887c61f789d4a9b8) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Hook into Codex marketplace (0.121.0+) so the install flow mirrors Claude Code: `codex marketplace add rob-balfre/dryui`. Update setup guides, llms.txt, and skill docs with the new command.

- Updated dependencies [[`9ec102f`](https://github.com/rob-balfre/dryui/commit/9ec102f597c1ecd5cd82432f887c61f789d4a9b8)]:
  - @dryui/mcp@2.1.2

## 0.6.0

### Minor Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Added `dryui setup`, an interactive onboarding flow that walks through editor integration (Claude Code, Codex, Copilot, Cursor, Windsurf, Zed) and the optional Claude SessionStart hook, and can open feedback tooling at the end. Bare `dryui` now opens the same flow when run outside a DryUI project on a TTY, while still printing the project dashboard inside DryUI projects and the feedback launcher inside the monorepo. Per-editor snippets are shared between the CLI guide and the docs setup data. The MCP `ai-surface` manifest, `spec.json`, and `contract.v1.json` advertise the new `setup` command, and shared CLI helpers (`hasFlag`, `getFlag`, `isInteractiveTTY`) moved into `run.ts` so feedback, launcher, install-hook, and setup share one parser.

### Patch Changes

- [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Feedback dashboard screenshots are now rendered as a thumbnail that opens a full-resolution Dialog with the original capture, viewport metadata, and a link out to the page. The dashboard reads its `?dev=` target through a shared `normalizeDevUrl` helper that always pins `?dryui-feedback=1` on the dev app URL, and the CLI launcher (`dryui` / `dryui feedback ui`) now constructs the dashboard URL with the same flag so the docs site only mounts the feedback overlay when the dashboard hands off to it.

- Updated dependencies [[`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047), [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047), [`e27993e`](https://github.com/rob-balfre/dryui/commit/e27993e4c4307f64cde953a33e055b142392d047)]:
  - @dryui/mcp@2.1.1
  - @dryui/feedback-server@0.3.2

## 0.5.3

### Patch Changes

- [`b108f15`](https://github.com/rob-balfre/dryui/commit/b108f150d2151b2251ba76bb19d81a61c377e3c0) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `dryui detect` (ambient command) now imports the spec and project-planner through the `@dryui/mcp` package exports instead of relative source paths, so the published CLI no longer depends on the repo layout to load detection metadata.

- Updated dependencies [[`7ad699c`](https://github.com/rob-balfre/dryui/commit/7ad699c581e2d9c7c4e2004ead841e6b6932e2fc)]:
  - @dryui/mcp@2.1.0

## 0.5.2

### Patch Changes

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

- Updated dependencies [[`b61f462`](https://github.com/rob-balfre/dryui/commit/b61f462239c87eb7633430637ea29ff766691715)]:
  - @dryui/mcp@2.0.0

## 0.5.1

### Patch Changes

- [`d76f9f4`](https://github.com/rob-balfre/dryui/commit/d76f9f4e530c8413431b781f7c1c73720106027b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Calendar consolidation, input/embed fixes, and feedback dashboard merge.

  **@dryui/ui**
  - Consolidated `Calendar`, `DatePicker`, `DateRangePicker`, and `RangeCalendar` onto a single shared internal `CalendarGridButton` via a `CalendarGridAdapter` prop. ~600 lines of duplicated template + styles removed; behavior, narrow weekday headers (S M T W T F S), and brand-fill selection are now consistent across all four.
  - Fixed empty weekday header row caused by duplicate keys in the `{#each}` (narrow labels have repeated letters).
  - Selected dates fill with the brand color on first click via cell-level CSS variable cascade.
  - `NumberInput`: removed dead `container-type: inline-size` that was collapsing the wrapper to 38px and misaligning the +/- buttons; increment/decrement buttons now scale with the `size` prop (`sm`/`md`/`lg`).
  - `VideoEmbed`: iframe and video now fill the aspect-ratio box via `width="100%" height="100%"` HTML attributes (CSS `inset` alone doesn't override replaced-element intrinsic size).
  - `Image`: exposed `--dry-image-block-size` and `--dry-image-place-self` for consumer overrides.

  **@dryui/cli**
  - `dryui feedback launcher` now opens the unified feedback dashboard at `/ui/` directly (with the docs URL passed via `?dev=`), via the new `buildDashboardUrl()` helper. Removed the separate launcher URL/targets and the `includeLauncher` build option.

  **@dryui/feedback-server**
  - The standalone launcher UI (`launcher.html`, `Launcher.svelte`, `launcher.ts`) is removed. The main dashboard (`App.svelte`) is now the single entry point and reads the docs base URL from a `?dev=` query parameter. Added a copy-prompt button so submissions can be handed off to Claude with one click.

- Updated dependencies [[`d76f9f4`](https://github.com/rob-balfre/dryui/commit/d76f9f4e530c8413431b781f7c1c73720106027b)]:
  - @dryui/feedback-server@0.3.1

## 0.5.0

### Minor Changes

- [`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154) Thanks [@rob-balfre](https://github.com/rob-balfre)! - - `@dryui/cli`: Adds `dryui launcher` (the default no-arg command inside the repo) for opening the feedback dashboard and `dryui feedback ui` / `dryui feedback-ui-build` for building and serving it. Shared launch helpers deduped into `launch-utils.ts`.
  - `@dryui/feedback-server`: Ships a new Vite-built Svelte dashboard UI and launcher page served directly by the HTTP server, with supporting endpoints and store/client updates.
  - `@dryui/mcp`: Adds an `interactive-card-wrapper` reviewer rule plus minor tweaks to `architecture.ts` and `utils.ts`.
  - `@dryui/ui`: `AccordionButtonTrigger` now sets `--dry-btn-justify="space-between"` and `--dry-btn-radius="0"` so the chevron sits flush-right and the trigger aligns cleanly with its panel.

### Patch Changes

- Updated dependencies [[`5049f55`](https://github.com/rob-balfre/dryui/commit/5049f553f31dd68b110e922c192e3d1a10ded154)]:
  - @dryui/feedback-server@0.3.0
  - @dryui/mcp@1.0.3

## 0.4.4

### Patch Changes

- [#13](https://github.com/rob-balfre/dryui/pull/13) [`6f60494`](https://github.com/rob-balfre/dryui/commit/6f604949c14692885ef9b3b3487ebae2af8c17f9) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `@dryui/cli install --json` failing with `ENOENT: ../@dryui/ui/src/themes/default.css`
  in published builds. The theme token registry is now generated at build time into
  `theme-tokens.generated.json` and bundled with `@dryui/mcp`, so the CLI no longer
  tries to read CSS files from `@dryui/ui`'s source tree (which is not shipped with
  the published tarball).
- Updated dependencies [[`6f60494`](https://github.com/rob-balfre/dryui/commit/6f604949c14692885ef9b3b3487ebae2af8c17f9)]:
  - @dryui/mcp@1.0.1

## 0.4.3

### Patch Changes

- Updated dependencies [[`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42)]:
  - @dryui/mcp@1.0.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf)]:
  - @dryui/mcp@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @dryui/feedback-server@0.2.0

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

### Patch Changes

- Updated dependencies [[`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3)]:
  - @dryui/mcp@0.4.0

## 0.3.0

### Minor Changes

- [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Enhanced `dryui init` to bootstrap SvelteKit + DryUI projects from scratch. Works for greenfield, brownfield, and existing SvelteKit projects. The MCP `plan_install` tool now returns scaffold steps instead of blocking for unsupported projects.

### Patch Changes

- Updated dependencies [[`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b)]:
  - @dryui/mcp@0.3.0

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

### Patch Changes

- Updated dependencies [[`79e3d4c`](https://github.com/rob-balfre/dryui/commit/79e3d4cc7f4cd67272042f4007f2acbc3271b537)]:
  - @dryui/mcp@0.2.0

## 0.1.2

### Patch Changes

- fix(mcp): improve install plan snippets for LLM reliability
  - Root layout create-file step now includes `{@render children()}` so pages render
  - Edit-file descriptions are prescriptive: specify where to insert and how to merge
  - app.html snippet includes example with preserved lang attribute
  - Theme import snippet tells LLMs to add to existing `<script>` block, not create a duplicate

- Updated dependencies []:
  - @dryui/mcp@0.1.3

## 0.1.1

### Patch Changes

- Fix workspace:\* dependencies that broke npm installs

## 0.1.0

### Minor Changes

- [`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Initial public release of @dryui/mcp, @dryui/feedback-server, and @dryui/cli

### Patch Changes

- Updated dependencies [[`58379a3`](https://github.com/rob-balfre/dryui/commit/58379a3e5667552da988cceed3415c25f8716e8c)]:
  - @dryui/mcp@0.1.0
  - @dryui/feedback-server@0.1.0
