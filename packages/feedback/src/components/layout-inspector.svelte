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

	type Area = {
		key: string;
		root: HTMLElement;
		shell: HTMLElement;
		wrapper: HTMLElement;
		name: string;
		x: number;
		y: number;
		anchor: 'center' | 'topLeft';
	};

	interface Props {
		onclose: () => void;
		oncommit?: () => void;
		oncapture?: (el: HTMLElement) => void;
		oncapturelabel?: (el: HTMLElement) => void;
	}

	let { onclose, oncommit, oncapture, oncapturelabel }: Props = $props();

	let handles = $state<Handle[]>([]);
	let areas = $state<Area[]>([]);
	let editing = $state<{ area: Area; value: string } | null>(null);
	let editingInputEl = $state<HTMLInputElement | null>(null);
	const hiddenLabels = new Map<HTMLElement, string>();

	function hideLabel(span: HTMLElement) {
		if (hiddenLabels.has(span)) return;
		hiddenLabels.set(span, span.style.visibility);
		span.style.visibility = 'hidden';
	}

	function restoreLabels() {
		for (const [span, prev] of hiddenLabels) {
			span.style.visibility = prev;
		}
		hiddenLabels.clear();
	}

	$effect(() => {
		if (editingInputEl) {
			editingInputEl.focus();
			editingInputEl.select();
		}
	});
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
		const nextHandles: Handle[] = [];
		const nextAreas: Area[] = [];
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

			const gridId = (grid.dataset.dryuiFeedbackGridId ??= cryptoId());

			let cursorX = rect.left;
			for (let i = 0; i < cols.length - 1; i++) {
				cursorX += cols[i]!;
				nextHandles.push({
					key: `${gridId}-col-${i}`,
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
				nextHandles.push({
					key: `${gridId}-row-${i}`,
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

			const seen = new Set<string>();
			for (const child of Array.from(grid.children)) {
				if (!(child instanceof HTMLElement) && !(child instanceof Element)) continue;
				const wrapper = child as HTMLElement;
				const name = getComputedStyle(wrapper).getPropertyValue('--dry-grid-area-name').trim();
				if (!name || name === 'auto' || name === '.') continue;
				if (seen.has(name)) continue;
				seen.add(name);
				const placeholderLabel = wrapper.querySelector<HTMLElement>(
					'[data-area-grid-placeholder] > span'
				);
				if (placeholderLabel) {
					const lr = placeholderLabel.getBoundingClientRect();
					if (lr.width < 4 || lr.height < 4) continue;
					hideLabel(placeholderLabel);
					nextAreas.push({
						key: `${gridId}-area-${name}`,
						root: grid,
						shell,
						wrapper,
						name,
						x: lr.left + lr.width / 2,
						y: lr.top + lr.height / 2,
						anchor: 'center'
					});
				} else {
					const measure = wrapper.firstElementChild as HTMLElement | null;
					const target = measure ?? wrapper;
					const cr = target.getBoundingClientRect();
					if (cr.width < 4 || cr.height < 4) continue;
					nextAreas.push({
						key: `${gridId}-area-${name}`,
						root: grid,
						shell,
						wrapper,
						name,
						x: cr.left + 8,
						y: cr.top + 8,
						anchor: 'topLeft'
					});
				}
			}
		}
		handles = nextHandles;
		areas = nextAreas;
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

	const TEMPLATE_AREAS_PROPS = [
		'--dry-area-grid-template-areas',
		'--dry-area-grid-template-areas-wide',
		'--dry-area-grid-template-areas-xl'
	] as const;

	const VALID_AREA_NAME = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

	function startRename(area: Area, e: MouseEvent) {
		e.stopPropagation();
		editing = { area, value: area.name };
	}

	function cancelRename() {
		editing = null;
	}

	function commitRename() {
		const current = editing;
		if (!current) return;
		editing = null;
		const next = current.value.trim();
		if (!next || next === current.area.name) return;
		if (!VALID_AREA_NAME.test(next)) return;
		applyRename(current.area, next);
	}

	function applyRename(area: Area, next: string) {
		const oldName = area.name;
		oncapture?.(area.shell);

		// Update template-areas vars on the shell. Read effective value via cascade,
		// rewrite, then set inline on the shell.
		const cs = getComputedStyle(area.shell);
		for (const prop of TEMPLATE_AREAS_PROPS) {
			const current = cs.getPropertyValue(prop).trim();
			if (!current || current === 'none') continue;
			const rewritten = renameInTemplate(current, oldName, next);
			if (rewritten !== current) area.shell.style.setProperty(prop, rewritten);
		}

		// Update every wrapper in this grid that names the renamed area, plus any
		// placeholder label inside it so the new name persists when leaving Layout mode.
		for (const child of Array.from(area.root.children)) {
			if (!(child instanceof HTMLElement)) continue;
			const name = getComputedStyle(child).getPropertyValue('--dry-grid-area-name').trim();
			if (name !== oldName) continue;
			oncapture?.(child);
			child.style.setProperty('--dry-grid-area-name', next);
			const span = child.querySelector<HTMLElement>('[data-area-grid-placeholder] > span');
			if (span && span.textContent === oldName) {
				oncapturelabel?.(span);
				span.textContent = next;
			}
		}

		scheduleRebuild();
		oncommit?.();
	}

	function renameInTemplate(template: string, oldName: string, newName: string): string {
		return template.replace(/'([^']*)'/g, (_match, row) => {
			const tokens = row
				.split(/\s+/)
				.filter(Boolean)
				.map((t: string) => (t === oldName ? newName : t))
				.join(' ');
			return `'${tokens}'`;
		});
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
			restoreLabels();
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

	{#each areas as a (a.key)}
		{#if editing && editing.area.key === a.key}
			<input
				class="layout-area-input"
				type="text"
				data-anchor={a.anchor}
				aria-label="Rename area {a.name}"
				bind:value={editing.value}
				bind:this={editingInputEl}
				style="left: {a.x}px; top: {a.y}px;"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						commitRename();
					} else if (e.key === 'Escape') {
						e.preventDefault();
						cancelRename();
					}
				}}
				onblur={commitRename}
			/>
		{:else}
			<button
				class="layout-area-badge"
				type="button"
				data-anchor={a.anchor}
				aria-label="Rename area {a.name}"
				style="left: {a.x}px; top: {a.y}px;"
				onclick={(e) => startRename(a, e)}
			>
				{a.name}
			</button>
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

	.layout-area-badge,
	.layout-area-input {
		position: fixed;
		z-index: 1;
		margin: 0;
		padding: 2px 10px;
		border: 1px solid hsl(25 100% 55%);
		border-radius: 4px;
		background: hsl(225 15% 8%);
		color: hsl(25 100% 90%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1.25;
		text-transform: lowercase;
		pointer-events: auto;
		cursor: text;
	}

	.layout-area-badge[data-anchor='center'],
	.layout-area-input[data-anchor='center'] {
		transform: translate(-50%, -50%);
	}

	.layout-area-badge {
		font: inherit;
		text-transform: lowercase;
	}

	.layout-area-badge:hover,
	.layout-area-badge:focus-visible {
		background: hsl(25 100% 55% / 0.9);
		color: hsl(225 15% 8%);
		outline: none;
	}

	.layout-area-input {
		min-inline-size: 6ch;
		max-inline-size: 18ch;
		caret-color: hsl(25 100% 70%);
		outline: 2px solid hsl(25 100% 55%);
		outline-offset: 0;
	}
</style>
