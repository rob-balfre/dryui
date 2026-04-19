<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeIds } from '../utils/merge-ids.js';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children: Snippet<[{ isDragging: boolean; isOver: boolean }]>;
	}

	let { index, children, 'aria-describedby': ariaDescribedBy, ...rest }: Props = $props();

	const ctx = getDragAndDropCtx();

	let itemIsDragging = $derived(ctx.draggedIndex === index && ctx.isDragging);
	let isOver = $derived(ctx.overIndex === index && ctx.isDragging && ctx.draggedIndex !== index);

	function handlePointerDown(e: PointerEvent) {
		// Only start drag if there's no handle registered (drag from whole item)
		if (!ctx.hasHandle) {
			e.preventDefault();
			ctx.startDrag(index, e);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (ctx.hasHandle) return;

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

		if (e.key === 'Escape' && ctx.isDragging) {
			e.preventDefault();
			ctx.cancelDrag();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard reordering keeps the item itself focusable when there is no separate handle) -->
<div
	role="listitem"
	tabindex={ctx.hasHandle ? undefined : 0}
	aria-roledescription="sortable item"
	aria-posinset={index + 1}
	aria-setsize={ctx.itemCount}
	aria-describedby={mergeIds(ariaDescribedBy, !ctx.hasHandle ? ctx.instructionsId : undefined)}
	aria-keyshortcuts={!ctx.hasHandle
		? ctx.orientation === 'vertical'
			? 'ArrowUp ArrowDown'
			: 'ArrowLeft ArrowRight'
		: undefined}
	data-dnd-item
	data-index={index}
	data-dragging={itemIsDragging ? '' : undefined}
	data-over={isOver ? '' : undefined}
	onpointerdown={handlePointerDown}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children({ isDragging: itemIsDragging, isOver })}
</div>
