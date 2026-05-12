# Merged Best V2 Analytics Dashboard Page

## 1. Target brief

`type=page, subtype=dashboard, user=product operations analyst, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

Build a full-page Svelte 5 dashboard titled `Analytics Dashboard`. The page helps a product operations analyst monitor acquisition, activation, revenue, and retention health for a selected date range and segment. The primary work surface is a trend chart; filters and actions appear before affected data; compact summary metrics, secondary insights/actions, and a dense data table complete the workflow.

Verified local DryUI exports checked before naming APIs:

- `Button`, `Input`, `Label`, `Alert`, `Badge`, `Skeleton` are exported from `packages/ui/src/index.ts`.
- `Field.Root`, `Field.Description`, `Field.Error` are exported from `packages/ui/src/field/index.ts`; `Label` is a separate export.
- `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item` are exported from `packages/ui/src/select/index.ts`.
- `DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Content`, `DatePicker.Calendar` are exported from `packages/ui/src/date-picker/index.ts`.
- `Chart.Root`, `Chart.Line`, `Chart.Area`, `Chart.XAxis`, `Chart.YAxis`, `Chart.Bars` are exported from `packages/ui/src/chart/index.ts`.
- `DataGrid.Root`, `DataGrid.Table`, `DataGrid.Header`, `DataGrid.Row`, `DataGrid.Column`, `DataGrid.Body`, `DataGrid.Cell`, `DataGrid.Pagination` are exported from `packages/ui/src/data-grid/index.ts`.

## 2. Branch/variant/scoring work required by the assigned skill

Dashboard Branch choices:

- Primary task: monitor.
- Density: compact.
- Stable regions: header, filter/action bar, status strip, compact summary metrics, primary chart, secondary insights/actions, data table.
- Mobile order: header, filters/actions, status, metrics, primary chart, secondary insights/actions, table.
- Tablet shift: filters become two columns, metrics become two columns, secondary sits beside status/insight content only if readable.
- Desktop shift: compact left-to-right header/actions, chart dominates the main row, insights sit beside chart, table spans the full lower width.

Full Page Branch choices:

- Shell: `<main data-layout="analytics-dashboard-shell">`.
- Named container owner: shell gets `container: analytics-dashboard / inline-size`.
- Responsive grid target: direct inner child `<div data-layout-area="page">`.
- Container queries target descendants inside the shell, not the shell itself.
- Base layout is mobile-first single column.
- Tablet and desktop shifts use `@container analytics-dashboard (min-width: ...)`.

Three layout candidates for a substantial new page:

| Candidate                           | Description                                                                                                | Score | Notes                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------------- |
| A. Chart-first operations dashboard | Header, filters, status, metrics, dominant chart, insights beside chart on desktop, table full-width below |     9 | Best fit for monitor task; chart remains dominant without losing dense table readability. |
| B. Table-first revenue review       | Header, filters, metrics, table as primary region, chart and insights below                                |     7 | Better for triage/report, weaker for monitoring trends.                                   |
| C. Executive KPI canvas             | Large KPI band, chart below, insights/cards around it                                                      |     5 | Too spacious and KPI-heavy for compact operations density; risks wasting desktop space.   |

Winner: Candidate A. Merge detail: keep Candidate A's chart-first desktop, borrow Candidate B's full-width readable table treatment, reject Candidate C's oversized KPI band.

## 3. Winning implementation plan

Use a single Svelte route page with local sample data and Svelte 5 runes for state:

- Imports: `Button`, `Input`, `Label`, `Field`, `Select`, `DatePicker`, `Alert`, `Badge`, `Skeleton`, `Chart`, `DataGrid`.
- State: `rangeStart`, `rangeEnd`, `segment`, `channel`, `query`, `status` where status can be `'ready' | 'loading' | 'empty' | 'error' | 'disabled'`.
- Derived values: `filteredRows`, `hasRows`, `chartData`, and formatted metric deltas.
- Markup uses only layout hooks on raw interior elements. DryUI components receive no `class=`.
- `src/layout.css` owns all page grid/flex structure and named grid areas.
- Route/component CSS owns visual styling only: colors, borders, typography, chart/table overflow constraints, metric presentation, and state surfaces using DryUI tokens.
- State branches preserve the same stable regions: loading uses `Skeleton`, empty and error use `Alert`, disabled keeps controls visible but disabled and shows an informational state, dense data uses `DataGrid` pagination and compact numeric cells.

## 4. Proposed Svelte markup structure

Snippet integrity gate result:

- Every Svelte component used below appears in the import list.
- All compound parts named below are verified exports.
- This snippet is proposed route markup, not applied to production files.
- Named grid areas used: `header`, `filters`, `status`, `metrics`, `chart`, `insights`, `table`; each has a corresponding `grid-area` rule in the CSS section.

```svelte
<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Chart,
		DataGrid,
		DatePicker,
		Field,
		Input,
		Label,
		Select,
		Skeleton
	} from '@dryui/ui';

	type DashboardStatus = 'ready' | 'loading' | 'empty' | 'error' | 'disabled';
	type Segment = 'all' | 'self-serve' | 'sales-led';
	type Channel = 'all' | 'organic' | 'paid' | 'partner';

	type FunnelRow = {
		id: number;
		source: string;
		visitors: number;
		signups: number;
		activation: string;
		revenue: number;
		status: 'Healthy' | 'Watch' | 'Blocked';
	};

	let rangeStart = $state<Date | null>(new Date(2026, 4, 1));
	let rangeEnd = $state<Date | null>(new Date(2026, 4, 31));
	let segment = $state<Segment>('all');
	let channel = $state<Channel>('all');
	let query = $state('');
	let status = $state<DashboardStatus>('ready');

	const chartData = [
		{ label: 'Mon', value: 118 },
		{ label: 'Tue', value: 126 },
		{ label: 'Wed', value: 121 },
		{ label: 'Thu', value: 144 },
		{ label: 'Fri', value: 152 },
		{ label: 'Sat', value: 138 },
		{ label: 'Sun', value: 161 }
	];

	const rows: FunnelRow[] = [
		{
			id: 1,
			source: 'Organic search',
			visitors: 48210,
			signups: 3820,
			activation: '42.8%',
			revenue: 128400,
			status: 'Healthy'
		},
		{
			id: 2,
			source: 'Paid social',
			visitors: 26180,
			signups: 1490,
			activation: '31.4%',
			revenue: 68200,
			status: 'Watch'
		},
		{
			id: 3,
			source: 'Partner referrals',
			visitors: 18420,
			signups: 1215,
			activation: '46.2%',
			revenue: 74100,
			status: 'Healthy'
		},
		{
			id: 4,
			source: 'Lifecycle email',
			visitors: 9240,
			signups: 802,
			activation: '28.9%',
			revenue: 21600,
			status: 'Blocked'
		}
	];

	const currency = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	const statusColor = { Healthy: 'green', Watch: 'blue', Blocked: 'red' } as const;
	const filteredRows = $derived(
		rows.filter((row) => row.source.toLowerCase().includes(query.toLowerCase()))
	);
	const hasRows = $derived(filteredRows.length > 0);
