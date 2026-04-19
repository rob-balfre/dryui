<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeIds } from '@dryui/primitives';
	import { getDragAndDropCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index: number;
		children: Snippet<[{ isDragging: boolean; isOver: boolean }]>;
	}

	let {
		index,
		children,
		'aria-describedby': ariaDescribedBy,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getDragAndDropCtx();

	let itemIsDragging = $derived(ctx.draggedIndex === index && ctx.isDragging);
	let isOver = $derived(
		(ctx.overIndex === index && ctx.isDragging && ctx.draggedIndex !== index) ||
			ctx.foreignOverIndex === index
	);

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
	data-drag-active={ctx.isDragging ? '' : undefined}
	data-over={isOver ? '' : undefined}
	onpointerdown={handlePointerDown}
	onkeydown={handleKeydown}
	{...rest}
	class={className}
>
	{@render children({ isDragging: itemIsDragging, isOver })}
</div>

<style>
	[data-dnd-item] {
		position: relative;
		display: grid;
		grid-template-columns: var(--dry-dnd-item-columns, 1fr);
		align-items: center;
		gap: var(--dry-dnd-item-gap, var(--dry-space-2));
		background: var(--dry-dnd-item-bg, var(--dry-color-bg-base));
		border: 1px solid var(--dry-dnd-item-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-dnd-item-radius, var(--dry-radius-md));
		padding: var(--dry-dnd-item-padding, var(--dry-space-3));
		box-shadow: var(--dry-dnd-item-shadow, var(--dry-shadow-sm));
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		user-select: none;
		touch-action: none;
	}

	[data-dnd-item]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}

	[data-dnd-item][data-dragging] {
		background: var(--dry-color-bg-sunken);
		border-color: transparent;
		box-shadow: none;
	}

	[data-dnd-item][data-dragging]::after {
		content: '';
		position: absolute;
		inset: 0;
		background: inherit;
		border-radius: inherit;
	}

	[data-dnd-item]::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: calc(
			-1 * (var(--dry-dnd-gap, var(--dry-space-2)) / 2 + var(--dry-dnd-indicator-size, 2px) / 2)
		);
		height: var(--dry-dnd-indicator-size, 2px);
		background: var(--dry-dnd-indicator-color, var(--dry-color-fill-brand));
		border-radius: var(--dry-dnd-indicator-size, 2px);
		opacity: 0;
		transition: opacity var(--dry-duration-fast) var(--dry-ease-default);
		pointer-events: none;
	}

	[data-dnd-item][data-over]::before {
		opacity: 1;
		transition: none;
	}
</style>
