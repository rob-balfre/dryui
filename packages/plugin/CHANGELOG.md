# @dryui/plugin

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

## 0.3.0

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
