# Variant C Output: Analytics Dashboard

## Concise Implementation Plan

1. Build one full-page route root with `data-layout="analytics-dashboard"` and declare `container: analytics-dashboard / inline-size` in `src/layout.css`.
2. Use semantic direct children with `data-layout-area`: header, filters, metrics, chart, table, and status/detail.
3. Treat the dashboard purpose as **triage**: the user filters time range, segment, and channel, then compares KPI movement against chart and row-level campaign performance.
4. Use compact density for admin/data work. KPI cards are comparable units; the chart and table are the dominant regions.
5. Use DryUI primitives where available: `Button`, `Select`, `Field`, `Label`, `Badge`, `Chart`, `DataGrid`, `Skeleton`, and `Alert`.
6. Keep all page and section layout in `src/layout.css`; route styles, if any, only handle non-layout visual details.
7. Include loading, empty, and error branches before the default dashboard content, with disabled filter/action states while loading.
8. Verify mobile single-column collapse, desktop multi-region grid, long labels in KPI/table cells, and no horizontal overflow.

## Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import { Alert, Badge, Button, Chart, DataGrid, Field, Label, Select, Skeleton } from '@dryui/ui';

	type DashboardState = 'loading' | 'error' | 'empty' | 'ready';

	let state: DashboardState = 'ready';
	let range = '30d';
	let segment = 'all';
	let channel = 'all';

	const metrics = [
		{ label: 'Revenue', value: '$128.4K', delta: '+12.8%', tone: 'success' },
		{ label: 'Conversion rate', value: '7.4%', delta: '+1.1%', tone: 'success' },
		{ label: 'Active accounts', value: '2,418', delta: '-2.0%', tone: 'warning' },
		{ label: 'Churn risk', value: '84', delta: '+9 flagged', tone: 'danger' }
	];

	const chartData = [
		{ label: 'Week 1', value: 42000 },
		{ label: 'Week 2', value: 51000 },
		{ label: 'Week 3', value: 47000 },
		{ label: 'Week 4', value: 64000 }
	];

	const rows = [
		{
			source: 'Lifecycle email',
			segment: 'Expansion',
			visitors: 18420,
			conversion: '8.9%',
			revenue: '$44.2K',
			status: 'Healthy'
		},
		{
			source: 'Paid search',
			segment: 'Acquisition',
			visitors: 24180,
			conversion: '5.6%',
			revenue: '$38.7K',
			status: 'Watch'
		},
		{
			source: 'Partner webinar',
			segment: 'Enterprise',
			visitors: 6120,
			conversion: '12.4%',
			revenue: '$31.5K',
			status: 'Healthy'
		}
	];

	const disabled = $derived(state === 'loading');
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<main data-layout="analytics-dashboard" aria-labelledby="analytics-dashboard-title">
	<header data-layout-area="header">
		<div data-layout="analytics-dashboard-title">
			<p>Analytics</p>
			<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
		</div>
		<Button variant="solid" {disabled}>Export report</Button>
	</header>

	<section data-layout-area="filters" aria-label="Dashboard filters">
		<Field.Root>
			<Label for="range">Range</Label>
			<Select.Root bind:value={range} {disabled}>
				<Select.Trigger id="range">
					<Select.Value placeholder="Select range" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="7d">Last 7 days</Select.Item>
					<Select.Item value="30d">Last 30 days</Select.Item>
					<Select.Item value="90d">Last 90 days</Select.Item>
				</Select.Content>
			</Select.Root>
		</Field.Root>

		<Field.Root>
			<Label for="segment">Segment</Label>
			<Select.Root bind:value={segment} {disabled}>
				<Select.Trigger id="segment">
					<Select.Value placeholder="Select segment" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All segments</Select.Item>
					<Select.Item value="acquisition">Acquisition</Select.Item>
					<Select.Item value="expansion">Expansion</Select.Item>
				</Select.Content>
			</Select.Root>
		</Field.Root>

		<Field.Root>
			<Label for="channel">Channel</Label>
			<Select.Root bind:value={channel} {disabled}>
				<Select.Trigger id="channel">
					<Select.Value placeholder="Select channel" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All channels</Select.Item>
					<Select.Item value="paid">Paid</Select.Item>
					<Select.Item value="owned">Owned</Select.Item>
				</Select.Content>
			</Select.Root>
		</Field.Root>

		<Button variant="outline" {disabled}>Refresh</Button>
	</section>

	{#if state === 'loading'}
		<section data-layout-area="status" aria-label="Loading dashboard">
			<Skeleton aria-label="Loading summary metrics" />
			<Skeleton aria-label="Loading chart" />
			<Skeleton aria-label="Loading table" />
		</section>
	{:else if state === 'error'}
		<section data-layout-area="status" aria-label="Dashboard error">
			<Alert variant="danger" title="Analytics failed to load">
				Check the data connection and retry the dashboard request.
			</Alert>
			<Button variant="solid">Retry</Button>
		</section>
	{:else if state === 'empty'}
		<section data-layout-area="status" aria-label="No analytics data">
			<Alert title="No data for this filter set">
				Change the range, segment, or channel to view analytics.
			</Alert>
		</section>
	{:else}
		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-kpi">
					<p>{metric.label}</p>
					<strong>{metric.value}</strong>
					<Badge color={metric.tone}>{metric.delta}</Badge>
				</article>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="revenue-chart-title">
			<header data-layout="analytics-panel-header">
				<h2 id="revenue-chart-title">Revenue trend</h2>
				<Badge>Weekly</Badge>
			</header>
			<Chart.Root data={chartData}>
				<Chart.YAxis />
				<Chart.Area dataKey="value" />
				<Chart.Line dataKey="value" />
				<Chart.XAxis dataKey="label" />
			</Chart.Root>
		</section>

		<section data-layout-area="table" aria-labelledby="campaign-table-title">
			<header data-layout="analytics-panel-header">
				<h2 id="campaign-table-title">Campaign performance</h2>
				<Badge>{rows.length} rows</Badge>
			</header>
			<DataGrid.Root items={rows} pageSize={10} striped>
				<DataGrid.Table>
					<DataGrid.Header>
						<DataGrid.Row>
							<DataGrid.Column key="source" sortable>Source</DataGrid.Column>
							<DataGrid.Column key="segment" sortable>Segment</DataGrid.Column>
							<DataGrid.Column key="visitors" sortable>Visitors</DataGrid.Column>
							<DataGrid.Column key="conversion" sortable>Conversion</DataGrid.Column>
							<DataGrid.Column key="revenue" sortable>Revenue</DataGrid.Column>
							<DataGrid.Column key="status">Status</DataGrid.Column>
						</DataGrid.Row>
					</DataGrid.Header>
					<DataGrid.Body>
						{#each rows as row}
							<DataGrid.Row>
								<DataGrid.Cell>{row.source}</DataGrid.Cell>
								<DataGrid.Cell>{row.segment}</DataGrid.Cell>
								<DataGrid.Cell>{row.visitors}</DataGrid.Cell>
								<DataGrid.Cell>{row.conversion}</DataGrid.Cell>
								<DataGrid.Cell>{row.revenue}</DataGrid.Cell>
								<DataGrid.Cell><Badge>{row.status}</Badge></DataGrid.Cell>
							</DataGrid.Row>
						{/each}
					</DataGrid.Body>
				</DataGrid.Table>
				<DataGrid.Pagination />
			</DataGrid.Root>
		</section>
	{/if}
</main>
```

## Proposed `src/layout.css` Structure

```css
[data-layout='analytics-dashboard'] {
	container: analytics-dashboard / inline-size;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	grid-template-areas:
		'header'
		'filters'
		'metrics'
		'chart'
		'table';
	gap: var(--dryui-space-5);
	inline-size: min(100%, 1180px);
	margin-inline: auto;
	padding: var(--dryui-space-4);
}

[data-layout='analytics-dashboard'] > [data-layout-area='header'] {
	grid-area: header;
	display: grid;
	gap: var(--dryui-space-3);
}

[data-layout='analytics-dashboard-title'] {
	display: grid;
	gap: var(--dryui-space-1);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard'] > [data-layout-area='filters'] {
	grid-area: filters;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dryui-space-3);
	align-items: end;
}

[data-layout='analytics-dashboard'] > [data-layout-area='metrics'] {
	grid-area: metrics;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dryui-space-3);
}

