# Variant 4: Dashboard Recipes

## 1. Target Brief

Build a full-page Svelte 5 analytics dashboard for a product/operator user who needs to monitor health, compare recent performance, triage anomalies, and act on filtered data without leaving the page.

- Page title: `Analytics Dashboard`
- Primary task: monitor
- Secondary tasks: compare, triage, export/report
- Density: compact-to-standard
- Required regions: header, filter/action bar, status/state strip, summary metrics, primary chart, secondary insights/actions, data table
- Required states: default, loading, empty, error, disabled, dense-data
- Implementation constraints: use DryUI primitives where available, Svelte 5 runes, `data-layout` and `data-layout-area` hooks, page shell-owned named container query, inner responsive grid, and structural layout only in `src/layout.css`

## 2. Branch / Variant / Scoring Work

The assigned skill requires running the Dashboard Recipe before markup. I treated the variant as a dashboard recipe exercise and scored candidate dashboard shapes against the skill's visual and lint constraints.

### Candidate A: Metrics-First Operations Dashboard

- Structure: header, filters, status, KPI row, large chart, insight rail, table
- Strengths: matches dashboard expectations, efficient desktop layout, easy mobile ordering
- Risks: KPI cards could dominate desktop if allowed to stretch too wide
- Score: 8/10

### Candidate B: Table-First Analyst Workbench

- Structure: header, filters, table-dominant work surface, chart as secondary, compact metrics
- Strengths: strong for dense-data triage and row-level action
- Risks: primary chart requirement becomes visually secondary; less suitable for "Analytics Dashboard" title
- Score: 7/10

### Candidate C: Report-Style Analytics Summary

- Structure: header, narrative status, large metrics bands, chart, table appendix
- Strengths: readable for executive reporting
- Risks: too spacious, desktop waste, weaker state handling for active operations
- Score: 6/10

### Winning Variant

Candidate A wins. It best satisfies the Dashboard Recipe: a stable shell, clear monitoring task, compact density, chart/table dominance at desktop, and predictable mobile ordering. The implementation should prevent desktop KPI bloat by using a bounded metrics grid and giving the chart/table the largest regions.

## 3. Winning Implementation Plan

Use a route-level page component such as `src/routes/analytics/+page.svelte` and extend `src/layout.css` with a dedicated dashboard layout namespace.

### Regions

- `analytics-dashboard-shell`: page shell that owns `container: analytics-dashboard / inline-size`
- `page`: inner responsive grid that receives the container query layout
- `header`: title, period summary, primary export/action controls
- `filters`: search, segment/product filter, date range, refresh action
- `status`: loading/error/empty/dense/disabled notices inside a stable row
- `metrics`: four compact summary metric cards
- `chart`: primary chart panel with loading/empty/error fallbacks
- `secondary`: anomaly list, insights, and next actions
- `table`: data table with contained overflow and dense-data handling

### Data / State Model

Use Svelte 5 runes:

- `$state` for filters, selected segment, status mode, and table density
- `$derived` for filtered rows, metric summaries, chart series, disabled reason, and visible state branch
- no `$effect` unless browser-only chart measurement or resize observation is required

Representative state modes:

- `loading`: skeletons or progress indicator in metrics/chart/table, filters disabled
- `empty`: `EmptyState` in chart/table regions after filters return no rows
- `error`: `Alert` or stable status panel with retry action
- `disabled`: disabled filter/action controls plus explanatory status text
- `dense-data`: compact table density, horizontal overflow containment, pagination visible

### DryUI Components

Use DryUI primitives where available:

- `Button` for refresh, export, retry, and row actions
- `Field.Root` and `Field.Label` around filters
- `Input` for search
- `Select` for segment/product/status filters
- `DatePicker` or date-range equivalent for period filtering
- `Table` or `DataGrid` for the data region
- `EmptyState` for no-results regions
- `Separator` only if needed between actions and metadata
- `Tooltip` for icon-only controls

Charts should use DryUI `Chart`/`Sparkline` if available in the target package metadata; otherwise use a locally scoped semantic chart wrapper with tokenized visual CSS and no route-level layout display declarations.

