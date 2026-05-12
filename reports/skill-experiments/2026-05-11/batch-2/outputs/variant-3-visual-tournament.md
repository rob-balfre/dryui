# Variant 3: Visual Tournament

## 1. Target Brief

User: product or growth analyst reviewing account, usage, and revenue signals.

Screen: full-page Svelte 5 dashboard titled `Analytics Dashboard`.

Primary task: filter a date range and segment, scan summary metrics, inspect the main trend, then review ranked rows in a data table.

Density: operational dashboard density. Metrics should be compact and scannable, the primary chart should dominate the page, and table rows should support dense-data mode without forcing horizontal overflow on mobile.

Required states:

- Loading: skeleton metrics, chart placeholder, disabled filters/actions, table loading rows.
- Empty: EmptyState near chart/table when filters return no records, with a reset action.
- Error: Alert/Callout area with retry action, while preserving filter context.
- Disabled: disabled export/apply buttons when loading, errored, or no rows are selected.
- Dense data: table supports compact rows, truncated long labels, sticky/scannable columns where available through DryUI DataGrid/Table APIs.

## 2. Visual Tournament

Subagents are not available in this harness, so the Visual Tournament was run as local sketches.

### Variant A: Structure

Focus: clear page regions and predictable responsive order.

Mobile plan: title, actions, filters, metrics, chart, state banner, table.

Tablet plan: title/actions row, filters row, two-column metric grid, chart, table.

Desktop plan: title/actions row, filters sidebar or top rail, four metrics, chart and secondary state panel, table full width.

`data-layout` structure:

```svelte
<section data-layout="analytics-dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="header">...</header>
		<section data-layout-area="filters">...</section>
		<section data-layout-area="metrics">...</section>
		<section data-layout-area="chart">...</section>
		<section data-layout-area="status">...</section>
		<section data-layout-area="table">...</section>
	</div>
</section>
```

`src/layout.css` structure:

```css
[data-layout='analytics-dashboard-shell'] {
  container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
  display: grid;
  gap: var(--dry-space-4);
  grid-template-areas:
    "header"
    "filters"
    "metrics"
    "chart"
    "status"
    "table";
}

@container analytics-dashboard (min-width: 48rem) { ... }
@container analytics-dashboard (min-width: 72rem) { ... }
```

Risks: top rail can become tall if filters have long labels; status panel may feel detached from chart if desktop placement is wrong.

Scores:

| Criterion               | Score |
| ----------------------- | ----: |
| Task fit                |     5 |
| DryUI contract          |     5 |
| Container-query quality |     5 |
| Visual hierarchy        |     4 |
| State coverage          |     4 |
| Implementation risk     |     5 |

### Variant B: Density

Focus: fastest scan for many metrics and rows.

Mobile plan: compact toolbar, horizontal metric summary via cards stacked in two columns only if space allows, chart after metrics, table with visible density toggle.

Tablet plan: metrics in four compact cells, chart and table stacked, filters compressed into Select/DatePicker row.

Desktop plan: dense metrics strip, chart left, table right for above-the-fold comparison, expanded table below only when dense mode is active.

`data-layout` structure:

```svelte
<section data-layout="analytics-dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="header">...</header>
		<section data-layout-area="controls">...</section>
		<section data-layout-area="metrics">...</section>
		<section data-layout-area="chart">...</section>
		<section data-layout-area="table">...</section>
	</div>
</section>
```

`src/layout.css` structure: mobile stack, tablet metrics rail, desktop two-column chart/table region.

Risks: chart and table competing side by side can reduce chart readability; dense mode can make state messaging too subtle; table may become cramped at desktop mid-widths.

Scores:

| Criterion               | Score |
| ----------------------- | ----: |
| Task fit                |     4 |
| DryUI contract          |     5 |
| Container-query quality |     4 |
| Visual hierarchy        |     3 |
| State coverage          |     4 |
| Implementation risk     |     4 |

### Variant C: Resilience

Focus: all states and overflow cases are first-class.

