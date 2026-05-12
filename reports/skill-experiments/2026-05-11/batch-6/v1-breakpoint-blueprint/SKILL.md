---
name: dryui-build
description: Experimental DryUI layout-only skill that extracts page regions from references into colored blocks using a required mobile/tablet/desktop breakpoint blueprint. Use when testing responsive page layout extraction from screenshots or mockups.
---

# DryUI Layout Blocks: Breakpoint Blueprint

Build only a structural page prototype: labelled colored blocks that prove layout. Do not build finished UI.

Edit only:

- `src/routes/+page.svelte`
- `src/layout.css`

No imports. No `@dryui/ui`, Lucide, icons, SVGs, images, charts, tables, forms, buttons, inputs, avatars, or final widgets.

## Required Thinking Order

Before coding, derive a compact breakpoint blueprint from the supplied design:

1. List the repeated chrome regions visible in mobile, tablet, and desktop.
2. List the content regions visible at each breakpoint.
3. Decide which regions merge, move, appear, or disappear between breakpoints.
4. Identify the primary region at each breakpoint.
5. Decide spacing mode: `contiguous`, `guttered`, or `mixed`.

Then implement the blueprint. Do not let the mobile source order become the desktop layout by accident; every breakpoint must be intentionally mapped.

## Page Shell

For a full page, use exactly this shell shape:

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">
		<!-- semantic regions here -->
	</div>
</main>
```

Every direct child of `page` must have a meaningful `data-layout-area`. Use semantic elements such as `header`, `nav`, `section`, `aside`, and `footer`.

## Layout CSS

All grid, flex, container, spacing, alignment, and block-size rules go in `src/layout.css`.

Required pattern:

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
		'secondary'
		'utility';
}

@container <name> (min-width: 48rem) {
}
@container <name> (min-width: 72rem) {
}
```

The container name and `@container` name must match exactly.

## Breakpoint Rules

- Base CSS is mobile and must be one column only.
- Tablet at `48rem` must visibly use extra width. Put related secondary/support regions beside the primary region only when readable.
- Desktop at `72rem` must match the reference composition, not just widen the tablet. If the design has a left rail, sidebar, right rail, split workspace, or fixed action/footer area, represent it in the desktop grid.
- Use `minmax(0, 1fr)` for content tracks.
- Keep the primary region visually dominant through grid tracks and `min-block-size`.

## Spacing

- `contiguous`: `gap: 0`, no page padding unless the reference has an outer margin, no body/shell background showing between regions.
- `guttered`: tokenized `gap` and padding that match the reference.
- `mixed`: use grid gaps only where the reference shows gutters; use zero gap for attached regions.

## Block Styling

In the route `<style>` block only, add fixed block colors, readable label text, borders, and typography. Keep labels short and descriptive.

## Failure Gates

Fix before finishing:

- Any import statement in `+page.svelte`.
- Any icon, image, chart, table, form, card, or real widget.
- `@media` for layout.
- Fewer than two `@container` blocks.
- Base grid has multiple area names in one row.
- Desktop reference shows a persistent rail/sidebar but desktop output has none.
- Main workspace/reader/board is smaller than support panels on desktop.
- Horizontal overflow or clipped labels at 390px, 820px, or 1440px.
