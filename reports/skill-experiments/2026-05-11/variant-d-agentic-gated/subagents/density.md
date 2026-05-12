# Density Variant: Analytics Dashboard

## Target Brief

Target brief: type=page, subtype=dashboard, user=analytics operator, primary_task=scan current performance, compare trend shifts, and triage table anomalies, density=compact, required_states=loading, empty, error, disabled, dense-data.

## Density Strategy

Optimize for fast dashboard scanning rather than presentation. The first viewport should expose the page title, filters/actions, compact KPIs, and the top of the primary chart on mobile. Tablet should become a real work surface with metrics beside the chart or table preview. Desktop should avoid full-width KPI bands and instead use a compact summary rail plus a dominant chart/table split.

Primary hierarchy:

1. Filter/action bar: visible before affected data, with refresh/export disabled states.
2. Summary metrics: compact comparable units with delta, sparkline, and status tone.
3. Primary chart: largest stable visual region for trend comparison.
4. Data table: dense rows, sticky-ish header behavior at component level if available, row status, sortable columns, and pagination/row count.
5. Secondary state panels: empty/error/loading should preserve the same footprint as the chart/table regions.

## Layout Plan

### Mobile

- Single-column grid inside the shell container.
- Order: header, filters, metrics, chart, table, state detail/action area.
- Metrics use a compact two-column card grid only if the container can support it; otherwise single column with small metric rows.
- Chart keeps a stable block-size via layout CSS constraints so loading/empty/error do not collapse the page.
- Table collapses to horizontally safe dense list/table component behavior: fewer visible columns, priority columns first, row actions behind an icon/menu.
- Primary action remains in the filter/action bar, visible in the first viewport.

### Tablet

- Inner page grid shifts to two columns.
- Header and filters span both columns.
- Metrics become a compact two-by-two area.
- Chart gets the wider column; table or dense-row preview occupies the second column below/alongside depending on available container width.
- This is not a stretched phone layout: chart and table can be compared without excessive scrolling.

### Desktop

- Inner page grid uses a dense dashboard composition:
  - Header and filters span the full page.
  - Metrics form a compact left rail or top-left block, not a full-width band.
  - Primary chart occupies the largest central area.
  - Data table occupies a broad lower or right-hand work surface.
- Dense-data mode increases visible rows by reducing vertical gaps and using compact table density, while keeping chart/table regions stable.
- Avoid nested cards; KPI cards are allowed as repeated comparable units, chart/table regions should be framed by their own component surfaces rather than page-section cards.

## Hooks

Proposed Svelte hook structure:

```svelte
<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page">
		<header data-layout-area="header">
			<h1>Analytics Dashboard</h1>
			<!-- compact status/meta -->
		</header>

		<section data-layout-area="filters">
			<!-- Date range, segment, channel, refresh/export actions -->
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			<article data-layout-area="metric-card">...</article>
			<article data-layout-area="metric-card">...</article>
			<article data-layout-area="metric-card">...</article>
			<article data-layout-area="metric-card">...</article>
		</section>

		<section data-layout-area="primary-chart" aria-label="Primary chart">
			<!-- Chart/Sparkline component plus loading/empty/error slots -->
		</section>

		<section data-layout-area="data-table" aria-label="Analytics data table">
			<!-- Table/DataGrid component plus dense rows and states -->
		</section>
	</section>
</main>
```

Optional state hooks within stable regions:

```svelte
<div data-layout-area="chart-state">...</div>
<div data-layout-area="table-state">...</div>
<div data-layout-area="table-toolbar">...</div>
```

Use only layout hooks for grid/flex/container behavior. Component classes can carry tone, typography, borders, and visual state styling outside `src/layout.css`.

## `src/layout.css` Structure

Keep this file structural only.

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
	display: grid;
	gap: var(--dry-space-4);
	grid-template-areas:
		'header'
		'filters'
		'metrics'
		'primary-chart'
		'data-table';
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
	display: grid;
	gap: var(--dry-space-2);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-2);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='primary-chart'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='data-table'] {
	display: grid;
	gap: var(--dry-space-3);
	min-block-size: 18rem;
}

@container analytics-dashboard (min-width: 42rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'metrics primary-chart'
			'data-table data-table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-content: start;
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(14rem, 0.65fr) minmax(0, 1.45fr) minmax(22rem, 1fr);
		grid-template-areas:
			'header header header'
			'filters filters filters'
			'metrics primary-chart data-table'
			'metrics primary-chart data-table';
		align-items: start;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: minmax(0, 1fr);
	}
}
```

Notes:

- The shell owns the named container.
- Responsive rules style descendants inside the shell, not the shell itself.
- `display: grid`, gaps, grid areas, alignment, and block-size constraints live here.
- No colors, borders, shadows, typography, z-index, or raw width/height/inline-size styling belongs here.

## State Coverage

- Loading: skeleton rows/metric placeholders preserve metric, chart, and table block footprints.
- Empty: chart/table regions show compact empty states with filter-reset action; grid areas remain unchanged.
- Error: chart/table regions show retry action without moving the filter/action bar.
- Disabled: refresh/export/table-row actions use disabled component state while filters remain readable.
- Dense-data: table defaults to compact density, truncates long labels at component level, keeps row actions accessible through icon/menu controls, and preserves no-hover access for coarse pointers.

## Risks

- DryUI lint risk: accidental `display: grid` or `display: flex` in route/component styles instead of `src/layout.css`.
- Container-query risk: styling the shell inside `@container` would fail the skill contract; all queries must target descendants.
- Density risk: KPI cards could become too small on tablet if metric labels are long; use short labels, accessible full labels, and stable truncation.
- Table risk: dense rows can cause horizontal overflow if too many columns remain visible on mobile; prioritize columns and use component-level responsive behavior.
- Visual hierarchy risk: a left metric rail can overpower the chart if KPI styling is too loud; keep KPI visuals compact and let chart/table own the dominant area.
- State risk: loading/empty/error variants may drift if implemented as separate markup paths; prefer shared region containers with state slots.

## Self-Score

| Criterion               | Score | Rationale                                                                                                                      |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------ |
| Task fit                |     5 | Directly targets scan speed, compact metrics, chart/table hierarchy, and dense-data behavior for the requested dashboard.      |
| DryUI contract          |     5 | Uses page shell container ownership, inner responsive grid, data hooks, structural CSS only, and no layout-wrapper components. |
| Container-query quality |     4 | Mobile-first with meaningful tablet and desktop shifts; exact breakpoints may need screenshot tuning.                          |
| Visual hierarchy        |     5 | Prioritizes filters, compact KPIs, dominant chart, and dense table without wasting desktop space.                              |
| State coverage          |     4 | Covers required states and dense data; final strength depends on implementation using shared stable state regions.             |
| Implementation risk     |     4 | Low to moderate risk; main hazards are mobile table overflow and overly tight KPI labels.                                      |

Overall: 4.5/5. Strong density-focused candidate. Best merged with resilience checks for long labels, no-hover row actions, and error/empty state consistency.