Mobile plan: state banner immediately below controls, metrics can show skeleton/empty independently, chart has fixed block-size, table row labels truncate.

Tablet plan: filters wrap in structural layout CSS, status occupies a narrow row before chart/table, table remains below chart.

Desktop plan: filters/actions in header, metrics across the top, chart with adjacent state/detail panel, table below with dense-data controls.

`data-layout` structure:

```svelte
<section data-layout="analytics-dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="header">...</header>
		<section data-layout-area="filters">...</section>
		<section data-layout-area="state">...</section>
		<section data-layout-area="metrics">...</section>
		<section data-layout-area="chart">...</section>
		<section data-layout-area="table-toolbar">...</section>
		<section data-layout-area="table">...</section>
	</div>
</section>
```

`src/layout.css` structure: explicit state and table-toolbar areas, chart/table get stable minimum block sizes in layout CSS, responsive columns only inside `@container analytics-dashboard`.

Risks: more regions means more markup; table toolbar may duplicate actions already present in the page header unless commands are scoped carefully.

Scores:

| Criterion               | Score |
| ----------------------- | ----: |
| Task fit                |     5 |
| DryUI contract          |     5 |
| Container-query quality |     5 |
| Visual hierarchy        |     4 |
| State coverage          |     5 |
| Implementation risk     |     4 |

### Winner

Winner: merge Variant A's simple information architecture with Variant C's explicit state and table-toolbar handling.

Reasoning: Variant A gives the clearest full-page dashboard hierarchy and lowest implementation risk. Variant C adds the strongest resilience requirements without making the dashboard feel like a component demo. Variant B contributes the dense-data toggle idea, but not its side-by-side chart/table desktop layout.

## 3. Winning Implementation Plan

Implement a full Svelte route page with:

- Page shell owning `container: analytics-dashboard / inline-size`.
- Inner child owning the responsive grid.
- Header with title `Analytics Dashboard`, date range, segment Select, refresh, export, and primary apply action.
- Four summary metric cards using DryUI Card or equivalent primitives if present, with loading skeleton text and delta badges.
- Primary chart section with a tokenized visual chart placeholder or project chart primitive if available; use SVG/canvas only inside the visual component area, not for page layout.
- State region using DryUI Alert/EmptyState patterns:
  - loading banner for slow data,
  - error alert with retry,
  - empty state with reset filters.
- Table toolbar with dense mode Toggle/Switch, row count, and disabled bulk action.
- Data table using DryUI Table or DataGrid, with compact row variant where supported.

State model:

```ts
type DashboardStatus = 'idle' | 'loading' | 'empty' | 'error';

let status = $state<DashboardStatus>('idle');
let dense = $state(false);
let selectedRows = $state<string[]>([]);
let hasRows = $derived(status === 'idle' && rows.length > 0);
let actionsDisabled = $derived(status === 'loading' || status === 'error');
let exportDisabled = $derived(actionsDisabled || !hasRows);
let bulkDisabled = $derived(actionsDisabled || selectedRows.length === 0);
```

## 4. Proposed Svelte Markup Structure

