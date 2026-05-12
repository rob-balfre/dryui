# Variant 1: Shell-Gated Analytics Dashboard

## 1. Target brief

`type=page, subtype=dashboard, user=product analyst, primary_task=monitor acquisition and conversion trends, density=compact, states=loading|empty|error|disabled|dense-data`

The target is a full Svelte 5 dashboard page titled **Analytics Dashboard**. It should prioritize quick monitoring and comparison: filters/actions appear before affected data, summary metrics scan quickly, the primary chart dominates the upper work area, and the data table remains usable with dense rows and long labels.

## 2. Branch, Variant, and Scoring Work

Assigned skill: `variant-1-shell-gated/SKILL.md`, treated as the active DryUI build skill.

Required branch path:

1. Dashboard Branch
2. Full Page Branch

Dashboard branch decisions:

- Primary task: monitor, with secondary compare/report actions.
- Density: compact, because the page is an admin/data surface.
- Regions: header, filter/action bar, summary metrics, primary chart, data table, state/status region.
- Data order: filters and actions precede metrics, chart, and table.
- Primary work surface: chart on tablet/desktop, table below; on desktop the chart receives the largest top-row area.
- Components: `Button`, `Select`, `DatePicker`, `Chart`, `DataGrid`, and optionally `Table` only if a simpler static table is preferred after metadata verification.
- States: loading skeleton rows, empty state copy/action, inline error recovery, disabled controls while loading/exporting, dense-data row mode, long labels and no-hover behavior.

Full page branch decisions:

- Shell element owns `container: analytics-dashboard / inline-size`.
- Inner child owns the responsive grid.
- Container queries style descendants from inside the shell; they do not restyle the shell element itself.
- Base layout is single-column mobile-first.
- Tablet introduces chart/table separation and tighter metrics.
- Desktop uses named grid areas for chart/table/actions without making KPI cards a full-width wasteful band.

Scoring rubric self-target:

- Task classification: 5, because this is a full dashboard page plan with explicit dashboard/full-page branch work.
- Shell/container contract: 5, if implemented exactly with shell container plus inner grid.
- DryUI contract: 4, because exact `DataGrid.Root` prop names should still be checked against nearby examples before coding.
- Mobile-first quality: 5, because base layout is single column and tablet/desktop have meaningful shifts.
- Dashboard hierarchy: 5, because filters precede data and chart/table are dominant.
- State coverage: 5, with all required states mapped to concrete UI behavior.
- Visual readiness: 4, pending rendered screenshots.
- Implementation risk: 4, because the plan avoids raw layout CSS in route styles and uses verified compound component shapes.

## 3. Winning Implementation Plan

Create a route page with a semantic shell and one inner grid:

- `section data-layout="analytics-dashboard-shell"` owns the named container query.
- `div data-layout-area="page"` owns the responsive grid and named areas.
- Header uses plain semantic text plus a DryUI `Button` action group.
- Filters use DryUI `DatePicker.Root`, `Select.Root`, and `Button`; each control is wrapped in `Field.Root` if form field components are available in the implementation target.
- Metrics render as repeated semantic sections with `data-layout="analytics-dashboard-metric"`.
- Chart uses `Chart.Root` with `Chart.Area`, `Chart.Line`, `Chart.XAxis`, and `Chart.YAxis`.
- Table uses `DataGrid.Root`, `DataGrid.Table`, `DataGrid.Header`, `DataGrid.Column`, `DataGrid.Body`, `DataGrid.Row`, `DataGrid.Cell`, and `DataGrid.Pagination`.
- State handling is explicit and layout-preserving:
  - `loading`: controls disabled; metric/chart/table regions show skeleton placeholders with the same structural areas.
  - `empty`: chart area shows an empty state and table body shows a single explanatory row.
  - `error`: inline alert region appears before chart/table with retry button; controls remain available unless data is refreshing.
  - `disabled`: export and apply buttons disabled during loading/exporting.
  - `dense-data`: table region switches to compact copy/row density through data attributes, not layout changes.

## 4. Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import { Button, Chart, DataGrid, DatePicker, Select } from '@dryui/ui';

	type ViewState = 'ready' | 'loading' | 'empty' | 'error';

	let state = $state<ViewState>('ready');
	let denseRows = $state(true);
	let exporting = $state(false);
	let selectedRange = $state('30d');
	let selectedSegment = $state('all');
	let selectedDate = $state<Date | null>(null);

	const isBusy = $derived(state === 'loading' || exporting);
	const chartSummary = $derived(
		'Sessions, conversion rate, and revenue trend for the selected period.'
	);
</script>

<section
	data-layout="analytics-dashboard-shell"
	data-state={state}
	data-density={denseRows ? 'dense' : 'standard'}
	aria-labelledby="analytics-dashboard-title"
