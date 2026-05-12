---
name: dryui-build
description: Experimental DryUI layout-only skill that extracts responsive page structure as abstract colored blocks with strict shell-only layout areas and fixed page container queries. Use when testing design-image to layout-skeleton extraction.
---

# DryUI Layout Blocks: Abstract Shell

Build only an abstract colored block layout skeleton. This is a layout extraction stage, not a UI implementation.

Only edit:

- `src/routes/+page.svelte`
- `src/layout.css`

Do not import anything. Do not use DryUI components, Lucide, icons, SVGs, images, charts, tables, forms, buttons, inputs, avatars, realistic widgets, copied text, copied metrics, copied dates, copied names, or generated business data.

## 1. Classify The Task

- Full page: build a page shell with `topbar`/`navigation`, `primary`, and optional `secondary`, `utility`, `rail`, `summary`, `actions`.
- Page section: build a section shell with `primary` and optional adjacent regions.

For full-page design-image references, treat the whole image as the page shell.

## 2. Blueprint Before Coding

Write the region plan mentally before editing:

- Mobile: one-column top-to-bottom order.
- Tablet: first useful two-pane/grouped composition.
- Desktop: persistent rail/sidebar, right panels, attached panes, dominant work surface.

Decide:

- Which region is `primary`.
- Whether spacing is `contiguous`, `guttered`, or `mixed`.
- Which regions are secondary or utility, so they do not become larger than `primary`.
- Which visible bands are shell regions versus nested primitives.

## 3. Use Recipes Only For Proportions

Do not change required area names for a recipe.

- Dashboard: summary strip, primary chart/workspace, insights/activity.
- Board/Kanban: board is `primary`; task detail is `secondary`; activity is `utility`; desktop rail if present.
- CRM: table/pipeline is `primary`; account/detail is `secondary`; forecast/activity are utility.
- Settings/Admin: settings/profile/form stack is `primary`; help/status/activity are secondary/utility; compact actions; desktop rail if present.
- Knowledge/Document Reader: reader is `primary`; collections/list are navigation/secondary; AI summary is secondary/utility; reader must be largest at desktop.

## 4. Markup Contract

For a full page, use this direct-child shape:

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">Topbar</header>
		<nav data-layout-area="navigation">Navigation</nav>
		<section data-layout-area="primary">Primary</section>
		<aside data-layout-area="secondary">Secondary</aside>
	</div>
</main>
```

Rules:

- `page`, `primary`, and at least one of `topbar` or `navigation` are mandatory.
- Direct-child shell areas may only be: `rail`, `topbar`, `navigation`, `summary`, `primary`, `secondary`, `utility`, `actions`.
- Each shell area should appear once.
- `data-layout-area` is shell-only. Use it only on `[data-layout-area='page']` and its direct children.
- Never put `data-layout-area` on nested spans, nested divs, articles, list items, labels, chips, cards, search placeholders, tabs, badges, rows, columns, or decorative blocks.
- Nested blocks must use `data-layout="<specific-name>"` and classes, never `data-layout-area`.
- Put recipe-specific meaning in text labels/classes, not direct-child area names.

## 5. Abstract Block Content

The skeleton should look like colored regions and blocks, not a finished UI.

- Use text only for short region labels: `Topbar`, `Navigation`, `Summary`, `Primary`, `Secondary`, `Utility`, `Actions`, `Rail`.
- Do not copy visible text from the reference image.
- Do not create domain labels such as customer names, project names, document titles, settings names, money, dates, percentages, or status text.
- Represent cards, controls, rows, tabs, charts, documents, columns, and copy as colored rectangles, lines, chips, and blocks.
- Use repeated abstract primitives to communicate density and grouping.
- Use distinct color families for region types, but keep the layout readable.

## 6. CSS Contract: Copy This Shape

Use the fixed container name `page`. Do not invent another container name.

```css
[data-layout='<name>-shell'] {
	container: page / inline-size;
}

[data-layout='<name>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'topbar'
		'navigation'
		'primary'
		'secondary';
	grid-template-columns: minmax(0, 1fr);
}

[data-layout='<name>-shell'] [data-layout-area='page'] > [data-layout-area='topbar'] {
	grid-area: topbar;
}

[data-layout='<name>-shell'] [data-layout-area='page'] > [data-layout-area='primary'] {
	grid-area: primary;
}

@container page (min-width: 48rem) {
}

@container page (min-width: 72rem) {
}
```

Hard rules:

- `container: page / inline-size` must appear exactly once on the shell selector.
- Use exactly `@container page (min-width: 48rem)`.
- Use exactly `@container page (min-width: 72rem)`.
- Never use `@container <name>`, `@container (width...)`, or `@container page (width>=...)`.
- Any CSS selector that targets a shell area other than `page` must use `[data-layout-area='page'] > [data-layout-area='<area>']`.
- Do not use broad descendant selectors like `[data-layout='<name>-shell'] [data-layout-area='primary']`; they can accidentally style nested blocks.

## 7. Layout Rules

- Mobile is one column only.
- Tablet must visibly use extra width when the reference has grouped panes.
- Desktop must preserve the reference shell: rail/sidebar, right inspector, attached panes, and dominant primary surface.
- Put all `display: grid`, `display: flex`, grid, flex, container, and breakpoint rules in `src/layout.css`.
- Use `minmax(0, 1fr)` for flexible tracks.
- Use only DryUI token gaps such as `var(--dry-space-2)`, `var(--dry-space-3)`, `var(--dry-space-4)`, and `var(--dry-space-6)`.
- If panes touch in the reference, use `gap: 0`; if gutters are visible, use token gaps.
- `primary` must be the largest or most visually dominant desktop content region.
- Utility/status/activity blocks must never be larger than `primary`.
- Do not create large blank shell regions. Every direct shell area should contain visible blocks near its top edge.

## 8. Route Styling Rules

Route `<style>` is visual only:

- color, background, border, shadow, typography, padding inside blocks, labels, and min-block-size are allowed.
- `display`, `grid-*`, `flex-*`, `container`, `@container`, and `@media` are not allowed in route `<style>`.
- Keep labels short and generic.
- Use distinct accessible colors.

## 9. Self-Check Before Finishing

Run `bun run build`, then check:

- No `import` in `src/routes/+page.svelte`.
- No `@dryui/ui`, `lucide`, `<button>`, `<input>`, `<form>`, `<table>`, `<img>`, or `<svg>`.
- No copied text, numbers, dates, customer names, document titles, metrics, or statuses from the reference.
- No `@media`.
- No `display`, `grid-*`, `flex-*`, or `@container` in route `<style>`.
- `src/layout.css` contains exact `container: page / inline-size`.
- `src/layout.css` contains exact `@container page (min-width: 48rem)` and `@container page (min-width: 72rem)`.
- Full page has exactly one direct child `data-layout-area="primary"`.
- No nested primitive uses `data-layout-area`.
- 390px, 820px, and 1440px should not overflow horizontally or show a large blank shell region.