```svelte
<script lang="ts">
	import {
		Button,
		Card,
		DataGrid,
		DatePicker,
		EmptyState,
		Field,
		Select,
		Separator,
		Skeleton,
		Switch,
		Tooltip
	} from '@dryui/ui';

	type DashboardStatus = 'idle' | 'loading' | 'empty' | 'error';

	let status = $state<DashboardStatus>('idle');
	let dense = $state(false);
	let selectedRows = $state<string[]>([]);

	const rows = $derived(status === 'empty' || status === 'error' ? [] : analyticsRows);
	const hasRows = $derived(status === 'idle' && rows.length > 0);
	const exportDisabled = $derived(status !== 'idle' || !hasRows);
	const bulkDisabled = $derived(status !== 'idle' || selectedRows.length === 0);
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<section data-layout="analytics-dashboard-shell" aria-labelledby="analytics-dashboard-title">
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p>Performance</p>
				<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
			</div>

			<div data-layout="analytics-dashboard-actions">
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button variant="ghost" aria-label="Refresh dashboard" disabled={status === 'loading'}
							>...</Button
						>
					</Tooltip.Trigger>
					<Tooltip.Content>Refresh dashboard</Tooltip.Content>
				</Tooltip.Root>
				<Button variant="secondary" disabled={exportDisabled}>Export</Button>
				<Button disabled={status === 'loading'}>Apply</Button>
			</div>
		</header>

		<section data-layout-area="filters" aria-label="Dashboard filters">
			<Field.Root>
				<Field.Label>Date range</Field.Label>
				<DatePicker.Range bind:value={dateRange} disabled={status === 'loading'} />
			</Field.Root>

			<Field.Root>
				<Field.Label>Segment</Field.Label>
				<Select.Root bind:value={segment} disabled={status === 'loading'}>
					<Select.Trigger />
					<Select.Content>...</Select.Content>
				</Select.Root>
			</Field.Root>
		</section>

		<section data-layout-area="state" aria-live="polite">
			{#if status === 'loading'}
				<Card.Root>Loading analytics data...</Card.Root>
			{:else if status === 'error'}
				<Card.Root role="alert">
					<p>Analytics data could not be loaded.</p>
					<Button variant="secondary">Retry</Button>
				</Card.Root>
			{:else if status === 'empty'}
				<EmptyState.Root>
					<EmptyState.Title>No analytics data</EmptyState.Title>
					<EmptyState.Description
						>Try widening the date range or clearing segment filters.</EmptyState.Description
					>
					<EmptyState.Actions>
						<Button variant="secondary">Reset filters</Button>
					</EmptyState.Actions>
				</EmptyState.Root>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<Card.Root>
					<Card.Header>
						<Card.Title>{metric.label}</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if status === 'loading'}
							<Skeleton.Text />
						{:else}
							<strong>{metric.value}</strong>
							<span>{metric.delta}</span>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<section data-layout-area="chart" aria-labelledby="analytics-chart-title">
			<Card.Root>
				<Card.Header>
					<Card.Title id="analytics-chart-title">Revenue and usage trend</Card.Title>
				</Card.Header>
				<Card.Content>
					<div data-layout="analytics-dashboard-chart-frame">
						{#if status === 'loading'}
							<Skeleton.Block aria-label="Loading chart" />
						{:else if status === 'idle'}
							<AnalyticsTrendChart data={chartData} />
						{:else}
							<EmptyState.Root>...</EmptyState.Root>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		<section data-layout-area="table-toolbar" aria-label="Table controls">
			<p>{rows.length} rows</p>
			<Field.Root>
				<Field.Label>Dense rows</Field.Label>
				<Switch.Root bind:checked={dense} disabled={status === 'loading'} />
			</Field.Root>
			<Button variant="secondary" disabled={bulkDisabled}>Compare selected</Button>
		</section>

		<section data-layout-area="table" aria-labelledby="analytics-table-title">
			<Card.Root>
				<Card.Header>
					<Card.Title id="analytics-table-title">Channel performance</Card.Title>
				</Card.Header>
				<Card.Content>
					<DataGrid.Root
						data={rows}
						density={dense ? 'compact' : 'default'}
						disabled={status === 'loading'}
					>
						...
					</DataGrid.Root>
				</Card.Content>
			</Card.Root>
		</section>
	</div>
</section>
```

Notes:

- Exact component names must be confirmed against `packages/ui/src/<component>/<component>.meta.ts` before implementation.
- No `class=` is passed to DryUI components. Styling hooks stay on raw wrapper elements through `data-layout` and `data-layout-area`.
- Raw controls are avoided where DryUI provides a primitive.

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
		'state'
		'metrics'
		'chart'
		'table-toolbar'
		'table';
}

[data-layout='analytics-dashboard-heading'] {
	display: grid;
	gap: var(--dry-space-1);
}

[data-layout='analytics-dashboard-actions'] {
	display: flex;
	align-items: center;
	gap: var(--dry-space-2);
	flex-wrap: wrap;
}

