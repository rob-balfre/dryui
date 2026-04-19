<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeIds } from '../utils/merge-ids.js';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children?: Snippet | undefined;
	}

	let {
		index,
		children,
		'aria-describedby': ariaDescribedBy,
		'aria-label': ariaLabel,
		...rest
	}: Props = $props();

	const ctx = getDragAndDropCtx();

	ctx.registerHandle();

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();
		ctx.startDrag(index, e);
	}

	function handlePointerUp(e: PointerEvent) {
		if (ctx.isDragging) {
			e.stopPropagation();
			ctx.endDrag();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
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

<div
	role="button"
	tabindex="0"
	aria-roledescription="reorder handle"
	aria-label={ariaLabel ?? `Reorder item ${index + 1}`}
	aria-describedby={mergeIds(ariaDescribedBy, ctx.instructionsId)}
	aria-keyshortcuts={ctx.orientation === 'vertical' ? 'ArrowUp ArrowDown' : 'ArrowLeft ArrowRight'}
	data-dnd-handle
	data-dragging={ctx.isDragging && ctx.draggedIndex === index ? '' : undefined}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onkeydown={handleKeydown}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true" data-dnd-grip>&#8942;&#8942;</span>
	{/if}
</div>
