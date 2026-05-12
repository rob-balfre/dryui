# Final Candidate V3: Analytics Dashboard Page

## 1. Target Brief

`type=page, subtype=dashboard, user=product-analytics operator, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

Page title: `Analytics Dashboard`.

The page is a full Svelte 5 dashboard concept. The primary job is monitoring traffic and conversion health, with filters before affected data, compact metrics, a primary chart, secondary insights/actions, and a dense data table.

Verified local DryUI exports used in snippets:

- `Button`: verified in `packages/ui/src/button/index.ts`.
- `Input`: verified in `packages/ui/src/input/index.ts`.
- `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item`: verified in `packages/ui/src/select/index.ts`.
- `DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Content`, `DatePicker.Calendar`: verified in `packages/ui/src/date-picker/index.ts`.
- `Field.Root`, `Field.Description`, `Field.Error`: verified in `packages/ui/src/field/index.ts`.
- `Label`: verified in `packages/ui/src/label/index.ts`.
- `Alert`: verified in `packages/ui/src/alert/index.ts`.
- `Badge`: verified in `packages/ui/src/badge/index.ts`.
- `Skeleton`: verified in `packages/ui/src/skeleton/index.ts`.
- `Chart.Root`, `Chart.Line`, `Chart.XAxis`, `Chart.YAxis`: verified in `packages/ui/src/chart/index.ts` and nearby docs usage.
- `DataGrid.Root`, `DataGrid.Table`, `DataGrid.Header`, `DataGrid.Row`, `DataGrid.Column`, `DataGrid.Body`, `DataGrid.Cell`, `DataGrid.Pagination`: verified in `packages/ui/src/data-grid/index.ts` and nearby docs usage.

## 2. Branch, Variant, And Scoring Work

Dashboard Branch was applied first, then Full Page Branch.

Stable regions:

- `header`: page title, operational status, export action.
- `filters`: date range, segment, campaign search, refresh action.
- `status`: error banner or current data state.
- `metrics`: four compact summary metrics.
- `primary`: primary chart and loading/empty/error branches.
- `secondary`: insights and next actions.
- `table`: dense campaign table with pagination.

Full Page Branch decisions:

- Shell hook: `data-layout="analytics-dashboard-shell"`.
- Shell owns `container: analytics-dashboard / inline-size`.
- Shell direct inner child owns the responsive named grid: `data-layout-area="page"`.
- Mobile is single-column in work order: header, filters, status, metrics, primary, secondary, table.
- Tablet shifts filters and metrics into two columns.
- Desktop keeps metrics compact, places secondary insights beside the primary chart, and keeps the table full-width.

Three layout candidates:

| Variant | Description                                                 | Score | Notes                                                                                      |
| ------- | ----------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------ |
| A       | Metrics-first full-width band, then chart/table stack       |  6/10 | Easy to scan, but desktop wastes too much early vertical space on KPI-only content.        |
| B       | Chart-first with secondary side rail, compact metrics above |  9/10 | Best match for monitor task: primary chart dominates desktop while metrics remain visible. |
| C       | Table-first operations view with chart secondary            |  7/10 | Good for triage, weaker for the requested analytics dashboard monitor task.                |

Winner: Variant B.

## 3. Winning Implementation Plan

Implement one Svelte route page and one `src/layout.css` section:

- Use a page shell with `data-layout="analytics-dashboard-shell"`.
- Put the direct child `data-layout-area="page"` on the responsive grid.
- Keep all grid/flex declarations in `src/layout.css`.
- Use route/component CSS only for visual styling, tokenized color, typography, borders, and chart/table polish.
- Use DryUI form and data components for filters, actions, chart, state surfaces, and table.
- Keep state branches inside stable regions so loading, empty, error, disabled, and dense-data modes do not change the layout skeleton.

State handling:

- `loading`: show `Skeleton` in metrics, chart, insights, and table region.
- `empty`: keep chart/table regions mounted with a compact empty message and reset action.
- `error`: show `Alert variant="error"` in status region and keep disabled controls/data regions stable.
- `disabled`: disable filter/action controls while loading or error recovery is pending.
- `dense-data`: reduce table page size only by data settings and keep the full-width table region on desktop.

## 4. Proposed Svelte Markup Structure

Snippet integrity gate result before presenting:

- All Svelte components used below appear in the import list.
- Compound parts are verified local exports.
- Every named grid area in the CSS section has one matching `data-layout-area`.
- Every interior raw element has `data-layout` or `data-layout-area`.
- No DryUI component receives `class=`.
- No raw native controls are used for available DryUI controls.
- APIs named here are verified from local metadata/index files or nearby local usage.

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

	type DashboardState = 'ready' | 'loading' | 'empty' | 'error';

	type Metric = {
		label: string;
		value: string;
		change: string;
		tone: 'success' | 'warning' | 'info';
	};

	type CampaignRow = {
		id: string;
		name: string;
		channel: string;
		status: 'Healthy' | 'Watch' | 'Paused';
		visitors: number;
		conversion: string;
		revenue: string;
	};

	let state = $state<DashboardState>('ready');
	let segment = $state('all');
	let query = $state('');

	const isBusy = $derived(state === 'loading');
	const hasError = $derived(state === 'error');
	const controlsDisabled = $derived(isBusy || hasError);

	const metrics: Metric[] = [
		{ label: 'Visitors', value: '128.4k', change: '+12.8%', tone: 'success' },
		{ label: 'Conversion', value: '6.42%', change: '+0.7%', tone: 'success' },
		{ label: 'Revenue', value: '$842k', change: '+9.1%', tone: 'info' },
		{ label: 'Churn risk', value: '2.8%', change: '-0.4%', tone: 'warning' }
	];

	const chartData = [
		{ label: 'Mon', value: 42 },
		{ label: 'Tue', value: 58 },
		{ label: 'Wed', value: 51 },
		{ label: 'Thu', value: 73 },
		{ label: 'Fri', value: 69 },
		{ label: 'Sat', value: 81 },
		{ label: 'Sun', value: 77 }
	];

	const rows: CampaignRow[] = [
		{
			id: 'c-1',
			name: 'Launch search',
			channel: 'Search',
			status: 'Healthy',
			visitors: 48200,
			conversion: '7.1%',
			revenue: '$218k'
		},
		{
			id: 'c-2',
			name: 'Lifecycle email',
			channel: 'Email',
			status: 'Healthy',
			visitors: 28600,
			conversion: '8.4%',
			revenue: '$176k'
		},
		{
			id: 'c-3',
			name: 'Partner referral',
			channel: 'Referral',
			status: 'Watch',
			visitors: 12400,
			conversion: '4.8%',
			revenue: '$92k'
		},
		{
			id: 'c-4',
			name: 'Retargeting',
			channel: 'Paid social',
			status: 'Paused',
			visitors: 9300,
			conversion: '2.9%',
			revenue: '$31k'
		}
	];

	const statusColor = {
		Healthy: 'green',
		Watch: 'yellow',
		Paused: 'gray'
	} as const;
</script>

<section data-layout="analytics-dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-title-group">
				<p data-layout="analytics-dashboard-eyebrow">Analytics</p>
				<h1 data-layout="analytics-dashboard-title">Analytics Dashboard</h1>
			</div>
			<div data-layout="analytics-dashboard-header-actions">
				<Badge variant="soft" color="green">Live</Badge>
				<Button variant="outline" disabled={controlsDisabled}>Export</Button>
			</div>
		</header>

		<section data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root>
				<Label for="segment-filter">Segment</Label>
				<Select.Root id="segment-filter" bind:value={segment} disabled={controlsDisabled}>
					<Select.Trigger>
						<Select.Value placeholder="All traffic" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All traffic</Select.Item>
						<Select.Item value="new">New visitors</Select.Item>
						<Select.Item value="returning">Returning visitors</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Label>Date range</Label>
				<DatePicker.Root disabled={controlsDisabled}>
					<DatePicker.Trigger>Last 7 days</DatePicker.Trigger>
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</Field.Root>

			<Field.Root>
				<Label for="campaign-search">Campaign</Label>
				<Input
					id="campaign-search"
					bind:value={query}
					placeholder="Search campaigns"
					disabled={controlsDisabled}
				/>
			</Field.Root>

			<Button variant="solid" disabled={controlsDisabled}>Refresh</Button>
		</section>

		<section data-layout-area="status" aria-live="polite">
			{#if state === 'error'}
				<Alert variant="error">
					Campaign data could not be loaded. Retry or narrow the selected filters.
				</Alert>
			{:else if state === 'empty'}
				<Alert variant="info">No analytics data matches the current filters.</Alert>
			{:else}
				<Alert variant="success">
					Data is current through the latest completed reporting window.
				</Alert>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric">
					<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
					{#if isBusy}
						<Skeleton height="2rem" />
					{:else}
						<strong data-layout="analytics-dashboard-metric-value">{metric.value}</strong>
						<Badge variant="soft" color={metric.tone}>{metric.change}</Badge>
					{/if}
				</article>
			{/each}
		</section>

		<section data-layout-area="primary" aria-labelledby="analytics-chart-title">
			<div data-layout="analytics-dashboard-region-heading">
				<h2 id="analytics-chart-title" data-layout="analytics-dashboard-region-title">
					Traffic and conversion
				</h2>
				<Badge variant="outline" color="blue">Daily</Badge>
			</div>

			<div data-layout="analytics-dashboard-chart-frame">
				{#if isBusy}
					<Skeleton height="18rem" />
				{:else if state === 'empty'}
					<div data-layout="analytics-dashboard-empty-state">
						<p data-layout="analytics-dashboard-empty-title">No chart data</p>
						<Button variant="outline">Reset filters</Button>
					</div>
				{:else}
					<Chart.Root
						data={chartData}
						height={280}
						padding={{ top: 16, right: 16, bottom: 28, left: 32 }}
						summary="Daily traffic trend"
					>
						<Chart.Line strokeWidth={3} showDots color="var(--dry-color-fill-brand)" />
						<Chart.XAxis />
						<Chart.YAxis ticks={5} />
					</Chart.Root>
				{/if}
			</div>
		</section>

		<aside data-layout-area="secondary" aria-labelledby="analytics-insights-title">
			<h2 id="analytics-insights-title" data-layout="analytics-dashboard-region-title">Insights</h2>
			<div data-layout="analytics-dashboard-insight-list">
				<article data-layout="analytics-dashboard-insight">
					<Badge variant="soft" color="green">Opportunity</Badge>
					<p data-layout="analytics-dashboard-insight-text">
						Search traffic is carrying the weekly lift.
					</p>
					<Button variant="ghost" size="sm">Review source</Button>
				</article>
				<article data-layout="analytics-dashboard-insight">
					<Badge variant="soft" color="yellow">Watch</Badge>
					<p data-layout="analytics-dashboard-insight-text">
						Referral conversion is below the segment baseline.
					</p>
					<Button variant="ghost" size="sm">Open segment</Button>
				</article>
			</div>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<div data-layout="analytics-dashboard-region-heading">
				<h2 id="analytics-table-title" data-layout="analytics-dashboard-region-title">
					Campaign performance
				</h2>
				<Badge variant="outline">Dense data</Badge>
			</div>

			{#if isBusy}
				<Skeleton height="18rem" />
			{:else if state === 'empty'}
				<div data-layout="analytics-dashboard-empty-state">
					<p data-layout="analytics-dashboard-empty-title">No campaigns found</p>
					<Button variant="outline">Clear filters</Button>
				</div>
			{:else}
				<DataGrid.Root items={rows} pageSize={8} striped>
					<DataGrid.Table>
						<DataGrid.Header>
							<DataGrid.Row>
								<DataGrid.Column key="name" sortable>Campaign</DataGrid.Column>
								<DataGrid.Column key="channel" sortable>Channel</DataGrid.Column>
								<DataGrid.Column key="status">Status</DataGrid.Column>
								<DataGrid.Column key="visitors" sortable>Visitors</DataGrid.Column>
								<DataGrid.Column key="conversion" sortable>Conversion</DataGrid.Column>
								<DataGrid.Column key="revenue" sortable>Revenue</DataGrid.Column>
							</DataGrid.Row>
						</DataGrid.Header>
						<DataGrid.Body>
							{#snippet children({ items })}
								{@const visibleRows = items as CampaignRow[]}
								{#each visibleRows as row (row.id)}
									<DataGrid.Row>
										<DataGrid.Cell>{row.name}</DataGrid.Cell>
										<DataGrid.Cell>{row.channel}</DataGrid.Cell>
										<DataGrid.Cell
											><Badge variant="soft" color={statusColor[row.status]}>{row.status}</Badge
											></DataGrid.Cell
										>
										<DataGrid.Cell>{row.visitors}</DataGrid.Cell>
										<DataGrid.Cell>{row.conversion}</DataGrid.Cell>
										<DataGrid.Cell>{row.revenue}</DataGrid.Cell>
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
</section>
```

