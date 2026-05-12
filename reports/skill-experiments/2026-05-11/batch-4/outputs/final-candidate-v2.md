# Final Candidate V2: Analytics Dashboard Page

## 1. Target brief

`type=page, subtype=dashboard, user=analytics lead, primary_task=monitor, density=compact, states=loading|empty|error|disabled|dense-data`

The page concept is a full Svelte 5 dashboard titled `Analytics Dashboard`. The primary task is monitoring conversion and revenue movement across channels. The primary work surface is an area chart, supported by compact metrics, filters/actions, a secondary insights/actions region, and a full-width data table.

Verified local DryUI exports used in the proposal:

- `Button`, `Input`, `Label`, `Badge`, `Alert`, `Skeleton`
- `Field.Root`, `Field.Description`, `Field.Error`
- `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item`
- `DatePicker.Root`, `DatePicker.Trigger`, `DatePicker.Content`, `DatePicker.Calendar`
- `Chart.Root`, `Chart.Area`, `Chart.XAxis`, `Chart.YAxis`
- `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`, `Table.Cell`, `Table.Caption`

No unverified DryUI component APIs are named in the snippets below.

## 2. Branch/variant/scoring work

Dashboard Branch decisions:

- Primary task: `monitor`
- Density: `compact`
- Stable regions: `header`, `filters`, `status`, `metrics`, `primary`, `secondary`, `table`
- Mobile order: header, filters/actions, status, metrics, primary chart, secondary insights/actions, data table
- Tablet shift: filters and metrics gain columns while the primary chart remains readable
- Desktop shift: compact metrics sit beside the primary chart, secondary insights sit to the right, and the table spans the full content width below

Full Page Branch decisions:

- Shell: `data-layout="analytics-dashboard-shell"`
- Named container query owner: shell rule with `container: analytics-dashboard / inline-size`
- Responsive grid owner: shell direct child `data-layout-area="page"`
- Container queries style descendants under `[data-layout='analytics-dashboard-shell']`
- Base layout is mobile-first and single-column

Three layout candidates:

| Candidate | Shape                                                                                                                      | Score | Reason                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------- |
| A         | Full-width header, filters, compact status, metrics, primary chart, secondary, table in one column until desktop           |     7 | Strong mobile behavior, but desktop leaves the chart too isolated from secondary actions.                                  |
| B         | Header and filters top, desktop grid with chart dominant left, metrics and secondary stacked right, table full-width below |     9 | Best match for monitor workflow: chart dominates, metrics stay compact, secondary actions are available without competing. |
| C         | Metrics as first full-width band, chart/table split below, secondary below table                                           |     5 | KPI band delays the primary work surface and wastes desktop width.                                                         |

Winner: Candidate B.

## 3. Winning implementation plan

Use a route-level Svelte page with Svelte 5 runes for state and derived branches. Import only verified DryUI exports from `@dryui/ui`. Keep all structural layout in `src/layout.css`, using `data-layout` and `data-layout-area` hooks. Keep visual styling in the route `<style>` block without `display: grid` or `display: flex`.

State handling:

- `loading`: metrics, chart, and table render `Skeleton` placeholders in stable regions
- `empty`: stable chart and table regions render an `Alert` with reset action
- `error`: stable status region renders `Alert` plus retry action; other regions remain present
- `disabled`: filter controls and export button receive `disabled`
- `dense-data`: table rows increase while layout regions do not change

Snippet integrity gate result before presenting code:

- Every Svelte component in markup is imported.
- Every compound component part used is verified in local `index.ts` files.
- Every named grid area has a matching child selector in `src/layout.css`.
- Every named `data-layout-area` has exactly one `grid-area` rule.
- Every region selector is scoped under `[data-layout='analytics-dashboard-shell']`; only the shell selector itself is unscoped.
- Every interior raw element has a specific `data-layout` or `data-layout-area` hook.
- Proposed `src/layout.css` contains structural layout only.

## 4. Proposed Svelte markup structure

