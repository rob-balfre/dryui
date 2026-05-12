---
name: dryui-build
description: Experimental DryUI layout-only skill that requires visual screenshot checks and repair for colored block page prototypes. Use when testing responsive layout extraction from mockups with Codex browser validation.
---

# DryUI Layout Blocks: Visual Repair Loop

Build a layout-only colored block prototype. The result is not finished UI; it is a structural proof.

Allowed edits:

- `src/routes/+page.svelte`
- `src/layout.css`

No imports. No `@dryui/ui`, Lucide, icons, SVGs, images, charts, tables, forms, buttons, inputs, avatars, cards, or real widgets.

## Build Steps

1. Extract the reference into a region list for mobile, tablet, and desktop.
2. Decide spacing: `contiguous`, `guttered`, or `mixed`.
3. Build the semantic block markup.
4. Build mobile-first container-query layout CSS.
5. Run `bun run build`.
6. Start the app and visually check 390px, 820px, and 1440px screenshots.
7. Repair layout if any failure gate is visible.

## Shell And CSS

Use exactly:

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">...</div>
</main>
```

In `src/layout.css`:

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

The container name and all `@container` names must match.

## Responsive Rules

- Base layout is mobile and one column only.
- Tablet must be visibly different from mobile and use extra width.
- Desktop must be visibly different from tablet and match the reference’s rails, side panels, primary surface proportions, and attached/guttered spacing.
- If a reference has a left rail/sidebar at desktop, include it only at desktop.
- If a reference has a dominant reader, board, form, table, or chart area, the colored primary block must be the largest region at desktop.

## Visual Repair Checklist

When viewing screenshots, fix before finishing if:

- Mobile, tablet, and desktop look like the same one-column stack.
- Desktop misses a visible reference rail/sidebar/right inspector.
- Primary workspace is a shallow strip.
- Utility/activity/status blocks are larger than the main workspace.
- Labels are clipped or illegible.
- Page has horizontal overflow.
- Contiguous panes show unintended white/body gaps.
- Guttered panes lose the intended spacing.

## Styling

Use route `<style>` only for block colors, borders, text color, and typography. Use distinct accessible colors; do not rely on dark mode.

## Hard Failures

- Import statements.
- Real UI widgets or components.
- `@media` layout.
- Fewer than two `@container` branches.
- Mismatched `container:` and `@container` names.
