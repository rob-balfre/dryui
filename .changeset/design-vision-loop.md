---
'@dryui/ui': minor
'@dryui/primitives': minor
'@dryui/lint': minor
'@dryui/mcp': minor
'@dryui/cli': minor
---

Close the gap between the static linter and how UIs actually render. Two parallel tracks: structural component fixes that make four classes of design bugs impossible at the source, and a new vision-critique tool that catches the residue.

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

- New MCP tool `check-vision` and CLI subcommand `dryui check-vision <url>`. Renders the URL in headless Chromium, screenshots it, and sends the PNG plus a taste rubric (chip wrap, plural mismatch, variant mix, mid-token break, contrast, alignment, orphan, spacing rhythm) to Claude vision. Returns TOON findings + JSON.
- Requires `ANTHROPIC_API_KEY` in env (or `--api-key`). Prompt cache is wired so the rubric system message hits the cache after the first call.
- `@dryui/mcp` reviewer's `prefer-grid-layout` rule now respects the same `[data-chip-group]` selector carve-out and `/* dryui-allow flex */` per-declaration opt-out that `@dryui/lint`'s `dryui/no-flex` already honors, so the two surfaces agree.

The static linter has a hard ceiling: it cannot see runtime wrap, plural agreement, contrast against live data, or alignment drift. This pair (component-layer impossibility + VLM critique) covers the gap.
