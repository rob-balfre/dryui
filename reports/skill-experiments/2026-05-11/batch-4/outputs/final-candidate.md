# Final Candidate Analytics Dashboard Page

## 1. Target Brief

`type=page, subtype=dashboard, user=product-analytics lead, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

The concept is a full-page Svelte 5 analytics dashboard titled `Analytics Dashboard`. It prioritizes monitoring traffic, conversion, revenue, and retention across a selected time range and segment. The primary work surface is a trend chart, with filters/actions before the affected data, compact metrics above the work surface, secondary insights beside the chart on desktop, and a detailed channel table below.

Verified local exports checked before naming APIs:

- `Button`, `Input`, `Label`, `Field`, `Select`, `Badge`, `Alert`, `Skeleton`, `Spinner`, `Chart`, and `Table` are exported from `packages/ui/src/index.ts`.
- `Chart.Root`, `Chart.Area`, `Chart.Line`, `Chart.XAxis`, and `Chart.YAxis` are exported from `packages/ui/src/chart/index.ts`.
- `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`, `Table.Cell`, and `Table.Caption` are exported from `packages/ui/src/table/index.ts`.
- `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, and `Select.Item` are exported from `packages/ui/src/select/index.ts`.
- `Field.Root`, `Field.Description`, and `Field.Error` are exported from `packages/ui/src/field/index.ts`.

Exact prop contracts for values, binding, and visual variants remain verification-needed at implementation time unless copied from nearby usage or component metadata.

## 2. Branch, Variant, And Scoring Work

Required skill branches:

- Dashboard Branch first, because the target is a dashboard page.
- Full Page Branch second, because the target is a full route/page.

Dashboard branch decisions:

- Primary task: monitor.
- Density: compact, because the page is operational and data-heavy.
- Stable regions: header, filter/action bar, status strip, summary metrics, primary chart, secondary insights/actions, and data table.
- Mobile order: header, filters/actions, status, metrics, primary chart, secondary insights/actions, table.
- Desktop priority: chart dominates; secondary insights sit beside it; metrics stay compact; table remains full-width below.

Full page branch decisions:

- Shell hook: `data-layout="analytics-dashboard-shell"`.
- Named container query owner: shell with `container: analytics-dashboard / inline-size`.
- Responsive grid owner: direct child `data-layout-area="page"`.
- Base layout: single column.
- Tablet shift: two-column metrics and filter grouping.
- Desktop shift: named grid areas with a dominant chart and side insights.

Substantial page layout variants:

| Variant | Layout                                                                    | Score | Notes                                                                               |
| ------- | ------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------- |
| A       | KPI band, chart full-width, table, insights below                         |  6/10 | Easy mobile flow, but desktop wastes space and delays action insight.               |
| B       | Filters, compact metrics, chart + insights side-by-side, table full-width |  9/10 | Best fit for monitor task; chart dominates while insights stay useful.              |
| C       | Sidebar filters, chart/table split, metrics in right rail                 |  7/10 | Dense, but filters consume prime desktop space and mobile ordering is more complex. |

Winner: Variant B.

## 3. Winning Implementation Plan

Create a Svelte route with a shell and one direct page grid child:

- Use `data-layout="analytics-dashboard-shell"` on the outer page shell.
- Use `data-layout-area="page"` on the direct inner child that receives the responsive named grid.
- Add stable child regions: `header`, `filters`, `status`, `metrics`, `chart`, `insights`, and `table`.
- Use DryUI form/display primitives instead of raw native controls for filters, buttons, chart, table, status feedback, and loading indicators.
- Keep route visual CSS in the route/component style block, but no `display: grid`, `display: flex`, layout breakpoints, or layout sizing there.
- Put only structural layout in `src/layout.css`.
- Implement state branches inside stable regions so loading, empty, error, disabled, and dense-data states do not remove the layout skeleton.
- Keep visual states tokenized with real DryUI tokens such as `--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-text`, and `--dry-color-border`.

Validation plan for a real implementation:

- Run the app/package Svelte check covering the route.
- Run the DryUI layout lint surface for `src/layout.css`.
- Browser-check mobile, tablet, and desktop screenshots.

## 4. Proposed Svelte Markup Structure

Snippet integrity status:

- Every Svelte component used below appears in the import list.
- Compound parts are verified exports from local `index.ts` files.
- No unverified component parts are named.
- Every interior raw element has a specific `data-layout` or `data-layout-area` hook.
- The `Chart` and `Table` prop details are structurally plausible but should be checked against nearby usage before production implementation.