[data-layout='analytics-kpi'] {
	display: grid;
	gap: var(--dryui-space-2);
	min-inline-size: 0;
	padding: var(--dryui-space-4);
	border: 1px solid var(--dryui-color-border);
	border-radius: var(--dryui-radius-2);
	background: var(--dryui-color-surface);
}

[data-layout='analytics-dashboard'] > [data-layout-area='chart'] {
	grid-area: chart;
	display: grid;
	gap: var(--dryui-space-4);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard'] > [data-layout-area='table'] {
	grid-area: table;
	display: grid;
	gap: var(--dryui-space-4);
	min-inline-size: 0;
	overflow-x: auto;
}

[data-layout='analytics-dashboard'] > [data-layout-area='status'] {
	grid-area: metrics / metrics / table / table;
	display: grid;
	gap: var(--dryui-space-4);
	min-inline-size: 0;
}

[data-layout='analytics-panel-header'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: var(--dryui-space-3);
	align-items: center;
}

@container analytics-dashboard (min-width: 44rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-areas:
			'header header'
			'filters filters'
			'metrics metrics'
			'chart chart'
			'table table';
		padding: var(--dryui-space-6);
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='header'],
	[data-layout='analytics-dashboard'] > [data-layout-area='filters'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='header'] {
		align-items: end;
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-areas:
			'header header header header header header header header header header header header'
			'filters filters filters filters filters filters filters filters filters filters filters filters'
			'metrics metrics metrics metrics chart chart chart chart chart chart chart chart'
			'table table table table table table table table table table table table';
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='metrics'] {
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
	}

	[data-layout='analytics-dashboard'] > [data-layout-area='chart'] {
		min-block-size: 24rem;
	}
}
```

## Self-Review Against Variant C

- Classification: full page dashboard, so Page recipe plus Dashboard recipe applies.
- Lint contract: route markup uses a single semantic root, `data-layout`, direct `data-layout-area` children, and no layout-wrapper components. Layout declarations are confined to the proposed `src/layout.css`.
- Dashboard purpose: triage, with compact density, filters before affected data, KPI summary, dominant chart, and sortable data grid.
- Responsive behavior: mobile starts as one column, then uses named `@container analytics-dashboard` rules for tablet and desktop shifts.
- State coverage: loading, empty, error, disabled controls, default rows, dense table, and long-label tolerance are represented.
- Remaining implementation check: confirm exact `Select`, `Chart`, `Alert`, and token prop names against the installed DryUI version before pasting into production source.
