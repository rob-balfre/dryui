<script lang="ts">
	import { Sparkline } from '@dryui/ui';

	const rows = [
		{ repo: 'dryui/core', commits: [4, 7, 3, 9, 12, 6, 14], total: 55 },
		{ repo: 'dryui/cli', commits: [1, 0, 2, 3, 2, 4, 1], total: 13 },
		{ repo: 'dryui/impeccable', commits: [8, 5, 11, 7, 9, 14, 12], total: 66 },
		{ repo: 'dryui/docs', commits: [2, 4, 3, 6, 3, 5, 8], total: 31 }
	];
</script>

<div class="card">
	<p class="eyebrow">Activity, last 7 days</p>
	<ul class="rows">
		{#each rows as row (row.repo)}
			<li class="row">
				<span class="repo">{row.repo}</span>
				<Sparkline
					data={row.commits}
					width={140}
					height={28}
					filled
					highlightLast
					strokeWidth={1.5}
				/>
				<span class="total">{row.total}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--dry-space-2);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.repo {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
	.total {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}
</style>
