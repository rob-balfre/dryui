<script lang="ts">
	import { VirtualList } from '@dryui/ui';

	const items = Array.from({ length: 1000 }, (_, i) => ({
		id: i,
		label: `Item ${i + 1}`
	}));
</script>

<div class="frame">
	<VirtualList {items} itemHeight={40}>
		{#snippet children({ item, style })}
			<div class="row" {style}>{item.label}</div>
		{/snippet}
	</VirtualList>
</div>

<style>
	.frame {
		block-size: 20rem;
	}

	.row {
		display: grid;
		align-items: center;
		padding: 0 var(--dry-space-4);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
