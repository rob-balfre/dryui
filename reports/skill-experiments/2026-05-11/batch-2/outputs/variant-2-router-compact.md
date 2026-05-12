# Variant 2 Router Compact: Analytics Dashboard

## 1. Target brief

Target: a full-page Svelte 5 analytics dashboard for a product or docs team reviewing acquisition, engagement, and conversion health.

Screen: `Analytics Dashboard`.

Primary task: scan current performance, filter by time range/channel/segment, inspect trend movement in the primary chart, and compare dense row-level channel data in a table.

Density: work-focused dashboard density. The page should show filters, four summary metrics, a dominant chart, a table, and status surfaces without becoming a card-only marketing layout.

Required states:

- Loading: dashboard shell remains stable; metrics, chart, and table show loading placeholders or `aria-busy`.
- Empty: useful empty state when filters return no rows.
- Error: recoverable alert with retry action.
- Disabled: filter controls and export/action buttons disabled while loading or when no data exists.
- Dense-data: table supports many rows with compact cell treatment, horizontal overflow containment, and a clear summary of active result count.

## 2. Branch, variant, and scoring work

Assigned variant: `variant-2-router-compact`.

Active skill: the experiment-local `dryui-build` skill at `reports/skill-experiments/2026-05-11/batch-2/variant-2-router-compact/SKILL.md`.

No code branch work is required by the task. This output is a proposal artifact only, and production files must not be edited.

Scoring criteria implied by the assigned skill:

- Full-page dashboard recipe is used rather than an isolated component.
- Page shell owns the named container query.
- Responsive grid lives on an inner child.
- `src/layout.css` contains all page and section `display: grid` / `display: flex` structure.
- Route/component styles contain visual treatment only, no raw layout display declarations.
- DryUI primitives are used where available, especially `Button`, `Select`, `DatePicker`, `Field`, `Table`, `EmptyState`, and alert/dialog primitives.
- Svelte 5 runes are used for local state and derived rows/flags.
- Mobile, tablet, and desktop behavior is explicitly planned.

## 3. Winning implementation plan

Create a route-level Svelte page with a shell element:

- Outer shell: `<main data-layout="analytics-dashboard-shell">`
- Inner grid: `<section data-layout="analytics-dashboard-page">`
- Named areas: heading, filters, metrics, chart, table, status.

Use local mock data for the concept, with state flags that exercise the required states:

- `isLoading`
- `errorMessage`
- `selectedRange`
- `selectedChannel`
- `selectedSegment`
- `rows`
- `$derived` values for filtered rows, totals, empty state, dense state, and disabled state.

Use DryUI controls:

- `Button` for refresh/export/retry.
- `Field.Root` and `Field.Label` around filter controls.
- `Select.Root` for channel/segment.
- `DatePicker` or a range select for date range depending on nearby package metadata.
- `Table.Root` and compound table parts for dense channel rows.
- `EmptyState.Root` for empty results.

Visual CSS remains in the route style block:

- Dashboard surface colors, borders, text sizing, chart bars, table typography, skeleton shimmer, and alert colors use DryUI tokens.
- No `display: grid` or `display: flex` in the route style block.
- Media and long text are constrained with `min-inline-size: 0`, `max-inline-size: 100%`, and readable measures.

Structural CSS goes in `src/layout.css`:

- Container query ownership on the shell.
- Mobile-first single-column layout on the inner page.
- Tablet query shifts filters/metrics/table controls.
- Desktop query gives the chart a dominant area and keeps table below or beside secondary status depending on available space.

## 4. Proposed Svelte markup structure