>
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p data-layout="analytics-dashboard-eyebrow">Performance</p>
				<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
				<p data-layout="analytics-dashboard-summary">
					Acquisition, conversion, and revenue signals across active campaigns.
				</p>
			</div>

			<div data-layout="analytics-dashboard-header-actions">
				<Button variant="outline" disabled={isBusy} onclick={refreshData}>Refresh</Button>
				<Button disabled={isBusy} onclick={exportReport}>Export</Button>
			</div>
		</header>

		<form data-layout-area="filters" onsubmit={applyFilters}>
			<div data-layout="analytics-dashboard-filter">
				<DatePicker.Root bind:value={selectedDate} disabled={isBusy}>
					<DatePicker.Trigger size="sm">Date</DatePicker.Trigger>
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</div>

			<div data-layout="analytics-dashboard-filter">
				<Select.Root bind:value={selectedRange} disabled={isBusy}>
					<Select.Trigger><Select.Value placeholder="Range" /></Select.Trigger>
					<Select.Content>
						<Select.Item value="7d">Last 7 days</Select.Item>
						<Select.Item value="30d">Last 30 days</Select.Item>
						<Select.Item value="90d">Last 90 days</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div data-layout="analytics-dashboard-filter">
				<Select.Root bind:value={selectedSegment} disabled={isBusy}>
					<Select.Trigger><Select.Value placeholder="Segment" /></Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All traffic</Select.Item>
						<Select.Item value="paid">Paid acquisition</Select.Item>
						<Select.Item value="organic">Organic</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<Button type="submit" size="sm" disabled={isBusy}>Apply</Button>
		</form>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric">
					<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
					<strong data-layout="analytics-dashboard-metric-value">{metric.value}</strong>
					<span data-layout="analytics-dashboard-metric-change" data-trend={metric.trend}>
						{metric.change}
					</span>
				</article>
			{/each}
		</section>

		{#if state === 'error'}
			<section data-layout-area="status" role="alert">
				<p>Analytics data could not be loaded.</p>
				<Button variant="outline" size="sm" onclick={retryLoad}>Retry</Button>
			</section>
		{/if}

		<section data-layout-area="chart" aria-labelledby="analytics-chart-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-chart-title">Revenue trend</h2>
				<p>Compared with the previous selected period.</p>
			</div>

			{#if state === 'loading'}
				<div data-layout="analytics-dashboard-chart-skeleton" aria-label="Loading chart"></div>
			{:else if state === 'empty'}
				<div data-layout="analytics-dashboard-empty">
					<h3>No analytics data</h3>
					<p>Adjust the date range or segment to broaden the result set.</p>
					<Button variant="outline" size="sm" onclick={resetFilters}>Reset filters</Button>
				</div>
			{:else}
				<Chart.Root data={chartData} height={280} summary={chartSummary}>
					<Chart.Area color="var(--dry-color-brand)" />
					<Chart.Line color="var(--dry-color-brand)" showDots={false} />
					<Chart.XAxis />
					<Chart.YAxis ticks={4} />
				</Chart.Root>
			{/if}
		</section>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-table-title">Channel performance</h2>
				<Button variant="ghost" size="sm" onclick={() => (denseRows = !denseRows)}>
					{denseRows ? 'Comfort rows' : 'Dense rows'}
				</Button>
			</div>

			<DataGrid.Root data={rows} striped>
				<DataGrid.Table>
					<DataGrid.Header>
						<DataGrid.Column id="channel">Channel</DataGrid.Column>
						<DataGrid.Column id="sessions">Sessions</DataGrid.Column>
						<DataGrid.Column id="conversion">Conversion</DataGrid.Column>
						<DataGrid.Column id="revenue">Revenue</DataGrid.Column>
					</DataGrid.Header>
					<DataGrid.Body>
						{#if state === 'loading'}
							{#each loadingRows as row}
								<DataGrid.Row id={row.id} data-loading="true">
									<DataGrid.Cell>Loading</DataGrid.Cell>
									<DataGrid.Cell></DataGrid.Cell>
									<DataGrid.Cell></DataGrid.Cell>
									<DataGrid.Cell></DataGrid.Cell>
								</DataGrid.Row>
							{/each}
						{:else if state === 'empty'}
							<DataGrid.Row id="empty">
								<DataGrid.Cell>No channel rows match the current filters.</DataGrid.Cell>
							</DataGrid.Row>
						{:else}
							{#each rows as row}
								<DataGrid.Row id={row.id}>
									<DataGrid.Cell>{row.channel}</DataGrid.Cell>
									<DataGrid.Cell>{row.sessions}</DataGrid.Cell>
									<DataGrid.Cell>{row.conversion}</DataGrid.Cell>
									<DataGrid.Cell>{row.revenue}</DataGrid.Cell>
								</DataGrid.Row>
							{/each}
						{/if}
					</DataGrid.Body>
				</DataGrid.Table>
				<DataGrid.Pagination />
			</DataGrid.Root>
		</section>
	</div>
</section>
```

Implementation note: before coding, verify exact `DataGrid.Root` row id and column prop names against nearby usage or primitive types. The compound shape above matches exported DryUI component parts, but row identity props may differ.

## 5. Proposed `src/layout.css` Structure

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'header'
		'filters'
		'metrics'
		'status'
		'chart'
		'table';
	gap: var(--dry-space-4);
	align-items: start;
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
	display: grid;
	grid-area: header;
	gap: var(--dry-space-3);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	display: grid;
	grid-area: filters;
	gap: var(--dry-space-2);
	align-items: end;
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	display: grid;
	grid-area: metrics;
	gap: var(--dry-space-3);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='status'] {
	display: grid;
	grid-area: status;
	gap: var(--dry-space-2);
	align-items: center;
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='chart'] {
	display: grid;
	grid-area: chart;
	gap: var(--dry-space-3);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	display: grid;
	grid-area: table;
	gap: var(--dry-space-3);
	min-inline-size: 0;
	overflow-x: auto;
}

[data-layout='analytics-dashboard-heading'],
[data-layout='analytics-dashboard-header-actions'],
[data-layout='analytics-dashboard-section-heading'] {
	display: grid;
	gap: var(--dry-space-2);
	min-inline-size: 0;
}

[data-layout='analytics-dashboard-metric'] {
	display: grid;
	gap: var(--dry-space-1);
	min-inline-size: 0;
}

@container analytics-dashboard (min-width: 42rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
	}

	[data-layout='analytics-dashboard-header-actions'],
	[data-layout='analytics-dashboard-section-heading'] {
		grid-auto-flow: column;
		justify-content: space-between;
		align-items: center;
	}
}

@container analytics-dashboard (min-width: 64rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		grid-template-columns: minmax(0, 1.6fr) minmax(22rem, 0.9fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'metrics metrics'
			'status status'
			'chart table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Visual CSS stays outside `src/layout.css` and handles color, background, borders, type, chart skeleton styling, metric surfaces, truncation, and table density using DryUI tokens. Replaced media and chart/table wrappers should use `inline-size: 100%`, `max-inline-size: 100%`, and `min-inline-size: 0` in visual CSS where needed to prevent intrinsic overflow.

## 6. Visual Check Plan for Mobile, Tablet, Desktop

Check these viewport widths after implementation:

- Mobile: 390px
- Tablet: 820px
- Desktop: 1440px

Mobile pass criteria:

- Single-column order is header, filters, metrics, status if present, chart, table.
- No horizontal page overflow; table scrolls inside its region if needed.
- Filter controls fit without clipped labels.
- Primary action and page title are visible early.
- Empty, loading, and error states preserve the same region order.

Tablet pass criteria:

- Filters align into a useful row/grid instead of a stretched phone stack.
- Metrics use two columns.
- Header actions sit beside the title without crowding.
- Chart and table remain readable, with no clipped long channel names.

Desktop pass criteria:

- Chart and table share the main work row, with chart visually dominant.
- Metrics are compact and do not become a wasteful full-width banner.
- Dense table rows remain scannable.
- Disabled/export/loading states do not shift layout.
- No text overlap, button clipping, or chart axis collision.

State screenshots to capture:

- Ready with representative dense data.
- Loading with disabled actions.
- Empty after restrictive filters.
- Error with retry action.

## 7. Self-Review Against Assigned Test Skill

- Target brief: present and matches the required full page dashboard.
- Branch work: dashboard branch and full page branch both completed before markup.
- Shell/container contract: proposed shell owns `container: analytics-dashboard / inline-size`; inner `page` area owns the responsive grid.
- Container query discipline: `@container analytics-dashboard` rules style descendants inside the shell and do not rely on querying the container element itself.
- Layout CSS discipline: all `display: grid` declarations are in proposed `src/layout.css`; route/component style blocks would only handle visual styling.
- Data hooks: all raw structural elements use `data-layout` or `data-layout-area`; named areas are specific, not generic.
- DryUI usage: proposed controls use exported DryUI compound components verified from metadata/index files: `Button`, `DatePicker`, `Select`, `Chart`, and `DataGrid`.
- Dashboard hierarchy: filters/actions precede data; chart and table are the primary work surfaces; metrics are compact.
- State coverage: empty, loading, error, disabled, and dense-data behavior are included.
- Mobile-first: base layout is single column; tablet and desktop introduce container-query shifts.
- Known risk: exact `DataGrid` primitive props should be verified in local examples or type errors during implementation. The plan avoids committing to questionable visual wrapper APIs.
- Validation expectation if implemented: run the route/package Svelte check that covers the changed file, then screenshot mobile/tablet/desktop states.
