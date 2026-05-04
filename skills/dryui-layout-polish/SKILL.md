---
name: dryui-layout-polish
description: 'Post-layout quality pass for DryUI page and section layouts. Use after dryui-layout has created zones, or when a DryUI layout feels flat, cramped, sparse, monotonous, poorly grouped, or weak across breakpoints. Improves spatial rhythm, hierarchy, density, content grouping, and responsive structure while preserving DryUI layout rules: .svelte files keep data-layout/data-layout-area hooks and all page-level grid/flex/container-query CSS stays in src/layout.css.'
---

# DryUI Layout Polish

Run this after `dryui-layout` and before placing real components, or when visual feedback identifies a layout-only problem. This is a DryUI-native spatial pass: improve rhythm and structure without becoming a general design critique skill.

## Scope

Own:

- `src/layout.css` blocks for the target `[data-layout='<name>']`
- target `.svelte` layout hooks when zones need splitting, merging, reordering, or clearer semantic landmarks
- setup fixes already required by `dryui-layout`: page container in `src/app.css`, `../layout.css` import in `src/routes/+layout.svelte`

Do not own:

- real DryUI component placement or component APIs; hand that to `dryui`
- first-pass skeleton creation; hand that to `dryui-layout`
- broad brand critique, product strategy, or general visual polish; hand that to `impeccable`
- `PRODUCT.md` or `DESIGN.md`; those files are impeccable-owned and DryUI skills do not read or write them

## Required Reference

Before diagnosing layout quality, read [references/layout-quality.md](references/layout-quality.md). It contains the red flags, fixes, and DryUI-specific spacing guidance for this pass.

## Workflow

1. **Confirm the base.** If the target route has no `data-layout` skeleton or no matching `src/layout.css` block, run `dryui-layout` first. If the existing skeleton violates `dryui-layout` hard rules, fix those before polishing.
2. **Capture the brief.** Write one sentence: what the page is for, who scans it, and whether the surface is mostly `product` or `expressive`. If unclear, default to `product`.
3. **Inspect the files.** Read the target `.svelte` file, `src/layout.css`, `src/app.css`, and `src/routes/+layout.svelte`. If editing Svelte, use the repo's Svelte MCP workflow when available and run `svelte-autofixer` before finalizing.
4. **Diagnose layout quality.** Check for monotone spacing, weak hierarchy, unclear grouping, accidental centered stacks, awkward sidebars, cramped tracks, over-wide content, premature breakpoints, and mobile/wide layouts that tell different stories.
5. **Make the smallest structural improvement.** Prefer `src/layout.css` edits: grid areas, tracks, rows, gaps, padding, alignment, `min-block-size`, and `@container page (...)` rules. Edit markup only when the layout needs a missing or different named area.
6. **Preserve DryUI discipline.** No route-level `<style>`, no `style=`, no Svelte `style:` directives, no `class=` in phase-zone markup, no `@media` for layout breakpoints, no hardcoded colors, and no width/inline-size escape hatches.
7. **Verify.** Run `dryui check <target>` or MCP `check`. Also verify the layout at a narrow viewport around 400px and a wide viewport around 1280px when a browser/dev server is available.

## Edit Rules

- Keep page-level `display: grid` and `display: flex` only in `src/layout.css`.
- Scope every rule under `[data-layout='<name>']`.
- Use mobile-first base rules, then `@container page (min-width: <rem>)`.
- Use `gap` and padding from `--dry-space-*` tokens. Do not invent arbitrary spacing values.
- Size content tracks with `minmax(0, 1fr)` or `1fr`; size rails with explicit `rem` tracks.
- Prefer named grid areas for page layout; use auto-fit grids only for repeated peer zones.
- Keep placeholder text short if still in phase zones. Do not add real content to solve a layout problem.

## Output Gate

When the layout is structurally improved and checks pass, emit:

```text
LAYOUT POLISH DONE
- file: <target .svelte>
- root: data-layout='<name>'
- changed: <areas/tracks/gaps/breakpoints>
- mode: product|expressive
- checks: dryui check <target> passed
- visual: narrow and wide layouts have clear hierarchy, grouping, and rhythm
```

NEXT: Phase 2 (Components) - place real DryUI components with the `dryui` skill.
