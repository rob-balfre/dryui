---
name: dryui-build
description: 'Experimental DryUI design-to-page skill that runs a three-stage pipeline: layout extraction, real DryUI composition, and visual QA repair. Use when testing full-page implementation from app mockup images.'
---

# DryUI Full Page: Contract First

Build a real DryUI page from the supplied design image. This is not a colored-block skeleton, but the page must start from the same strict layout contract.

## Experiment Harness Rule

Run `bun run build` before finishing. Do not run `bun run dev`, `bun run check`, or a long-running screenshot/browser server during the agent step; the experiment harness performs browser capture and visual scoring after you finish.

Only edit:

- `src/routes/+page.svelte`
- `src/layout.css`
- `src/app.css` only for global font/body polish if needed

## Stage 1: Extract The Layout

Before coding, classify the target:

- `dashboard`: summary, chart/workspace, side insight/activity.
- `board`: rail/nav, board columns as primary, inspector/activity as secondary.
- `crm`: pipeline/table as primary, detail/forecast/activity as secondary or utility.
- `settings`: form/content stack as primary, help/status/actions as secondary/utility.
- `knowledge`: reader/workspace as primary, list/navigation and assistant/details around it.

Decide:

- Mobile order.
- Tablet grouping.
- Desktop shell.
- Whether adjacent sections touch (`gap: 0`) or have visible gutters.
- Which region is the largest desktop `primary`.

## Stage 2: Build Real UI

Use DryUI components for controls and UI primitives:

- Prefer `Button`, `Input`, `Badge`, `Table`, `Tabs`, and `Separator`.
- Use raw semantic elements for shell regions, headings, text, cards, charts, and decorative rectangles.
- Do not use raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<form>`, or `<table>` when a DryUI component exists.
- Use realistic but concise content. Do not copy long mockup text, exact numbers, dates, names, or private-looking data from the image.
- Keep the UI compact and work-focused. Avoid marketing hero sections, oversized cards, and decorative background blobs.
- Use app-owned light surfaces for the page unless the reference is explicitly dark.

## Markup Contract

Use one page shell:

```svelte
<main data-layout="<page-type>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

Rules:

- `page`, `primary`, and at least one of `topbar` or `navigation` are mandatory.
- Shell areas may be `rail`, `topbar`, `navigation`, `summary`, `primary`, `secondary`, `utility`, `actions`.
- Each shell area appears once.
- Use `data-layout-area` only on `[data-layout-area='page']` and direct shell children.
- All nested elements use `data-layout="<specific-name>"`, never `data-layout-area`.
- Every raw interior element has a specific `data-layout`.

## CSS Contract

In `src/layout.css`, use this exact responsive contract:

```css
[data-layout='<page-type>-shell'] {
	container: page / inline-size;
}

[data-layout='<page-type>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas: ...;
	grid-template-columns: minmax(0, 1fr);
}

[data-layout='<page-type>-shell'] [data-layout-area='page'] > [data-layout-area='primary'] {
	grid-area: primary;
}

@container page (min-width: 48rem) {
}
@container page (min-width: 72rem) {
}
```

Hard rules:

- Use exactly `container: page / inline-size`.
- Use exactly `@container page (min-width: 48rem)` and `@container page (min-width: 72rem)`.
- Never use `@media` for layout.
- All `display`, `grid`, `flex`, `container`, and responsive layout rules live in `src/layout.css`.
- Route `<style>` is visual only: colors, borders, radius, shadows, type, internal padding, and block min-size.
- Select shell areas with direct child selectors: `[data-layout-area='page'] > [data-layout-area='<area>']`.

## Stage 3: Visual QA And Repair

After implementing:

- Run `bun run build`.
- Check 390px, 820px, and 1440px behavior, using screenshots if practical.
- Repair horizontal overflow, dark-on-dark text, huge blank regions, wrong mobile order, and a non-dominant primary region.
- The desktop page should use the viewport width; do not leave a small mockup floating in a large blank canvas.
- The mobile page should collapse to a deliberate summary, not a dump of every desktop primitive.

## Final Self-Check

- `@dryui/ui` is imported and at least three DryUI components are used.
- `src/layout.css` contains the exact page container and both exact container queries.
- No `@media`, inline `style=`, `style:` directives, `:global()`, `!important`, or raw native controls.
- No class props on DryUI components; style wrappers or use component props.
- Primary is visually largest on desktop.
