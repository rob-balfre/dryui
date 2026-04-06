<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children?: Snippet | undefined;
	}

	let { index, children, class: className, ...rest }: Props = $props();

	const ctx = getDragAndDropCtx();

	// Register that a handle exists so items don't initiate drag themselves
	ctx.registerHandle();

	function handlePointerDown(e: PointerEvent) {
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
	data-dnd-handle
	data-dragging={ctx.isDragging && ctx.draggedIndex === index ? '' : undefined}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	{...rest}
	class={className}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true" data-dnd-grip>&#8942;&#8942;</span>
	{/if}
</div>

<style>
	[data-dnd-handle] {
		display: inline-grid;
		place-items: center;
		cursor: grab;
		color: var(--dry-dnd-handle-color, var(--dry-color-text-weak));
		padding: var(--dry-space-1);
		border-radius: var(--dry-radius-sm);
		touch-action: none;
		transition: color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dnd-handle]:hover {
		color: var(--dry-dnd-handle-hover-color, var(--dry-color-text-strong));
	}

	[data-dnd-handle]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-dnd-handle][data-dragging] {
		cursor: grabbing;
	}
</style>