[data-layout-area='filters'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='metrics'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout-area='chart'] {
	min-block-size: 24rem;
}

[data-layout='analytics-dashboard-chart-frame'] {
	min-block-size: 18rem;
}

[data-layout-area='table-toolbar'] {
	display: flex;
	align-items: center;
	gap: var(--dry-space-3);
	flex-wrap: wrap;
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-template-areas:
			'header header header header'
			'filters filters filters filters'
			'state state state state'
			'metrics metrics metrics metrics'
			'chart chart chart chart'
			'table-toolbar table-toolbar table-toolbar table-toolbar'
			'table table table table';
	}

	[data-layout-area='header'],
	[data-layout-area='filters'],
	[data-layout-area='metrics'] {
		display: grid;
		gap: var(--dry-space-3);
	}

	[data-layout-area='header'] {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
	}

	[data-layout-area='filters'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-shell'] > [data-layout-area='page'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-areas:
			'header header header header header header header header header header header header'
			'filters filters filters filters filters filters filters filters filters filters filters filters'
			'state state state state state state state state state state state state'
			'metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics'
			'chart chart chart chart chart chart chart chart chart chart chart chart'
			'table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar table-toolbar'
			'table table table table table table table table table table table table';
	}

	[data-layout-area='metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout-area='filters'] {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
		align-items: end;
	}
}
```

Visual CSS outside `src/layout.css` should handle only colors, borders, shadows, typography, chart drawing, truncation, and tokenized surface styling. It must not add `display: grid` or `display: flex`.

## 6. Visual Check Plan

Check three viewport widths:

- Mobile: 390px wide. Confirm title, filters, metric cards, chart, state block, dense toggle, and table all stack without horizontal overflow. Long segment names and table labels must truncate or wrap cleanly.
- Tablet: 820px wide. Confirm header actions align with title, filters form a two-column row, metrics use two columns, chart block has stable height, and state messages do not visually detach.
- Desktop: 1440px wide. Confirm four metrics form a single row, chart remains the primary visual element, table toolbar scans as table-specific controls, and disabled/export states are obvious.

State checks:

- `loading`: filters and actions disabled, skeletons visible, no layout jump when data resolves.
- `empty`: EmptyState appears in chart/table context with reset action, export disabled.
- `error`: alert is announced and retry is available, table does not show stale rows unless explicitly marked stale.
- `dense`: table rows compact while preserving readable labels and accessible hit targets for row selection.
- Long data: long channel names, large numbers, and many rows do not change grid track sizes unexpectedly.

Theme checks:

- If the app imports both DryUI light and dark themes, verify light and dark. If not, keep page light-only and do not depend on adaptive tokens for fixed custom text colors.

## 7. Self-Review Against Assigned Test Skill

- Full page dashboard: yes, page shell plus header, filters, metrics, chart, state, table toolbar, and table.
- Page title: yes, `Analytics Dashboard`.
- Summary metrics: yes, four metric cards.
- Primary chart: yes, dedicated chart region with stable block size.
- Filters/actions: yes, DatePicker, Select, refresh, export, apply.
- Data table: yes, proposed DataGrid/Table region.
- Useful state handling: yes, loading, empty, error, disabled, dense-data states are explicit.
- DryUI components: yes, uses DryUI primitives where available, with a note to verify exact APIs via metadata before implementation.
- Page shell owns named container query: yes, `analytics-dashboard-shell` owns `container: analytics-dashboard / inline-size`.
- Responsive grid on inner child: yes, direct inner `[data-layout-area='page']` owns grid.
- `data-layout` and `data-layout-area` hooks: yes.
- Page and section structure in `src/layout.css`: yes.
- Mobile-first with tablet and desktop `@container` shifts: yes.
- No raw `display: grid` or `display: flex` in route/component styles: yes, all structural display rules are in `src/layout.css`.
- No layout-wrapper components: yes, plain markup and DryUI components only.
- Production files edited: no.

Validation not run: this task requested a report-only concept file and no production implementation. No Svelte, lint, build, or visual browser verification was applicable.
