<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setDragAndDropCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: T[];
		onReorder: (items: T[]) => void;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	let { items, onReorder, orientation = 'vertical', children, ...rest }: Props = $props();

	let draggedIndex: number | null = $state(null);
	let overIndex: number | null = $state(null);
	let isDragging = $state(false);
	let hasHandle = $state(false);
	let liveRegionMessage = $state('');

	let rootElement: HTMLDivElement | undefined = $state();

	function reorder(from: number, to: number) {
		if (from === to) return;
		const newItems = [...items];
		const removed = newItems.splice(from, 1);
		if (removed.length === 0) return;
		newItems.splice(to, 0, removed[0]!);
		onReorder(newItems);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || draggedIndex === null || !rootElement) return;

		const itemElements = Array.from(rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]'));

		const pointerPos = orientation === 'vertical' ? e.clientY : e.clientX;

		let closestIndex = draggedIndex;
		let closestDist = Infinity;

		for (let i = 0; i < itemElements.length; i++) {
			const el = itemElements[i];
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			const center =
				orientation === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
			const dist = Math.abs(pointerPos - center);
			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		overIndex = closestIndex;
	}

	function handlePointerUp() {
		if (isDragging && draggedIndex !== null && overIndex !== null) {
			reorder(draggedIndex, overIndex);
			announce(`Item moved to position ${overIndex + 1}`);
		}
		resetState();
	}

	function resetState() {
		draggedIndex = null;
		overIndex = null;
		isDragging = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isDragging) {
			e.preventDefault();
			announce('Reorder cancelled');
			resetState();
		}
	}

	setDragAndDropCtx({
		get draggedIndex() {
			return draggedIndex;
		},
		get overIndex() {
			return overIndex;
		},
		get isDragging() {
			return isDragging;
		},
		get orientation() {
			return orientation;
		},
		get hasHandle() {
			return hasHandle;
		},
		registerHandle() {
			hasHandle = true;
		},
		startDrag(index: number, event: PointerEvent) {
			draggedIndex = index;
			overIndex = index;
			isDragging = true;

			const target = event.currentTarget as HTMLElement;
			target.setPointerCapture(event.pointerId);
			announce(`Grabbed item at position ${index + 1}. Use arrow keys to move.`);
		},
		handleDragOver(index: number) {
			if (isDragging) {
				overIndex = index;
			}
		},
		endDrag() {
			if (isDragging && draggedIndex !== null && overIndex !== null) {
				reorder(draggedIndex, overIndex);
				announce(`Item moved to position ${overIndex + 1}`);
			}
			resetState();
		},
		cancelDrag() {
			announce('Reorder cancelled');
			resetState();
		},
		moveItem(fromIndex: number, direction: 'up' | 'down') {
			const toIndex =
				direction === 'up' ? Math.max(0, fromIndex - 1) : Math.min(items.length - 1, fromIndex + 1);
			if (fromIndex !== toIndex) {
				reorder(fromIndex, toIndex);
				announce(`Item moved to position ${toIndex + 1} of ${items.length}`);
			}
		},
		announce(message: string) {
			liveRegionMessage = message;
		}
	});

	function announce(message: string) {
		liveRegionMessage = '';
		// Force re-announcement by clearing then setting
		requestAnimationFrame(() => {
			liveRegionMessage = message;
		});
	}
</script>

<div
	bind:this={rootElement}
	role="listbox"
	data-dnd-root
	data-orientation={orientation}
	data-dragging={isDragging ? '' : undefined}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
	<div aria-live="assertive" aria-atomic="true" class="liveRegion">
		{liveRegionMessage}
	</div>
</div>

<style>
	.liveRegion {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}
</style>
