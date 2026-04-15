# @dryui/mcp

## 2.1.0

### Minor Changes

- [`7ad699c`](https://github.com/rob-balfre/dryui/commit/7ad699c581e2d9c7c4e2004ead841e6b6932e2fc) Thanks [@rob-balfre](https://github.com/rob-balfre)! - `detectProject` (and by extension `dryui ask --scope project` / `dryui detect`) now auto-selects a unique nested Svelte or SvelteKit project when the provided path resolves to a non-Svelte parent directory (e.g. running detection from a monorepo root that hosts a single SvelteKit app under `apps/`). When multiple candidates are present the detector warns and stays at the original root so users can rerun against the intended app. Explicit `package.json` paths are still honored without descent.

## 2.0.2

### Patch Changes

- Manual `bun publish` to actually resolve the `@dryui/lint: workspace:*` dep in the published tarball. `changeset publish` (used by the CI release workflow) does not run `prepack`/`postpack` lifecycle scripts, so the hooks added in 2.0.1 never fired. `bun publish` does run them, so publishing by hand from `packages/mcp` produces a tarball with `"@dryui/lint": "^0.4.0"` as intended. The CI release flow still needs a structural fix so future releases don't require a manual step.

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