## 4. Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import { Button, DatePicker, EmptyState, Field, Input, Select, Table, Tooltip } from '@dryui/ui';

	type DashboardState = 'ready' | 'loading' | 'empty' | 'error' | 'disabled' | 'dense-data';

	let state = $state<DashboardState>('ready');
	let query = $state('');
	let segment = $state('all');
	let period = $state<Date | undefined>();
	let density = $state<'standard' | 'dense'>('standard');

	const isLoading = $derived(state === 'loading');
	const isError = $derived(state === 'error');
	const isDisabled = $derived(state === 'disabled');
	const isEmpty = $derived(state === 'empty');
	const isDense = $derived(state === 'dense-data' || density === 'dense');
	const filteredRows = $derived(getFilteredRows(query, segment, period));
	const metrics = $derived(getMetrics(filteredRows));
	const chartSeries = $derived(getChartSeries(filteredRows));
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<main data-layout="analytics-dashboard-shell">
	<section data-layout-area="page" aria-labelledby="analytics-dashboard-title">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-title-group">
				<p data-layout="analytics-dashboard-kicker">Product analytics</p>
				<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
				<p data-layout="analytics-dashboard-summary">
					Revenue, activation, retention, and funnel quality for the selected period.
				</p>
			</div>

			<div data-layout="analytics-dashboard-header-actions">
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button aria-label="Refresh analytics" disabled={isDisabled}>Refresh</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>Refresh analytics</Tooltip.Content>
				</Tooltip.Root>
				<Button disabled={isDisabled}>Export</Button>
			</div>
		</header>

		<form data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root>
				<Field.Label>Search</Field.Label>
				<Input
					bind:value={query}
					disabled={isDisabled || isLoading}
					placeholder="Campaign, cohort, or source"
				/>
			</Field.Root>

			<Field.Root>
				<Field.Label>Segment</Field.Label>
				<Select.Root bind:value={segment} disabled={isDisabled || isLoading}>
					<Select.Trigger />
					<Select.Content>
						<Select.Item value="all">All segments</Select.Item>
						<Select.Item value="new">New users</Select.Item>
						<Select.Item value="returning">Returning users</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Field.Label>Period</Field.Label>
				<DatePicker.Root bind:value={period} disabled={isDisabled || isLoading}>
					<DatePicker.Trigger />
					<DatePicker.Content />
				</DatePicker.Root>
			</Field.Root>

			<Button type="submit" disabled={isDisabled || isLoading}>Apply</Button>
		</form>

		<section data-layout-area="status" aria-live="polite">
			{#if isError}
				<div data-layout="analytics-dashboard-state-panel" data-state="error">
					<p>Analytics failed to load.</p>
					<Button>Retry</Button>
				</div>
			{:else if isDisabled}
				<div data-layout="analytics-dashboard-state-panel" data-state="disabled">
					<p>Analytics are disabled until a workspace is selected.</p>
				</div>
			{:else if isLoading}
				<div data-layout="analytics-dashboard-state-panel" data-state="loading">
					<p>Loading analytics...</p>
				</div>
			{:else if isEmpty}
				<div data-layout="analytics-dashboard-state-panel" data-state="empty">
					<p>No results match the current filters.</p>
				</div>
			{:else if isDense}
				<div data-layout="analytics-dashboard-state-panel" data-state="dense-data">
					<p>Dense table mode is active for this result set.</p>
				</div>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric-card">
					<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
					<strong>{metric.value}</strong>
					<span>{metric.delta}</span>
				</article>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="analytics-chart-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-chart-title">Performance trend</h2>
				<p>Daily conversion, revenue, and active-account movement.</p>
			</div>

			{#if isEmpty}
				<EmptyState.Root>
					<EmptyState.Title>No chart data</EmptyState.Title>
					<EmptyState.Description>Adjust filters to include more activity.</EmptyState.Description>
				</EmptyState.Root>
			{:else}
				<div data-layout="analytics-dashboard-chart-surface" aria-label="Performance chart">
					<!-- DryUI Chart if available; otherwise tokenized local chart markup. -->
				</div>
			{/if}
		</section>

		<aside data-layout-area="secondary" aria-labelledby="analytics-insights-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-insights-title">Insights</h2>
			</div>
			<ul data-layout="analytics-dashboard-insight-list">
				<li>Trial activation is down in paid search cohorts.</li>
				<li>Expansion revenue improved in enterprise accounts.</li>
				<li>Checkout latency is correlated with funnel drop-off.</li>
			</ul>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-table-title">Breakdown</h2>
				<Button disabled={isDisabled}>Download CSV</Button>
			</div>

			{#if isEmpty}
				<EmptyState.Root>
					<EmptyState.Title>No rows found</EmptyState.Title>
					<EmptyState.Description
						>Try another segment, date range, or search term.</EmptyState.Description
					>
				</EmptyState.Root>
			{:else}
				<div
					data-layout="analytics-dashboard-table-scroll"
					data-density={isDense ? 'dense' : 'standard'}
				>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Source</Table.Head>
								<Table.Head>Visitors</Table.Head>
								<Table.Head>Conversion</Table.Head>
								<Table.Head>Revenue</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredRows as row}
								<Table.Row>
									<Table.Cell>{row.source}</Table.Cell>
									<Table.Cell>{row.visitors}</Table.Cell>
									<Table.Cell>{row.conversion}</Table.Cell>
									<Table.Cell>{row.revenue}</Table.Cell>
									<Table.Cell>{row.status}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</section>
	</section>
</main>
```

Notes:

- The exact compound component names should be checked against `packages/ui/src/<component>/<component>.meta.ts` before implementation.
- The route style block must avoid `display: grid` and `display: flex`.
- DryUI components should not receive `class=`.
- Every interior raw element has a specific `data-layout` or `data-layout-area` hook.

## 5. Proposed `src/layout.css` Structure

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
		'secondary'
		'table';
}

[data-layout-area='header'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: header;
}

[data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: filters;
}

[data-layout-area='status'] {
	grid-area: status;
}

[data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: metrics;
}

[data-layout-area='chart'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: chart;
}

[data-layout-area='secondary'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: secondary;
}

[data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: table;
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-title-group'],
[data-layout='analytics-dashboard-header-actions'],
[data-layout='analytics-dashboard-state-panel'],
[data-layout='analytics-dashboard-metric-card'],
[data-layout='analytics-dashboard-section-heading'],
[data-layout='analytics-dashboard-chart-surface'],
[data-layout='analytics-dashboard-insight-list'],
[data-layout='analytics-dashboard-table-scroll'] {
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-header-actions'],
[data-layout='analytics-dashboard-state-panel'],
[data-layout='analytics-dashboard-section-heading'] {
	display: flex;
	gap: var(--dry-space-2);
}

[data-layout='analytics-dashboard-table-scroll'] {
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
			'secondary secondary'
			'table table';
	}

	[data-layout-area='header'],
	[data-layout-area='filters'],
	[data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 0.6fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'chart secondary'
			'table table';
	}

	[data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Visual CSS would stay outside `src/layout.css` in the relevant route or app stylesheet. It should use real DryUI tokens for color, border, typography, focus, and spacing. Replaced media and chart surfaces should set overflow and intrinsic-size constraints in visual CSS without introducing page-level layout display rules.

## 6. Visual Check Plan

### Mobile: 390px

- Confirm no horizontal page overflow.
- Confirm header title and primary action remain visible.
- Confirm filters stack in a usable order with labels.
- Confirm metrics remain readable and do not clip long labels.
- Confirm chart fallback and table overflow are contained.
- Confirm loading, empty, error, disabled, and dense-data states preserve the same region order.

### Tablet: 820px

- Confirm the layout is no longer stretched mobile.
- Confirm metrics or filters use two columns.
- Confirm chart remains readable and table controls do not overlap.
- Confirm state/status row keeps consistent height behavior across branches.

### Desktop: 1440px

- Confirm chart and table dominate the page.
- Confirm metrics are compact and do not become giant bands.
- Confirm secondary insights support the chart without competing for primary focus.
- Confirm dense-data table has contained overflow and legible row density.

### Theme / Accessibility Checks

- Check light and dark theme if the host app uses `.theme-auto` or explicit `data-theme`.
- Verify contrast for chart labels, status panels, table headers, and disabled controls.
- Verify form labels, `aria-live` state messaging, section headings, and icon-only action labels.
- Verify keyboard navigation through filters, actions, chart-adjacent controls, and table actions.

## 7. Self-Review Against The Assigned Test Skill

- Target brief: included user, screen, primary task, density, and state coverage.
- Dashboard Recipe: applied before markup; selected primary task, density, stable regions, mobile-first order, tablet improvement, and desktop emphasis.
- Page shell: proposed `data-layout="analytics-dashboard-shell"` with `container: analytics-dashboard / inline-size`.
- Inner grid: proposed responsive grid on the shell's direct child with `data-layout-area="page"`.
- Markup hooks: all raw interior elements use specific `data-layout` or `data-layout-area` names.
- Layout CSS discipline: all `display: grid` and `display: flex` declarations are isolated to `src/layout.css`; route/component style blocks would hold only visual CSS.
- Responsive discipline: uses mobile-first base layout and `@container analytics-dashboard (...)` shifts, not `@media`.
- DryUI usage: uses DryUI controls for buttons, fields, input, select, date picker, table, tooltip, and empty states; chart usage is conditional on metadata availability.
- State handling: includes loading, empty, error, disabled, and dense-data branches inside stable regions.
- Known implementation caveat: exact DryUI compound part names must be confirmed from package metadata before coding.
- Validation expectation if implemented: run the Svelte check/build surface that covers the route, plus visual screenshots at 390px, 820px, and 1440px.
