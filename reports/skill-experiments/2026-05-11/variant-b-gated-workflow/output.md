# Variant B Output: Gated Dashboard Workflow

## Target Brief

Target brief: type=page, subtype=dashboard, user=product analyst, primary_task=monitor, density=standard, required_states=loading|empty|error|dense-data.

## Concise Implementation Plan

1. Create a Svelte 5 route page titled "Analytics Dashboard" with one page root: `<main data-layout="analytics-dashboard">`.
2. Put all page structure behind `data-layout-area` hooks for header, filters/actions, summary metrics, primary chart, table, and state message regions.
3. Use DryUI components for the dashboard surface: `Button`, `Card`, `Chart`, `DataGrid` or `Table`, `Input`, `Select`, `Badge`, `Skeleton`, and alert/status components where available.
4. Keep route component styles visual-only or omit them entirely. All page grid/flex structure, area placement, gaps, spacing, and responsive behavior live in `src/layout.css`.
5. Model four data states explicitly: loading skeletons, empty state, error state with retry action, and dense-data state with table pagination or compact rows.

## Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import { Badge, Button, Card, Chart, DataGrid, Input, Select, Skeleton } from '@dryui/ui';

	type DashboardState = 'loading' | 'empty' | 'error' | 'ready';

	let dashboardState: DashboardState = 'ready';
	let query = $state('');
	let range = $state('30d');
	let segment = $state('all');

	const metrics = [
		{ label: 'Revenue', value: '$128.4k', delta: '+12.6%', tone: 'positive' },
		{ label: 'Conversion', value: '8.2%', delta: '+1.4%', tone: 'positive' },
		{ label: 'Active users', value: '42,810', delta: '-2.1%', tone: 'critical' },
		{ label: 'Avg. order', value: '$64.20', delta: '+3.8%', tone: 'positive' }
	];

	const rows = [];
	const chartSeries = [];
</script>