</script>

<main data-layout="analytics-dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-title">
				<p data-layout="analytics-dashboard-eyebrow">Workspace analytics</p>
				<h1 data-layout="analytics-dashboard-heading">Analytics Dashboard</h1>
				<p data-layout="analytics-dashboard-summary">
					Monitor acquisition quality, activation, and revenue movement across active channels.
				</p>
			</div>
			<div data-layout="analytics-dashboard-header-actions">
				<Button variant="secondary">Export CSV</Button>
				<Button disabled={status === 'disabled'}>Refresh</Button>
			</div>
		</header>

		<form data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root>
				<Label>Start date</Label>
				<DatePicker.Root bind:value={rangeStart} name="start-date">
					<DatePicker.Trigger placeholder="Start date" disabled={status === 'disabled'} />
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</Field.Root>

			<Field.Root>
				<Label>End date</Label>
				<DatePicker.Root bind:value={rangeEnd} name="end-date">
					<DatePicker.Trigger placeholder="End date" disabled={status === 'disabled'} />
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</Field.Root>

			<Field.Root>
				<Label>Segment</Label>
				<Select.Root bind:value={segment} name="segment" disabled={status === 'disabled'}>
					<Select.Trigger>
						<Select.Value placeholder="Choose segment" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All segments</Select.Item>
						<Select.Item value="self-serve">Self-serve</Select.Item>
						<Select.Item value="sales-led">Sales-led</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Label>Channel</Label>
				<Select.Root bind:value={channel} name="channel" disabled={status === 'disabled'}>
					<Select.Trigger>
						<Select.Value placeholder="Choose channel" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All channels</Select.Item>
						<Select.Item value="organic">Organic</Select.Item>
						<Select.Item value="paid">Paid</Select.Item>
						<Select.Item value="partner">Partner</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Label>Search source</Label>
				<Input
					bind:value={query}
					placeholder="Filter table rows"
					disabled={status === 'disabled'}
				/>
			</Field.Root>
		</form>

		<section data-layout-area="status" aria-live="polite">
			{#if status === 'error'}
				<Alert variant="error">
					{#snippet title()}Analytics sync failed{/snippet}
					{#snippet description()}Retry the refresh or check the warehouse connection before acting
						on this report.{/snippet}
				</Alert>
			{:else if status === 'empty' || !hasRows}
				<Alert variant="info">
					{#snippet title()}No matching analytics data{/snippet}
					{#snippet description()}Adjust filters or widen the date range to restore the trend and
						table views.{/snippet}
				</Alert>
			{:else if status === 'disabled'}
				<Alert variant="warning">
					{#snippet title()}Dashboard controls are disabled{/snippet}
					{#snippet description()}A scheduled backfill is running, so the current snapshot is
						read-only.{/snippet}
				</Alert>
			{:else}
				<Alert variant="success">
					{#snippet title()}Data current through 09:00 UTC{/snippet}
					{#snippet description()}Seven-day trend and source table are ready for review.{/snippet}
				</Alert>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each [['Visitors', '102.1K', '+8.4%'], ['Activation', '39.6%', '+2.1%'], ['Revenue', '$292K', '+5.7%'], ['Churn risk', '3.2%', '-0.6%']] as metric}
				<article data-layout="analytics-dashboard-metric">
					<p data-layout="analytics-dashboard-metric-label">{metric[0]}</p>
					<strong data-layout="analytics-dashboard-metric-value">{metric[1]}</strong>
					<span data-layout="analytics-dashboard-metric-change">{metric[2]}</span>
				</article>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="analytics-dashboard-chart-title">
			<div data-layout="analytics-dashboard-region-header">
				<h2 id="analytics-dashboard-chart-title" data-layout="analytics-dashboard-region-title">
					Activation trend
				</h2>
				<Badge variant="soft" color="green">Live</Badge>
			</div>
			{#if status === 'loading'}
				<Skeleton variant="rectangular" height="320px" />
			{:else}
				<div data-layout="analytics-dashboard-chart-frame">
					<Chart.Root
						data={chartData}
						width={760}
						height={320}
						summary="Seven-day activation trend"
					>
						<Chart.Area />
						<Chart.Line strokeWidth={3} showDots />
						<Chart.XAxis />
						<Chart.YAxis ticks={4} />
					</Chart.Root>
				</div>
			{/if}
		</section>

		<aside data-layout-area="insights" aria-labelledby="analytics-dashboard-insights-title">
			<div data-layout="analytics-dashboard-region-header">
				<h2 id="analytics-dashboard-insights-title" data-layout="analytics-dashboard-region-title">
					Insights
				</h2>
				<Button variant="secondary" size="sm">Create task</Button>
			</div>
			<ul data-layout="analytics-dashboard-insight-list">
				<li data-layout="analytics-dashboard-insight-item">
					Partner referrals convert 14% above account average.
				</li>
				<li data-layout="analytics-dashboard-insight-item">
					Paid social activation dropped after the campaign reset.
				</li>
				<li data-layout="analytics-dashboard-insight-item">
					Lifecycle email is blocked by delayed event ingestion.
				</li>
			</ul>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-dashboard-table-title">
			<div data-layout="analytics-dashboard-region-header">
				<h2 id="analytics-dashboard-table-title" data-layout="analytics-dashboard-region-title">
					Source performance
				</h2>
				<Badge variant="outline" color="gray">Dense data</Badge>
			</div>
			{#if status === 'loading'}
				<Skeleton variant="rectangular" height="280px" />
			{:else if hasRows}
				<DataGrid.Root items={filteredRows} pageSize={4} striped>
					<DataGrid.Table>
						<DataGrid.Header>
							<DataGrid.Row>
								<DataGrid.Column key="source" sortable>Source</DataGrid.Column>
								<DataGrid.Column key="visitors" sortable>Visitors</DataGrid.Column>
								<DataGrid.Column key="signups" sortable>Signups</DataGrid.Column>
								<DataGrid.Column key="activation" sortable>Activation</DataGrid.Column>
								<DataGrid.Column key="revenue" sortable>Revenue</DataGrid.Column>
								<DataGrid.Column key="status">Status</DataGrid.Column>
							</DataGrid.Row>
						</DataGrid.Header>
						<DataGrid.Body>
							{#snippet children({ items })}
								{@const visibleRows = items as FunnelRow[]}
								{#each visibleRows as row (row.id)}
									<DataGrid.Row>
										<DataGrid.Cell>{row.source}</DataGrid.Cell>
										<DataGrid.Cell
											><span data-layout="analytics-dashboard-number"
												>{row.visitors.toLocaleString()}</span
											></DataGrid.Cell
										>
										<DataGrid.Cell
											><span data-layout="analytics-dashboard-number"
												>{row.signups.toLocaleString()}</span
											></DataGrid.Cell
										>
										<DataGrid.Cell
											><span data-layout="analytics-dashboard-number">{row.activation}</span
											></DataGrid.Cell
										>
										<DataGrid.Cell
											><span data-layout="analytics-dashboard-number"
												>{currency.format(row.revenue)}</span
											></DataGrid.Cell
										>
										<DataGrid.Cell
											><Badge variant="soft" color={statusColor[row.status]}>{row.status}</Badge
											></DataGrid.Cell
										>
									</DataGrid.Row>
								{/each}
							{/snippet}
						</DataGrid.Body>
					</DataGrid.Table>
					<DataGrid.Pagination />
				</DataGrid.Root>
			{/if}
		</section>
	</div>
</main>
```

## 5. Proposed `src/layout.css` structure

Snippet integrity gate result:

- Every `grid-template-areas` token has exactly one matching direct child selector with `grid-area`.
- `src/layout.css` includes structural layout only.
- This proposed `src/layout.css` intentionally uses `inline-size` for the shell and `minmax(0, ...)` grid tracks. Therefore it must not be described as avoiding inline sizing.
- Intrinsic overflow fixes for chart SVGs, table wrappers, text, and media remain in route/component visual CSS, not in this structural file.

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
	grid-template-columns: minmax(0, 1fr);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
	grid-area: header;
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	grid-area: filters;
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='status'] {
	grid-area: status;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	grid-area: metrics;
	display: grid;
	gap: var(--dry-space-3);
	grid-template-columns: minmax(0, 1fr);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'] {
	grid-area: chart;
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='insights'] {
	grid-area: insights;
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	grid-area: table;
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-title'],
[data-layout='analytics-dashboard-header-actions'],
[data-layout='analytics-dashboard-region-header'],
[data-layout='analytics-dashboard-insight-list'] {
	display: grid;
	gap: var(--dry-space-2);
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'],
	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'],
	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-areas:
			'header header header'
			'filters filters filters'
			'status status status'
			'metrics metrics metrics'
			'chart chart insights'
			'table table table';
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(18rem, 0.72fr);
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Route/component visual CSS would handle non-structural presentation only, for example:

- Surface colors, borders, and text color for metric cards and regions.
- `min-inline-size: 0`, `max-inline-size: 100%`, and `overflow-x: auto` around chart/table visual wrappers.
- Typography for numeric cells using `var(--dry-font-mono)`.
- No `display: grid`, no `display: flex`, no layout breakpoints, no inline `style=`, no `style:` directives.

## 6. Visual check plan for mobile, tablet, desktop

Check screenshots at:

- Mobile: 390px wide.
- Tablet: 820px wide.
- Desktop: 1440px wide.

Pass criteria:

- No horizontal page overflow from chart SVG, table, long source labels, metric values, or filter controls.
- Page title `Analytics Dashboard`, filters/actions, and current data status are visible early on mobile.
- Tablet uses available width: filters and metrics move to two columns while chart remains readable.
- Desktop chart dominates the main work row, insights sit beside it, and dense table spans below for readability.
- Loading, empty, error, disabled, and dense-data branches preserve the same named regions and do not cause large layout jumps.
- Disabled controls remain visible and understandable; primary action disabled state is visually apparent.
- Text does not overlap or clip in buttons, labels, alerts, KPI values, table headers, chart axes, or insight copy.

## 7. Self-review against the assigned test skill

- Loaded and followed the experiment-local skill at `reports/skill-experiments/2026-05-11/batch-3/merged-best-v2/SKILL.md`.
- Used the dashboard branch before full page branch because the target is a dashboard page.
- Wrote the target brief before markup.
- Inspected local exports and nearby demos before naming component APIs.
- Did not name unverified component parts.
- Used a page shell that owns `container: analytics-dashboard / inline-size`.
- Put the responsive grid on the shell's direct inner child.
- Used `data-layout` and `data-layout-area` hooks; avoided layout-wrapper components.
- Kept page/section structure in proposed `src/layout.css`.
- Kept route/component style responsibilities visual only and called out overflow constraints separately.
- Used mobile-first layout and tablet/desktop `@container` shifts, not `@media`.
- Included loading, empty, error, disabled, and dense-data state handling.
- Applied the snippet integrity gate before presenting Svelte and CSS snippets.
- Did not edit production app, package, docs, or canonical skill files.
- Edited only this requested report output file.
- Validation not run because this is a report-only task and no production code was changed.
