<script lang="ts">
	import { DragAndDrop } from '@dryui/ui';

	let items = $state(['Plan', 'Design', 'Build', 'Ship']);
</script>

<DragAndDrop.Root {items} onReorder={(next) => (items = next)}>
	{#each items as item, index (item)}
		<DragAndDrop.Item {index}>
			{#snippet children()}
				<DragAndDrop.Handle {index} />
				<span>{item}</span>
			{/snippet}
		</DragAndDrop.Item>
	{/each}
</DragAndDrop.Root>
