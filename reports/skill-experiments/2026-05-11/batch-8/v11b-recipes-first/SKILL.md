---
name: dryui-build
description: 'Experimental DryUI design-to-page skill that uses app-type recipes before implementing real responsive DryUI pages. Use when testing design-image to finished app-page workflows.'
---

# DryUI Full Page: Recipes First

Implement the supplied design image as a real, responsive DryUI app page. Pick the closest recipe first, then code.

## Experiment Harness Rule

Run `bun run build` before finishing. Do not run `bun run dev`, `bun run check`, or a long-running screenshot/browser server during the agent step; the experiment harness performs browser capture and visual scoring after you finish.

Only edit `src/routes/+page.svelte`, `src/layout.css`, and `src/app.css` if global body/font cleanup is needed.

## Pick One Recipe

Dashboard:

- Desktop: rail or top nav, metric/summary band, dominant chart/workspace, right activity/insight.
- Tablet: topbar plus two-column content, summary above primary.
- Mobile: topbar, navigation, summary, primary, secondary/utility.

Board/Kanban:

- Desktop: navigation rail, board as primary with horizontal columns, inspector/activity as secondary.
- Tablet: compact rail plus board and inspector stacked or side-by-side.
- Mobile: topbar, nav/status filters, primary board list, secondary details.

CRM/Pipeline:

- Desktop: rail/nav, summary strip, table/pipeline as primary, detail or forecast as secondary.
- Tablet: summary plus table, secondary stacked.
- Mobile: filters, summary cards, primary list/table rows, secondary below.

Settings/Admin:

- Desktop: left rail or settings nav, primary forms/content, secondary status/help, actions fixed to shell edge if present.
- Tablet: navigation band, primary content, secondary cards.
- Mobile: topbar, navigation grid, primary sections, secondary, utility, actions.

Knowledge/Document:

- Desktop: navigation/list, reader/workspace primary, assistant/details utility.
- Tablet: navigation beside reader, utility below or narrow side.
- Mobile: topbar, navigation, secondary/list, primary reader, utility/actions.

## Build Rules

- Use DryUI `Button`, `Input`, `Badge`, `Table`, `Tabs`, `Separator`, and simple static Svelte markup.
- Avoid component APIs you have not checked.
- Use believable content and short labels, not exact copied mockup data.
- Keep repeated controls dense and scannable.
- Use icons from `lucide-svelte` only where they clarify buttons or navigation.
- Use light, readable app-owned colors unless the reference is explicitly dark.

## Layout Shell

Every full page uses one shell:

```svelte
<main data-layout="<recipe>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="summary">...</section>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
		<aside data-layout-area="utility">...</aside>
		<section data-layout-area="actions">...</section>
	</div>
</main>
```

Include only regions visible in the reference. `page`, `primary`, and `topbar` or `navigation` are required.

Rules:

- `data-layout-area` is shell-only and direct-child only.
- Nested rows, cards, controls, charts, lists, columns, and groups use specific `data-layout` names.
- Each shell area appears at most once.
- Do not put a shell area inside `primary`.

## Layout CSS

`src/layout.css` is structural only.

- Exact shell container: `container: page / inline-size`.
- Exact queries: `@container page (min-width: 48rem)` and `@container page (min-width: 72rem)`.
- Mobile first with one-column shell.
- Tablet must visibly use extra width.
- Desktop must match the recipe and make `primary` dominant.
- If the image has no gap between panes, use `gap: 0`; otherwise use DryUI spacing tokens.
- Use `minmax(0, 1fr)` tracks.
- Use direct shell selectors: `[data-layout-area='page'] > [data-layout-area='<area>']`.
- Never use `@media`.

## Visual CSS

Route `<style>` handles visual styling only:

- backgrounds, borders, radius, shadows, typography, internal padding, and min-block-size are fine.
- no `display`, `grid-*`, `flex-*`, `container`, `@container`, or `@media`.
- choose contrast-safe text/surface pairs.
- avoid single-hue monotony; use restrained neutrals plus purposeful accents.

## QA Before Final

Run `bun run build`, then inspect or reason through 390, 820, and 1440 widths:

- no horizontal overflow;
- no dark text on dark surfaces;
- no huge blank area above real content;
- mobile order puts the primary task early enough;
- desktop fills the available width instead of preserving a tiny centered phone/tablet mockup;
- DryUI components render without raw native fallback controls.