## 5. Proposed `src/layout.css` Structure

Snippet integrity gate result before presenting:

- `grid-template-areas` names are `header`, `filters`, `status`, `metrics`, `primary`, `secondary`, and `table`.
- Each area has exactly one matching `grid-area` rule.
- All selectors are scoped under `[data-layout='analytics-dashboard-shell']`, except the shell selector itself.
- The desktop-spanning `primary` and `table` regions include alignment or stable internal tracks.
- No visual CSS appears here: no color, background, border, shadow, typography, position, z-index, width, height, inline-size, min-inline-size, or max-inline-size.

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
	display: grid;
	gap: var(--dry-spacing-5);
	padding: var(--dry-spacing-4);
	grid-template-areas:
		'header'
		'filters'
		'status'
		'metrics'
		'primary'
		'secondary'
		'table';
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
	grid-area: header;
	display: grid;
	gap: var(--dry-spacing-3);
	align-items: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-header-actions'] {
	display: flex;
	gap: var(--dry-spacing-2);
	align-items: center;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	grid-area: filters;
	display: grid;
	gap: var(--dry-spacing-3);
	align-items: end;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='status'] {
	grid-area: status;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	grid-area: metrics;
	display: grid;
	gap: var(--dry-spacing-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-metric'] {
	display: grid;
	gap: var(--dry-spacing-2);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='primary'] {
	grid-area: primary;
	display: grid;
	gap: var(--dry-spacing-4);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-chart-frame'] {
	display: grid;
	align-items: stretch;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='secondary'] {
	grid-area: secondary;
	display: grid;
	gap: var(--dry-spacing-4);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-insight-list'] {
	display: grid;
	gap: var(--dry-spacing-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-insight'] {
	display: grid;
	gap: var(--dry-spacing-3);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	grid-area: table;
	display: grid;
	gap: var(--dry-spacing-4);
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-region-heading'] {
	display: flex;
	gap: var(--dry-spacing-3);
	align-items: center;
	justify-content: space-between;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-empty-state'] {
	display: grid;
	gap: var(--dry-spacing-3);
	align-content: center;
	justify-items: start;
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		padding: var(--dry-spacing-6);
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'primary primary'
			'secondary secondary'
			'table table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'primary secondary'
			'table table';
		align-items: start;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: minmax(12rem, 1fr) minmax(12rem, 1fr) minmax(16rem, 2fr) auto;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='primary'] {
		align-content: start;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='secondary'] {
		align-content: start;
	}
}
```

Route/component visual CSS would handle tokenized surfaces, borders, text sizing, number formatting, and chart/table overflow constraints. It would not contain `display: grid`, `display: flex`, layout breakpoints, inline styles, or Svelte `style:` directives.

## 6. Visual Check Plan

Use browser screenshots after implementation at:

- Mobile: `390px` wide.
- Tablet: `820px` wide.
- Desktop: `1440px` wide.

Pass checks:

- No horizontal overflow, clipped labels, or overlapping controls.
- Page title and primary refresh/export actions are visible early.
- Filters appear before metric/chart/table data they affect.
- Tablet uses two-column filters and metrics instead of a stretched phone layout.
- Desktop chart is the dominant work surface; secondary insights support it without competing.
- Metrics remain compact and do not form a giant KPI-only desktop band.
- Table remains full-width on desktop for dense data readability.
- Loading, empty, error, disabled, and dense-data branches preserve region structure and avoid layout jumps.
- Primary chart content starts at the top of its region with no blank band caused by grid spanning.

No screenshots were captured for this report because the task requested a written concept only and forbade editing production files.

## 7. Self-Review Against Assigned Test Skill

Passed:

- Used the experiment-local `final-candidate-v3` skill as the active skill.
- Produced all seven requested sections.
- Treated the task as Dashboard Branch plus Full Page Branch.
- Wrote a target brief before markup.
- Checked local component index files before naming component APIs.
- Used only verified DryUI exports in code snippets.
- Page shell owns the named container query.
- Responsive grid is on the shell direct inner child.
- Used `data-layout` and `data-layout-area` hooks.
- Kept page/section structure in `src/layout.css`.
- Used mobile-first base layout with tablet and desktop `@container` shifts.
- Avoided layout-wrapper components.
- Included loading, empty, error, disabled, and dense-data handling.
- Applied the snippet integrity gate before the Svelte and CSS snippets.
- Did not edit production app, package, docs, or canonical skill files.

Caveats:

- This is a report-only output, so no Svelte compiler, DryUI lint, or browser screenshot validation was run.
- Exact prop behavior for `DatePicker.Root disabled` should be confirmed during implementation if this concept is turned into production code; the component family and parts are verified exports, but disabled propagation was not tested here.