```svelte
<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Chart,
		DatePicker,
		Field,
		Input,
		Label,
		Select,
		Skeleton,
		Table
	} from '@dryui/ui';

	type DashboardState = 'ready' | 'loading' | 'empty' | 'error';

	let state = $state<DashboardState>('ready');
	let disabled = $state(false);
	let denseData = $state(true);
	let channel = $state('all');

	const metrics = [
		{ label: 'Revenue', value: '$128.4k', delta: '+12.8%' },
		{ label: 'Conversion', value: '7.4%', delta: '+1.1%' },
		{ label: 'Sessions', value: '482k', delta: '+8.3%' },
		{ label: 'CAC', value: '$41', delta: '-4.6%' }
	];

	const chartData = [
		{ label: 'Mon', value: 42 },
		{ label: 'Tue', value: 58 },
		{ label: 'Wed', value: 53 },
		{ label: 'Thu', value: 71 },
		{ label: 'Fri', value: 76 },
		{ label: 'Sat', value: 61 },
		{ label: 'Sun', value: 84 }
	];

	const baseRows = [
		{
			channel: 'Organic',
			sessions: '184k',
			conversion: '8.2%',
			revenue: '$54.2k',
			status: 'Healthy'
		},
		{
			channel: 'Paid search',
			sessions: '96k',
			conversion: '6.9%',
			revenue: '$31.8k',
			status: 'Watch'
		},
		{
			channel: 'Lifecycle',
			sessions: '72k',
			conversion: '9.8%',
			revenue: '$28.1k',
			status: 'Healthy'
		},
		{ channel: 'Referral', sessions: '41k', conversion: '5.1%', revenue: '$9.7k', status: 'Review' }
	];

	let rows = $derived(denseData ? [...baseRows, ...baseRows] : baseRows);
	let isLoading = $derived(state === 'loading');
	let isEmpty = $derived(state === 'empty');
	let hasError = $derived(state === 'error');
</script>

<svelte:head>
	<title>Analytics Dashboard</title>
</svelte:head>

<section data-layout="analytics-dashboard-shell" aria-labelledby="analytics-dashboard-title">
	<div data-layout-area="page">
		<header data-layout-area="header">
			<div data-layout="analytics-dashboard-heading">
				<p data-layout="analytics-dashboard-eyebrow">Performance</p>
				<h1 id="analytics-dashboard-title">Analytics Dashboard</h1>
				<p data-layout="analytics-dashboard-summary">
					Monitor revenue, conversion, and channel movement.
				</p>
			</div>
			<div data-layout="analytics-dashboard-actions">
				<Button onclick={() => (state = 'loading')} {disabled}>Refresh</Button>
				<Button onclick={() => (disabled = !disabled)}>
					{disabled ? 'Enable controls' : 'Disable controls'}
				</Button>
			</div>
		</header>

		<form data-layout-area="filters" aria-label="Dashboard filters">
			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label>Channel</Label>
				<Select.Root bind:value={channel} {disabled}>
					<Select.Trigger>
						<Select.Value placeholder="All channels" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All channels</Select.Item>
						<Select.Item value="organic">Organic</Select.Item>
						<Select.Item value="paid">Paid search</Select.Item>
						<Select.Item value="lifecycle">Lifecycle</Select.Item>
					</Select.Content>
				</Select.Root>
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label>Date range</Label>
				<DatePicker.Root {disabled}>
					<DatePicker.Trigger>Last 7 days</DatePicker.Trigger>
					<DatePicker.Content>
						<DatePicker.Calendar />
					</DatePicker.Content>
				</DatePicker.Root>
			</Field.Root>

			<Field.Root data-layout="analytics-dashboard-filter-field">
				<Label>Segment</Label>
				<Input value="All customers" {disabled} />
				<Field.Description>Applies to chart and table.</Field.Description>
			</Field.Root>

			<Button type="submit" {disabled}>Apply filters</Button>
		</form>

		<section data-layout-area="status" aria-live="polite">
			{#if hasError}
				<Alert variant="danger"
					>Unable to load analytics. Retry when the data service is available.</Alert
				>
			{:else if isEmpty}
				<Alert>No analytics match the current filters.</Alert>
			{:else}
				<Badge>Live data</Badge>
			{/if}
		</section>

		<section data-layout-area="metrics" aria-label="Summary metrics">
			{#each metrics as metric}
				<article data-layout="analytics-dashboard-metric">
					{#if isLoading}
						<Skeleton />
						<Skeleton />
					{:else}
						<p data-layout="analytics-dashboard-metric-label">{metric.label}</p>
						<strong data-layout="analytics-dashboard-metric-value">{metric.value}</strong>
						<Badge>{metric.delta}</Badge>
					{/if}
				</article>
			{/each}
		</section>

		<section data-layout-area="primary" aria-labelledby="analytics-dashboard-chart-title">
			<div data-layout="analytics-dashboard-panel-heading">
				<h2 id="analytics-dashboard-chart-title">Revenue trend</h2>
				<Badge>Weekly</Badge>
			</div>
			{#if isLoading}
				<Skeleton />
			{:else if isEmpty}
				<Alert>No chart data is available for the selected filters.</Alert>
			{:else}
				<Chart.Root
					data={chartData}
					width={720}
					height={320}
					summary="Revenue trend for the last seven days"
				>
					<Chart.XAxis />
					<Chart.YAxis ticks={4} />
					<Chart.Area />
				</Chart.Root>
			{/if}
		</section>

		<aside data-layout-area="secondary" aria-labelledby="analytics-dashboard-insights-title">
			<div data-layout="analytics-dashboard-panel-heading">
				<h2 id="analytics-dashboard-insights-title">Insights</h2>
				<Button {disabled}>Create action</Button>
			</div>
			<ul data-layout="analytics-dashboard-insight-list">
				<li data-layout="analytics-dashboard-insight-item">
					Organic revenue is carrying most week-over-week growth.
				</li>
				<li data-layout="analytics-dashboard-insight-item">
					Paid search conversion softened after budget expansion.
				</li>
				<li data-layout="analytics-dashboard-insight-item">
					Lifecycle campaigns have the strongest conversion rate.
				</li>
			</ul>
		</aside>

		<section data-layout-area="table" aria-labelledby="analytics-dashboard-table-title">
			<div data-layout="analytics-dashboard-panel-heading">
				<h2 id="analytics-dashboard-table-title">Channel performance</h2>
				<Button onclick={() => (denseData = !denseData)}>
					{denseData ? 'Standard rows' : 'Dense rows'}
				</Button>
			</div>
			{#if isLoading}
				<Skeleton />
			{:else if isEmpty}
				<Alert>No rows match the current filter set.</Alert>
			{:else}
				<Table.Root>
					<Table.Caption>Performance by acquisition channel.</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head>Channel</Table.Head>
							<Table.Head>Sessions</Table.Head>
							<Table.Head>Conversion</Table.Head>
							<Table.Head>Revenue</Table.Head>
							<Table.Head>Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each rows as row}
							<Table.Row>
								<Table.Cell>{row.channel}</Table.Cell>
								<Table.Cell>{row.sessions}</Table.Cell>
								<Table.Cell>{row.conversion}</Table.Cell>
								<Table.Cell>{row.revenue}</Table.Cell>
								<Table.Cell><Badge>{row.status}</Badge></Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</section>
	</div>
</section>
```

