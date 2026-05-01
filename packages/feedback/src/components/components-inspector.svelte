<script lang="ts">
	import { Button } from '@dryui/ui';
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
	let coarsePointer = $state(false);
	const COARSE_POINTER_QUERY = '(pointer: coarse), (hover: none)';

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

	function isContainerElement(el: HTMLElement, cs: CSSStyleDeclaration): boolean {
		if (isGridContainer(cs)) return true;
		if (el.children.length > 0) return true;
		return ['article', 'aside', 'footer', 'form', 'header', 'main', 'nav', 'section'].includes(
			el.tagName.toLowerCase()
		);
	}

	function isLayoutStructure(el: Element): boolean {
		if (el.tagName.toLowerCase() === 'svelte-css-wrapper') return true;
		return el.matches('[data-layout], [data-layout-area]');
	}

	function rebuild() {
		const all = document.querySelectorAll<HTMLElement>('body *');
		const next: Box[] = [];
		let key = 0;
		for (const el of all) {
			const added = isAddedPlaceholder(el);
			if (!added && isInsideFeedback(el)) continue;
			if (isClone(el)) continue;
			if (!added && isLayoutStructure(el)) continue;
			const cs = getComputedStyle(el);
			if (cs.display === 'none') continue;
			const clone = getClone(el);
			if (cs.visibility === 'hidden' && !clone) continue;

			const rect = (clone ?? el).getBoundingClientRect();
			if (rect.width < 4 || rect.height < 4) continue;
			const role = added || !isContainerElement(el, cs) ? 'cell' : 'container';

			next.push({
				key: key++,
				el,
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height,
				role
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

	function boxStyle(box: Pick<Box, 'x' | 'y' | 'w' | 'h'>): string {
		return `left: ${box.x}px; top: ${box.y}px; width: ${box.w}px; height: ${box.h}px;`;
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

		const target = document.documentElement;
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
		const pointerQuery = window.matchMedia(COARSE_POINTER_QUERY);
		const syncPointerMode = () => {
			coarsePointer = pointerQuery.matches;
		};
		syncPointerMode();
		pointerQuery.addEventListener('change', syncPointerMode);
		const ro = new ResizeObserver(scheduleRebuild);
		ro.observe(document.body);
		window.addEventListener('scroll', scheduleRebuild, true);
		window.addEventListener('resize', scheduleRebuild);
		window.addEventListener('keydown', handleKey, true);

		return () => {
			if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
			pointerQuery.removeEventListener('change', syncPointerMode);
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
	class="components-inspector"
	data-has-selection={selectedElement ? '' : undefined}
	data-coarse-pointer={coarsePointer || undefined}
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
				class="components-box components-box-selected"
				data-role={box.role}
				data-tooltip={tooltipLabelFor(box.el)}
				style:left="{box.x}px"
				style:top="{box.y}px"
				style:width="{box.w}px"
				style:height="{box.h}px"
			>
				<Button
					class="components-handle components-handle-body"
					variant="bare"
					size="sm"
					color={null}
					type="button"
					aria-label="Move element"
					onpointerdown={(e) => startGesture(e, { kind: 'move' })}
				>
					<span hidden>Move element</span>
				</Button>
				{#each EDGES as edge (edge)}
					<Button
						class="components-handle components-handle-edge components-handle-edge-{edge}"
						variant="bare"
						size="sm"
						color={null}
						type="button"
						aria-label="Resize {edge} edge"
						onpointerdown={(e) => startGesture(e, { kind: 'resize', edge })}
					>
						<span hidden>Resize {edge} edge</span>
					</Button>
				{/each}
				{#each CORNERS as corner (corner)}
					<Button
						class="components-handle components-handle-corner components-handle-corner-{corner}"
						variant="bare"
						size="sm"
						color={null}
						type="button"
						aria-label="Rotate from {corner} corner"
						onpointerdown={(e) => startGesture(e, { kind: 'rotate' })}
					>
						<span hidden>Rotate from {corner} corner</span>
					</Button>
				{/each}
			</div>
		{:else}
			<Button
				class="components-box"
				variant="bare"
				size="sm"
				color={null}
				type="button"
				data-role={box.role}
				data-tooltip={tooltipLabelFor(box.el)}
				style={boxStyle(box)}
				aria-label={`Select ${box.role} ${box.el.tagName.toLowerCase()}`}
				onclick={(e) => handleSelect(e, box)}
			>
				<span hidden>Select {box.role} {box.el.tagName.toLowerCase()}</span>
			</Button>
		{/if}
	{/each}
</div>

<style>
	.components-inspector {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	.components-inspector[data-has-selection] {
		pointer-events: auto;
	}

	.components-box,
	.components-inspector :global(.components-box[data-dry-button]) {
		--dry-btn-active-transform: none;
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: inherit;
		--dry-btn-min-height: 0;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 0;
		position: fixed;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		pointer-events: auto;
		touch-action: manipulation;
		cursor: pointer;
		font: inherit;
		color: inherit;
		min-height: 0;
		box-shadow: none;
		text-decoration: none;
	}

	.components-box[data-role='container']:hover,
	.components-inspector :global(.components-box[data-role='container']:hover) {
		outline: 2px solid hsl(25 100% 55%);
		outline-offset: -1px;
		background: hsl(25 100% 55% / 0.1);
	}

	.components-box[data-role='cell']:hover,
	.components-inspector :global(.components-box[data-role='cell']:hover) {
		outline: 1px dashed hsl(25 100% 55% / 0.5);
		outline-offset: -0.5px;
		background: hsl(25 100% 55% / 0.1);
	}

	.components-box[data-tooltip]::after,
	.components-box-selected[data-tooltip]::after,
	.components-inspector :global(.components-box[data-tooltip])::after {
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

	.components-box[data-tooltip]:hover::after,
	.components-box-selected[data-tooltip]::after,
	.components-inspector :global(.components-box[data-tooltip]:hover)::after {
		opacity: 1;
		transform: translateY(0);
	}

	.components-box-selected {
		outline: 3px solid hsl(25 100% 55%);
		outline-offset: -1.5px;
		background: hsl(25 100% 55% / 0.16);
		box-shadow: 0 0 0 1px hsl(25 100% 55% / 0.4) inset;
	}

	.components-box-selected[data-role='cell'] {
		outline-style: solid;
	}

	.components-inspector[data-has-selection] .components-box:not(.components-box-selected),
	.components-inspector[data-has-selection] :global(.components-box[data-dry-button]) {
		outline: none;
		background: transparent;
		pointer-events: none;
	}

	.components-box:focus-visible,
	.components-inspector :global(.components-box:focus-visible) {
		outline: 2px solid hsl(25 100% 67%);
		outline-offset: -1px;
	}

	.components-inspector :global(.components-handle) {
		--dry-btn-active-transform: none;
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: inherit;
		--dry-btn-min-height: 0;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 0;
		position: absolute;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		font: inherit;
		color: inherit;
		min-height: 0;
		box-shadow: none;
		text-decoration: none;
		touch-action: none;
	}

	.components-inspector
		:global(.components-box[data-dry-button][data-variant='bare']:hover:not([data-disabled])),
	.components-inspector
		:global(.components-box[data-dry-button][data-variant='bare']:active:not([data-disabled])),
	.components-inspector
		:global(.components-handle[data-dry-button][data-variant='bare']:hover:not([data-disabled])),
	.components-inspector
		:global(.components-handle[data-dry-button][data-variant='bare']:active:not([data-disabled])) {
		opacity: 1;
		transform: none;
	}

	.components-inspector :global(.components-handle-body) {
		inset: 0;
		cursor: move;
	}

	.components-inspector :global(.components-handle-edge) {
		background: transparent;
	}

	.components-inspector :global(.components-handle-edge-top) {
		top: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: ns-resize;
	}

	.components-inspector :global(.components-handle-edge-bottom) {
		bottom: -4px;
		left: 8px;
		right: 8px;
		height: 8px;
		cursor: ns-resize;
	}

	.components-inspector :global(.components-handle-edge-left) {
		left: -4px;
		top: 8px;
		bottom: 8px;
		width: 8px;
		cursor: ew-resize;
	}

	.components-inspector :global(.components-handle-edge-right) {
		right: -4px;
		top: 8px;
		bottom: 8px;
		width: 8px;
		cursor: ew-resize;
	}

	.components-inspector :global(.components-handle-corner) {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background: hsl(25 100% 55%);
		box-shadow:
			0 0 0 1.5px white,
			0 1px 4px hsl(0 0% 0% / 0.5);
		cursor: alias;
	}

	.components-inspector :global(.components-handle-corner-nw) {
		top: -6px;
		left: -6px;
	}

	.components-inspector :global(.components-handle-corner-ne) {
		top: -6px;
		right: -6px;
	}

	.components-inspector :global(.components-handle-corner-se) {
		bottom: -6px;
		right: -6px;
	}

	.components-inspector :global(.components-handle-corner-sw) {
		bottom: -6px;
		left: -6px;
	}

	@container dryui-feedback-root (max-width: 36rem) {
		.components-box[data-tooltip]::after,
		.components-box-selected[data-tooltip]::after,
		.components-inspector :global(.components-box[data-tooltip])::after {
			max-inline-size: min(240px, calc(100vw - 24px));
		}
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-edge-top) {
		top: -12px;
		left: 18px;
		right: 18px;
		height: 24px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-edge-bottom) {
		bottom: -12px;
		left: 18px;
		right: 18px;
		height: 24px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-edge-left) {
		left: -12px;
		top: 18px;
		bottom: 18px;
		width: 24px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-edge-right) {
		right: -12px;
		top: 18px;
		bottom: 18px;
		width: 24px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-corner) {
		width: 28px;
		height: 28px;
		border-radius: 6px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-corner-nw) {
		top: -14px;
		left: -14px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-corner-ne) {
		top: -14px;
		right: -14px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-corner-se) {
		bottom: -14px;
		right: -14px;
	}

	.components-inspector[data-coarse-pointer] :global(.components-handle-corner-sw) {
		bottom: -14px;
		left: -14px;
	}
</style>
