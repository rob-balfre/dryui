<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		Card,
		ChipGroup,
		Field,
		Input,
		Label,
		Progress,
		Spinner,
		Text
	} from '@dryui/ui';
	import { Search, ArrowUp, ArrowDown, Filter, MoreHorizontal } from 'lucide-svelte';

	type Row = {
		id: string;
		project: string;
		owner: string;
		ownerInitials: string;
		status: 'shipped' | 'review' | 'queued' | 'blocked';
		uptime: number;
		change: number;
	};

	const rows: Row[] = [
		{
			id: 'r1',
			project: 'aurora-router',
			owner: 'Maya Patel',
			ownerInitials: 'MP',
			status: 'shipped',
			uptime: 99.96,
			change: 1.4
		},
		{
			id: 'r2',
			project: 'pulse-pipeline',
			owner: 'Jordan Lee',
			ownerInitials: 'JL',
			status: 'review',
			uptime: 99.81,
			change: -0.6
		},
		{
			id: 'r3',
			project: 'orbit-edge',
			owner: 'Sam Reyes',
			ownerInitials: 'SR',
			status: 'queued',
			uptime: 99.4,
			change: 0.2
		},
		{
			id: 'r4',
			project: 'beacon-auth',
			owner: 'Alex Mei',
			ownerInitials: 'AM',
			status: 'blocked',
			uptime: 97.1,
			change: -2.3
		},
		{
			id: 'r5',
			project: 'flux-cdn',
			owner: 'Riley Voss',
			ownerInitials: 'RV',
			status: 'shipped',
			uptime: 99.99,
			change: 0.4
		}
	];

	const STATUS_TONE = {
		shipped: 'success',
		review: 'blue',
		queued: 'gray',
		blocked: 'danger'
	} as const;

	let query = $state('');
	let activeFilter = $state<'all' | 'live' | 'queued'>('all');

	const metrics = [
		{ label: 'Active deploys', value: '128', delta: '+12', tone: 'success' as const },
		{ label: 'Mean uptime', value: '99.74%', delta: '+0.08', tone: 'success' as const },
		{ label: 'Open incidents', value: '3', delta: '−2', tone: 'success' as const },
		{ label: 'Queue depth', value: '46', delta: '+8', tone: 'warning' as const }
	];
</script>

