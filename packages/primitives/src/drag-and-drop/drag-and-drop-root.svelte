<script lang="ts" generics="T">
	import { flushSync } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createId } from '../utils/create-id.js';
	import { mergeIds } from '../utils/merge-ids.js';
	import { setDragAndDropCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: T[];
		onReorder: (items: T[]) => void;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	let {
		items,
		onReorder,
		orientation = 'vertical',
		children,
		'aria-describedby': ariaDescribedBy,
		...rest
	}: Props = $props();

	let draggedIndex: number | null = $state(null);
	let overIndex: number | null = $state(null);
	let isDragging = $state(false);
	let hasHandle = $state(false);
	let liveRegionMessage = $state('');

	let rootElement: HTMLDivElement | undefined = $state();

	let isPending = $state(false);
	let startX = 0;
	let startY = 0;
	let pointerX = 0;
	let pointerY = 0;

	let previewEl: HTMLElement | null = null;
	let rafId: number | null = null;
	const instructionsId = createId('dry-dnd-instructions');

	let keyboardInstructions = $derived.by(() => {
		const arrowKeys =
			orientation === 'vertical' ? 'Arrow Up and Arrow Down' : 'Arrow Left and Arrow Right';
		if (hasHandle) {
			return `Use the reorder handle and ${arrowKeys} to move items. Drag with a pointer to reorder, and press Escape to cancel an active drag.`;
		}
		return `Focus an item and use ${arrowKeys} to move it. Drag with a pointer to reorder, and press Escape to cancel an active drag.`;
	});

	const DRAG_THRESHOLD = 8;
	const SCROLL_THRESHOLD = 40;
	const SCROLL_SPEED = 8;

	function announceReorder(to: number) {
		announce(`Item moved to position ${to + 1} of ${items.length}`);
	}

	function focusReorderedControl(index: number) {
		const targetItem = rootElement?.querySelector<HTMLElement>(
			`[data-dnd-item][data-index="${index}"]`
		);
		if (!targetItem) return;

		if (hasHandle) {
			targetItem.querySelector<HTMLElement>('[data-dnd-handle]')?.focus();
			return;
		}

		targetItem.focus();
	}

	function reorder(from: number, to: number) {
		if (from === to) return;
		const newItems = [...items];
		const removed = newItems.splice(from, 1);
		if (removed.length === 0) return;
		newItems.splice(to, 0, removed[0]!);
		flushSync(() => onReorder(newItems));
	}

	function createPreview() {
		if (!rootElement || draggedIndex === null) return;

		const draggedEl = rootElement.querySelector<HTMLElement>(
			`[data-dnd-item][data-index="${draggedIndex}"]`
		);
		if (!draggedEl) return;

		const rect = draggedEl.getBoundingClientRect();

		const clone = draggedEl.cloneNode(true) as HTMLElement;
		clone.setAttribute('data-dnd-preview', '');
		clone.removeAttribute('data-dnd-item');
		clone.removeAttribute('data-index');
		clone.removeAttribute('role');
		clone.removeAttribute('tabindex');
		clone.removeAttribute('aria-roledescription');
		clone.removeAttribute('aria-label');
		clone.style.cssText = [
			'position: fixed',
			`left: ${rect.left}px`,
			`top: ${rect.top}px`,
			`width: ${rect.width}px`,
			`height: ${rect.height}px`,
			'margin: 0',
			'pointer-events: none',
			'will-change: transform',
			'z-index: 9999',
			'transition: none'
		].join(';');

		document.body.appendChild(clone);
		previewEl = clone;
		updatePreviewPosition();
	}

	function updatePreviewPosition() {
		if (!previewEl) return;
		const dx = pointerX - startX;
		const dy = pointerY - startY;
		previewEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
	}

	function updateOverIndex() {
		if (draggedIndex === null || !rootElement) return;

		const els = document.elementsFromPoint(pointerX, pointerY);

		for (const el of els) {
			const item = (el as HTMLElement).closest?.('[data-dnd-item]') as HTMLElement | null;
			if (item && rootElement.contains(item)) {
				const idx = parseInt(item.getAttribute('data-index') || '', 10);
				if (!isNaN(idx)) {
					if (overIndex !== idx) overIndex = idx;
					return;
				}
			}
		}

		const itemElements = Array.from(rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]'));
		const pointerPos = orientation === 'vertical' ? pointerY : pointerX;
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

		if (overIndex !== closestIndex) overIndex = closestIndex;
	}

	function autoScroll() {
		if (!rootElement || !isDragging) return;
		const rect = rootElement.getBoundingClientRect();

		if (orientation === 'vertical') {
			if (pointerY - rect.top < SCROLL_THRESHOLD && rootElement.scrollTop > 0) {
				rootElement.scrollTop -= SCROLL_SPEED;
			} else if (
				rect.bottom - pointerY < SCROLL_THRESHOLD &&
				rootElement.scrollTop < rootElement.scrollHeight - rootElement.clientHeight
			) {
				rootElement.scrollTop += SCROLL_SPEED;
			}
		} else {
			if (pointerX - rect.left < SCROLL_THRESHOLD && rootElement.scrollLeft > 0) {
				rootElement.scrollLeft -= SCROLL_SPEED;
			} else if (
				rect.right - pointerX < SCROLL_THRESHOLD &&
				rootElement.scrollLeft < rootElement.scrollWidth - rootElement.clientWidth
			) {
				rootElement.scrollLeft += SCROLL_SPEED;
			}
		}
	}

	function scheduleUpdate() {
		if (rafId !== null) return;
		rafId = requestAnimationFrame(() => {
			rafId = null;
			updatePreviewPosition();
			updateOverIndex();
			autoScroll();
		});
	}

	function removePreview() {
		if (previewEl) {
			previewEl.remove();
			previewEl = null;
		}
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPending && !isDragging) return;

		pointerX = e.clientX;
		pointerY = e.clientY;

		if (isPending && !isDragging) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;

			isPending = false;
			isDragging = true;
			createPreview();
			announce(
				`Grabbed item at position ${(draggedIndex ?? 0) + 1} of ${items.length}. Drag to move and release to drop.`
			);
		}

		if (isDragging) {
			scheduleUpdate();
		}
	}

	function handlePointerUp() {
		if (isPending) {
			resetState();
			return;
		}
		if (isDragging && draggedIndex !== null && overIndex !== null) {
			const from = draggedIndex;
			const to = overIndex;
			resetState();
			reorder(from, to);
			announceReorder(to);
		} else {
			resetState();
		}
	}

	function handlePointerCancel() {
		if (isDragging || isPending) {
			announce('Reorder cancelled');
		}
		resetState();
	}

	function resetState() {
		removePreview();
		draggedIndex = null;
		overIndex = null;
		isDragging = false;
		isPending = false;
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
		get instructionsId() {
			return instructionsId;
		},
		get itemCount() {
			return items.length;
		},
		registerHandle() {
			hasHandle = true;
		},
		startDrag(index: number, event: PointerEvent) {
			if (event.button !== 0) return;
			draggedIndex = index;
			overIndex = index;
			isPending = true;
			startX = event.clientX;
			startY = event.clientY;
			pointerX = event.clientX;
			pointerY = event.clientY;

			const target = event.currentTarget as HTMLElement;
			target.setPointerCapture(event.pointerId);
		},
		handleDragOver(index: number) {
			if (isDragging) {
				overIndex = index;
			}
		},
		endDrag() {
			if (isDragging && draggedIndex !== null && overIndex !== null) {
				const from = draggedIndex;
				const to = overIndex;
				resetState();
				reorder(from, to);
				announceReorder(to);
			} else {
				resetState();
			}
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
				focusReorderedControl(toIndex);
				announce(`Item moved to position ${toIndex + 1} of ${items.length}`);
			}
		},
		announce(message: string) {
			liveRegionMessage = message;
		}
	});

	function announce(message: string) {
		liveRegionMessage = '';
		requestAnimationFrame(() => {
			liveRegionMessage = message;
		});
	}
</script>

<div
	bind:this={rootElement}
	role="list"
	aria-roledescription="sortable list"
	aria-describedby={mergeIds(ariaDescribedBy, instructionsId)}
	data-dnd-root
	data-orientation={orientation}
	data-dragging={isDragging ? '' : undefined}
	data-handle={hasHandle ? '' : undefined}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	{...rest}
>
	{@render children()}
	<div id={instructionsId} data-dnd-instructions class="assistiveText">
		{keyboardInstructions}
	</div>
	<div data-dnd-live-region aria-live="assertive" aria-atomic="true" class="assistiveText">
		{liveRegionMessage}
	</div>
</div>

<style>
	.assistiveText {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}
</style>
