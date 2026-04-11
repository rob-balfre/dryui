<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children?: Snippet | undefined;
	}

	let { index, children, ...rest }: Props = $props();

	const ctx = getDragAndDropCtx();

	// Register that a handle exists so items don't initiate drag themselves
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
</script>

<div
	role="button"
	tabindex="0"
	aria-roledescription="drag handle"
	aria-label="Drag to reorder"
	aria-pressed={ctx.isDragging && ctx.draggedIndex === index ? 'true' : undefined}
	data-dnd-handle
	data-dragging={ctx.isDragging && ctx.draggedIndex === index ? '' : undefined}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true" data-dnd-grip>&#8942;&#8942;</span>
	{/if}
</div>
