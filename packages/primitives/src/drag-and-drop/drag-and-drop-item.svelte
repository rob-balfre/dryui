<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children: Snippet<[{ isDragging: boolean; isOver: boolean }]>;
	}

	let { index, children, ...rest }: Props = $props();

	const ctx = getDragAndDropCtx();

	let itemIsDragging = $derived(ctx.draggedIndex === index && ctx.isDragging);
	let isOver = $derived(ctx.overIndex === index && ctx.isDragging && ctx.draggedIndex !== index);

	let grabbing = $state(false);

	function handlePointerDown(e: PointerEvent) {
		// Only start drag if there's no handle registered (drag from whole item)
		if (!ctx.hasHandle) {
			e.preventDefault();
			ctx.startDrag(index, e);
			grabbing = true;
		}
	}

	function handlePointerUp() {
		grabbing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			if (ctx.isDragging && ctx.draggedIndex === index) {
				ctx.endDrag();
			}
		}

		const upKey = ctx.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
		const downKey = ctx.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

		if (e.key === upKey) {
			e.preventDefault();
			ctx.moveItem(index, 'up');
		}

		if (e.key === downKey) {
			e.preventDefault();
			ctx.moveItem(index, 'down');
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.cancelDrag();
		}
	}
</script>

<div
	role="option"
	tabindex="0"
	aria-roledescription="sortable"
	aria-label="Item {index + 1}, press Space to grab, arrow keys to move"
	data-dnd-item
	data-index={index}
	data-dragging={itemIsDragging ? '' : undefined}
	data-over={isOver ? '' : undefined}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children({ isDragging: itemIsDragging, isOver })}
</div>