```svelte
<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Chart,
		Field,
		Input,
		Label,
		Select,
		Skeleton,
		Spinner,
		Table
	} from '@dryui/ui';

	type DashboardState = 'ready' | 'loading' | 'empty' | 'error';

	let state = $state<DashboardState>('ready');
	let disabled = $state(false);
	let dense = $state(true);
	let range = $state('30d');
	let segment = $state('all');

	const metrics = [
		{ label: 'Revenue', value: '$128.4k', delta: '+12.8%' },
		{ label: 'Conversion', value: '7.4%', delta: '+1.1%' },
		{ label: 'Active users', value: '42,910', delta: '+8.6%' },
		{ label: 'Churn risk', value: '3.2%', delta: '-0.4%' }
	];

	const chartData = [
		{ label: 'Week 1', value: 42 },
		{ label: 'Week 2', value: 58 },
		{ label: 'Week 3', value: 51 },
		{ label: 'Week 4', value: 73 }
	];

	const rows = [
		{ channel: 'Organic', sessions: '18,240', conversion: '8.1%', revenue: '$48.2k' },
		{ channel: 'Paid search', sessions: '12,880', conversion: '6.7%', revenue: '$35.8k' },
		{ channel: 'Lifecycle', sessions: '9,420', conversion: '9.4%', revenue: '$28.6k' }
	];

	const isBusy = $derived(state === 'loading');
	const isUnavailable = $derived(disabled || isBusy);
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<section data-layout="analytics-dashboard-shell" aria-labelledby="analytics-dashboard-title">
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p data-layout="analytics-dashboard-eyebrow">Product analytics</p>
				<h1 id="analytics-dashboard-title" data-layout="analytics-dashboard-title">
					Analytics Dashboard
				</h1>
			</div>

			<div data-layout="analytics-dashboard-header-actions">
				<Button disabled={isUnavailable}>Export</Button>
				<Button disabled={isUnavailable}>Refresh</Button>
			</div>
		</header>

		<section data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root>
				<Label for="analytics-search">Search</Label>
				<Input id="analytics-search" placeholder="Campaign or channel" disabled={isUnavailable} />
			</Field.Root>

			<Field.Root>
				<Label>Range</Label>
				<Select.Root bind:value={range} disabled={isUnavailable}>
					<Select.Trigger>
						<Select.Value placeholder="Choose range" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="7d">Last 7 days</Select.Item>
						<Select.Item value="30d">Last 30 days</Select.Item>
						<Select.Item value="90d">Last 90 days</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Label>Segment</Label>
				<Select.Root bind:value={segment} disabled={isUnavailable}>
					<Select.Trigger>
						<Select.Value placeholder="Choose segment" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All users</Select.Item>
						<Select.Item value="new">New users</Select.Item>
						<Select.Item value="returning">Returning users</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>
		</section>

		<section data-layout-area="status" aria-live="polite">
			{#if state === 'error'}
				<Alert variant="error">Analytics data could not be loaded. Try refreshing.</Alert>
			{:else if state === 'empty'}
				<Alert>No analytics data matches the current filters.</Alert>
			{:else if disabled}
				<Alert>Editing is disabled while the workspace is locked.</Alert>
			{:else}
				<Badge>Live data</Badge>
			{/if}
		</section>

		<section
			data-layout-area="metrics"
			aria-label="Summary metrics"
			data-density={dense ? 'dense' : 'standard'}
		>
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric">
					<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
					<strong data-layout="analytics-dashboard-metric-value">{metric.value}</strong>
					<Badge>{metric.delta}</Badge>
				</article>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="analytics-dashboard-chart-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-dashboard-chart-title" data-layout="analytics-dashboard-section-title">
					Revenue trend
				</h2>
				<Badge>Primary</Badge>
			</div>

			{#if state === 'loading'}
				<div data-layout="analytics-dashboard-chart-loading">
					<Skeleton aria-label="Loading revenue chart" />
					<Spinner aria-label="Loading" />
				</div>
			{:else if state === 'empty'}
				<div data-layout="analytics-dashboard-empty-state">
					<p data-layout="analytics-dashboard-empty-title">No trend data</p>
					<Button disabled={isUnavailable}>Clear filters</Button>
				</div>
			{:else}
				<Chart.Root data={chartData} summary="Revenue trend for the selected range">
					<Chart.Area />
					<Chart.Line showDots />
					<Chart.XAxis />
					<Chart.YAxis />
				</Chart.Root>
			{/if}
		</section>

		<aside data-layout-area="insights" aria-labelledby="analytics-dashboard-insights-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-dashboard-insights-title" data-layout="analytics-dashboard-section-title">
					Insights
				</h2>
			</div>

			<div data-layout="analytics-dashboard-insight-list">
				<article data-layout="analytics-dashboard-insight">
					<Badge>Action</Badge>
					<p data-layout="analytics-dashboard-insight-copy">
						Paid search spend is rising faster than revenue.
					</p>
					<Button disabled={isUnavailable}>Review spend</Button>
				</article>

				<article data-layout="analytics-dashboard-insight">
					<Badge>Watch</Badge>
					<p data-layout="analytics-dashboard-insight-copy">
						Returning-user conversion is above the 90-day average.
					</p>
					<Button disabled={isUnavailable}>Open segment</Button>
				</article>
			</div>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-dashboard-table-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-dashboard-table-title" data-layout="analytics-dashboard-section-title">
					Channel performance
				</h2>
				<Button disabled={isUnavailable}>Download CSV</Button>
			</div>

			<Table.Root>
				<Table.Caption>Performance by acquisition channel</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>Channel</Table.Head>
						<Table.Head>Sessions</Table.Head>
						<Table.Head>Conversion</Table.Head>
						<Table.Head>Revenue</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if state === 'loading'}
						<Table.Row>
							<Table.Cell colspan={4}>Loading channel performance...</Table.Cell>
						</Table.Row>
					{:else if state === 'empty'}
						<Table.Row>
							<Table.Cell colspan={4}>No channels match the selected filters.</Table.Cell>
						</Table.Row>
					{:else if state === 'error'}
						<Table.Row>
							<Table.Cell colspan={4}>Channel data is unavailable.</Table.Cell>
						</Table.Row>
					{:else}
						{#each rows as row}
							<Table.Row>
								<Table.Cell>{row.channel}</Table.Cell>
								<Table.Cell>{row.sessions}</Table.Cell>
								<Table.Cell>{row.conversion}</Table.Cell>
								<Table.Cell>{row.revenue}</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</section>
	</div>
</section>
```

