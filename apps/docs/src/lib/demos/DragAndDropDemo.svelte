<script lang="ts">
	import { DragAndDrop } from '@dryui/ui';

	let items = $state([
		{ id: 'a', label: 'Item 1' },
		{ id: 'b', label: 'Item 2' },
		{ id: 'c', label: 'Item 3' }
	]);
</script>

<DragAndDrop.Root {items} onReorder={(next) => (items = next)}>
	{#each items as item, i (item.id)}
		<DragAndDrop.Item index={i}>
			<DragAndDrop.Handle index={i} />
			<span>{item.label}</span>
		</DragAndDrop.Item>
	{/each}
</DragAndDrop.Root>

<style>
	:global(:root) {
		--dry-dnd-item-columns: auto minmax(0, 1fr);
		--dry-dnd-item-padding: var(--dry-space-3) var(--dry-space-4);
	}
</style>
