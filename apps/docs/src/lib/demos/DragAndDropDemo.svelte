<script>
	import { DragAndDrop } from '@dryui/ui';

	let items = $state(['Organize workspace', 'Review pull requests', 'Update documentation']);
</script>

<div class="demo">
	<DragAndDrop.Root {items} onReorder={(reordered) => (items = reordered)}>
		{#each items as item, i (item)}
			<DragAndDrop.Item index={i}>
				<DragAndDrop.Handle index={i} />
				{item}
			</DragAndDrop.Item>
		{/each}
	</DragAndDrop.Root>
</div>

<style>
	.demo {
		--dry-dnd-item-columns: auto 1fr;
	}
</style>
