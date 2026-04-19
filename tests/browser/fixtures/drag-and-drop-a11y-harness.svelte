<script lang="ts">
	import { DragAndDrop as PrimitiveDragAndDrop } from '@dryui/primitives';
	import { DragAndDrop } from '@dryui/ui';

	type Item = {
		id: string;
		label: string;
	};

	let uiHandlelessItems = $state<Item[]>([
		{ id: 'ui-1', label: 'Design system audit' },
		{ id: 'ui-2', label: 'Review pull requests' },
		{ id: 'ui-3', label: 'Update documentation' }
	]);

	let uiHandleItems = $state<Item[]>([
		{ id: 'uih-1', label: 'Plan milestones' },
		{ id: 'uih-2', label: 'QA release build' },
		{ id: 'uih-3', label: 'Publish changelog' }
	]);

	let primitiveHandleItems = $state<Item[]>([
		{ id: 'prim-1', label: 'Backlog review' },
		{ id: 'prim-2', label: 'Refine component API' },
		{ id: 'prim-3', label: 'Ship documentation' }
	]);
</script>

<section data-testid="ui-handleless-section">
	<DragAndDrop.Root
		items={uiHandlelessItems}
		aria-label="UI sortable tasks"
		data-testid="ui-handleless-root"
		onReorder={(reordered) => (uiHandlelessItems = reordered)}
	>
		{#each uiHandlelessItems as item, index (item.id)}
			<DragAndDrop.Item {index}>
				<span data-item-label>{item.label}</span>
			</DragAndDrop.Item>
		{/each}
	</DragAndDrop.Root>
</section>

<section data-testid="ui-handle-section">
	<DragAndDrop.Root
		items={uiHandleItems}
		aria-label="UI handle tasks"
		data-testid="ui-handle-root"
		onReorder={(reordered) => (uiHandleItems = reordered)}
	>
		{#each uiHandleItems as item, index (item.id)}
			<DragAndDrop.Item {index}>
				<DragAndDrop.Handle {index} />
				<span data-item-label>{item.label}</span>
			</DragAndDrop.Item>
		{/each}
	</DragAndDrop.Root>
</section>

<section data-testid="primitive-handle-section">
	<PrimitiveDragAndDrop.Root
		items={primitiveHandleItems}
		aria-label="Primitive handle tasks"
		data-testid="primitive-handle-root"
		onReorder={(reordered) => (primitiveHandleItems = reordered)}
	>
		{#each primitiveHandleItems as item, index (item.id)}
			<PrimitiveDragAndDrop.Item {index}>
				<PrimitiveDragAndDrop.Handle {index} />
				<span data-item-label>{item.label}</span>
			</PrimitiveDragAndDrop.Item>
		{/each}
	</PrimitiveDragAndDrop.Root>
</section>
