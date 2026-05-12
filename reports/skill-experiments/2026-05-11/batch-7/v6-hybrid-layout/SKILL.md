---
name: dryui-build
description: Experimental DryUI layout-only skill that extracts responsive colored-block page structure from design images using a strict container-query contract. Use when testing full-page or section layout skeletons before detailed UI implementation.
---

# DryUI Layout Blocks: Hybrid Contract

Build only a colored block layout skeleton. Do not recreate detailed UI.

Only edit:

- `src/routes/+page.svelte`
- `src/layout.css`

Do not import anything. Do not use DryUI components, Lucide, icons, SVGs, images, charts, tables, forms, buttons, inputs, avatars, realistic widgets, or generated data.

## 1. Classify The Task

- Full page: build a page shell with `topbar`/`navigation`, `primary`, and optional `secondary`, `utility`, `rail`, `actions`.
- Page section: build a section shell with `primary` and optional adjacent regions.

For full-page design-image references, treat the whole image as the page shell.

## 2. Make A Breakpoint Blueprint Before Coding

Infer the same region set at all breakpoints:

- Mobile: one-column order from top to bottom.
- Tablet: first grouping when there is room for side-by-side panes.
- Desktop: persistent rails, side panels, and dominant work surface from the reference.

For each breakpoint, decide:

- Which regions are visible.
- Which regions become rails or side panels.
- Which region is `primary`.
- Whether the spacing is `contiguous`, `guttered`, or `mixed`.

## 3. Pick The Closest Recipe

Use recipes for proportion decisions only. Do not replace required area names.

- Dashboard: topbar/nav, KPI or summary strip, primary chart/workspace, insights/activity/utilities.
- Board/Kanban: topbar, tabs/toolbar, dominant board as `primary`, task/detail as `secondary`, activity as `utility`, desktop rail if present.
- CRM/Record Workspace: nav, workspace header, KPI strip, table/pipeline as `primary`, account/detail as `secondary`, forecast/activity as `utility`.
- Settings/Admin: nav/topbar, settings/profile/form stack as `primary`, help/status/activity as `secondary` or `utility`, compact `actions`, desktop rail if present.
- Knowledge/Document Reader: collections/list as navigation/secondary, document reader as `primary`, AI summary as `secondary`; the reader must be the largest desktop region.

## 4. Use This Markup Contract

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">Topbar</header>
		<nav data-layout-area="navigation">Navigation</nav>
		<section data-layout-area="primary">Primary workspace</section>
		<aside data-layout-area="secondary">Secondary panel</aside>
	</div>
</main>
```

Rules:

- `page`, `primary`, and at least one of `topbar` or `navigation` must exist for a full page.
- Use optional direct-child areas only from: `rail`, `topbar`, `navigation`, `summary`, `primary`, `secondary`, `utility`, `actions`.
- Put recipe-specific meaning in text labels/classes, not area names. Example: settings profile/form stack is still `data-layout-area="primary"`.
- Nested blocks may use descriptive `data-layout` names, but they must not replace the direct-child area contract.

## 5. Use This Exact CSS Contract

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
	grid-template-columns: minmax(0, 1fr);
}

@container <name> (min-width: 48rem) {
}

@container <name> (min-width: 72rem) {
}
```

The container name and both `@container` names must match exactly. Use `min-width`, not `width>=`.

## 6. Layout Rules

- Mobile is one column only.
- Tablet must visibly use the extra width when the reference has grouped panes.
- Desktop must match the reference’s shell: persistent rail/sidebar, right inspector, attached panes, and dominant primary surface.
- Put all grid/flex/container rules in `src/layout.css`.
- Use `minmax(0, 1fr)` for flexible tracks.
- If panes touch in the reference, set the gap to `0`. If gutters are visible, use token gaps.
- `primary` must be the largest or most visually dominant content region at desktop.
- Utility/status/activity blocks must never be larger than `primary`.

## 7. Styling Rules

In route `<style>`, use only visual treatment for the colored blocks: color, background, border, text, spacing inside blocks, and labels.

- Keep labels short and readable.
- Use distinct accessible colors.
- Do not rely on dark mode.
- Do not place layout breakpoints, `display: grid`, or `display: flex` in route styles.

## 8. Self-Check Before Finishing

Run `bun run build`, then check:

- `src/routes/+page.svelte` has no `import`.
- No `@dryui/ui`, `lucide`, `<button>`, `<input>`, `<form>`, `<table>`, `<img>`, or `<svg>`.
- No `@media`.
- `src/layout.css` contains `container: <name> / inline-size`.
- `src/layout.css` contains exact `@container <name> (min-width: 48rem)` and `@container <name> (min-width: 72rem)`.
- Full page has direct-child `data-layout-area="primary"`.
- 390px, 820px, and 1440px should not overflow horizontally.