<main data-layout="analytics-dashboard">
	<header data-layout-area="dashboard-heading">
		<div data-layout-area="dashboard-title-group">
			<Badge>Live</Badge>
			<h1>Analytics Dashboard</h1>
		</div>
		<div data-layout-area="dashboard-page-actions">
			<Button variant="secondary">Export</Button>
			<Button>Refresh</Button>
		</div>
	</header>

	<section aria-label="Filters and actions" data-layout-area="dashboard-controls">
		<Input bind:value={query} aria-label="Search analytics rows" placeholder="Search" />
		<Select bind:value={range} aria-label="Date range">
			<option value="7d">Last 7 days</option>
			<option value="30d">Last 30 days</option>
			<option value="90d">Last 90 days</option>
		</Select>
		<Select bind:value={segment} aria-label="Segment">
			<option value="all">All segments</option>
			<option value="new">New customers</option>
			<option value="returning">Returning customers</option>
		</Select>
		<Button variant="secondary">Apply</Button>
	</section>

	{#if dashboardState === 'loading'}
		<section aria-label="Loading dashboard" data-layout-area="dashboard-state">
			<Skeleton />
			<Skeleton />
			<Skeleton />
		</section>
	{:else if dashboardState === 'error'}
		<section aria-label="Dashboard error" data-layout-area="dashboard-state">
			<Card>
				<h2>Analytics could not be loaded</h2>
				<p>Try again or adjust the selected filters.</p>
				<Button>Retry</Button>
			</Card>
		</section>
	{:else if dashboardState === 'empty'}
		<section aria-label="Empty dashboard" data-layout-area="dashboard-state">
			<Card>
				<h2>No analytics found</h2>
				<p>Change the date range or segment to widen the result set.</p>
				<Button variant="secondary">Reset filters</Button>
			</Card>
		</section>
	{:else}
		<section aria-label="Summary metrics" data-layout-area="dashboard-metrics">
			{#each metrics as metric}
				<Card data-layout-area="dashboard-metric-card">
					<span>{metric.label}</span>
					<strong>{metric.value}</strong>
					<Badge tone={metric.tone}>{metric.delta}</Badge>
				</Card>
			{/each}
		</section>

		<section aria-labelledby="analytics-trend-title" data-layout-area="dashboard-chart">
			<Card>
				<div data-layout-area="chart-heading">
					<h2 id="analytics-trend-title">Revenue trend</h2>
					<Badge>Daily</Badge>
				</div>
				<Chart data={chartSeries} />
			</Card>
		</section>

		<section aria-labelledby="analytics-table-title" data-layout-area="dashboard-table">
			<div data-layout-area="table-heading">
				<h2 id="analytics-table-title">Channel performance</h2>
				<Button variant="secondary">Columns</Button>
			</div>
			<DataGrid {rows} density="compact" />
		</section>
	{/if}
</main>
```

## Proposed `src/layout.css` Structure

```css
[data-layout='analytics-dashboard'] {
	container: analytics-dashboard / inline-size;
	display: grid;
	gap: var(--dryui-space-5);
	align-content: start;
	padding: var(--dryui-space-4);
	min-block-size: 100svb;
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-heading'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-controls'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-metrics'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-chart'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-table'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-state'] {
	min-inline-size: 0;
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-heading'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-title-group'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-page-actions'],
[data-layout='analytics-dashboard'] [data-layout-area='dashboard-controls'],
[data-layout='analytics-dashboard'] [data-layout-area='chart-heading'],
[data-layout='analytics-dashboard'] [data-layout-area='table-heading'] {
	display: grid;
	gap: var(--dryui-space-3);
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-metrics'] {
	display: grid;
	gap: var(--dryui-space-3);
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-metric-card'] {
	display: grid;
	gap: var(--dryui-space-2);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-chart'] {
	min-block-size: 22rem;
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-table'] {
	display: grid;
	gap: var(--dryui-space-3);
	overflow: auto;
}

[data-layout='analytics-dashboard'] [data-layout-area='dashboard-state'] {
	display: grid;
	gap: var(--dryui-space-3);
	align-content: start;
	min-block-size: 18rem;
}

@container analytics-dashboard (min-width: 44rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-template-areas:
			'heading heading heading heading'
			'controls controls controls controls'
			'metrics metrics metrics metrics'
			'chart chart chart chart'
			'table table table table';
		padding: var(--dryui-space-6);
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-heading'] {
		grid-area: heading;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-controls'] {
		grid-area: controls;
		grid-template-columns: minmax(12rem, 1fr) repeat(2, minmax(10rem, 14rem)) auto;
		align-items: end;
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-metrics'] {
		grid-area: metrics;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-chart'] {
		grid-area: chart;
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-table'] {
		grid-area: table;
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-areas:
			'heading heading heading heading heading heading heading heading heading heading heading heading'
			'controls controls controls controls controls controls controls controls controls controls controls controls'
			'metrics metrics metrics metrics chart chart chart chart chart chart chart chart'
			'table table table table table table table table table table table table';
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-content: start;
	}

	[data-layout='analytics-dashboard'] [data-layout-area='dashboard-chart'] {
		min-block-size: 28rem;
	}
}

[data-layout='analytics-dashboard'] h1,
[data-layout='analytics-dashboard'] h2,
[data-layout='analytics-dashboard'] p,
[data-layout='analytics-dashboard'] span,
[data-layout='analytics-dashboard'] strong {
	overflow-wrap: anywhere;
}
```

## Self-Review Against Variant B

- Route-level layout CSS: satisfied. The proposed Svelte file has no page-level `display: grid`, `display: flex`, layout breakpoint, inline style, or `style:` directive.
- Structural hooks: satisfied. The page root owns `data-layout="analytics-dashboard"` and structural descendants use `data-layout-area` names tied to clear layout reasons.
- Dashboard primary task: satisfied. The design prioritizes monitoring, with filters before affected chart/table data and the largest desktop region assigned to the primary trend chart.
- Required states: satisfied. Loading, empty, error, and dense-data states are represented; dense data uses a compact `DataGrid` rather than hover-only controls.
- DryUI lint risk: low. The main thing to verify during implementation is exact component API names and props for `Chart`, `DataGrid`, `Badge tone`, and `Skeleton`; the layout discipline itself follows the gated workflow.
