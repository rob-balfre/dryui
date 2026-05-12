# Final Candidate V4: Analytics Dashboard Page

## 1. Target Brief

`type=page, subtype=dashboard, user=analytics operator, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

The page is a full Svelte 5 dashboard titled `Analytics Dashboard`. It prioritizes monitoring acquisition and conversion health, with filters/actions before affected data, compact summary metrics, a dominant primary chart, a secondary insights/actions region, and a dense table for drill-down.

Verified local DryUI exports checked before naming APIs:

- `Button`, `Input`, `Label`, `Badge`, `Alert`, `Skeleton`
- `Field.Root`, `Field.Description`, `Field.Error`
- `Select.Root`, `Select.Trigger`, `Select.Content`, `Select.Item`, `Select.Value`
- `DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Content`, `DatePicker.Calendar`
- `Chart.Root`, `Chart.Area`, `Chart.XAxis`, `Chart.YAxis`
- `DataGrid.Root`, `DataGrid.Table`, `DataGrid.Header`, `DataGrid.Column`, `DataGrid.Body`, `DataGrid.Row`, `DataGrid.Cell`, `DataGrid.Pagination`
- `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`

The exact value binding prop names for `Select.Root`, `DatePicker.Root`, and `DataGrid.Root` should be verified against component implementation or docs before production use. The snippets below mark those bindings as verification-needed comments rather than assuming final API details.

## 2. Branch, Variant, And Scoring Work

Dashboard Branch:

- Primary task: monitor.
- Density: compact.
- Stable regions: header, filters/actions, status strip, summary metrics, primary chart, secondary insights/actions, data table.
- Filters/actions appear before status, chart, and table.
- Primary chart is the largest region on desktop.
- State handling is layout-preserving: loading, empty, error, disabled, and dense-data branches render inside stable regions.

Full Page Branch:

- Page shell: `data-layout="analytics-dashboard-shell"`.
- Named container query owner: shell gets `container: analytics-dashboard / inline-size`.
- Responsive grid lives on the shell's direct inner child: `data-layout-area="page"`.
- Mobile base is single-column.
- Tablet adds two-column filters/metrics where useful.
- Desktop keeps compact metrics and places secondary insights beside the primary chart, with the table full-width below.

Variants scored:

| Variant | Structure                                                  | Score | Reason                                                                                                        |
| ------- | ---------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------- |
| A       | Full-width metrics, chart below, table below               |  5/10 | Simple, but desktop wastes vertical space and delays the primary chart.                                       |
| B       | Chart dominant left, insights right, metrics compact above |  9/10 | Best match for monitoring: primary work appears early, secondary context supports it, table remains readable. |
| C       | Table dominant with chart/sidebar above                    |  7/10 | Good for triage, weaker for monitor because the visual trend is not dominant.                                 |

Winner: Variant B.

## 3. Winning Implementation Plan

Build `Analytics Dashboard` as a route page with one shell and one direct page grid child. Use compact DryUI controls for filters, a status alert strip, metric cards as repeated raw sections with `Badge` for trend state, `Chart` for the primary trend, an insights/actions region with `Button` and `Tooltip`, and `DataGrid` for dense rows.

Keep layout structure in `src/layout.css` only. The route `<style>` block handles surfaces, text, borders, and media/chart constraints without `display: grid` or `display: flex`. Use real tokens already observed in the repo, including `--dry-space-*`, `--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-bg-sunken`, `--dry-color-text-strong`, `--dry-color-text-weak`, `--dry-color-stroke-weak`, `--dry-color-fill`, `--dry-color-fill-brand`, and `--dry-font-sans`.

## 4. Proposed Svelte Markup Structure

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
		Skeleton,
		Tooltip
	} from '@dryui/ui';

	type DashboardState = 'ready' | 'loading' | 'empty' | 'error' | 'disabled';

	type Metric = {
		label: string;
		value: string;
		change: string;
		tone: 'success' | 'warning' | 'neutral';
	};

	type ChartPoint = { label: string; value: number };
	type CampaignRow = {
		id: string;
		campaign: string;
		source: string;
		sessions: string;
		conversion: string;
		revenue: string;
		status: 'Healthy' | 'Watch' | 'Paused';
	};

	let state = $state<DashboardState>('ready');
	let dense = $state(true);
	let query = $state('');

	const disabled = $derived(state === 'disabled');

	const metrics: Metric[] = [
		{ label: 'Visitors', value: '128.4k', change: '+12.8%', tone: 'success' },
		{ label: 'Conversion', value: '6.8%', change: '+0.9%', tone: 'success' },
		{ label: 'CAC', value: '$42', change: '-4.1%', tone: 'success' },
		{ label: 'At risk', value: '7', change: '+2', tone: 'warning' }
	];

	const chartData: ChartPoint[] = [
		{ label: 'Mon', value: 42 },
		{ label: 'Tue', value: 58 },
		{ label: 'Wed', value: 51 },
		{ label: 'Thu', value: 68 },
		{ label: 'Fri', value: 74 },
		{ label: 'Sat', value: 61 },
		{ label: 'Sun', value: 79 }
	];

	const rows: CampaignRow[] = [
		{
			id: 'launch',
			campaign: 'Launch retargeting',
			source: 'Paid social',
			sessions: '38,420',
			conversion: '7.4%',
			revenue: '$84,200',
			status: 'Healthy'
		},
		{
			id: 'search',
			campaign: 'Search intent',
			source: 'Search',
			sessions: '24,180',
			conversion: '5.9%',
			revenue: '$52,900',
			status: 'Watch'
		}
	];
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<main data-layout="analytics-dashboard-shell" aria-labelledby="analytics-dashboard-title">
	<section data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p data-layout="analytics-dashboard-kicker">Performance</p>
				<h1 id="analytics-dashboard-title" data-layout="analytics-dashboard-title">
					Analytics Dashboard
				</h1>
				<p data-layout="analytics-dashboard-summary">
					Monitor acquisition quality, conversion movement, and campaign risk.
				</p>
			</div>

			<div data-layout="analytics-dashboard-header-actions">
				<Button variant="outline" size="sm" {disabled}>Export</Button>
				<Button size="sm" {disabled}>Refresh</Button>
			</div>
		</header>

		<form data-layout-area="filters" aria-label="Analytics filters">
			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label for="analytics-search">Search</Label>
				<Input id="analytics-search" bind:value={query} size="sm" {disabled} />
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label id="analytics-segment-label">Segment</Label>
				<!-- verification-needed: confirm Select.Root selected-value binding prop. -->
				<Select.Root {disabled}>
					<Select.Trigger size="sm" aria-labelledby="analytics-segment-label">
						<Select.Value placeholder="All traffic" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All traffic</Select.Item>
						<Select.Item value="paid">Paid</Select.Item>
						<Select.Item value="organic">Organic</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label id="analytics-range-label">Range</Label>
				<!-- verification-needed: confirm DatePicker.Root value binding prop. -->
				<DatePicker.Root {disabled}>
					<DatePicker.Trigger size="sm" aria-labelledby="analytics-range-label" />
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</Field.Root>

			<div data-layout="analytics-dashboard-filter-actions">
				<Button type="submit" size="sm" {disabled}>Apply</Button>
				<Button type="button" variant="ghost" size="sm" {disabled}>Reset</Button>
			</div>
		</form>

		<section data-layout-area="status" aria-live="polite">
			{#if state === 'error'}
				<Alert variant="error">Analytics data failed to load. Retry the refresh action.</Alert>
			{:else if state === 'empty'}
				<Alert variant="info">No analytics matched the current filters.</Alert>
			{:else if state === 'disabled'}
				<Alert variant="warning"
					>Dashboard controls are disabled while permissions are reviewed.</Alert
				>
			{:else}
				<Alert variant="success">Live analytics are current through the last refresh.</Alert>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric">
					{#if state === 'loading'}
						<Skeleton variant="text" />
						<Skeleton variant="rectangular" />
					{:else}
						<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
						<strong data-layout="analytics-dashboard-metric-value">{metric.value}</strong>
						<Badge variant="soft" color={metric.tone === 'warning' ? 'warning' : 'success'}>
							{metric.change}
						</Badge>
					{/if}
				</article>
			{/each}
		</section>

		<section data-layout-area="primary" aria-labelledby="analytics-chart-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-chart-title" data-layout="analytics-dashboard-section-title">
					Conversion trend
				</h2>
				<Badge variant="dot" color="success">Tracking above plan</Badge>
			</div>

			<div data-layout="analytics-dashboard-chart-frame">
				{#if state === 'loading'}
					<Skeleton variant="rectangular" />
				{:else if state === 'empty'}
					<p data-layout="analytics-dashboard-state-copy">No trend data for this filter set.</p>
				{:else if state === 'error'}
					<Button variant="outline" size="sm">Retry chart load</Button>
				{:else}
					<Chart.Root data={chartData} summary="Daily conversion index for the selected range">
						<Chart.YAxis ticks={4} />
						<Chart.Area color="var(--dry-color-fill-brand)" />
						<Chart.XAxis />
					</Chart.Root>
				{/if}
			</div>
		</section>

		<aside data-layout-area="secondary" aria-labelledby="analytics-insights-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-insights-title" data-layout="analytics-dashboard-section-title">
					Insights
				</h2>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button variant="ghost" size="icon-sm" aria-label="Explain insights">?</Button>
					</Tooltip.Trigger>
					<Tooltip.Content
						>Insights compare current performance against the previous period.</Tooltip.Content
					>
				</Tooltip.Root>
			</div>

			<ul data-layout="analytics-dashboard-insight-list">
				<li data-layout="analytics-dashboard-insight">
					Paid social is driving 34% more qualified sessions.
				</li>
				<li data-layout="analytics-dashboard-insight">
					Search intent conversion dipped below the weekly target.
				</li>
				<li data-layout="analytics-dashboard-insight">
					Seven campaigns need budget or creative review.
				</li>
			</ul>

			<div data-layout="analytics-dashboard-insight-actions">
				<Button size="sm" {disabled}>Open recommendations</Button>
				<Button variant="outline" size="sm" {disabled}>Assign review</Button>
			</div>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<div data-layout="analytics-dashboard-section-heading">
				<h2 id="analytics-table-title" data-layout="analytics-dashboard-section-title">
					Campaign performance
				</h2>
				<Badge variant="outline">{dense ? 'Dense' : 'Comfortable'}</Badge>
			</div>

			{#if state === 'loading'}
				<div data-layout="analytics-dashboard-table-loading">
					<Skeleton variant="rectangular" />
					<Skeleton variant="rectangular" />
					<Skeleton variant="rectangular" />
				</div>
			{:else if state === 'empty'}
				<p data-layout="analytics-dashboard-state-copy">No campaigns match the selected filters.</p>
			{:else if state === 'error'}
				<Button variant="outline" size="sm">Retry table load</Button>
			{:else}
				<!-- verification-needed: confirm DataGrid.Root row/data props for production. -->
				<DataGrid.Root data={rows} striped={dense}>
					<DataGrid.Table aria-label="Campaign performance table">
						<DataGrid.Header>
							<DataGrid.Column id="campaign">Campaign</DataGrid.Column>
							<DataGrid.Column id="source">Source</DataGrid.Column>
							<DataGrid.Column id="sessions">Sessions</DataGrid.Column>
							<DataGrid.Column id="conversion">Conversion</DataGrid.Column>
							<DataGrid.Column id="revenue">Revenue</DataGrid.Column>
							<DataGrid.Column id="status">Status</DataGrid.Column>
						</DataGrid.Header>
						<DataGrid.Body>
							{#each rows as row}
								<DataGrid.Row rowId={row.id}>
									<DataGrid.Cell>{row.campaign}</DataGrid.Cell>
									<DataGrid.Cell>{row.source}</DataGrid.Cell>
									<DataGrid.Cell>{row.sessions}</DataGrid.Cell>
									<DataGrid.Cell>{row.conversion}</DataGrid.Cell>
									<DataGrid.Cell>{row.revenue}</DataGrid.Cell>
									<DataGrid.Cell>
										<Badge variant="soft" color={row.status === 'Watch' ? 'warning' : 'success'}>
											{row.status}
										</Badge>
									</DataGrid.Cell>
								</DataGrid.Row>
							{/each}
						</DataGrid.Body>
					</DataGrid.Table>
					<DataGrid.Pagination />
				</DataGrid.Root>
			{/if}
		</section>
	</section>
</main>

<style>
	[data-layout='analytics-dashboard-shell'] {
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-strong);
	}

	[data-layout='analytics-dashboard-kicker'],
	[data-layout='analytics-dashboard-summary'],
	[data-layout='analytics-dashboard-metric-label'],
	[data-layout='analytics-dashboard-state-copy'],
	[data-layout='analytics-dashboard-insight'] {
		color: var(--dry-color-text-weak);
	}

	[data-layout='analytics-dashboard-title'],
	[data-layout='analytics-dashboard-section-title'],
	[data-layout='analytics-dashboard-metric-value'] {
		color: var(--dry-color-text-strong);
	}

	[data-layout='analytics-dashboard-metric'],
	[data-layout-area='primary'],
	[data-layout-area='secondary'],
	[data-layout-area='table'] {
		border: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-raised);
		border-radius: 8px;
	}

	[data-layout='analytics-dashboard-chart-frame'] {
		background: var(--dry-color-bg-sunken);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: 8px;
	}

	[data-layout='analytics-dashboard-chart-frame'] svg {
		inline-size: 100%;
		max-inline-size: 100%;
	}
</style>
```