<div class="dashboard-grid">
	<section class="metrics" aria-label="Key metrics">
		{#each metrics as metric (metric.label)}
			<Card.Root size="sm">
				<Card.Content>
					<div class="metric">
						<Text size="xs" color="muted">{metric.label}</Text>
						<div class="metric-value">{metric.value}</div>
						<Badge variant="soft" color={metric.tone} size="sm">{metric.delta} 7d</Badge>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<Card.Root>
		<Card.Header>
			<div class="table-toolbar">
				<div class="table-title">
					<Text as="span" weight="semibold">Production deployments</Text>
					<Text size="sm" color="muted">{rows.length} active across 4 regions</Text>
				</div>
				<div class="table-controls">
					<Field.Root>
						<Label for="dashboard-search">
							<span class="visually-hidden">Search projects</span>
						</Label>
						<div class="search-shell">
							<Search size={14} aria-hidden="true" />
							<Input
								id="dashboard-search"
								bind:value={query}
								variant="ghost"
								placeholder="Search projects"
							/>
						</div>
					</Field.Root>
					<Button variant="secondary" size="sm">
						<Filter size={14} aria-hidden="true" />
						Filter
					</Button>
				</div>
			</div>
			<ChipGroup.Root gap="sm" justify="start">
				<Button
					variant={activeFilter === 'all' ? 'solid' : 'secondary'}
					size="sm"
					onclick={() => (activeFilter = 'all')}
				>
					All
				</Button>
				<Button
					variant={activeFilter === 'live' ? 'solid' : 'secondary'}
					size="sm"
					onclick={() => (activeFilter = 'live')}
				>
					Live
				</Button>
				<Button
					variant={activeFilter === 'queued' ? 'solid' : 'secondary'}
					size="sm"
					onclick={() => (activeFilter = 'queued')}
				>
					Queued
				</Button>
			</ChipGroup.Root>
		</Card.Header>
		<Card.Content>
			<div class="table">
				<div class="table-head">
					<span class="th">Project</span>
					<span class="th">Owner</span>
					<span class="th">Status</span>
					<span class="th">Uptime</span>
					<span class="th th-end">Change</span>
					<span class="th th-end" aria-hidden="true"></span>
				</div>
				{#each rows as row (row.id)}
					<div class="table-row">
						<span class="cell project-cell">
							<span class="project-dot" data-status={row.status}></span>
							<Text as="span" weight="medium">{row.project}</Text>
						</span>
						<span class="cell owner-cell">
							<Avatar fallback={row.ownerInitials} size="sm" />
							<Text>{row.owner}</Text>
						</span>
						<span class="cell">
							<Badge color={STATUS_TONE[row.status]} variant="soft" size="sm">{row.status}</Badge>
						</span>
						<span class="cell">
							<div class="uptime-cell">
								<Text size="sm">{row.uptime.toFixed(2)}%</Text>
								<Progress value={row.uptime} size="sm" />
							</div>
						</span>
						<span
							class="cell cell-end change-cell"
							data-direction={row.change >= 0 ? 'up' : 'down'}
						>
							{#if row.change >= 0}
								<ArrowUp size={12} aria-hidden="true" />
							{:else}
								<ArrowDown size={12} aria-hidden="true" />
							{/if}
							<Text size="sm">{Math.abs(row.change).toFixed(1)}%</Text>
						</span>
						<span class="cell cell-end">
							<Button variant="ghost" size="icon-sm" aria-label="More for {row.project}">
								<MoreHorizontal size={14} aria-hidden="true" />
							</Button>
						</span>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<div class="bottom-row">
		<Card.Root size="sm">
			<Card.Content>
				<div class="loading-state">
					<Spinner size="md" />
					<Text as="span" weight="medium">Loading region health</Text>
					<Text size="sm" color="muted">Polling 4 endpoints…</Text>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root size="sm">
			<Card.Content>
				<div class="empty-state">
					<div class="empty-icon" aria-hidden="true"></div>
					<Text as="span" weight="medium">No incidents</Text>
					<Text size="sm" color="muted">Last incident resolved 19 days ago.</Text>
					<Button variant="ghost" size="sm">View timeline</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	.dashboard-grid {
		display: grid;
		gap: var(--dry-space-4);
		container-type: inline-size;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--dry-space-3);
	}

	.metric {
		display: grid;
		gap: var(--dry-space-1);
	}

	.metric-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--dry-color-text-strong);
		line-height: 1.1;
	}

	.table-toolbar {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
		align-items: center;
		gap: var(--dry-space-3);
	}

	.table-title {
		display: grid;
		gap: var(--dry-space-1);
	}

	.table-controls {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.search-shell {
		display: grid;
		grid-template-columns: max-content minmax(12rem, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-1_5) var(--dry-space-3);
		border: 1px solid var(--dry-form-control-border);
		border-radius: var(--dry-radius-md);
		background: var(--dry-form-control-bg);
		color: var(--dry-color-text-weak);
		--dry-input-padding-x: 0;
	}

	.table {
		display: grid;
		grid-template-rows: auto;
	}

	.table-head,
	.table-row {
		display: grid;
		grid-template-columns:
			minmax(10rem, 1.4fr) minmax(8rem, 1.2fr) minmax(6rem, 0.8fr) minmax(8rem, 1.2fr) minmax(
				4rem,
				0.6fr
			)
			minmax(2rem, max-content);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2_5) var(--dry-space-4);
	}

	.table-head {
		border-block-end: 1px solid var(--dry-color-stroke-weak);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 60%, var(--dry-color-bg-raised) 40%);
	}

	.th {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.th-end {
		justify-self: end;
	}

	.table-row + .table-row,
	.table-head + .table-row {
		border-block-start: 1px solid var(--dry-color-stroke-weak);
	}

	.cell {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		color: var(--dry-color-text-strong);
	}

	.cell-end {
		justify-self: end;
	}

	.project-cell {
		grid-template-columns: max-content minmax(0, 1fr);
	}

	.project-dot {
		display: inline-grid;
		grid-template-columns: 0.5rem;
		grid-template-rows: 0.5rem;
		border-radius: 50%;
		background: var(--dry-color-fill-brand);
	}

	.project-dot[data-status='shipped'] {
		background: var(--dry-color-fill-success);
	}

	.project-dot[data-status='review'] {
		background: var(--dry-color-fill-brand);
	}

	.project-dot[data-status='queued'] {
		background: var(--dry-color-fill-warning);
	}

	.project-dot[data-status='blocked'] {
		background: var(--dry-color-fill-danger);
	}

	.owner-cell {
		grid-template-columns: max-content minmax(0, 1fr);
		--dry-avatar-size: 1.5rem;
		--dry-avatar-font-size: 0.625rem;
	}

	.uptime-cell {
		display: grid;
		grid-template-columns: minmax(7rem, 9rem);
		gap: var(--dry-space-1);
	}

	.change-cell {
		grid-template-columns: max-content max-content;
		gap: var(--dry-space-1);
		color: var(--dry-color-text-success);
	}

	.change-cell[data-direction='down'] {
		color: var(--dry-color-text-danger);
	}

	.bottom-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--dry-space-3);
	}

	.loading-state,
	.empty-state {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4) var(--dry-space-3);
	}

	.empty-icon {
		display: inline-grid;
		grid-template-columns: 2rem;
		grid-template-rows: 2rem;
		border-radius: 50%;
		background: color-mix(in srgb, var(--dry-color-fill-success) 16%, var(--dry-color-bg-overlay));
		border: 1px solid color-mix(in srgb, var(--dry-color-fill-success) 32%, transparent);
	}

	.visually-hidden {
		position: absolute;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
		block-size: 1px;
		padding: 0;
		margin: -1px;
	}

	@container (max-width: 56rem) {
		.table-head,
		.table-row {
			grid-template-columns:
				minmax(8rem, 1.2fr) minmax(6rem, 1fr) minmax(5rem, 0.8fr) minmax(0, 0) minmax(0, 0)
				max-content;
		}

		.table-head .th:nth-child(4),
		.table-head .th:nth-child(5),
		.table-row .cell:nth-child(4),
		.table-row .cell:nth-child(5) {
			display: none;
		}
	}
</style>
