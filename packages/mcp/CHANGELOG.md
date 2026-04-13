# @dryui/mcp

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