## 5. Proposed `src/layout.css` Structure

The app-level font rule belongs in `src/app.css`, not in the route style block:

```css
body {
	font-family: var(--dry-font-sans);
}
```

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
	display: grid;
	gap: var(--dry-space-4);
	padding: var(--dry-space-4);
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
	display: grid;
	gap: var(--dry-space-3);
	grid-area: header;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: filters;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='status'] {
	display: grid;
	gap: var(--dry-space-2);
	grid-area: status;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: metrics;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='primary'] {
	display: grid;
	gap: var(--dry-space-4);
	grid-area: primary;
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='secondary'] {
	display: grid;
	gap: var(--dry-space-4);
	grid-area: secondary;
	align-content: start;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-4);
	grid-area: table;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-header-actions'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-filter-actions'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-section-heading'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-insight-actions'] {
	display: flex;
	gap: var(--dry-space-2);
	align-items: center;
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-metric'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-filter-field'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-chart-frame'],
[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-table-loading'] {
	display: grid;
	gap: var(--dry-space-2);
	padding: var(--dry-space-3);
}

[data-layout='analytics-dashboard-shell'] [data-layout='analytics-dashboard-insight-list'] {
	display: grid;
	gap: var(--dry-space-2);
	padding: var(--dry-space-3);
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		padding: var(--dry-space-6);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'metrics metrics'
			'primary primary'
			'secondary secondary'
			'table table';
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'],
	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'],
	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: end;
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		grid-template-areas:
			'header header header'
			'filters filters filters'
			'status status status'
			'metrics metrics secondary'
			'primary primary secondary'
			'table table table';
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(18rem, 24rem);
		align-items: start;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: minmax(14rem, 1fr) minmax(12rem, 16rem) minmax(12rem, 16rem) auto;
	}
}
```

## 6. Visual Check Plan

Use Browser or Playwright against the implemented route after files exist.

- Mobile `390px`: verify order is header, filters/actions, status, metrics, chart, insights, table; no horizontal overflow; filter controls and table state fit without clipped text.
- Tablet `820px`: verify filters and metrics use two columns rather than a stretched phone layout; chart remains readable; status branches preserve layout.
- Desktop `1440px`: verify the primary chart dominates, metrics remain compact, insights sit beside the chart without competing, the chart starts near the top, and table remains full-width/readable.
- State passes: `ready`, `loading`, `empty`, `error`, `disabled`, and dense-data table rows.
- Theme pass: if the app uses system/explicit theme, check light and dark; otherwise keep light-only theme imports and no adaptive custom text on adaptive surfaces.

## 7. Self-Review Against The Assigned Test Skill

Snippet integrity gate:

- Every Svelte component used in markup appears in the import list.
- Component compound parts used above are verified exports from local `packages/ui/src/*/index.ts`.
- `Select.Root`, `DatePicker.Root`, and `DataGrid.Root` value/data binding details are marked verification-needed where prop semantics may be uncertain.
- All `grid-template-areas` names have one matching `grid-area` selector: `header`, `filters`, `status`, `metrics`, `primary`, `secondary`, `table`.
- Every participating `data-layout-area` has exactly one matching `grid-area` rule.
- All `src/layout.css` selectors are scoped under `[data-layout='analytics-dashboard-shell']` except the shell container rule.
- Areas that span beside stacked regions include `align-content: start` on `primary` and `secondary`, plus desktop `align-items: start`.
- Interior raw elements have specific `data-layout` or `data-layout-area` hooks.
- Layout CSS uses `--dry-space-*` tokens and observed DryUI color/font tokens.
- `src/layout.css` stays structural: display, grid, flex, container, gap, padding, alignment. It does not include color, background, border, typography, position, width, height, or inline-size.

Known issues to resolve before production implementation:

- `DatePicker.Trigger` accessible labeling may need adjustment after checking the component's rendered button attributes.
- `DataGrid.Row rowId`, `DataGrid.Column id`, and `DataGrid.Root data` were inferred from exported prop types and file names; confirm against local component implementation before final code.
- The report was the only edited file, per experiment constraints. No production validation or screenshots were run because no production route was implemented.
