<script lang="ts" generics="T">
	import { flushSync } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setDragAndDropCtx } from './context.svelte.js';
	import { getGroupCtx } from './group-context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: T[];
		onReorder: (items: T[]) => void;
		orientation?: 'vertical' | 'horizontal';
		listId?: string;
		children: Snippet;
	}

	let {
		items,
		onReorder,
		orientation = 'vertical',
		listId,
		children,
		class: className,
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
	let isAnimating = false;

	// Cross-list state
	let crossListTarget: string | null = null;
	let crossListIndex: number | null = null;

	const groupCtx = getGroupCtx();

	// Register with group when inside one
	$effect(() => {
		if (groupCtx && listId && rootElement) {
			groupCtx.register(listId, rootElement);
			return () => {
				if (listId) groupCtx.unregister(listId);
			};
		}
	});

	// Derive foreign over index from group active target
	let foreignOverIndex = $derived.by(() => {
		if (!groupCtx || !listId) return null;
		const target = groupCtx.activeTarget;
		if (target && target.listId === listId) return target.index;
		return null;
	});

	const DRAG_THRESHOLD = 8;
	const SCROLL_THRESHOLD = 40;
	const SCROLL_SPEED = 8;
	const FLIP_DURATION = 200;
	const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

	function captureRects(): Map<number, DOMRect> {
		const rects = new Map<number, DOMRect>();
		if (!rootElement) return rects;
		rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]').forEach((el) => {
			const idx = parseInt(el.getAttribute('data-index') || '', 10);
			if (!isNaN(idx)) rects.set(idx, el.getBoundingClientRect());
		});
		return rects;
	}

	function reorder(from: number, to: number) {
		if (to === from || to === from + 1) return;

		const firstRects = captureRects();
		const insertAt = to > from ? to - 1 : to;

		const newItems = [...items];
		const removed = newItems.splice(from, 1);
		if (removed.length === 0) return;
		newItems.splice(insertAt, 0, removed[0]!);
		flushSync(() => onReorder(newItems));

		if (!rootElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]').forEach((el) => {
			const newIdx = parseInt(el.getAttribute('data-index') || '', 10);
			if (isNaN(newIdx)) return;

			let oldIdx: number;
			if (newIdx === insertAt) {
				oldIdx = from;
			} else if (from < insertAt && newIdx >= from && newIdx < insertAt) {
				oldIdx = newIdx + 1;
			} else if (from > insertAt && newIdx > insertAt && newIdx <= from) {
				oldIdx = newIdx - 1;
			} else {
				return;
			}

			const first = firstRects.get(oldIdx);
			if (!first) return;
			const last = el.getBoundingClientRect();
			const dx = first.left - last.left;
			const dy = first.top - last.top;
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

			el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
				duration: FLIP_DURATION,
				easing: FLIP_EASING
			});
		});
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
		clone.removeAttribute('data-index');
		clone.removeAttribute('data-dragging');
		clone.removeAttribute('data-drag-active');
		clone.removeAttribute('data-over');
		clone.removeAttribute('role');
		clone.removeAttribute('tabindex');
		clone.removeAttribute('aria-roledescription');
		clone.removeAttribute('aria-label');

		const computed = getComputedStyle(draggedEl);
		Object.assign(clone.style, {
			gridTemplateColumns: computed.gridTemplateColumns,
			padding: computed.padding,
			gap: computed.gap,
			position: 'fixed',
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			margin: '0',
			pointerEvents: 'none',
			willChange: 'transform',
			zIndex: '9999',
			boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18), 0 12px 24px -8px rgba(0,0,0,0.1)',
			transition: 'none'
		});

		document.body.appendChild(clone);
		previewEl = clone;
		updatePreviewPosition();
	}

	function updatePreviewPosition() {
		if (!previewEl) return;
		const dx = pointerX - startX;
		const dy = pointerY - startY;
		previewEl.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(3deg) scale(1.04)`;
	}

	function findItemAt(x: number, y: number): { rootEl: HTMLElement; index: number } | null {
		const els = document.elementsFromPoint(x, y);
		for (const el of els) {
			const item = (el as HTMLElement).closest?.('[data-dnd-item]') as HTMLElement | null;
			if (!item || item.hasAttribute('data-dnd-preview')) continue;
			const idx = parseInt(item.getAttribute('data-index') || '', 10);
			if (isNaN(idx)) continue;
			const root = item.closest('[data-dnd-root]') as HTMLElement | null;
			if (root) return { rootEl: root, index: idx };
		}
		return null;
	}

	function gapIndexFromItems(container: HTMLElement, pos: number): number {
		const itemEls = container.querySelectorAll<HTMLElement>('[data-dnd-item]');
		if (itemEls.length === 0) return 0;
		for (let i = 0; i < itemEls.length; i++) {
			const rect = itemEls[i]!.getBoundingClientRect();
			const center =
				orientation === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
			if (pos < center) return i;
		}
		return itemEls.length;
	}

	function updateOverIndex() {
		if (draggedIndex === null || !rootElement) return;
		const pointerPos = orientation === 'vertical' ? pointerY : pointerX;

		const hit = findItemAt(pointerX, pointerY);

		// Direct hit on an item in THIS root — use above/below center
		if (hit && hit.rootEl === rootElement) {
			const el = rootElement.querySelector<HTMLElement>(
				`[data-dnd-item][data-index="${hit.index}"]`
			);
			if (el) {
				const rect = el.getBoundingClientRect();
				const center =
					orientation === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
				const idx = pointerPos < center ? hit.index : hit.index + 1;
				if (overIndex !== idx) overIndex = idx;
			}
			clearCrossListTarget();
			return;
		}

		// Direct hit on an item in a SIBLING root
		if (hit && groupCtx && listId) {
			const roots = groupCtx.getRoots();
			for (const [siblingId, siblingEl] of roots) {
				if (siblingId === listId) continue;
				if (siblingEl === hit.rootEl || siblingEl.contains(hit.rootEl)) {
					const idx = gapIndexFromItems(siblingEl, pointerPos);
					setCrossListTarget(siblingId, idx);
					overIndex = null;
					return;
				}
			}
		}

		// No direct hit — check if pointer is over a sibling root's bounds
		if (groupCtx && listId) {
			const roots = groupCtx.getRoots();
			for (const [siblingId, siblingEl] of roots) {
				if (siblingId === listId) continue;
				const rect = siblingEl.getBoundingClientRect();
				if (
					pointerX >= rect.left &&
					pointerX <= rect.right &&
					pointerY >= rect.top &&
					pointerY <= rect.bottom
				) {
					const idx = gapIndexFromItems(siblingEl, pointerPos);
					setCrossListTarget(siblingId, idx);
					overIndex = null;
					return;
				}
			}
		}

		// Fallback: find gap in THIS root
		const idx = gapIndexFromItems(rootElement, pointerPos);
		if (overIndex !== idx) overIndex = idx;
		clearCrossListTarget();
	}

	function setCrossListTarget(targetListId: string, targetIndex: number) {
		crossListTarget = targetListId;
		crossListIndex = targetIndex;
		if (groupCtx) groupCtx.setActiveTarget(targetListId, targetIndex);
	}

	function clearCrossListTarget() {
		if (crossListTarget !== null) {
			crossListTarget = null;
			crossListIndex = null;
			if (groupCtx) groupCtx.setActiveTarget(null, null);
		}
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
		if (isAnimating) return;
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
			announce(`Grabbed item at position ${(draggedIndex ?? 0) + 1}. Use arrow keys to move.`);
		}

		if (isDragging) {
			scheduleUpdate();
		}
	}

	function performDrop() {
		if (draggedIndex === null) return;
		const from = draggedIndex;

		// Cross-list drop
		if (crossListTarget !== null && crossListIndex !== null && groupCtx && listId) {
			const toListId = crossListTarget;
			const toIdx = crossListIndex;
			if (
				!previewEl ||
				!rootElement ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			) {
				resetState();
				groupCtx.move(listId, from, toListId, toIdx);
				announce('Item moved to another list');
				return;
			}
			animateCrossListDrop(from, toListId, toIdx);
			return;
		}

		// Same-list reorder
		if (overIndex !== null) {
			const to = overIndex;
			if (
				to === from ||
				to === from + 1 ||
				!previewEl ||
				!rootElement ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches
			) {
				resetState();
				applyReorder(from, to);
				return;
			}
			animateDrop(from, to);
			return;
		}

		resetState();
	}

	function applyReorder(from: number, to: number) {
		if (to === from || to === from + 1) return;
		const newItems = [...items];
		const removed = newItems.splice(from, 1);
		if (removed.length === 0) return;
		const insertAt = to > from ? to - 1 : to;
		newItems.splice(insertAt, 0, removed[0]!);
		flushSync(() => onReorder(newItems));
	}

	function animateDrop(from: number, to: number) {
		if (!previewEl || !rootElement) return;

		const isEnd = to >= items.length;
		const anchorIdx = isEnd ? items.length - 1 : to;
		const placeholderEl = rootElement.querySelector<HTMLElement>(
			`[data-dnd-item][data-index="${from}"]`
		);
		const anchorEl = rootElement.querySelector<HTMLElement>(
			`[data-dnd-item][data-index="${anchorIdx}"]`
		);
		if (!anchorEl) {
			resetState();
			applyReorder(from, to);
			return;
		}

		isAnimating = true;
		overIndex = null;
		const itemHeight = previewEl.offsetHeight;

		// Capture positions before layout change
		const firstRects = new Map<HTMLElement, DOMRect>();
		rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]').forEach((el) => {
			firstRects.set(el, el.getBoundingClientRect());
		});

		// Remove placeholder from grid entirely (display:none removes its
		// track AND gaps — collapsing to height:0 leaves orphan grid gaps).
		if (placeholderEl) placeholderEl.style.display = 'none';

		// Insert full-height spacer at target so the opening is immediate
		const spacer = document.createElement('div');
		spacer.style.cssText = `overflow: hidden; height: ${itemHeight}px;`;
		if (isEnd) {
			anchorEl.after(spacer);
		} else {
			anchorEl.before(spacer);
		}

		// FLIP items from old to new positions + fly preview — all in one pass
		const animations: Animation[] = [];

		rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]').forEach((el) => {
			if (el === placeholderEl) return;
			const first = firstRects.get(el);
			if (!first) return;
			const last = el.getBoundingClientRect();
			const dx = first.left - last.left;
			const dy = first.top - last.top;
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

			animations.push(
				el.animate(
					[{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
					{ duration: FLIP_DURATION, easing: FLIP_EASING }
				)
			);
		});

		// Fly preview into the opening
		const spacerRect = spacer.getBoundingClientRect();
		const baseLeft = parseFloat(previewEl.style.left);
		const baseTop = parseFloat(previewEl.style.top);
		const currentDx = pointerX - startX;
		const currentDy = pointerY - startY;
		const finalDx = spacerRect.left - baseLeft;
		const finalDy = spacerRect.top - baseTop;

		animations.push(
			previewEl.animate(
				[
					{
						transform: `translate3d(${currentDx}px, ${currentDy}px, 0) rotate(3deg) scale(1.04)`,
						boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18), 0 12px 24px -8px rgba(0,0,0,0.1)'
					},
					{
						transform: `translate3d(${finalDx}px, ${finalDy}px, 0) rotate(0deg) scale(1)`,
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
					}
				],
				{ duration: FLIP_DURATION, easing: FLIP_EASING, fill: 'forwards' }
			)
		);

		Promise.all(animations.map((a) => a.finished))
			.then(() => {
				if (placeholderEl) placeholderEl.style.removeProperty('display');
				spacer.remove();
				isAnimating = false;
				resetState();
				applyReorder(from, to);
			})
			.catch(() => {
				if (placeholderEl) placeholderEl.style.removeProperty('display');
				spacer.remove();
				isAnimating = false;
				resetState();
			});
	}

	function animateCrossListDrop(from: number, toListId: string, toIdx: number) {
		if (!previewEl || !rootElement || !groupCtx || !listId) return;

		const siblingRoot = groupCtx.getRoots().get(toListId);
		if (!siblingRoot) {
			resetState();
			groupCtx.move(listId, from, toListId, toIdx);
			return;
		}

		isAnimating = true;
		overIndex = null;
		clearCrossListTarget();
		const itemHeight = previewEl.offsetHeight;

		// Capture positions in both source and target lists
		const firstRects = new Map<HTMLElement, DOMRect>();
		for (const el of rootElement.querySelectorAll<HTMLElement>('[data-dnd-item]')) {
			firstRects.set(el, el.getBoundingClientRect());
		}
		for (const el of siblingRoot.querySelectorAll<HTMLElement>('[data-dnd-item]')) {
			firstRects.set(el, el.getBoundingClientRect());
		}

		// Remove placeholder from source grid
		const placeholderEl = rootElement.querySelector<HTMLElement>(
			`[data-dnd-item][data-index="${from}"]`
		);
		if (placeholderEl) placeholderEl.style.display = 'none';

		// Insert spacer at full track height but visually collapsed via scaleY.
		// Full height keeps the grid track correct (no double-gap from a 0-height
		// track); scaleY gives the "grow into position" effect.
		const spacer = document.createElement('div');
		spacer.style.cssText = `overflow: hidden; height: ${itemHeight}px; transform: scaleY(0); transform-origin: top;`;
		const siblingItems = siblingRoot.querySelectorAll<HTMLElement>('[data-dnd-item]');
		if (toIdx >= siblingItems.length) {
			if (siblingItems.length > 0) {
				siblingItems[siblingItems.length - 1]!.after(spacer);
			} else {
				siblingRoot.prepend(spacer);
			}
		} else {
			siblingItems[toIdx]!.before(spacer);
		}

		// FLIP items in both lists + grow spacer + fly preview
		const animations: Animation[] = [];

		for (const root of [rootElement, siblingRoot]) {
			for (const el of root.querySelectorAll<HTMLElement>('[data-dnd-item]')) {
				if (el === placeholderEl) continue;
				const first = firstRects.get(el);
				if (!first) continue;
				const last = el.getBoundingClientRect();
				const dx = first.left - last.left;
				const dy = first.top - last.top;
				if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;

				animations.push(
					el.animate(
						[{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
						{ duration: FLIP_DURATION, easing: FLIP_EASING }
					)
				);
			}
		}

		// Grow spacer visually
		animations.push(
			spacer.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
				duration: FLIP_DURATION,
				easing: FLIP_EASING,
				fill: 'forwards'
			})
		);

		const spacerRect = spacer.getBoundingClientRect();
		const baseLeft = parseFloat(previewEl.style.left);
		const baseTop = parseFloat(previewEl.style.top);
		const currentDx = pointerX - startX;
		const currentDy = pointerY - startY;
		const finalDx = spacerRect.left - baseLeft;
		const finalDy = spacerRect.top - baseTop;

		animations.push(
			previewEl.animate(
				[
					{
						transform: `translate3d(${currentDx}px, ${currentDy}px, 0) rotate(3deg) scale(1.04)`,
						boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18), 0 12px 24px -8px rgba(0,0,0,0.1)'
					},
					{
						transform: `translate3d(${finalDx}px, ${finalDy}px, 0) rotate(0deg) scale(1)`,
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
					}
				],
				{ duration: FLIP_DURATION, easing: FLIP_EASING, fill: 'forwards' }
			)
		);

		Promise.all(animations.map((a) => a.finished))
			.then(() => {
				if (placeholderEl) placeholderEl.style.removeProperty('display');
				spacer.remove();
				isAnimating = false;
				resetState();
				flushSync(() => groupCtx!.move(listId!, from, toListId, toIdx));
				announce('Item moved to another list');
			})
			.catch(() => {
				if (placeholderEl) placeholderEl.style.removeProperty('display');
				spacer.remove();
				isAnimating = false;
				resetState();
			});
	}

	function handlePointerUp() {
		if (isPending) {
			resetState();
			return;
		}
		if (isDragging) {
			performDrop();
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
		clearCrossListTarget();
		draggedIndex = null;
		overIndex = null;
		isDragging = false;
		isPending = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isDragging && !isAnimating) {
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
		get foreignOverIndex() {
			return foreignOverIndex;
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
			if (isDragging) {
				performDrop();
			} else {
				resetState();
			}
		},
		cancelDrag() {
			announce('Reorder cancelled');
			resetState();
		},
		moveItem(fromIndex: number, direction: 'up' | 'down') {
			// Gap-based: up = gap before previous item, down = gap after next item
			const toGap =
				direction === 'up' ? Math.max(0, fromIndex - 1) : Math.min(items.length, fromIndex + 2);
			if (toGap !== fromIndex && toGap !== fromIndex + 1) {
				reorder(fromIndex, toGap);
				const insertAt = toGap > fromIndex ? toGap - 1 : toGap;
				announce(`Item moved to position ${insertAt + 1} of ${items.length}`);
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
	role="listbox"
	data-dnd-root
	data-orientation={orientation}
	data-dragging={isDragging ? '' : undefined}
	data-over-end={(isDragging && overIndex !== null && overIndex >= items.length) ||
	(foreignOverIndex !== null && foreignOverIndex >= items.length)
		? ''
		: undefined}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onkeydown={handleKeydown}
	{...rest}
	class={className}
>
	{@render children()}
	<div aria-live="assertive" aria-atomic="true" class="liveRegion">
		{liveRegionMessage}
	</div>
</div>

<style>
	.liveRegion {
		position: absolute;
		aspect-ratio: 1;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	[data-dnd-root] {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--dry-dnd-gap, var(--dry-space-2));
	}

	[data-dnd-root][data-orientation='vertical'] {
		grid-auto-flow: row;
	}

	[data-dnd-root][data-orientation='horizontal'] {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
	}

	[data-dnd-root][data-dragging] {
		cursor: grabbing;
	}

	[data-dnd-root][data-over-end]::after {
		content: '';
		height: var(--dry-dnd-indicator-size, 2px);
		background: var(--dry-dnd-indicator-color, var(--dry-color-fill-brand));
		border-radius: var(--dry-dnd-indicator-size, 2px);
	}
</style>
