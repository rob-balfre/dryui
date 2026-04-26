<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		selectedElement: HTMLElement | null;
		getClone: (el: HTMLElement) => HTMLElement | null;
		onselect: (el: HTMLElement | null) => void;
		onclose: () => void;
		oncommit?: () => void;
	}

	let { selectedElement, getClone, onselect, onclose, oncommit }: Props = $props();

	const cloneElement = $derived(selectedElement ? getClone(selectedElement) : null);

	type Box = {
		key: number;
		el: HTMLElement;
		x: number;
		y: number;
		w: number;
		h: number;
		role: 'container' | 'cell';
	};

	type Edge = 'top' | 'right' | 'bottom' | 'left';
	type Corner = 'nw' | 'ne' | 'se' | 'sw';
	type Gesture = { kind: 'move' } | { kind: 'resize'; edge: Edge } | { kind: 'rotate' };

	let boxes = $state<Box[]>([]);

	function isInsideFeedback(el: Element): boolean {
		return !!el.closest('[data-dryui-feedback]');
	}

	function isClone(el: Element): boolean {
		return !!el.closest('[data-dryui-layout-clone]');
	}

	function isAddedPlaceholder(el: HTMLElement): boolean {
		return el.dataset.dryuiAddedId !== undefined;
	}

	function tooltipLabelFor(el: HTMLElement): string {
		if (isAddedPlaceholder(el)) {
			const fallback = el.querySelector<HTMLElement>('[data-dryui-added-fallback]');
			const kind = fallback?.textContent?.trim();
			if (kind) return kind;
		}
		const tag = el.tagName.toLowerCase();
		if (el.id) return `${tag}#${el.id}`;
		// Skip framework-scoped class hashes (Svelte: svelte-xxxxxx, CSS modules: _foo_xxxxx).
		const cls = Array.from(el.classList).find(
			(c) => !c.startsWith('svelte-') && !c.startsWith('_')
		);
		if (cls) return `${tag}.${cls}`;
		return tag;
	}

	function isGridContainer(cs: CSSStyleDeclaration): boolean {
		return cs.display === 'grid' || cs.display === 'inline-grid';
	}

	function rectFor(el: HTMLElement): DOMRect {
		return (getClone(el) ?? el).getBoundingClientRect();
	}

	function rebuild() {
		const all = document.querySelectorAll<HTMLElement>('body *');
		const next: Box[] = [];
		let key = 0;
		for (const el of all) {
			const added = isAddedPlaceholder(el);
			if (!added && isInsideFeedback(el)) continue;
			if (isClone(el)) continue;
			const cs = getComputedStyle(el);
			if (cs.display === 'none') continue;
			if (cs.visibility === 'hidden' && !getClone(el)) continue;

			const isGrid = isGridContainer(cs);
			const parent = el.parentElement;
			const parentIsGrid =
				parent && !isInsideFeedback(parent) && isGridContainer(getComputedStyle(parent));

			if (!added && !isGrid && !parentIsGrid) continue;

			const rect = rectFor(el);
			if (rect.width < 4 || rect.height < 4) continue;

			next.push({
				key: key++,
				el,
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height,
				role: added ? 'cell' : isGrid ? 'container' : 'cell'
			});
		}

		if (!boxesEqual(boxes, next)) boxes = next;
	}

	function boxesEqual(a: Box[], b: Box[]): boolean {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			const x = a[i]!;
			const y = b[i]!;
			if (
				x.el !== y.el ||
				x.x !== y.x ||
				x.y !== y.y ||
				x.w !== y.w ||
				x.h !== y.h ||
				x.role !== y.role
			) {
				return false;
			}
		}
		return true;
	}

	let rebuildFrame = 0;
	function scheduleRebuild() {
		if (rebuildFrame) return;
		rebuildFrame = requestAnimationFrame(() => {
			rebuildFrame = 0;
			rebuild();
		});
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			if (selectedElement) onselect(null);
			else onclose();
		}
	}

	function handleSelect(e: MouseEvent, box: Box) {
		e.stopPropagation();
		onselect(box.el);
	}

	// --- Direct manipulation (targets the clone, not the original) ---

	type ManipulationStart = {
		gesture: Gesture;
		pointerId: number;
		captureTarget: HTMLElement;
		clone: HTMLElement;
		startPointerX: number;
		startPointerY: number;
		startLeft: number;
		startTop: number;
		startWidth: number;
		startHeight: number;
		startRotation: number;
		centerX: number;
		centerY: number;
		startAngle: number;
	};

	let manipulating: ManipulationStart | null = null;

	$effect(() => {
		void cloneElement;
		scheduleRebuild();
	});

	function parseStyle(value: string, fallback: number): number {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	function startGesture(e: PointerEvent, gesture: Gesture) {
		const clone = cloneElement;
		if (!clone) return;
		e.stopPropagation();
		e.preventDefault();

		const rect = clone.getBoundingClientRect();
		const startLeft = parseStyle(clone.style.left, rect.left);
		const startTop = parseStyle(clone.style.top, rect.top);
		const startWidth = parseStyle(clone.style.width, rect.width);
		const startHeight = parseStyle(clone.style.height, rect.height);
		const startRotation = parseStyle(clone.dataset.dryuiLayoutRotation ?? '', 0);
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const target = e.currentTarget as HTMLElement;
		manipulating = {
			gesture,
			pointerId: e.pointerId,
			captureTarget: target,
			clone,
			startPointerX: e.clientX,
			startPointerY: e.clientY,
			startLeft,
			startTop,
			startWidth,
			startHeight,
			startRotation,
			centerX,
			centerY,
			startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX)
		};

		window.addEventListener('pointermove', handleGestureMove);
		window.addEventListener('pointerup', handleGestureEnd);
		window.addEventListener('pointercancel', handleGestureEnd);
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer may not be capturable (synthetic events, multi-touch)
		}
	}

	function applyTransform(clone: HTMLElement, rotation: number) {
		clone.dataset.dryuiLayoutRotation = String(rotation);
		clone.style.transform = rotation ? `rotate(${rotation}deg)` : '';
	}

	function handleGestureMove(e: PointerEvent) {
		if (!manipulating || manipulating.pointerId !== e.pointerId) return;
		const { clone, gesture } = manipulating;
		const dx = e.clientX - manipulating.startPointerX;
		const dy = e.clientY - manipulating.startPointerY;

		if (gesture.kind === 'move') {
			clone.style.left = `${manipulating.startLeft + dx}px`;
			clone.style.top = `${manipulating.startTop + dy}px`;
		} else if (gesture.kind === 'rotate') {
			const angle = Math.atan2(e.clientY - manipulating.centerY, e.clientX - manipulating.centerX);
			const deltaDeg = ((angle - manipulating.startAngle) * 180) / Math.PI;
			applyTransform(clone, manipulating.startRotation + deltaDeg);
		} else if (gesture.kind === 'resize') {
			const xDir = gesture.edge === 'right' ? 1 : gesture.edge === 'left' ? -1 : 0;
			const yDir = gesture.edge === 'bottom' ? 1 : gesture.edge === 'top' ? -1 : 0;
			const widthDelta = xDir === 0 ? 0 : Math.max(MIN_RESIZE - manipulating.startWidth, xDir * dx);
			const heightDelta =
				yDir === 0 ? 0 : Math.max(MIN_RESIZE - manipulating.startHeight, yDir * dy);

			clone.style.width = `${manipulating.startWidth + widthDelta}px`;
			clone.style.height = `${manipulating.startHeight + heightDelta}px`;
			clone.style.left = `${manipulating.startLeft - (xDir < 0 ? widthDelta : 0)}px`;
			clone.style.top = `${manipulating.startTop - (yDir < 0 ? heightDelta : 0)}px`;
		}

		scheduleRebuild();
	}

	function handleGestureEnd(e: PointerEvent) {
		if (!manipulating || manipulating.pointerId !== e.pointerId) return;
		try {
			manipulating.captureTarget.releasePointerCapture?.(e.pointerId);
		} catch {
			// pointer may already be released
		}
		manipulating = null;
		window.removeEventListener('pointermove', handleGestureMove);
		window.removeEventListener('pointerup', handleGestureEnd);
		window.removeEventListener('pointercancel', handleGestureEnd);
		oncommit?.();
	}

	onMount(() => {
		rebuild();
		const ro = new ResizeObserver(scheduleRebuild);
		ro.observe(document.body);
		window.addEventListener('scroll', scheduleRebuild, true);
		window.addEventListener('resize', scheduleRebuild);
		window.addEventListener('keydown', handleKey, true);

		return () => {
			if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
			ro.disconnect();
			window.removeEventListener('scroll', scheduleRebuild, true);
			window.removeEventListener('resize', scheduleRebuild);
			window.removeEventListener('keydown', handleKey, true);
			window.removeEventListener('pointermove', handleGestureMove);
			window.removeEventListener('pointerup', handleGestureEnd);
			window.removeEventListener('pointercancel', handleGestureEnd);
		};
	});

	const EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];
	const CORNERS: Corner[] = ['nw', 'ne', 'se', 'sw'];
	const MIN_RESIZE = 4;