```svelte
<script lang="ts">
	import { Button, EmptyState, Field, Select, Table } from '@dryui/ui';

	type DashboardRow = {
		channel: string;
		sessions: number;
		conversionRate: number;
		revenue: number;
		trend: 'up' | 'down' | 'flat';
	};

	let selectedRange = $state('30d');
	let selectedChannel = $state('all');
	let selectedSegment = $state('all');
	let isLoading = $state(false);
	let errorMessage = $state('');

	const rows = $state<DashboardRow[]>([
		{
			channel: 'Organic Search',
			sessions: 42810,
			conversionRate: 7.4,
			revenue: 182400,
			trend: 'up'
		},
		{ channel: 'Direct', sessions: 31420, conversionRate: 5.9, revenue: 126800, trend: 'flat' },
		{ channel: 'Referral', sessions: 18460, conversionRate: 6.6, revenue: 94300, trend: 'up' },
		{ channel: 'Paid Search', sessions: 15220, conversionRate: 4.1, revenue: 70600, trend: 'down' }
	]);

	const filteredRows = $derived(
		selectedChannel === 'all' ? rows : rows.filter((row) => row.channel === selectedChannel)
	);

	const hasRows = $derived(filteredRows.length > 0);
	const isDisabled = $derived(isLoading || Boolean(errorMessage));
	const isDense = $derived(filteredRows.length > 8);
	const totalSessions = $derived(filteredRows.reduce((sum, row) => sum + row.sessions, 0));
	const totalRevenue = $derived(filteredRows.reduce((sum, row) => sum + row.revenue, 0));
</script>

<main data-layout="analytics-dashboard-shell" aria-labelledby="analytics-dashboard-title">
	<section data-layout="analytics-dashboard-page">
		<header data-layout-area="heading" class="dashboard-heading">
			<p class="eyebrow">Performance</p>
			<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
			<p class="summary">Track acquisition quality, conversion movement, and revenue by channel.</p>
		</header>

		<section data-layout-area="filters" class="dashboard-filters" aria-label="Dashboard filters">
			<Field.Root>
				<Field.Label>Range</Field.Label>
				<Select.Root bind:value={selectedRange} disabled={isLoading}>
					<!-- Select trigger/content/items per DryUI metadata -->
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Field.Label>Channel</Field.Label>
				<Select.Root bind:value={selectedChannel} disabled={isLoading}>
					<!-- all + channel items -->
				</Select.Root>
			</Field.Root>

			<Field.Root>
				<Field.Label>Segment</Field.Label>
				<Select.Root bind:value={selectedSegment} disabled={isLoading}>
					<!-- all + segment items -->
				</Select.Root>
			</Field.Root>

			<div data-layout="analytics-dashboard-actions">
				<Button type="button" variant="secondary" disabled={isDisabled}>Refresh</Button>
				<Button type="button" disabled={isDisabled || !hasRows}>Export</Button>
			</div>
		</section>

		{#if errorMessage}
			<section data-layout-area="status" class="dashboard-alert" role="alert">
				<p>{errorMessage}</p>
				<Button type="button" variant="secondary">Retry</Button>
			</section>
		{/if}

		<section
			data-layout-area="metrics"
			data-layout="analytics-dashboard-metrics"
			aria-label="Summary metrics"
		>
			<article class="metric-card" aria-busy={isLoading}>
				<span>Sessions</span>
				<strong>{totalSessions.toLocaleString()}</strong>
				<small>+12.8% vs previous period</small>
			</article>
			<article class="metric-card" aria-busy={isLoading}>
				<span>Conversion rate</span>
				<strong>6.2%</strong>
				<small>+0.7 pts</small>
			</article>
			<article class="metric-card" aria-busy={isLoading}>
				<span>Revenue</span>
				<strong>${totalRevenue.toLocaleString()}</strong>
				<small>+9.4%</small>
			</article>
			<article class="metric-card" aria-busy={isLoading}>
				<span>Active users</span>
				<strong>18,240</strong>
				<small>-2.1%</small>
			</article>
		</section>

		<section data-layout-area="chart" class="chart-panel" aria-busy={isLoading}>
			<div data-layout="analytics-dashboard-panel-heading">
				<h2>Conversion trend</h2>
				<p>{selectedRange} rolling view</p>
			</div>
			<div class="chart-canvas" role="img" aria-label="Conversion trend chart">
				<!-- Token-colored bar or SVG chart concept; no layout display in route CSS -->
			</div>
		</section>

		<section data-layout-area="table" class:dense={isDense} class="table-panel">
			<div data-layout="analytics-dashboard-panel-heading">
				<h2>Channel performance</h2>
				<p>{filteredRows.length} rows</p>
			</div>

			{#if isLoading}
				<div class="table-loading" aria-live="polite">Loading analytics data...</div>
			{:else if !hasRows}
				<EmptyState.Root>
					<!-- EmptyState title/body/action per DryUI metadata -->
				</EmptyState.Root>
			{:else}
				<Table.Root>
					<!-- Table header/body rows for channel, sessions, conversion, revenue, trend -->
				</Table.Root>
			{/if}
		</section>
	</section>
</main>
```

Before implementation, confirm exact compound part names from:

- `packages/ui/src/select/select.meta.ts`
- `packages/ui/src/table/table.meta.ts`
- `packages/ui/src/empty-state/empty-state.meta.ts`
- `packages/ui/src/field/field.meta.ts`

