# @dryui/cli

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