## 5. Proposed `src/layout.css` Structure

Snippet integrity status:

- The named grid has seven areas and seven matching `grid-area` rules.
- Each `data-layout-area` used in the named grid has exactly one matching `grid-area` rule.
- `container: analytics-dashboard / inline-size` is on the shell.
- Responsive rules use `@container analytics-dashboard (...)`.
- `src/layout.css` contains structural layout only. It avoids color, background, border, shadow, typography, position, z-index, width, height, inline-size, min-inline-size, and max-inline-size properties.

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
	padding: var(--dry-space-4);
}

[data-layout-area='header'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: header;
}

[data-layout='analytics-dashboard-header-actions'] {
	display: flex;
	gap: var(--dry-space-2);
}

[data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: filters;
}

[data-layout-area='status'] {
	display: grid;
	gap: var(--dry-space-2);
	grid-area: status;
}

[data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: metrics;
}

[data-layout='analytics-dashboard-metric'] {
	display: grid;
	gap: var(--dry-space-2);
}

[data-layout-area='chart'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: chart;
}

[data-layout='analytics-dashboard-chart-loading'],
[data-layout='analytics-dashboard-empty-state'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='insights'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: insights;
}

[data-layout='analytics-dashboard-insight-list'],
[data-layout='analytics-dashboard-insight'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: table;
}

[data-layout='analytics-dashboard-section-heading'] {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--dry-space-3);
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
		padding: var(--dry-space-5);
	}

	[data-layout-area='header'],
	[data-layout-area='filters'],
	[data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: minmax(0, 2fr) minmax(20rem, 1fr);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'chart insights'
			'table table';
		padding: var(--dry-space-6);
	}

	[data-layout-area='filters'] {
		grid-template-columns: minmax(16rem, 1fr) repeat(2, minmax(12rem, 16rem));
	}

	[data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

## 6. Visual Check Plan

Mobile, 390px:

- Confirm no horizontal overflow from filters, table, chart, headings, or action buttons.
- Confirm order is header, filters, status, metrics, chart, insights, table.
- Confirm loading, empty, error, disabled, and dense-data states preserve the same page regions.

Tablet, 820px:

- Confirm metrics and filters use two-column space instead of a stretched phone layout.
- Confirm chart remains readable and table cells do not clip.
- Confirm section headings and action buttons wrap without overlap.

Desktop, 1440px:

- Confirm chart is visually dominant and insights sit beside it without competing.
- Confirm metrics stay compact and do not become a giant full-width KPI band.
- Confirm the table remains readable full-width below the primary work surface.
- Confirm disabled controls and state feedback remain visible near the affected data.

Theme and accessibility checks:

- Verify light and dark only if the app imports both themes and uses `.theme-auto` or `data-theme`; otherwise keep the concept light-only.
- Check accessible names for filters, chart region, table, icon/action buttons if any are added later.
- Check keyboard flow through filters, actions, chart-adjacent controls, and table actions.

## 7. Self-Review Against The Assigned Test Skill

- Used the experiment-local `dryui-build` skill as the active instruction source.
- Did not edit production app, package, docs, or canonical skill files.
- Wrote only this output report.
- Produced a full dashboard page concept, not an isolated card.
- Included title `Analytics Dashboard`.
- Included summary metrics, filters/actions, a primary chart, data table, secondary insights/actions, and useful state handling.
- Checked local exports before naming component APIs; marked exact prop contracts as verification-needed.
- Used a page shell that owns the named container query.
- Put the responsive grid on the shell's direct inner child.
- Used `data-layout` and `data-layout-area` hooks throughout the snippets.
- Kept page and section structure in the proposed `src/layout.css`.
- Used mobile-first base layout with tablet and desktop `@container` shifts.
- Avoided layout-wrapper components.
- Avoided route/component `display: grid` and `display: flex`; those appear only in the proposed `src/layout.css`.
- Included loading, empty, error, disabled, and dense-data state handling.
- Applied the snippet integrity gate before writing final snippets.

Validation not run: no app files were edited or created, and the task requested a report-only output.
