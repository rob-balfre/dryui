<script lang="ts">
	import { onMount, untrack } from 'svelte';

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

	type TrackRemove = {
		key: string;
		root: HTMLElement;
		shell: HTMLElement;
		axis: Axis;
		index: number;
		zoneX: number;
		zoneY: number;
		zoneW: number;
		zoneH: number;
	};

	type LayoutTool = 'insert-col' | 'insert-row' | 'remove-col' | 'remove-row' | 'swap';
	type EditingBp = 'auto' | 'base' | 'wide' | 'xl';

	interface Props {
		tool?: LayoutTool | null;
		breakpoint?: EditingBp;
		onclose: () => void;
		ontool?: (next: LayoutTool | null) => void;
		oncommit?: () => void;
		oncapture?: (el: HTMLElement) => void;
		oncapturelabel?: (el: HTMLElement) => void;
	}

	let {
		tool = null,
		breakpoint = 'auto',
		onclose,
		ontool,
		oncommit,
		oncapture,
		oncapturelabel
	}: Props = $props();

	const editingBreakpoint = $derived(breakpoint);
	let handles = $state<Handle[]>([]);
	let areas = $state<Area[]>([]);
	let trackRemoves = $state<TrackRemove[]>([]);
	let editing = $state<{ area: Area; value: string } | null>(null);
	let editingInputEl = $state<HTMLInputElement | null>(null);
	let areaDragGhost = $state<{ name: string; x: number; y: number } | null>(null);
	let areaPointer: {
		area: Area;
		pointerId: number;
		startX: number;
		startY: number;
		dragging: boolean;
	} | null = null;
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

	function parseTemplateAreas(value: string): string[][] {
		const trimmed = value.trim();
		if (!trimmed || trimmed === 'none') return [];
		const rows: string[][] = [];
		const re = /"([^"]*)"/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(trimmed)) !== null) {
			rows.push(m[1]!.trim().split(/\s+/));
		}
		return rows;
	}

	function parseTrackTokens(value: string): string[] {
		const trimmed = value.trim();
		if (!trimmed || trimmed === 'none') return [];
		const tokens: string[] = [];
		let depth = 0;
		let buf = '';
		for (const ch of trimmed) {
			if (ch === '(') depth++;
			else if (ch === ')') depth--;
			if ((ch === ' ' || ch === '\t') && depth === 0) {
				if (buf) {
					tokens.push(buf);
					buf = '';
				}
				continue;
			}
			buf += ch;
		}
		if (buf) tokens.push(buf);
		return tokens;
	}

	function serializeAreas(rows: string[][]): string {
		return rows.map((r) => `'${r.join(' ')}'`).join(' ');
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

	function effectiveBreakpoint(shell: HTMLElement): 'base' | 'wide' | 'xl' {
		return editingBreakpoint === 'auto' ? activeBreakpoint(shell) : editingBreakpoint;
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

	function colSeamSegments(
		areaGrid: string[][],
		rowSizes: number[],
		seamCol: number,
		gridTop: number
	): { y: number; h: number }[] {
		const segments: { y: number; h: number }[] = [];
		let segStart: number | null = null;
		let cursorY = gridTop;
		for (let r = 0; r < areaGrid.length; r++) {
			const row = areaGrid[r]!;
			const rowH = rowSizes[r] ?? 0;
			const left = row[seamCol];
			const right = row[seamCol + 1];
			const seamReal = left !== right;
			if (seamReal && segStart === null) segStart = cursorY;
			if (!seamReal && segStart !== null) {
				segments.push({ y: segStart, h: cursorY - segStart });
				segStart = null;
			}
			cursorY += rowH;
		}
		if (segStart !== null) segments.push({ y: segStart, h: cursorY - segStart });
		return segments;
	}

	function rowSeamSegments(
		areaGrid: string[][],
		colSizes: number[],
		seamRow: number,
		gridLeft: number
	): { x: number; w: number }[] {
		const segments: { x: number; w: number }[] = [];
		const above = areaGrid[seamRow];
		const below = areaGrid[seamRow + 1];
		if (!above || !below) return segments;
		let segStart: number | null = null;
		let cursorX = gridLeft;
		const cols = Math.max(above.length, below.length);
		for (let c = 0; c < cols; c++) {
			const colW = colSizes[c] ?? 0;
			const top = above[c];
			const bottom = below[c];
			const seamReal = top !== bottom;
			if (seamReal && segStart === null) segStart = cursorX;
			if (!seamReal && segStart !== null) {
				segments.push({ x: segStart, w: cursorX - segStart });
				segStart = null;
			}
			cursorX += colW;
		}
		if (segStart !== null) segments.push({ x: segStart, w: cursorX - segStart });
		return segments;
	}

	function rebuild() {
		const nextHandles: Handle[] = [];
		const nextAreas: Area[] = [];
		const nextRemoves: TrackRemove[] = [];
		const grids = document.querySelectorAll<HTMLElement>('[data-area-grid]');
		for (const grid of grids) {
			if (isInsideFeedback(grid)) continue;
			const shell = grid.closest<HTMLElement>('[data-area-grid-shell]');
			if (!shell) continue;
			const cs = getComputedStyle(grid);
			const cols = parseTrackList(cs.gridTemplateColumns);
			const rows = parseTrackList(cs.gridTemplateRows);
			const areaGrid = parseTemplateAreas(cs.gridTemplateAreas);
			const rect = grid.getBoundingClientRect();
			if (rect.width < 4 || rect.height < 4) continue;

			const gridId = (grid.dataset.dryuiFeedbackGridId ??= cryptoId());
			const hasAreas = areaGrid.length > 0;

			// Column seams: only render where the template-areas row to either side
			// of the seam names a different area. If the grid has no areas at all,
			// fall back to one full-height segment per seam.
			let cursorX = rect.left;
			for (let i = 0; i < cols.length - 1; i++) {
				cursorX += cols[i]!;
				const seamX = cursorX;
				const segments = hasAreas
					? colSeamSegments(areaGrid, rows, i, rect.top)
					: [{ y: rect.top, h: rect.height }];
				for (let s = 0; s < segments.length; s++) {
					const seg = segments[s]!;
					nextHandles.push({
						key: `${gridId}-col-${i}-${s}`,
						root: grid,
						shell,
						axis: 'col',
						index: i,
						x: seamX - HANDLE_THICKNESS / 2,
						y: seg.y,
						w: HANDLE_THICKNESS,
						h: seg.h
					});
				}
			}

			let cursorY = rect.top;
			for (let i = 0; i < rows.length - 1; i++) {
				cursorY += rows[i]!;
				const seamY = cursorY;
				const segments = hasAreas
					? rowSeamSegments(areaGrid, cols, i, rect.left)
					: [{ x: rect.left, w: rect.width }];
				for (let s = 0; s < segments.length; s++) {
					const seg = segments[s]!;
					nextHandles.push({
						key: `${gridId}-row-${i}-${s}`,
						root: grid,
						shell,
						axis: 'row',
						index: i,
						x: seg.x,
						y: seamY - HANDLE_THICKNESS / 2,
						w: seg.w,
						h: HANDLE_THICKNESS
					});
				}
			}

			// Remove zones: full-track click area covering the column / row.
			let cx = rect.left;
			for (let i = 0; i < cols.length; i++) {
				const w = cols[i]!;
				if (cols.length > 1) {
					nextRemoves.push({
						key: `${gridId}-rm-col-${i}`,
						root: grid,
						shell,
						axis: 'col',
						index: i,
						zoneX: cx,
						zoneY: rect.top,
						zoneW: w,
						zoneH: rect.height
					});
				}
				cx += w;
			}
			let cy = rect.top;
			for (let i = 0; i < rows.length; i++) {
				const h = rows[i]!;
				if (rows.length > 1) {
					nextRemoves.push({
						key: `${gridId}-rm-row-${i}`,
						root: grid,
						shell,
						axis: 'row',
						index: i,
						zoneX: rect.left,
						zoneY: cy,
						zoneW: rect.width,
						zoneH: h
					});
				}
				cy += h;
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
		trackRemoves = nextRemoves;
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
			if (tool) {
				ontool?.(null);
				return;
			}
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
			breakpoint: effectiveBreakpoint(h.shell),
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

	const AREA_DRAG_THRESHOLD = 4;

	function startAreaPointer(e: PointerEvent, area: Area) {
		e.stopPropagation();
		areaPointer = {
			area,
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			dragging: false
		};
		window.addEventListener('pointermove', onAreaMove);
		window.addEventListener('pointerup', endAreaPointer);
		window.addEventListener('pointercancel', endAreaPointer);
	}

	function onAreaMove(e: PointerEvent) {
		if (!areaPointer || areaPointer.pointerId !== e.pointerId) return;
		const dx = e.clientX - areaPointer.startX;
		const dy = e.clientY - areaPointer.startY;
		if (!areaPointer.dragging) {
			if (Math.hypot(dx, dy) < AREA_DRAG_THRESHOLD) return;
			areaPointer.dragging = true;
		}
		areaDragGhost = { name: areaPointer.area.name, x: e.clientX + 12, y: e.clientY + 12 };
	}

	function endAreaPointer(e: PointerEvent) {
		if (!areaPointer || areaPointer.pointerId !== e.pointerId) return;
		const wasDragging = areaPointer.dragging;
		const startedFrom = areaPointer.area;
		areaPointer = null;
		areaDragGhost = null;
		window.removeEventListener('pointermove', onAreaMove);
		window.removeEventListener('pointerup', endAreaPointer);
		window.removeEventListener('pointercancel', endAreaPointer);
		if (!wasDragging) {
			editing = { area: startedFrom, value: startedFrom.name };
			return;
		}
		const dropEl = document.elementFromPoint(e.clientX, e.clientY);
		const dropBadge = dropEl?.closest<HTMLButtonElement>('.layout-area-badge');
		if (!dropBadge) return;
		const dropName = dropBadge.textContent?.trim();
		if (!dropName || dropName === startedFrom.name) return;
		swapAreas(startedFrom.root, startedFrom.shell, startedFrom.name, dropName);
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

	function areasVar(bp: 'base' | 'wide' | 'xl'): string {
		if (bp === 'xl') return '--dry-area-grid-template-areas-xl';
		if (bp === 'wide') return '--dry-area-grid-template-areas-wide';
		return '--dry-area-grid-template-areas';
	}

	function insertCenterTrack(axis: Axis) {
		const grids = document.querySelectorAll<HTMLElement>('[data-area-grid]');
		let mutated = false;
		for (const grid of grids) {
			if (isInsideFeedback(grid)) continue;
			const shell = grid.closest<HTMLElement>('[data-area-grid-shell]');
			if (!shell) continue;
			const cs = getComputedStyle(grid);
			const trackStr = axis === 'col' ? cs.gridTemplateColumns : cs.gridTemplateRows;
			const tracks = parseTrackList(trackStr);
			if (tracks.length === 0) continue;

			oncapture?.(shell);

			// Pick the seam closest to the grid's visual midpoint instead of the
			// midpoint by track count, so repeated inserts on grids with uneven
			// tracks don't pile up at the same x.
			const total = tracks.reduce((a, b) => a + b, 0);
			const target = total / 2;
			let cumulative = 0;
			let bestIdx = 1;
			let bestDist = Infinity;
			for (let i = 1; i < tracks.length; i++) {
				cumulative += tracks[i - 1]!;
				const dist = Math.abs(cumulative - target);
				if (dist < bestDist) {
					bestDist = dist;
					bestIdx = i;
				}
			}
			if (tracks.length === 1) bestIdx = 1; // append after the only track

			// Carve room for the new track out of the largest existing one so the
			// new column/row is actually visible (otherwise a 1fr in a fully
			// fixed-px grid resolves to 0).
			let largestIdx = 0;
			for (let i = 1; i < tracks.length; i++) {
				if (tracks[i]! > tracks[largestIdx]!) largestIdx = i;
			}
			const newSize = Math.min(240, Math.max(96, tracks[largestIdx]! / 3));
			if (tracks[largestIdx]! > newSize + 64) {
				tracks[largestIdx] = tracks[largestIdx]! - newSize;
			}
			tracks.splice(bestIdx, 0, newSize);

			const areaRows = parseTemplateAreas(cs.gridTemplateAreas);
			if (areaRows.length > 0) {
				if (axis === 'col') {
					for (const row of areaRows) {
						const at = Math.max(0, Math.min(row.length, bestIdx));
						const before = at > 0 ? row[at - 1] : undefined;
						const after = at < row.length ? row[at] : undefined;
						const fill =
							before !== undefined && after !== undefined && before === after && before !== '.'
								? before
								: '.';
						row.splice(at, 0, fill);
					}
				} else {
					const colCount = areaRows[0]?.length ?? 1;
					const at = Math.max(0, Math.min(areaRows.length, bestIdx));
					const above = at > 0 ? areaRows[at - 1] : undefined;
					const below = at < areaRows.length ? areaRows[at] : undefined;
					const newRow: string[] = [];
					for (let c = 0; c < colCount; c++) {
						const a = above?.[c];
						const b = below?.[c];
						newRow.push(a !== undefined && b !== undefined && a === b && a !== '.' ? a : '.');
					}
					areaRows.splice(at, 0, newRow);
				}
			}

			const bp = effectiveBreakpoint(shell);
			const trackProp = axis === 'col' ? columnsVar(bp) : rowsVar(bp);
			shell.style.setProperty(trackProp, tracks.map((n) => `${Math.round(n)}px`).join(' '));
			if (areaRows.length > 0) {
				shell.style.setProperty(areasVar(bp), serializeAreas(areaRows));
			}
			mutated = true;
		}
		if (mutated) {
			scheduleRebuild();
			oncommit?.();
		}
	}

	$effect(() => {
		const t = tool;
		if (t !== 'insert-col' && t !== 'insert-row') return;
		untrack(() => {
			insertCenterTrack(t === 'insert-col' ? 'col' : 'row');
			ontool?.(null);
		});
	});

	function removeTrack(grid: HTMLElement, shell: HTMLElement, axis: Axis, index: number) {
		oncapture?.(shell);
		const cs = getComputedStyle(grid);
		const tracks = parseTrackTokens(axis === 'col' ? cs.gridTemplateColumns : cs.gridTemplateRows);
		if (index < 0 || index >= tracks.length || tracks.length <= 1) return;
		tracks.splice(index, 1);
		const areaRows = parseTemplateAreas(cs.gridTemplateAreas);
		if (areaRows.length > 0) {
			if (axis === 'col') {
				for (const row of areaRows) {
					if (index < row.length) row.splice(index, 1);
				}
			} else if (index < areaRows.length) {
				areaRows.splice(index, 1);
			}
		}
		const bp = effectiveBreakpoint(shell);
		const trackProp = axis === 'col' ? columnsVar(bp) : rowsVar(bp);
		shell.style.setProperty(trackProp, tracks.join(' '));
		if (areaRows.length > 0) {
			shell.style.setProperty(areasVar(bp), serializeAreas(areaRows));
		}
		scheduleRebuild();
		oncommit?.();
	}

	function swapAreas(grid: HTMLElement, shell: HTMLElement, name1: string, name2: string) {
		if (name1 === name2) return;
		oncapture?.(shell);
		const cs = getComputedStyle(shell);
		for (const prop of TEMPLATE_AREAS_PROPS) {
			const current = cs.getPropertyValue(prop).trim();
			if (!current || current === 'none') continue;
			const swapped = current.replace(/'([^']*)'/g, (_match, row) => {
				const tokens = row
					.split(/\s+/)
					.filter(Boolean)
					.map((t: string) => {
						if (t === name1) return name2;
						if (t === name2) return name1;
						return t;
					})
					.join(' ');
				return `'${tokens}'`;
			});
			if (swapped !== current) shell.style.setProperty(prop, swapped);
		}
		for (const child of Array.from(grid.children)) {
			if (!(child instanceof HTMLElement)) continue;
			const name = getComputedStyle(child).getPropertyValue('--dry-grid-area-name').trim();
			if (name !== name1 && name !== name2) continue;
			oncapture?.(child);
			child.style.setProperty('--dry-grid-area-name', name === name1 ? name2 : name1);
			const span = child.querySelector<HTMLElement>('[data-area-grid-placeholder] > span');
			if (span) {
				const txt = span.textContent ?? '';
				if (txt === name1 || txt === name2) {
					oncapturelabel?.(span);
					span.textContent = txt === name1 ? name2 : name1;
				}
			}
		}
		scheduleRebuild();
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
			window.removeEventListener('pointermove', onAreaMove);
			window.removeEventListener('pointerup', endAreaPointer);
			window.removeEventListener('pointercancel', endAreaPointer);
			scrollLockRestore?.();
			scrollLockRestore = null;
			restoreLabels();
		};
	});
</script>

<div
	class="layout-inspector"
	data-dragging={dragging ? '' : undefined}
	data-tool={tool ?? undefined}
	role="presentation"
>
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
				onpointerdown={(e) => startAreaPointer(e, a)}
			>
				{a.name}
			</button>
		{/if}
	{/each}

	{#each trackRemoves as t (t.key)}
		{#if (tool === 'remove-col' && t.axis === 'col') || (tool === 'remove-row' && t.axis === 'row')}
			<button
				class="layout-track-zone layout-track-remove-zone"
				data-axis={t.axis}
				type="button"
				aria-label="Remove {t.axis === 'col' ? 'column' : 'row'} {t.index + 1}"
				style="left: {t.zoneX}px; top: {t.zoneY}px; width: {t.zoneW}px; height: {t.zoneH}px;"
				onclick={(e) => {
					e.stopPropagation();
					removeTrack(t.root, t.shell, t.axis, t.index);
				}}
			></button>
		{/if}
	{/each}

	{#if areaDragGhost}
		<div class="layout-area-ghost" style="left: {areaDragGhost.x}px; top: {areaDragGhost.y}px;">
			{areaDragGhost.name}
		</div>
	{/if}
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

	.layout-track-zone {
		position: fixed;
		z-index: 1;
		margin: 0;
		padding: 0;
		border: 1px dashed hsl(25 100% 55% / 0);
		background: hsl(25 100% 55% / 0);
		cursor: pointer;
		pointer-events: auto;
		transition:
			background 0.12s ease-out,
			border-color 0.12s ease-out;
	}

	.layout-track-remove-zone:hover,
	.layout-track-remove-zone:focus-visible {
		background: hsl(0 75% 55% / 0.18);
		border-color: hsl(0 75% 60%);
		outline: none;
	}

	.layout-area-ghost {
		position: fixed;
		z-index: 2;
		padding: 2px 10px;
		border: 1px solid hsl(25 100% 55%);
		border-radius: 4px;
		background: hsl(25 100% 55% / 0.9);
		color: hsl(225 15% 8%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: lowercase;
		pointer-events: none;
	}
</style>
