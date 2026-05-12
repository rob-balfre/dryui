---
name: dryui-build
description: Experimental DryUI layout-only skill that preserves visual hierarchy and region proportions from app screenshots using weighted colored blocks. Use when testing page layout extraction for dashboards, workspaces, boards, readers, and admin pages.
---

# DryUI Layout Blocks: Proportion Weights

Create only labelled colored layout blocks. The output proves region hierarchy, not finished UI.

Allowed edits:

- `src/routes/+page.svelte`
- `src/layout.css`

No imports, components, icons, images, charts, tables, forms, buttons, inputs, avatars, or realistic widgets.

## Region Weighting

Before coding, classify every visible region:

- `primary`: the dominant workspace, board, reader, canvas, or form.
- `secondary`: inspector, AI panel, account detail, task detail, help panel.
- `chrome`: top bar, nav, rails, tabs, action bar.
- `summary`: KPI strips, filters, quick stats.
- `utility`: activity, recent updates, footer tools.

The generated layout must preserve these weights:

- `primary` is largest at every breakpoint.
- Desktop `primary` normally gets `minmax(0, 1fr)` or larger.
- `secondary` is narrower than `primary` unless the reference shows equal panes.
- `chrome` is compact but persistent when visible in the reference.
- Utility regions must not push the primary workspace below the fold on desktop.

## Page Structure

Use exactly one shell:

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">...</div>
</main>
```

Use direct semantic child regions with meaningful `data-layout-area` names.

## Layout CSS

Only `src/layout.css` may contain grid/flex/container rules.

```css
[data-layout='<name>-shell'] {
	container: <name> / inline-size;
}

[data-layout='<name>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'topbar'
		'navigation'
		'primary'
		'secondary';
}

@container <name> (min-width: 48rem) {
}
@container <name> (min-width: 72rem) {
}
```

Container name and query name must match exactly.

## Proportion Tools

Use these in `src/layout.css` when they match the reference:

- `grid-template-columns: minmax(0, 1fr) minmax(14rem, 0.32fr);`
- `grid-template-columns: 14rem minmax(0, 1fr) 18rem;`
- `grid-template-rows: auto auto minmax(24rem, 1fr) auto;`
- `min-block-size` on primary reader/board/workspace regions.
- `align-items: stretch` for pane layouts.

Do not make desktop all regions equal-height or equal-width unless the reference clearly does.

## Responsive Rules

- Mobile base: one column only.
- Tablet `48rem`: introduce two-column content only after top chrome/summary.
- Desktop `72rem`: use desktop pane proportions from the reference. If the design has a reader/document/workspace pane, it must be tall and dominant.

## Spacing

Preserve reference spacing as `contiguous`, `guttered`, or `mixed`. Guttered uses tokenized gaps; contiguous uses `gap: 0` and no unintended body background.

## Styling

Route `<style>` handles only color, borders, readable labels, and typography. Use distinct colors with strong contrast.

## Failure Gates

- Primary workspace is not visually dominant.
- Desktop reader/board/workspace is a shallow horizontal strip.
- Desktop side panels consume more space than the primary region.
- Missing matched `container:` and `@container` names.
- Imports, components, icons, images, charts, tables, forms, buttons, inputs.
- Horizontal overflow or clipped labels at 390px, 820px, or 1440px.
