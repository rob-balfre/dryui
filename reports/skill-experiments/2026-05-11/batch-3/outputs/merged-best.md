# Merged Best Analytics Dashboard Page

## 1. Target Brief

`type=page, subtype=dashboard, user=product analytics operator, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

Page title: `Analytics Dashboard`.

The page is a full analytics dashboard for monitoring product performance. The primary work surface is a trend chart for traffic and conversion movement. Supporting regions include compact summary metrics, filter/action controls, secondary insights/actions, and a dense data table. The dashboard should preserve stable regions across loading, empty, error, disabled, and dense-data states.

Verified local DryUI exports checked before naming APIs:

- `Button`, `Input`, `Label`, `Alert`, `Skeleton` are direct exports from `packages/ui/src/index.ts`.
- `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item` are verified in `packages/ui/src/select/index.ts`.
- `DateRangePicker.Root`, `DateRangePicker.Trigger`, `DateRangePicker.Content`, `DateRangePicker.Calendar`, `DateRangePicker.Preset` are verified in `packages/ui/src/date-range-picker/index.ts`.
- `Chart.Root`, `Chart.Area`, `Chart.XAxis`, `Chart.YAxis` are verified in `packages/ui/src/chart/index.ts`.
- `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`, `Table.Cell`, `Table.Caption` are verified in `packages/ui/src/table/index.ts`.
- `Field.Root`, `Field.Description`, `Field.Error` are verified. A `Field.Label` part is not exported, so labels should use the verified standalone `Label` component inside `Field.Root`.

## 2. Branch, Variant, And Scoring Work

Required branches from the assigned skill:

- Dashboard Branch first, because the target is a dashboard page.
- Full Page Branch second, because the target is a complete route/page.

Stable dashboard regions:

- Header: title, status copy, primary export action.
- Filter/action bar: date range, segment selector, search, refresh/export actions.
- Status strip: alert/error/loading/disabled state region.
- Summary metrics: compact KPI row.
- Primary work surface: chart region.
- Secondary insights/actions: ranked insights and recommended next actions.
- Data table/list: dense acquisition-channel rows.

Three layout candidates:

| Candidate                           | Mobile                          | Tablet                                                       | Desktop                                                 | Score | Notes                                                                                  |
| ----------------------------------- | ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| A: Chart-dominant operations layout | Single-column in required order | Filters and metrics split into two columns; chart full-width | Chart and insights side-by-side; table full-width below | 9/10  | Best match for monitor task; chart dominates desktop without losing table readability. |
| B: KPI-first report layout          | Single-column                   | Four KPI cards before chart                                  | Full-width KPI band, chart below                        | 6/10  | Too report-like; wastes desktop space on metrics and weakens primary work surface.     |
| C: Table-first triage layout        | Single-column                   | Table before chart                                           | Table dominant, chart secondary                         | 7/10  | Better for triage than monitoring; chart is not visually dominant enough.              |

Winner: Candidate A.

## 3. Winning Implementation Plan

Use a shell element with `data-layout="analytics-dashboard-shell"` that owns `container: analytics-dashboard / inline-size` in `src/layout.css`. Put the responsive grid on the shell's direct child with `data-layout-area="page"`.

Base mobile order:

1. Header.
2. Filters/actions.
3. Status.
4. Summary metrics.
5. Primary chart.
6. Secondary insights/actions.
7. Data table.

Tablet shift:

- Header keeps title/action alignment.
- Filters become two columns while staying before affected data.
- Metrics become a two-column compact grid.
- Chart remains full-width for readability.

Desktop shift:

- Page grid uses named areas.
- Metrics stay compact.
- Chart becomes the largest region.
- Insights sit beside chart.
- Dense table spans the full width below chart/insights.

State handling:

- `isLoading`: keep all regions mounted; use `Skeleton` inside metrics, chart, insights, and table rows.
- `isEmpty`: keep chart and table regions; show an empty message and disabled export.
- `hasError`: show `Alert` in status strip and preserve downstream layout with fallback empty panels.
- `isDisabled`: disable filter controls and primary actions while keeping visible values.
- `isDenseData`: use tighter row copy and a constrained table scroll region; do not change page grid.

## 4. Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import {
		Alert,
		Button,
		Chart,
		DateRangePicker,
		Input,
		Label,
		Select,
		Skeleton,
		Table
	} from '@dryui/ui';

	let isLoading = $state(false);
	let isEmpty = $state(false);
	let hasError = $state(false);
	let isDisabled = $state(false);
	let isDenseData = $state(true);

	const metricItems = [
		{ label: 'Visitors', value: '128.4k', delta: '+12.8%' },
		{ label: 'Conversion', value: '7.4%', delta: '+1.1%' },
		{ label: 'Revenue', value: '$842k', delta: '+8.6%' },
		{ label: 'Retention', value: '64.2%', delta: '-0.4%' }
	];

	const chartData = [
		{ label: 'Mon', value: 42 },
		{ label: 'Tue', value: 58 },
		{ label: 'Wed', value: 51 },
		{ label: 'Thu', value: 76 },
		{ label: 'Fri', value: 69 }
	];
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page" aria-labelledby="analytics-dashboard-title">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p data-layout="analytics-dashboard-kicker">Product analytics</p>
				<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
				<p data-layout="analytics-dashboard-summary">
					Monitor acquisition, conversion, and retention movement.
				</p>
			</div>
			<Button type="button" variant="solid" disabled={isDisabled || isEmpty}>Export report</Button>
		</header>

		<form data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label for="analytics-search" size="sm">Search</Label>
				<Input
					id="analytics-search"
					size="sm"
					placeholder="Campaign or channel"
					disabled={isDisabled}
				/>
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label size="sm">Date range</Label>
				<DateRangePicker.Root disabled={isDisabled}>
					<DateRangePicker.Trigger />
					<DateRangePicker.Content>
						<DateRangePicker.Preset value="7d">Last 7 days</DateRangePicker.Preset>
						<DateRangePicker.Preset value="30d">Last 30 days</DateRangePicker.Preset>
						<DateRangePicker.Calendar />
					</DateRangePicker.Content>
				</DateRangePicker.Root>
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label size="sm">Segment</Label>
				<Select.Root disabled={isDisabled}>
					<Select.Trigger>
						<Select.Value placeholder="All segments" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All segments</Select.Item>
						<Select.Item value="new">New users</Select.Item>
						<Select.Item value="returning">Returning users</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<div data-layout="analytics-dashboard-filter-actions">
				<Button type="button" variant="outline" disabled={isDisabled}>Refresh</Button>
				<Button type="submit" variant="solid" disabled={isDisabled}>Apply</Button>
			</div>
		</form>

		<section data-layout-area="status" aria-live="polite">
			{#if hasError}
				<Alert variant="error"
					>Analytics data could not be loaded. Retry or narrow the date range.</Alert
				>
			{:else if isDisabled}
				<Alert variant="warning">Controls are temporarily disabled while the dashboard syncs.</Alert
				>
			{:else if isEmpty}
				<Alert variant="info">No matching analytics data for the current filters.</Alert>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metricItems as metric}
				<article data-layout="analytics-dashboard-metric">
					{#if isLoading}
						<Skeleton variant="text" height="1rem" />
						<Skeleton variant="text" height="2rem" />
					{:else}
						<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
						<p data-layout="analytics-dashboard-metric-value">{isEmpty ? '-' : metric.value}</p>
						<p data-layout="analytics-dashboard-metric-delta">
							{isEmpty ? 'No data' : metric.delta}
						</p>
					{/if}
				</article>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="analytics-chart-title">
			<header data-layout="analytics-dashboard-section-header">
				<h2 id="analytics-chart-title">Traffic and conversion trend</h2>
			</header>
			{#if isLoading}
				<Skeleton variant="rectangular" height="22rem" />
			{:else if isEmpty || hasError}
				<div data-layout="analytics-dashboard-empty-panel">No chart data to display.</div>
			{:else}
				<Chart.Root data={chartData} height={320} summary="Daily analytics trend">
					<Chart.YAxis ticks={4} />
					<Chart.XAxis />
					<Chart.Area />
				</Chart.Root>
			{/if}
		</section>

		<aside data-layout-area="insights" aria-labelledby="analytics-insights-title">
			<header data-layout="analytics-dashboard-section-header">
				<h2 id="analytics-insights-title">Insights and actions</h2>
			</header>
			{#if isLoading}
				<Skeleton variant="text" height="1.25rem" />
				<Skeleton variant="text" height="1.25rem" />
			{:else}
				<ul data-layout="analytics-dashboard-insight-list">
					<li data-layout="analytics-dashboard-insight-item">
						Paid search is driving the largest conversion lift.
					</li>
					<li data-layout="analytics-dashboard-insight-item">
						Returning-user retention softened in the last period.
					</li>
				</ul>
				<Button type="button" variant="outline" disabled={isDisabled || isEmpty}
					>Create follow-up</Button
				>
			{/if}
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<header data-layout="analytics-dashboard-section-header">
				<h2 id="analytics-table-title">Channel performance</h2>
			</header>
			<Table.Root data-density={isDenseData ? 'dense' : 'standard'}>
				<Table.Caption>Acquisition channel performance for the selected range.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>Channel</Table.Head>
						<Table.Head>Visitors</Table.Head>
						<Table.Head>Conversion</Table.Head>
						<Table.Head>Revenue</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if isLoading}
						<Table.Row
							><Table.Cell colspan={4}><Skeleton variant="text" height="1.5rem" /></Table.Cell
							></Table.Row
						>
					{:else if isEmpty || hasError}
						<Table.Row
							><Table.Cell colspan={4}>No rows match the current filters.</Table.Cell></Table.Row
						>
					{:else}
						<Table.Row>
							<Table.Cell>Organic search</Table.Cell>
							<Table.Cell>48.2k</Table.Cell>
							<Table.Cell>8.1%</Table.Cell>
							<Table.Cell>$318k</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</section>
	</section>
</main>
```

