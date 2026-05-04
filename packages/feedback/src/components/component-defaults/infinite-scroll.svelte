<script lang="ts">
	import { InfiniteScroll } from '@dryui/ui';

	const items = ['Design review', 'Package build', 'PR checklist'];

	function loadMore() {}
</script>

<div style="block-size: 180px; inline-size: 240px; overflow: auto;">
	<InfiniteScroll onLoadMore={loadMore} hasMore={false}>
		{#each items as item (item)}
			<div
				style="padding: 10px 12px; border-bottom: 1px solid var(--dry-color-stroke-weak); font-size: var(--dry-type-small-size);"
			>
				{item}
			</div>
		{/each}
	</InfiniteScroll>
</div>
