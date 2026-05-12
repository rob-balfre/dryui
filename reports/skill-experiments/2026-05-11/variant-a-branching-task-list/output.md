# Variant A Output: Analytics Dashboard

## Concise Implementation Plan

Target branches: **Dashboard or data surface**, then **Full page**.

Primary user task: **monitor and compare** analytics health across channels, campaigns, and recent events.

Density: **standard**, with compact table rows available for dense-data mode.

Regions:

- `header`: page title, date range summary, status copy.
- `filters`: date range, channel selector, segment selector, refresh/export actions.
- `metrics`: comparable summary metric cards.
- `chart`: primary visualization with loading, empty, and error branches.
- `table`: tabular campaign or event data with row actions.
- `detail`: secondary insight/action area for anomalies or selected row context.

Implementation steps:

1. Create a route page with one root wrapper: `<main data-layout="analytics-dashboard">`.
2. Add `container: analytics-dashboard / inline-size` on that root in `src/layout.css`.
3. Use `data-layout-area` on each dashboard region.
4. Keep all page and region grid/flex structure in `src/layout.css`; keep route styles limited to visual treatment and state styling if needed.
5. Use DryUI primitives for buttons, selects, cards, table/data grid, chart, alerts, skeletons, and empty state where available.
6. Implement state branches for loading, empty, error, disabled refresh/export actions, and dense-data table mode.
7. Verify narrow and desktop containers, long metric labels, many table rows, and primary action visibility after collapse.

## Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Card,
		Chart,
		DataGrid,
		EmptyState,
		Select,
		Skeleton,
		Sparkline,
		Table,
		Tabs
	} from '@dryui/ui';

	type DashboardState = 'loading' | 'ready' | 'empty' | 'error';

	let state: DashboardState = 'ready';
	let dense = false;
	let isRefreshing = false;

	const metrics = [
		{ label: 'Revenue', value: '$128.4k', delta: '+12.8%', trend: [] },
		{ label: 'Conversion rate', value: '4.8%', delta: '+0.6%', trend: [] },
		{ label: 'Active campaigns', value: '42', delta: '-3', trend: [] },
		{ label: 'Cost per lead', value: '$18.20', delta: '-7.4%', trend: [] }
	];

	const rows = [];
</script>

<main data-layout="analytics-dashboard">
	<header data-layout-area="header" class="dashboard-header">
		<div>
			<Badge tone="neutral">Live</Badge>
			<h1>Analytics Dashboard</h1>
			<p>Monitor performance across active channels and campaigns.</p>
		</div>

		<Button variant="primary" disabled={isRefreshing}>
			{isRefreshing ? 'Refreshing' : 'Refresh'}
		</Button>
	</header>

	<section data-layout-area="filters" aria-label="Dashboard filters" class="dashboard-filters">
		<Select label="Date range" value="30d" />
		<Select label="Channel" value="all" />
		<Select label="Segment" value="all" />
		<Button variant="secondary">Export</Button>
	</section>

	<section data-layout-area="metrics" aria-label="Summary metrics" class="dashboard-metrics">
		{#each metrics as metric}
			<Card class="metric-card">
				<span>{metric.label}</span>
				<strong>{metric.value}</strong>
				<Badge tone={metric.delta.startsWith('+') ? 'success' : 'neutral'}>{metric.delta}</Badge>
				<Sparkline data={metric.trend} aria-label={`${metric.label} trend`} />
			</Card>
		{/each}
	</section>

	<section data-layout-area="chart" aria-labelledby="performance-heading" class="dashboard-chart">
		<div class="section-heading">
			<h2 id="performance-heading">Performance trend</h2>
			<Tabs value="revenue" />
		</div>

		{#if state === 'loading'}
			<Skeleton aria-label="Loading performance chart" />
		{:else if state === 'error'}
			<Alert tone="critical" title="Chart unavailable">Performance data could not be loaded.</Alert>
		{:else if state === 'empty'}
			<EmptyState
				title="No chart data"
				description="Try a wider date range or different filters."
			/>
		{:else}
			<Chart aria-label="Revenue and conversion trend" />
		{/if}
	</section>

	<section data-layout-area="table" aria-labelledby="campaigns-heading" class:dense>
		<div class="section-heading">
			<h2 id="campaigns-heading">Campaign performance</h2>
			<Button variant="ghost" pressed={dense}>Dense rows</Button>
		</div>

		{#if state === 'loading'}
			<Skeleton aria-label="Loading campaign rows" />
		{:else if state === 'error'}
			<Alert tone="critical" title="Table unavailable">Campaign rows could not be loaded.</Alert>
		{:else if rows.length === 0}
			<EmptyState
				title="No campaigns found"
				description="Adjust filters to include more campaigns."
			/>
		{:else}
			<DataGrid {rows} density={dense ? 'compact' : 'standard'} />
		{/if}
	</section>

	<aside data-layout-area="detail" aria-labelledby="insights-heading" class="dashboard-detail">
		<h2 id="insights-heading">Insights</h2>
		<Table rows={[]} caption="Recent anomalies and recommended actions" />
	</aside>
</main>
```

## Proposed `src/layout.css` Structure

```css
[data-layout='analytics-dashboard'] {
	container: analytics-dashboard / inline-size;
	display: grid;
	gap: var(--dryui-space-4);
	grid-template-areas:
		'header'
		'filters'
		'metrics'
		'chart'
		'table'
		'detail';
}

[data-layout='analytics-dashboard'] > [data-layout-area='header'] {
	grid-area: header;
}

[data-layout='analytics-dashboard'] > [data-layout-area='filters'] {
	grid-area: filters;
	display: grid;
	gap: var(--dryui-space-3);
}

[data-layout='analytics-dashboard'] > [data-layout-area='metrics'] {
	grid-area: metrics;
	display: grid;
	gap: var(--dryui-space-3);
	grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

[data-layout='analytics-dashboard'] > [data-layout-area='chart'] {
	grid-area: chart;
}

[data-layout='analytics-dashboard'] > [data-layout-area='table'] {
	grid-area: table;
}

[data-layout='analytics-dashboard'] > [data-layout-area='detail'] {
	grid-area: detail;
}

[data-layout='analytics-dashboard'] .section-heading {
	display: grid;
	gap: var(--dryui-space-2);
}

@container analytics-dashboard (min-width: 44rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'metrics metrics'
			'chart detail'
			'table table';
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='filters'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard'] .section-heading {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		grid-template-areas:
			'header header'
			'filters filters'
			'metrics detail'
			'chart detail'
			'table table';
	}
}
```

Notes for final implementation:

- Visual styles such as color, background, border, shadow, typography, width, and height should stay in component props, tokenized route styles, or existing DryUI component APIs, not in `src/layout.css`.
- If a DryUI component exposes its own internal layout, prefer that over adding route-level selectors for component internals.
- The `DataGrid` can be replaced with `Table` if the current UI package only exposes table primitives.

## Self-Review Against Skill Variant

- Followed the dashboard branch first: named the task, chose density, defined dashboard regions, prioritized hierarchy, and included loading, empty, error, disabled, and dense-data states.
- Followed the full-page branch: one root `data-layout`, matching `src/layout.css` selector, named container query, mobile-first layout, named grid areas, and `@container` responsive shifts.
- Kept all proposed raw `display: grid` usage in `src/layout.css`; the Svelte route markup has no layout wrapper components and no route style block grid/flex rules.
- Used cards only for comparable metric units, with primary chart and data table as distinct regions rather than decorative card nesting.
- Remaining verification for a real implementation would be screenshots at mobile and desktop widths plus long-label and many-row checks.
