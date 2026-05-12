# State/Resilience Variant

Target brief: type=page, subtype=dashboard, user=product analyst, primary_task=monitor analytics performance and recover from unavailable or sparse data, density=standard with dense-data table support, required_states=loading empty error disabled dense-data.

## Variant Goal

Optimize the "Analytics Dashboard" concept for stable structure across data states. The page should keep the same shell container and inner page grid whether data is loading, empty, errored, disabled, or dense. State UI should replace content inside existing regions instead of inserting new layout wrappers that shift the page unpredictably.

## Mobile Layout Plan

- One-column task order: `header`, `filters`, `status`, `metrics`, `chart`, `table`, `insights`.
- Header keeps title and primary actions visible in the first viewport. Secondary actions may wrap below the title, but remain in the `header` area.
- Filters appear before affected data. Inputs wrap vertically or into compact rows using the layout CSS hooks, with disabled controls retaining their footprint during loading.
- `status` is always part of the grid template. It can be hidden when absent, but error and stale-data messages occupy a predictable location below filters.
- Metrics render as single-column cards or skeleton blocks. Long metric labels wrap inside their component, never force horizontal scroll.
- Chart uses a stable minimum block constraint so loading skeleton, empty state, error fallback, and chart content do not collapse to different heights.
- Table region owns overflow containment for dense rows and long campaign labels. Mobile may render a table/data-grid with internal horizontal scroll or stacked row summaries, but page-level horizontal overflow is not allowed.

## Tablet Layout Plan

- Inner page grid shifts to two columns while preserving state order:
  - `header header`
  - `filters filters`
  - `status status`
  - `metrics metrics`
  - `chart chart`
  - `table insights`
- Metrics become a two-column grid.
- Chart remains full-width at tablet to avoid a cramped visualization.
- Table gets the wider column when paired with insights. Insights stays narrow and can collapse below table if content is long.
- Empty and error states keep the same grid area as their successful equivalent, so tablet does not jump between one-column and two-column modes when state changes.

## Desktop Layout Plan

- Inner page grid uses a 12-column-style structure through named areas:
  - `header header header`
  - `filters filters filters`
  - `status status status`
  - `metrics metrics metrics`
  - `chart chart insights`
  - `table table insights`
- Metrics become four equal tracks with `minmax(0, 1fr)` to contain long labels.
- Chart gets the dominant width. Insights is a secondary rail, not a wrapper around the page.
- Dense table spans the larger work area below the chart and owns its own scrolling/clipping behavior.
- Error, empty, and loading variants preserve the chart/table footprints to avoid desktop reflow.

## Hooks

Use the same full-page shell contract as the main experiment:

```svelte
<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page">
		<header data-layout-area="header">...</header>
		<section data-layout-area="filters">...</section>
		<section data-layout-area="status">...</section>
		<section data-layout-area="metrics">...</section>
		<section data-layout-area="chart">...</section>
		<section data-layout-area="table">...</section>
		<aside data-layout-area="insights">...</aside>
	</section>
</main>
```

Recommended inner hooks:

- `data-layout-area="header-actions"` for export/report actions that wrap predictably.
- `data-layout-area="filter-controls"` and `data-layout-area="filter-actions"` so disabled and loading controls keep the same structure.
- `data-layout-area="metric-grid"` if metrics need a nested grid separate from the region hook.
- `data-layout-area="section-heading"` for chart/table headings and local actions.
- `data-layout-area="state-panel"` for empty/error/loading panels inside chart and table regions.
- `data-layout-area="table-scroll"` for internal dense-data overflow containment.

## `src/layout.css` Structure

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
		'status'
		'metrics'
		'chart'
		'table'
		'insights';
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='section-heading'] {
	display: flex;
	gap: var(--dry-space-3);
	align-items: start;
	justify-content: space-between;
	flex-wrap: wrap;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='table'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='insights'] {
	display: grid;
	gap: var(--dry-space-3);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metric-grid'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-template-columns: minmax(0, 1fr);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='state-panel'] {
	min-block-size: 18rem;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table-scroll'] {
	overflow-x: auto;
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'chart chart'
			'table insights';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metric-grid'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 4fr) minmax(0, 4fr) minmax(18rem, 2fr);
		grid-template-areas:
			'header header header'
			'filters filters filters'
			'status status status'
			'metrics metrics metrics'
			'chart chart insights'
			'table table insights';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metric-grid'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Keep `src/layout.css` structural only. Visual state styling, colors, borders, typography, and component variants belong in Svelte markup or component props, not layout CSS.

## State Coverage

- Loading: skeletons in metrics, chart, and table regions with stable footprints; disable filter apply/export/report actions while pending.
- Empty: empty panels inside chart and table regions with reset/clear actions; no extra full-page empty wrapper.
- Error: `status` region shows a retry action and error explanation; chart/table regions may show local fallback panels without changing grid placement.
- Disabled: disabled filter controls and action buttons retain layout space and remain keyboard-discernible through component disabled semantics.
- Dense data: `table-scroll` contains overflow; long labels use normal wrapping or table-cell truncation from component-level styling, never page-level overflow.
- Long labels: metric cards use `minmax(0, 1fr)` tracks; action groups wrap; table columns are contained inside the table region.
- No-overflow: every grid track uses `minmax(0, ...)` where content can be long; dense table overflow is scoped to `table-scroll`.

## Risks

- If all states are displayed simultaneously, the page becomes a state catalogue rather than a realistic dashboard. The implementation should model states as branches.
- `min-block-size` is structural enough for state stability, but excessive fixed sizing would violate the spirit of the layout rules. Use only stable minimums for chart/state regions.
- Table overflow must be scoped to an inner `table-scroll` hook. Applying page-wide overflow would hide a layout bug rather than solving it.
- DryUI component names and props should be verified before implementation; this variant assumes standard primitives such as `Button`, `Card`, `Alert`, `Skeleton`, `Table`, or `DataGrid` exist.
- The `status` area must not leave an awkward visual gap when absent. Prefer rendering nothing while retaining the named grid area in the template.

## Self-Score

| Category                | Score | Rationale                                                                                                             |
| ----------------------- | ----: | --------------------------------------------------------------------------------------------------------------------- |
| Task fit                |     5 | Covers the full dashboard with required regions and focuses on resilience without changing the page shell contract.   |
| DryUI contract          |     5 | Uses shell-owned container, inner responsive grid, `data-layout-area` hooks, and keeps structure in `src/layout.css`. |
| Container-query quality |     5 | Mobile-first base with tablet and desktop `@container` shifts that style descendants, not the shell.                  |
| Visual hierarchy        |     4 | Chart and table remain primary, but resilience emphasis can over-index on state panels if not carefully branched.     |
| State coverage          |     5 | Explicit loading, empty, error, disabled, dense-data, long-label, no-overflow, and viewport stability handling.       |
| Implementation risk     |     4 | Main risk is component API mismatch or overusing structural minimums; layout approach itself is low risk.             |
