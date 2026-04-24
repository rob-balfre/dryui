<script lang="ts">
	import { Skeleton } from '@dryui/ui';

	const rows = ['a', 'b', 'c'];
</script>

<div class="grid">
	{#each rows as row (row)}
		<article class="card" aria-label="Loading card">
			<div class="head">
				<Skeleton variant="circular" width="2.25rem" height="2.25rem" />
				<div class="head-text">
					<Skeleton width="9rem" height="0.85rem" />
					<Skeleton width="5rem" height="0.7rem" />
				</div>
			</div>
			<div class="stat">
				<Skeleton width="4rem" height="1.4rem" />
				<Skeleton width="6rem" height="0.75rem" />
			</div>
			<div class="lines">
				<Skeleton width="100%" height="0.7rem" />
				<Skeleton width="88%" height="0.7rem" />
				<Skeleton width="72%" height="0.7rem" />
			</div>
		</article>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14em, 1fr));
		gap: var(--dry-space-3);
	}

	.card {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 32%, transparent);
	}

	.head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
	}

	.head-text,
	.stat,
	.lines {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
