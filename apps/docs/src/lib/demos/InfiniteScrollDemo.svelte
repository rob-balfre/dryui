<script lang="ts">
	import { InfiniteScroll } from '@dryui/ui';

	let items = $state(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
	let loading = $state(false);
	let hasMore = $state(true);

	async function loadMore() {
		loading = true;
		await new Promise((r) => setTimeout(r, 800));
		const start = items.length;
		items = [...items, ...Array.from({ length: 10 }, (_, i) => `Item ${start + i + 1}`)];
		if (items.length >= 60) hasMore = false;
		loading = false;
	}
</script>

<div class="scroll-container">
	<InfiniteScroll onLoadMore={loadMore} {hasMore} {loading}>
		{#each items as item}
			<div class="item">{item}</div>
		{/each}
	</InfiniteScroll>
</div>

<style>
	.scroll-container {
		height: 320px;
		overflow-y: auto;
		overscroll-behavior: contain;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
	}

	.item {
		padding: var(--dry-space-3) var(--dry-space-4);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
