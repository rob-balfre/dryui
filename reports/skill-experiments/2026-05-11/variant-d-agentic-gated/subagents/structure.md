# Structure Variant

## Target Brief

Target brief: type=page, subtype=dashboard, user=product analyst, primary_task=monitor analytics performance and drill into recent campaign rows, density=standard, required_states=loading empty error disabled dense-data.

## Information Architecture

The dashboard should read as a task-first analytics workspace, not a collection of disconnected cards. The first viewport should establish the current analytics scope, expose the primary actions, and put filters before the data they affect.

Primary regions:

1. Header: title, scope label, export/report actions.
2. Filters/actions: search, date range, channel/status filters, apply/reset.
3. Status: error or global loading/empty messaging when needed.
4. Summary metrics: four comparable KPI units.
5. Primary chart: dominant performance trend region.
6. Insights rail: secondary “needs attention” actions on desktop only as a side rail; stacked after chart on smaller containers.
7. Data table: campaign-level rows for drill-down and dense comparison.

Recommended responsive reading order:

- Mobile: header, filters, status, metrics, chart, insights, table.
- Tablet: header, filters, status, two-column metrics, chart, insights, table.
- Desktop: header, filters, status, four-column metrics, chart plus insights rail, full-width table.

This keeps the table available, but gives the chart the largest stable region because monitoring trend performance is the primary task.

## Mobile Layout Plan

At narrow container widths, the inner page grid stays single-column. Header actions wrap under or beside the title depending on component sizing. Filters wrap in source order, with Apply/Reset following the fields so the action remains immediately reachable after filter selection.

Metrics stack as one-column comparable units. The chart appears before the table to support monitoring before drill-down. The insights region stays after the chart so it does not interrupt the filter-to-chart path. The table region owns its own horizontal overflow for dense columns, preventing page-level overflow.

State placement:

- Loading: skeletons render in the same metric, chart, and table regions.
- Empty: chart and table empty states stay inside their normal regions.
- Error: global status appears after filters and before data regions.
- Disabled: header and filter actions preserve layout while disabled.
- Dense-data: table scrolls within `data-layout-area="table"`.

## Tablet Layout Plan

At about `48rem`, keep the page in two equal tracks, but avoid prematurely splitting chart and table. The tablet shift should improve scan speed without turning the page into a compressed desktop.

Tablet structure:

- Header, filters, and status span both tracks.
- Metrics become a two-column grid.
- Chart spans both tracks.
- Insights spans both tracks or can use a two-column internal list if content grows.
- Table spans both tracks.

This creates a materially better tablet layout than stretched mobile while preserving a clear vertical workflow.

## Desktop Layout Plan

At about `72rem`, move to a 12-column inner page grid.

Desktop structure:

- Header spans 12 columns.
- Filters span 12 columns.
- Status spans 12 columns.
- Metrics span 12 columns and render as four equal KPI tracks.
- Chart spans 8 columns.
- Insights spans 4 columns as the secondary action rail.
- Table spans 12 columns below chart and insights.

The chart should be the dominant visual surface. The insights rail should be secondary and action-oriented, not a second dashboard competing for attention.

## Hooks

Proposed Svelte layout hooks:

```svelte
<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page" aria-labelledby="analytics-dashboard-title">
		<header data-layout-area="header">
			<div data-layout-area="title">...</div>
			<div data-layout-area="header-actions">...</div>
		</header>

		<section data-layout-area="filters" aria-label="Dashboard filters">...</section>
		<section data-layout-area="status" aria-live="polite">...</section>
		<section data-layout-area="metrics" aria-label="Summary metrics">...</section>
		<section data-layout-area="chart" aria-labelledby="analytics-chart-title">...</section>
		<aside data-layout-area="insights" aria-labelledby="analytics-insights-title">...</aside>
		<section data-layout-area="table" aria-labelledby="analytics-table-title">...</section>
	</section>
</main>
```

Optional internal hooks:

- `data-layout-area="section-heading"` for chart/table title and local actions.
- `data-layout-area="filter-fields"` if filter controls need stable grouping.
- `data-layout-area="empty-state"` for centered empty content inside chart/table regions.
- `data-layout-area="table-scroll"` only if the table component cannot own horizontal overflow directly.

## Proposed `src/layout.css` Structure

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
		'insights'
		'table';
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='section-heading'] {
	display: flex;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='section-heading'] {
	align-items: start;
	justify-content: space-between;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	align-items: end;
	flex-wrap: wrap;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-template-columns: 1fr;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='insights'],
[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-3);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	overflow-x: auto;
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'chart chart'
			'insights insights'
			'table table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-areas:
			'header header header header header header header header header header header header'
			'filters filters filters filters filters filters filters filters filters filters filters filters'
			'status status status status status status status status status status status status'
			'metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics'
			'chart chart chart chart chart chart chart chart insights insights insights insights'
			'table table table table table table table table table table table table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Assign each named region to its grid area with one rule per area in the same file. Keep those mappings structural only:

```css
[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
	grid-area: header;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	grid-area: filters;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='status'] {
	grid-area: status;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	grid-area: metrics;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'] {
	grid-area: chart;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='insights'] {
	grid-area: insights;
}
[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	grid-area: table;
}
```

## Risks

- `status` may be absent in the ready state. The implementation should either always render an inert region or ensure missing grid-area content does not create awkward spacing.
- The `header` and `filters` flex rules are structural, but long button labels or filter labels still need visual component-level wrapping behavior.
- `overflow-x: auto` on the table region is acceptable for dense data containment, but it should be verified against DryUI lint expectations and actual table component behavior.
- The desktop insights rail can weaken the primary chart if its content becomes too visually heavy. Keep it short and action-focused.
- Tablet can feel too conservative if insights content is important. If the final content makes insights primary, split chart/insights at tablet only after visual checks.
- Actual DryUI component exports may differ from the concept. The structure should survive component substitutions, but implementation must use real component names.

## Self-Score

| Category                | Score |
| ----------------------- | ----: |
| Task fit                |     5 |
| DryUI contract          |     5 |
| Container-query quality |     5 |
| Visual hierarchy        |     5 |
| State coverage          |     4 |
| Implementation risk     |     4 |

Total: 28/30.