Notes:

- `Field.Root` supports the field wrapper, but the label must be standalone `Label`.
- `DateRangePicker.Root disabled={...}` and `Select.Root disabled={...}` are plausible from component intent, but exact disabled prop support should be verified against primitive prop definitions before production code.
- `Table.Cell colspan={4}` uses a native table-cell attribute through the component. Verify prop forwarding before production code; otherwise wrap empty state outside the table body.

## 5. Proposed `src/layout.css` Structure

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'header'
		'filters'
		'status'
		'metrics'
		'chart'
		'insights'
		'table';
	gap: var(--dry-space-4);
	align-items: start;
}

[data-layout-area='header'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-filter-actions'] {
	display: flex;
	gap: var(--dry-space-2);
	align-items: end;
}

[data-layout='analytics-dashboard-metric'] {
	display: grid;
	gap: var(--dry-space-1);
	min-inline-size: 0;
}

[data-layout-area='chart'],
[data-layout-area='insights'],
[data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-3);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-section-header'] {
	display: grid;
	gap: var(--dry-space-1);
}

[data-layout='analytics-dashboard-insight-list'] {
	display: grid;
	gap: var(--dry-space-2);
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

	[data-layout-area='filters'],
	[data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 2fr) minmax(18rem, 0.8fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'chart insights'
			'table table';
	}

	[data-layout-area='header'] {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
	}

	[data-layout-area='filters'] {
		grid-template-columns: minmax(12rem, 1fr) minmax(14rem, 1fr) minmax(12rem, 1fr) auto;
		align-items: end;
	}

	[data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Visual CSS outside `src/layout.css` would handle colors, borders, backgrounds, type scale, and chart/table surface styling with real DryUI tokens such as `--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-text`, and `--dry-color-border`. It must not add route-level `display: grid` or `display: flex`.

## 6. Visual Check Plan

Required screenshots:

- Mobile: 390px wide.
- Tablet: 820px wide.
- Desktop: 1440px wide.

Checks:

- No horizontal overflow at any viewport.
- Header, filters, status, metrics, chart, insights, and table appear in the intended order.
- Primary action and primary chart are visible early.
- Tablet uses two-column metrics and filters instead of stretching the phone layout.
- Desktop gives visual dominance to the chart and places insights beside it.
- Dense table remains readable and does not force page overflow.
- Loading, empty, error, disabled, and dense-data branches preserve region size and avoid layout jumps.
- Long labels, large metric values, and empty/error copy do not overlap or clip.

## 7. Self-Review Against Assigned Test Skill

- Target is a full dashboard page, not an isolated card.
- Dashboard Branch and Full Page Branch were both applied.
- The primary task is explicit: monitor.
- Density is compact and suitable for operational analytics.
- The shell owns the named container query: `container: analytics-dashboard / inline-size`.
- The responsive grid is on the shell's direct child, not on the shell itself.
- Layout hooks use `data-layout` and `data-layout-area`.
- Page structure is placed in `src/layout.css`; component visual CSS is left separate.
- `src/layout.css` proposal contains structural layout only and avoids color, border, shadow, typography, position, width, height, and inline-size declarations.
- Base layout is mobile-first with tablet and desktop `@container` shifts.
- No layout wrapper component is used.
- No raw route/component style block uses `display: grid` or `display: flex`.
- DryUI component APIs are named only after local export checks, with unresolved prop details marked verification-needed.
- State handling covers loading, empty, error, disabled, and dense-data.
- Visual verification is planned for mobile, tablet, and desktop, but not run because this experiment requested report-only output and no production file edits.
