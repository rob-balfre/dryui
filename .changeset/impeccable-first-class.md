---
'@dryui/ui': major
'@dryui/primitives': major
'@dryui/mcp': major
'@dryui/lint': major
'@dryui/cli': major
'@dryui/plugin': major
'@dryui/feedback-server': major
'@dryui/feedback': major
---

Delegate design guidance to impeccable.

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