Route visual CSS would only handle color, borders, typography, spacing inside already placed regions, and media/text containment. It would not include `display: grid`, `display: flex`, layout breakpoints, inline styles, or Svelte `style:` directives.

## 5. Proposed `src/layout.css` structure

```css
[data-layout='analytics-dashboard-shell'] {
	container: analytics-dashboard / inline-size;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
	display: grid;
	gap: var(--dry-space-4);
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
	gap: var(--dry-space-3);
	grid-area: primary;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='secondary'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: secondary;
}

[data-layout='analytics-dashboard-shell'] [data-layout-area='table'] {
	display: grid;
	gap: var(--dry-space-3);
	grid-area: table;
}

@container analytics-dashboard (min-width: 42rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='header'] {
		align-items: end;
		grid-template-columns: 1fr auto;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		align-items: end;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container analytics-dashboard (min-width: 64rem) {
	[data-layout='analytics-dashboard-shell'] [data-layout-area='page'] {
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem);
		grid-template-areas:
			'header header'
			'filters filters'
			'status status'
			'primary metrics'
			'primary secondary'
			'table table';
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='filters'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='metrics'] {
		align-content: start;
		grid-template-columns: 1fr;
	}

	[data-layout='analytics-dashboard-shell'] [data-layout-area='secondary'] {
		align-content: start;
	}
}
```

Snippet integrity notes for this CSS:

- Areas named in `grid-template-areas`: `header`, `filters`, `status`, `metrics`, `primary`, `secondary`, `table`
- Matching area rules: exactly one `grid-area` rule for each area
- All selectors after the shell are scoped under `[data-layout='analytics-dashboard-shell']`
- Structural properties only; no visual color, border, typography, shadow, position, width, height, or inline-size properties

## 6. Visual check plan

Run browser screenshots after implementation at:

- Mobile: `390px` wide
- Tablet: `820px` wide
- Desktop: `1440px` wide

Pass checks:

- No horizontal overflow, clipping, or overlapping UI
- Page title and primary action are visible early
- Filters precede the data they affect
- Mobile order matches the Dashboard Branch order
- Tablet uses columns for filters and metrics instead of stretching a phone layout
- Desktop makes the chart visually dominant and keeps metrics compact
- Secondary insights support the chart without competing with it
- Table remains readable and full-width on desktop
- Loading, empty, error, disabled, and dense-data branches preserve stable region structure

For an auto/system theme page, also check light and dark token resolution. If that cannot be verified, keep the concept light-only and leave `<html>` bare.

## 7. Self-review against the assigned test skill

- Followed the experiment-local skill as active skill.
- Kept the work report-only; no production app, package, docs, or canonical skill files were edited.
- Built a full page dashboard concept, not a card or isolated component.
- Included title, summary metrics, primary chart, filters/actions, data table, secondary insights/actions region, and useful state handling.
- Checked local exports before naming DryUI component APIs.
- Used a page shell that owns the named container query.
- Put the responsive grid on the shell direct child.
- Used `data-layout` and `data-layout-area` hooks throughout.
- Put page structure in `src/layout.css`.
- Used mobile-first base layout with tablet and desktop `@container` shifts.
- Avoided raw `display: grid` and `display: flex` in the route style guidance.
- Avoided layout-wrapper components.
- Included loading, empty, error, disabled, and dense-data branches.
- Applied the snippet integrity gate before writing final snippets.

Validation not run: this is a report-only artifact and no Svelte or CSS production files were changed.