</script>

<div
	class="layout-inspector"
	data-has-selection={selectedElement ? '' : undefined}
	onclick={(e) => {
		if (e.target === e.currentTarget && selectedElement) {
			onselect(null);
		}
	}}
	role="presentation"
>
	{#each boxes as box (box.key)}
		{@const isSelected = selectedElement === box.el}
		{#if isSelected}
			<div
				class="layout-box layout-box-selected"
				data-role={box.role}
				data-tooltip={tooltipLabelFor(box.el)}
				style:left="{box.x}px"
				style:top="{box.y}px"
				style:width="{box.w}px"
				style:height="{box.h}px"
			>
				<button
					class="layout-handle layout-handle-body"
					type="button"
					aria-label="Move element"
					onpointerdown={(e) => startGesture(e, { kind: 'move' })}
				></button>
				{#each EDGES as edge}
					<button
						class="layout-handle layout-handle-edge layout-handle-edge-{edge}"
						type="button"
						aria-label="Resize {edge} edge"
						onpointerdown={(e) => startGesture(e, { kind: 'resize', edge })}
					></button>
				{/each}
				{#each CORNERS as corner}
					<button
						class="layout-handle layout-handle-corner layout-handle-corner-{corner}"
						type="button"
						aria-label="Rotate from {corner} corner"
						onpointerdown={(e) => startGesture(e, { kind: 'rotate' })}
					></button>
				{/each}
			</div>
		{:else}
			<button
				class="layout-box"
				type="button"
				data-role={box.role}
				data-tooltip={tooltipLabelFor(box.el)}
				style:left="{box.x}px"
				style:top="{box.y}px"
				style:width="{box.w}px"
				style:height="{box.h}px"
				aria-label={`Select ${box.role} ${box.el.tagName.toLowerCase()}`}
				onclick={(e) => handleSelect(e, box)}
			></button>
		{/if}
	{/each}
</div>

<style>
	.layout-inspector {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	.layout-inspector[data-has-selection] {
		pointer-events: auto;
	}

	.layout-box {
		position: fixed;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		pointer-events: auto;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}

	.layout-box[data-role='container'] {
		outline: 2px solid hsl(25 100% 55%);
		outline-offset: -1px;
		background: hsl(25 100% 55% / 0.04);
	}

	.layout-box[data-role='cell'] {
		outline: 1px dashed hsl(25 100% 55% / 0.5);
		outline-offset: -0.5px;
	}

	.layout-box:hover {
		background: hsl(25 100% 55% / 0.1);
	}

	.layout-box[data-tooltip]::after,
	.layout-box-selected[data-tooltip]::after {
		content: attr(data-tooltip);
		position: absolute;
		top: -22px;
		left: 0;
		z-index: 2;
		max-inline-size: 240px;
		padding: 3px 6px;
		border-radius: 4px;
		background: hsl(25 100% 55%);
		color: black;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.02em;
		line-height: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
		box-shadow: 0 2px 6px hsl(0 0% 0% / 0.4);
		opacity: 0;
		transform: translateY(2px);
		transition:
			opacity 0.12s ease-out,
			transform 0.12s ease-out;
	}

	.layout-box[data-tooltip]:hover::after,
	.layout-box-selected[data-tooltip]::after {
		opacity: 1;
		transform: translateY(0);
	}

	.layout-box-selected {
		outline: 3px solid hsl(25 100% 55%);
		outline-offset: -1.5px;
		background: hsl(25 100% 55% / 0.16);
		box-shadow: 0 0 0 1px hsl(25 100% 55% / 0.4) inset;
	}

	.layout-box-selected[data-role='cell'] {
		outline-style: solid;
	}

	.layout-inspector[data-has-selection] .layout-box:not(.layout-box-selected) {
		outline: none;
		background: transparent;
		pointer-events: none;
	}

	.layout-box:focus-visible {
		outline-color: hsl(25 100% 67%);
	}

	.layout-handle {
		position: absolute;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		font: inherit;
		color: inherit;
	}

	.layout-handle-body {
		inset: 0;
		cursor: move;
	}

	.layout-handle-edge {
		background: transparent;
	}

	.layout-handle-edge-top {
		top: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: ns-resize;
	}

	.layout-handle-edge-bottom {
		bottom: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: ns-resize;
	}

	.layout-handle-edge-left {
		left: -4px;
		top: 8px;
		bottom: 8px;
		width: 8px;
		cursor: ew-resize;
	}

	.layout-handle-edge-right {
		right: -4px;
		top: 8px;
		bottom: 8px;
		width: 8px;
		cursor: ew-resize;
	}

	.layout-handle-corner {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background: hsl(25 100% 55%);
		box-shadow:
			0 0 0 1.5px white,
			0 1px 4px hsl(0 0% 0% / 0.5);
		cursor: alias;
	}

	.layout-handle-corner-nw {
		top: -6px;
		left: -6px;
	}

	.layout-handle-corner-ne {
		top: -6px;
		right: -6px;
	}

	.layout-handle-corner-se {
		bottom: -6px;
		right: -6px;
	}

	.layout-handle-corner-sw {
		bottom: -6px;
		left: -6px;
	}
</style>
