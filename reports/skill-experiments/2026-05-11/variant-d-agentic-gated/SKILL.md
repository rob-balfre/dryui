---
name: dryui-build-experiment-d
description: Experimental DryUI UI build workflow using branch routing, page-shell container queries, visual checks, and agentic variant selection. Use when testing whether the model can create, score, and choose among layout variants before implementation.
---

# DryUI Build Experiment D: Agentic Gated Workflow

## Target Router

Before implementation, identify the target:

- **Full page**: route, screen, dashboard, admin page, settings page, docs page.
- **Section**: hero, header, sidebar, table area, pricing block, footer.
- **Repeated component**: card, row, list item, toolbar item, table cell.
- **Form/workflow**: settings form, wizard, editor, onboarding, destructive action.
- **Polish pass**: spacing, hierarchy, states, responsive behavior, visual refinement.

If the target is a dashboard or data surface, apply Dashboard Branch first, then Full Page Branch when it is a route or screen.

## Target Brief Gate

Write this before code:

```text
Target brief: type=<page|section|component|form|polish>, subtype=<dashboard|docs|marketing|settings|other>, user=<role>, primary_task=<task>, density=<compact|standard|spacious>, required_states=<states>.
```

## Agentic Variant Gate

When the harness supports subagents and the user has asked for exploration, run three parallel variants before committing:

1. **Structure variant**: optimize information architecture, regions, and responsive order.
2. **Density variant**: optimize dashboard density, scan speed, and data hierarchy.
3. **State/resilience variant**: optimize loading, empty, error, long labels, dense rows, and mobile collapse.

Each variant must return:

- Mobile, tablet, and desktop layout plan.
- `data-layout` / `data-layout-area` structure.
- `src/layout.css` structure.
- Risk list against DryUI lint and visual checks.

Then score each variant from 1-5 on:

- Task fit.
- DryUI contract.
- Mobile-first/container-query quality.
- Visual hierarchy.
- State coverage.
- Implementation risk.

Pick one winner or merge the strongest parts. Do not average weak variants into a muddled design.

If subagents are unavailable, create the three variants locally as short sketches, then score them before implementation.

## Full Page Branch

For a full page:

1. Create a page shell with a specific `data-layout="<page-name>-shell"`.
2. In `src/layout.css`, put `container: <page-name> / inline-size` on the shell.
3. Put the responsive grid on an inner child, usually `data-layout-area="page"`.
4. Write `@container <page-name> (...)` rules that style descendants inside the shell; do not rely on a container query to style the container element itself.
5. Start with mobile-first single-column layout.
6. Add tablet and desktop shifts with `@container <page-name> (min-width: ...)`.
7. Use `data-layout-area` for stable regions and named grid areas.
8. Keep `src/layout.css` structural only: display, grid, flex, container, tokenized spacing, alignment, and block-size constraints.
9. Keep color, background, border, shadow, radius, typography, position, z-index, width, height, and inline-size out of `src/layout.css`.

Pattern:

```svelte
<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page">
		<header data-layout-area="header">...</header>
		<section data-layout-area="filters">...</section>
		<section data-layout-area="metrics">...</section>
	</section>
</main>
```

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
	display: grid;
	gap: var(--dry-space-4);
	grid-template-areas: 'header' 'filters' 'metrics';
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
```

## Dashboard Branch

For a dashboard or data surface:

1. Pick the primary task: monitor, compare, triage, report, configure, or act.
2. Pick density: compact for admin/data, standard for mixed dashboards, spacious only for executive summaries.
3. Define regions before markup:
   - header
   - filter/action bar
   - summary metrics
   - primary visualization
   - data table or list
   - secondary detail/action area if needed
4. Put filters/actions before the data they affect.
5. Give the largest stable region to the primary chart, table, or work surface.
6. Use `Table` or `DataGrid` for tabular data, and `Chart` or `Sparkline` for visualized data.
7. Use cards only for KPIs, alerts, or distinct comparable units. Do not scaffold the whole page with cards.
8. Include loading, empty, error, disabled, and dense-data states.
9. Test long labels, many rows, narrow containers, and no-hover/coarse-pointer behavior.
10. Make sure the primary action remains visible after mobile collapse.

## Visual Check Gate

For visual work, verify screenshots at:

- **Mobile**: 390px wide.
- **Tablet**: 820px wide.
- **Desktop**: 1440px wide.

Pass criteria:

- No horizontal page overflow.
- No clipped or overlapping text.
- Primary task and action are visible in the first viewport.
- Visual hierarchy survives mobile, tablet, and desktop.
- Tablet is not just a stretched phone layout when a better two-column structure fits.
- Desktop does not waste space with full-width KPI bands unless intentionally report-like.
- Empty, loading, error, disabled, and dense-data states keep stable structure.
- If adaptive theme is enabled, check light and dark; otherwise keep the app light-only.

## Self-Review Gate

Before finishing, answer:

- Did the correct target branch run?
- Did the page shell own the named container?
- Did `@container` rules style descendants inside the shell, not the shell itself?
- Are page-level layout rules only in `src/layout.css`?
- Are responsive shifts mobile-first with tablet and desktop checkpoints?
- Does `src/layout.css` avoid visual styling and width/height/inline-size hacks?
- Were mobile, tablet, and desktop screenshots checked?
- Are required loading, empty, error, disabled, and dense-data states represented?
- Would DryUI lint reject any markup, component usage, or CSS rule?
