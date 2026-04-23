<script lang="ts">
	import { VirtualList } from '@dryui/ui';

	const items = Array.from({ length: 120 }, (_, index) => `Flight option ${index + 1}`);
</script>

<div class="virtual-list">
	<VirtualList {items} itemHeight={56}>
		{#snippet children({ item, index, style })}
			<div class="virtual-row" {style}>
				<span class="virtual-index">{index + 1}</span>
				<span>{item}</span>
			</div>
		{/snippet}
	</VirtualList>
</div>

<style>
	.virtual-list {
		height: 20rem;
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-overlay);
	}

	.virtual-row {
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		gap: var(--dry-space-3);
		padding: 0 var(--dry-space-4);
		/* dryui-allow solid-border-on-raised: docs demo keeps an explicit sample boundary. */
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.virtual-index {
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}
</style>