## 5. Proposed `src/layout.css` structure

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-page'] {
	display: grid;
	gap: var(--dry-space-4);
	align-items: start;
	grid-template-areas:
		'heading'
		'filters'
		'status'
		'metrics'
		'chart'
		'table';
}

[data-layout='analytics-dashboard-actions'] {
	display: flex;
	gap: var(--dry-space-2);
	align-items: center;
}

[data-layout='analytics-dashboard-metrics'] {
	display: grid;
	gap: var(--dry-space-3);
}

[data-layout='analytics-dashboard-panel-heading'] {
	display: flex;
	gap: var(--dry-space-2);
	align-items: start;
	justify-content: space-between;
}

[data-layout-area='heading'] {
	grid-area: heading;
}

[data-layout-area='filters'] {
	grid-area: filters;
}

[data-layout-area='status'] {
	grid-area: status;
}

[data-layout-area='metrics'] {
	grid-area: metrics;
}

[data-layout-area='chart'] {
	grid-area: chart;
}

[data-layout-area='table'] {
	grid-area: table;
}

@container analytics-dashboard (min-width: 48rem) {
	[data-layout='analytics-dashboard-page'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-template-areas:
			'heading heading heading heading'
			'filters filters filters filters'
			'status status status status'
			'metrics metrics metrics metrics'
			'chart chart chart chart'
			'table table table table';
	}

	[data-layout='analytics-dashboard-metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 72rem) {
	[data-layout='analytics-dashboard-page'] {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-areas:
			'heading heading heading heading heading heading heading heading filters filters filters filters'
			'status status status status status status status status status status status status'
			'metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics metrics'
			'chart chart chart chart chart chart chart chart chart chart chart chart'
			'table table table table table table table table table table table table';
	}

	[data-layout='analytics-dashboard-metrics'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

Notes:

- The shell owns `container: analytics-dashboard / inline-size`.
- The inner page owns the responsive grid.
- Container queries style descendants of the shell, not the shell itself.
- Structural CSS only: display, grid, flex, container, gaps, alignment, and grid areas.
- No color, border, shadow, typography, width, inline-size, position, or visual state styling belongs here.

## 6. Visual check plan for mobile, tablet, desktop

Mobile, 390px:

- Single-column order is heading, filters, status if present, metrics, chart, table.
- Filters do not overflow and disabled states remain visible.
- Metric cards keep numbers readable without resizing the viewport font.
- Table either fits its constrained panel or scrolls inside the table surface without expanding the page grid.
- Empty, loading, and error states do not cause layout jumps that hide the page title.

Tablet, 820px:

- Metrics move to two columns.
- Filters and actions remain grouped before data.
- Chart gets dominant vertical space and remains readable.
- Dense table state keeps header and cells aligned.

Desktop, 1440px:

- Heading and filters share the top row cleanly.
- Four metrics appear in one row.
- Primary chart has the dominant region.
- Table can show dense rows without text overlap.
- The error alert, when present, spans the page width and does not squeeze metrics or chart content.

State screenshots to capture at each viewport:

- Normal data.
- Loading.
- Empty filter result.
- Error with retry.
- Dense-data table with at least 12 rows.

## 7. Self-review against the assigned test skill

- Full-page dashboard: yes. The proposal defines a route-level dashboard with shell, filters, metrics, chart, table, and state surfaces.
- Page title: yes. The heading is exactly `Analytics Dashboard`.
- DryUI components: yes. The plan uses DryUI `Button`, `Field`, `Select`, `Table`, and `EmptyState`, with metadata checks before final API use.
- Shell owns named container: yes. `analytics-dashboard-shell` owns `container: analytics-dashboard / inline-size`.
- Inner child owns responsive grid: yes. `analytics-dashboard-page` owns the grid and grid areas.
- `data-layout` and `data-layout-area` hooks: yes. The page uses specific non-generic names and area hooks.
- `src/layout.css` structure: yes. All grid/flex structure is placed in `src/layout.css`.
- Mobile-first with container shifts: yes. Base is single-column, then `48rem` and `72rem` container queries.
- No route-level raw grid/flex: yes. The Svelte route style block is reserved for visual styling only.
- No layout-wrapper components: yes. The layout is plain markup plus hooks.
- Required states: yes. Loading, empty, error, disabled, and dense-data states are represented.
- Svelte 5: yes. Local state uses `$state` and computed values use `$derived`.
- Validation plan: implementation should run the relevant Svelte check/build for the app target and visual screenshots at 390px, 820px, and 1440px.
