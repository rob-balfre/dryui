<script lang="ts">
	import { AppFrame, Badge, Button, Heading } from '@dryui/ui';
</script>

<AppFrame title="atlas.admin">
	{#snippet actions()}
		<Button size="sm" variant="ghost">Invite</Button>
		<Button size="sm" variant="solid">Publish</Button>
	{/snippet}

	<div class="shell">
		<nav class="sidebar" aria-label="Primary">
			<p class="group-label">Workspace</p>
			<a class="nav-item" data-active href="#overview">Overview</a>
			<a class="nav-item" href="#deploys">Deploys</a>
			<a class="nav-item" href="#members">Members</a>
			<a class="nav-item" href="#billing">Billing</a>

			<p class="group-label">Observability</p>
			<a class="nav-item" href="#logs">Audit log</a>
			<a class="nav-item" href="#incidents">Incidents</a>
		</nav>

		<section class="main">
			<header class="main-head">
				<div>
					<p class="eyebrow">Overview / acme-prod</p>
					<Heading level={3}>Production is healthy</Heading>
				</div>
				<Badge variant="soft" color="green">All regions green</Badge>
			</header>

			<div class="stat-grid">
				<div class="stat">
					<p class="stat-label">Requests / min</p>
					<p class="stat-value">12,408</p>
					<p class="stat-delta">+4.2% vs last hour</p>
				</div>
				<div class="stat">
					<p class="stat-label">p95 latency</p>
					<p class="stat-value">182<span class="unit">ms</span></p>
					<p class="stat-delta">steady</p>
				</div>
				<div class="stat">
					<p class="stat-label">Error rate</p>
					<p class="stat-value">0.04<span class="unit">%</span></p>
					<p class="stat-delta">-0.01% vs last hour</p>
				</div>
			</div>
		</section>
	</div>
</AppFrame>

<style>
	.shell {
		display: grid;
		grid-template-columns: 13rem minmax(0, 1fr);
		min-block-size: 22rem;
	}

	.sidebar {
		display: grid;
		align-content: start;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		border-right: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 60%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 50%, transparent);
	}

	.group-label {
		margin: var(--dry-space-3) 0 var(--dry-space-1);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.group-label:first-child {
		margin-top: 0;
	}

	.nav-item {
		display: grid;
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
		text-decoration: none;
	}

	.nav-item:hover {
		background: color-mix(in srgb, var(--dry-color-bg-raised) 50%, transparent);
		color: var(--dry-color-text-strong);
	}

	.nav-item[data-active] {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		color: var(--dry-color-text-strong);
	}

	.main {
		display: grid;
		align-content: start;
		gap: var(--dry-space-5);
		padding: var(--dry-space-5) var(--dry-space-6);
	}

	.main-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.eyebrow {
		margin: 0 0 var(--dry-space-1);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.stat {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 60%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 50%, transparent);
	}

	.stat-label {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.stat-value {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-2xl-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		font-variant-numeric: tabular-nums;
	}

	.unit {
		font-size: var(--dry-text-base-size);
		color: var(--dry-color-text-weak);
		margin-left: var(--dry-space-1);
	}

	.stat-delta {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
