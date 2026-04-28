<script lang="ts">
	import { onMount } from 'svelte';

	type Axis = 'col' | 'row';

	type Handle = {
		key: string;
		root: HTMLElement;
		shell: HTMLElement;
		axis: Axis;
		index: number;
		x: number;
		y: number;
		w: number;
		h: number;
	};

	interface Props {
		onclose: () => void;
		oncommit?: () => void;
		oncapture?: (shell: HTMLElement) => void;
	}

	let { onclose, oncommit, oncapture }: Props = $props();

	let handles = $state<Handle[]>([]);
	let dragging = $state<{
		handle: Handle;
		pointerId: number;
		captureTarget: HTMLElement;
		shell: HTMLElement;
		axis: Axis;
		index: number;
		startPointerCoord: number;
		startSizes: number[];
		breakpoint: 'base' | 'wide' | 'xl';
		minBefore: number;
		maxBefore: number;
	} | null>(null);

	const MIN_TRACK = 32;
	const HANDLE_THICKNESS = 12;

	let scrollLockRestore: (() => void) | null = null;

	function lockPageScroll(): () => void {
		const html = document.documentElement;
		const hadScrollbar = window.innerWidth - html.clientWidth > 0;
		const prevOverflow = html.style.overflow;
		const prevGutter = html.style.scrollbarGutter;
		html.style.overflow = 'hidden';
		if (hadScrollbar) html.style.scrollbarGutter = 'stable';
		return () => {
			html.style.overflow = prevOverflow;
			html.style.scrollbarGutter = prevGutter;
		};
	}

	function isInsideFeedback(el: Element): boolean {
		return !!el.closest('[data-dryui-feedback]');
	}

	function parseTrackList(value: string): number[] {
		const trimmed = value.trim();
		if (!trimmed || trimmed === 'none') return [];
		const tracks: number[] = [];
		let depth = 0;
		let buf = '';
		for (const ch of trimmed) {
			if (ch === '(') depth++;
			else if (ch === ')') depth--;
			if ((ch === ' ' || ch === '\t') && depth === 0) {
				if (buf) {
					const n = parseFloat(buf);
					if (Number.isFinite(n)) tracks.push(n);
					buf = '';
				}
				continue;
			}
			buf += ch;
		}
		if (buf) {
			const n = parseFloat(buf);
			if (Number.isFinite(n)) tracks.push(n);
		}
		return tracks;
	}

	function activeBreakpoint(shell: HTMLElement): 'base' | 'wide' | 'xl' {
		const width = shell.getBoundingClientRect().width;
		if (width >= 1024) return 'xl';
		if (width >= 720) return 'wide';
		return 'base';
	}

	function columnsVar(bp: 'base' | 'wide' | 'xl'): string {
		if (bp === 'xl') return '--dry-area-grid-template-columns-xl';
		if (bp === 'wide') return '--dry-area-grid-template-columns-wide';
		return '--dry-area-grid-template-columns';
	}

	function rowsVar(bp: 'base' | 'wide' | 'xl'): string {
		if (bp === 'xl') return '--dry-area-grid-template-rows-xl';
		if (bp === 'wide') return '--dry-area-grid-template-rows-wide';
		return '--dry-area-grid-template-rows';
	}

	function rebuild() {
		const next: Handle[] = [];
		const grids = document.querySelectorAll<HTMLElement>('[data-area-grid]');
		for (const grid of grids) {
			if (isInsideFeedback(grid)) continue;
			const shell = grid.closest<HTMLElement>('[data-area-grid-shell]');
			if (!shell) continue;
			const cs = getComputedStyle(grid);
			const cols = parseTrackList(cs.gridTemplateColumns);
			const rows = parseTrackList(cs.gridTemplateRows);
			const rect = grid.getBoundingClientRect();
			if (rect.width < 4 || rect.height < 4) continue;

			let cursorX = rect.left;
			for (let i = 0; i < cols.length - 1; i++) {
				cursorX += cols[i]!;
				next.push({
					key: `${(grid.dataset.dryuiFeedbackGridId ??= cryptoId())}-col-${i}`,
					root: grid,
					shell,
					axis: 'col',
					index: i,
					x: cursorX - HANDLE_THICKNESS / 2,
					y: rect.top,
					w: HANDLE_THICKNESS,
					h: rect.height
				});
			}
			let cursorY = rect.top;
			for (let i = 0; i < rows.length - 1; i++) {
				cursorY += rows[i]!;
				next.push({
					key: `${(grid.dataset.dryuiFeedbackGridId ??= cryptoId())}-row-${i}`,
					root: grid,
					shell,
					axis: 'row',
					index: i,
					x: rect.left,
					y: cursorY - HANDLE_THICKNESS / 2,
					w: rect.width,
					h: HANDLE_THICKNESS
				});
			}
		}
		handles = next;
	}

	function cryptoId(): string {
		return Math.random().toString(36).slice(2, 10);
	}

	function handleStyle(h: Handle): string {
		return `left: ${h.x}px; top: ${h.y}px; width: ${h.w}px; height: ${h.h}px;`;
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
			onclose();
		}
	}

	function startDrag(e: PointerEvent, h: Handle) {
		e.stopPropagation();
		e.preventDefault();
		oncapture?.(h.shell);
		scrollLockRestore = lockPageScroll();
		const target = e.currentTarget as HTMLElement;
		const cs = getComputedStyle(h.root);
		const sizes =
			h.axis === 'col'
				? parseTrackList(cs.gridTemplateColumns)
				: parseTrackList(cs.gridTemplateRows);
		if (sizes.length < 2) return;
		const before = sizes[h.index]!;
		const after = sizes[h.index + 1]!;
		dragging = {
			handle: h,
			pointerId: e.pointerId,
			captureTarget: target,
			shell: h.shell,
			axis: h.axis,
			index: h.index,
			startPointerCoord: h.axis === 'col' ? e.clientX : e.clientY,
			startSizes: sizes,
			breakpoint: activeBreakpoint(h.shell),
			minBefore: -(before - MIN_TRACK),
			maxBefore: after - MIN_TRACK
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer may not be capturable
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	function onMove(e: PointerEvent) {
		if (!dragging || dragging.pointerId !== e.pointerId) return;
		const coord = dragging.axis === 'col' ? e.clientX : e.clientY;
		const rawDelta = coord - dragging.startPointerCoord;
		const delta = Math.max(dragging.minBefore, Math.min(dragging.maxBefore, rawDelta));
		const sizes = [...dragging.startSizes];
		sizes[dragging.index] = sizes[dragging.index]! + delta;
		sizes[dragging.index + 1] = sizes[dragging.index + 1]! - delta;
		const serialized = sizes.map((px) => `${Math.round(px)}px`).join(' ');
		const prop =
			dragging.axis === 'col' ? columnsVar(dragging.breakpoint) : rowsVar(dragging.breakpoint);
		dragging.shell.style.setProperty(prop, serialized);
		scheduleRebuild();
	}

	function endDrag(e: PointerEvent) {
		if (!dragging || dragging.pointerId !== e.pointerId) return;
		try {
			dragging.captureTarget.releasePointerCapture?.(e.pointerId);
		} catch {
			// already released
		}
		dragging = null;
		scrollLockRestore?.();
		scrollLockRestore = null;
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', endDrag);
		window.removeEventListener('pointercancel', endDrag);
		oncommit?.();
	}

	onMount(() => {
		rebuild();
		const ro = new ResizeObserver(scheduleRebuild);
		ro.observe(document.body);
		const mo = new MutationObserver(scheduleRebuild);
		mo.observe(document.body, { childList: true, subtree: true, attributes: true });
		window.addEventListener('scroll', scheduleRebuild, true);
		window.addEventListener('resize', scheduleRebuild);
		window.addEventListener('keydown', handleKey, true);
		return () => {
			if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
			ro.disconnect();
			mo.disconnect();
			window.removeEventListener('scroll', scheduleRebuild, true);
			window.removeEventListener('resize', scheduleRebuild);
			window.removeEventListener('keydown', handleKey, true);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', endDrag);
			window.removeEventListener('pointercancel', endDrag);
			scrollLockRestore?.();
			scrollLockRestore = null;
		};
	});
</script>

<div class="layout-inspector" data-dragging={dragging ? '' : undefined} role="presentation">
	{#each handles as h (h.key)}
		<button
			class="layout-handle"
			data-axis={h.axis}
			type="button"
			aria-label="Resize {h.axis === 'col' ? 'column' : 'row'} {h.index + 1}"
			style={handleStyle(h)}
			onpointerdown={(e) => startDrag(e, h)}
		></button>
	{/each}
</div>

<style>
	.layout-inspector {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	.layout-handle {
		position: fixed;
		padding: 0;
		margin: 0;
		border: none;
		background: hsl(25 100% 55% / 0.18);
		pointer-events: auto;
		touch-action: none;
		font: inherit;
		color: inherit;
		min-height: 0;
		box-shadow: none;
		transition:
			background 0.12s ease-out,
			outline-color 0.12s ease-out;
		outline: 2px solid hsl(25 100% 55% / 0);
		outline-offset: -1px;
	}

	.layout-handle[data-axis='col'] {
		cursor: col-resize;
	}

	.layout-handle[data-axis='row'] {
		cursor: row-resize;
	}

	.layout-handle:hover,
	.layout-handle:focus-visible,
	.layout-inspector[data-dragging] .layout-handle {
		background: hsl(25 100% 55% / 0.5);
		outline-color: hsl(25 100% 55%);
	}
</style>
