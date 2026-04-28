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

	type LayoutTool = 'insert-col' | 'insert-row' | 'remove-col' | 'remove-row';
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

	let removeDrag = $state<{
		pointerId: number;
		captureTarget: HTMLElement;
		grid: HTMLElement;
		shell: HTMLElement;
		axis: Axis;
		sourceIdx: number;
		startX: number;
		startY: number;
		moved: boolean;
		targetIdx: number | null;
	} | null>(null);

	const MIN_TRACK = 32;
	const HANDLE_THICKNESS = 12;
	const REMOVE_DRAG_THRESHOLD = 4;

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

	type Bp = 'base' | 'wide' | 'xl';
	type BpSnapshot = { containerBp: Bp; values: Map<string, string> };

	const bpPreviewSnapshots = new Map<HTMLElement, BpSnapshot>();

	function bpVarsFor(bp: Bp): string[] {
		return [columnsVar(bp), rowsVar(bp), areasVar(bp)];
	}

	function captureBpSnapshot(shell: HTMLElement, containerBp: Bp) {
		const values = new Map<string, string>();
		for (const v of bpVarsFor(containerBp)) {
			values.set(v, shell.style.getPropertyValue(v));
		}
		bpPreviewSnapshots.set(shell, { containerBp, values });
	}

	function restoreBpSnapshot(shell: HTMLElement) {
		const snap = bpPreviewSnapshots.get(shell);
		if (!snap) return;
		for (const [v, val] of snap.values) {
			if (val) shell.style.setProperty(v, val);
			else shell.style.removeProperty(v);
		}
		bpPreviewSnapshots.delete(shell);
	}

	function applyBpPreview(shell: HTMLElement) {
		const containerBp = activeBreakpoint(shell);
		const editing = editingBreakpoint;
		const noOverride = editing === 'auto' || editing === containerBp;
		if (noOverride) {
			restoreBpSnapshot(shell);
			return;
		}
		const existing = bpPreviewSnapshots.get(shell);
		if (existing && existing.containerBp !== containerBp) {
			restoreBpSnapshot(shell);
		}
		if (!bpPreviewSnapshots.has(shell)) {
			captureBpSnapshot(shell, containerBp);
		}
		const cs = getComputedStyle(shell);
		const sources = bpVarsFor(editing);
		const targets = bpVarsFor(containerBp);
		for (let i = 0; i < sources.length; i++) {
			const sv = sources[i]!;
			const tv = targets[i]!;
			if (sv === tv) continue;
			const value = cs.getPropertyValue(sv).trim();
			if (value) shell.style.setProperty(tv, value);
			else shell.style.removeProperty(tv);
		}
	}

	function refreshBpPreview() {
		const grids = document.querySelectorAll<HTMLElement>('[data-area-grid]');
		for (const grid of grids) {
			if (isInsideFeedback(grid)) continue;
			const shell = grid.closest<HTMLElement>('[data-area-grid-shell]');
			if (shell) applyBpPreview(shell);
		}
	}

	$effect(() => {
		void editingBreakpoint;
		untrack(refreshBpPreview);
	});

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

			if (hasAreas) {
				const colStarts: number[] = [rect.left];
				{
					let cx = rect.left;
					for (const w of cols) {
						cx += w;
						colStarts.push(cx);
					}
				}
				const rowStarts: number[] = [rect.top];
				{
					let cy = rect.top;
					for (const h of rows) {
						cy += h;
						rowStarts.push(cy);
					}
				}
				const wrappersByName = new Map<string, HTMLElement>();
				for (const child of Array.from(grid.children)) {
					if (!(child instanceof HTMLElement)) continue;
					const cname = getComputedStyle(child).getPropertyValue('--dry-grid-area-name').trim();
					if (!cname || cname === 'auto' || cname === '.') continue;
					if (!wrappersByName.has(cname)) wrappersByName.set(cname, child);
				}
				const areaBoxes = new Map<
					string,
					{ cMin: number; cMax: number; rMin: number; rMax: number }
				>();
				for (let r = 0; r < areaGrid.length; r++) {
					const row = areaGrid[r]!;
					for (let c = 0; c < row.length; c++) {
						const name = row[c]!;
						if (!name || name === '.') continue;
						const box = areaBoxes.get(name);
						if (!box) {
							areaBoxes.set(name, { cMin: c, cMax: c, rMin: r, rMax: r });
						} else {
							if (c < box.cMin) box.cMin = c;
							if (c > box.cMax) box.cMax = c;
							if (r < box.rMin) box.rMin = r;
							if (r > box.rMax) box.rMax = r;
						}
					}
				}
				for (const [name, box] of areaBoxes) {
					const wrapper = wrappersByName.get(name);
					const placeholderLabel = wrapper
						? wrapper.querySelector<HTMLElement>('[data-area-grid-placeholder] > span')
						: null;
					let bx: number;
					let by: number;
					let anchor: 'center' | 'topLeft';
					if (placeholderLabel) {
						const lr = placeholderLabel.getBoundingClientRect();
						if (lr.width < 4 || lr.height < 4) continue;
						hideLabel(placeholderLabel);
						bx = lr.left + lr.width / 2;
						by = lr.top + lr.height / 2;
						anchor = 'center';
					} else if (wrapper) {
						const measure = wrapper.firstElementChild as HTMLElement | null;
						const target = measure ?? wrapper;
						const cr = target.getBoundingClientRect();
						if (cr.width < 4 || cr.height < 4) continue;
						bx = cr.left + 8;
						by = cr.top + 8;
						anchor = 'topLeft';
					} else {
						const cMaxIdx = Math.min(box.cMax + 1, colStarts.length - 1);
						const rMaxIdx = Math.min(box.rMax + 1, rowStarts.length - 1);
						bx = (colStarts[box.cMin]! + colStarts[cMaxIdx]!) / 2;
						by = (rowStarts[box.rMin]! + rowStarts[rMaxIdx]!) / 2;
						anchor = 'center';
					}
					nextAreas.push({
						key: `${gridId}-area-${name}`,
						root: grid,
						shell,
						wrapper: wrapper ?? grid,
						name,
						x: bx,
						y: by,
						anchor
					});
				}
			} else {
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
			refreshBpPreview();
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

	function startRename(e: MouseEvent, area: Area) {
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

	function areasVar(bp: 'base' | 'wide' | 'xl'): string {
		if (bp === 'xl') return '--dry-area-grid-template-areas-xl';
		if (bp === 'wide') return '--dry-area-grid-template-areas-wide';
		return '--dry-area-grid-template-areas';
	}

	function uniqueAreaName(existing: Set<string>, prefix: string, startFrom: number): string {
		let i = startFrom;
		while (existing.has(`${prefix}-${i}`)) i++;
		return `${prefix}-${i}`;
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
				const allNames = new Set<string>();
				for (const prop of TEMPLATE_AREAS_PROPS) {
					const v = cs.getPropertyValue(prop).trim();
					if (!v || v === 'none') continue;
					for (const r of parseTemplateAreas(v)) for (const c of r) if (c !== '.') allNames.add(c);
				}
				for (const r of areaRows) for (const c of r) if (c !== '.') allNames.add(c);
				const newName = uniqueAreaName(allNames, 'area', 1);
				allNames.add(newName);

				if (axis === 'col') {
					const splitNames = new Set<string>();
					for (const row of areaRows) {
						const before = bestIdx > 0 ? row[bestIdx - 1] : undefined;
						const after = bestIdx < row.length ? row[bestIdx] : undefined;
						if (before !== undefined && after !== undefined && before === after && before !== '.') {
							splitNames.add(before);
						}
					}
					const renameMap = new Map<string, string>();
					for (const sn of splitNames) {
						const renamed = uniqueAreaName(allNames, sn, 2);
						renameMap.set(sn, renamed);
						allNames.add(renamed);
					}
					for (const row of areaRows) {
						for (let c = bestIdx; c < row.length; c++) {
							const cur = row[c]!;
							if (renameMap.has(cur)) row[c] = renameMap.get(cur)!;
						}
						row.splice(bestIdx, 0, newName);
					}
				} else {
					const colCount = areaRows[0]?.length ?? 1;
					const splitNames = new Set<string>();
					if (bestIdx > 0 && bestIdx < areaRows.length) {
						const above = areaRows[bestIdx - 1]!;
						const below = areaRows[bestIdx]!;
						for (let c = 0; c < colCount; c++) {
							const a = above[c];
							const b = below[c];
							if (a !== undefined && b !== undefined && a === b && a !== '.') {
								splitNames.add(a);
							}
						}
					}
					const renameMap = new Map<string, string>();
					for (const sn of splitNames) {
						const renamed = uniqueAreaName(allNames, sn, 2);
						renameMap.set(sn, renamed);
						allNames.add(renamed);
					}
					for (let r = bestIdx; r < areaRows.length; r++) {
						const row = areaRows[r]!;
						for (let c = 0; c < row.length; c++) {
							const cur = row[c]!;
							if (renameMap.has(cur)) row[c] = renameMap.get(cur)!;
						}
					}
					const newRow: string[] = new Array(colCount).fill(newName);
					areaRows.splice(bestIdx, 0, newRow);
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

	function collapseTrack(
		grid: HTMLElement,
		shell: HTMLElement,
		axis: Axis,
		sourceIdx: number,
		targetIdx: number
	) {
		if (sourceIdx === targetIdx) return;
		oncapture?.(shell);
		const cs = getComputedStyle(grid);
		const tracks = parseTrackList(axis === 'col' ? cs.gridTemplateColumns : cs.gridTemplateRows);
		if (tracks.length <= 1) return;
		if (sourceIdx < 0 || sourceIdx >= tracks.length) return;
		if (targetIdx < 0 || targetIdx >= tracks.length) return;
		// Hand the dragged track's size to the drop target, then drop the source.
		tracks[targetIdx] = tracks[targetIdx]! + tracks[sourceIdx]!;
		tracks.splice(sourceIdx, 1);
		const areaRows = parseTemplateAreas(cs.gridTemplateAreas);
		if (areaRows.length > 0) {
			if (axis === 'col') {
				for (const row of areaRows) {
					if (sourceIdx < row.length) row.splice(sourceIdx, 1);
				}
			} else if (sourceIdx < areaRows.length) {
				areaRows.splice(sourceIdx, 1);
			}
		}
		const bp = effectiveBreakpoint(shell);
		const trackProp = axis === 'col' ? columnsVar(bp) : rowsVar(bp);
		shell.style.setProperty(trackProp, tracks.map((n) => `${Math.round(n)}px`).join(' '));
		if (areaRows.length > 0) {
			shell.style.setProperty(areasVar(bp), serializeAreas(areaRows));
		}
		scheduleRebuild();
		oncommit?.();
	}

	function findTrackZoneAt(x: number, y: number): TrackRemove | null {
		for (const t of trackRemoves) {
			if (x >= t.zoneX && x <= t.zoneX + t.zoneW && y >= t.zoneY && y <= t.zoneY + t.zoneH) {
				return t;
			}
		}
		return null;
	}

	function startRemovePointer(e: PointerEvent, t: TrackRemove) {
		if (e.button !== 0) return;
		e.stopPropagation();
		const target = e.currentTarget as HTMLElement;
		removeDrag = {
			pointerId: e.pointerId,
			captureTarget: target,
			grid: t.root,
			shell: t.shell,
			axis: t.axis,
			sourceIdx: t.index,
			startX: e.clientX,
			startY: e.clientY,
			moved: false,
			targetIdx: null
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onRemoveMove);
		window.addEventListener('pointerup', endRemovePointer);
		window.addEventListener('pointercancel', endRemovePointer);
	}

	function onRemoveMove(e: PointerEvent) {
		if (!removeDrag || removeDrag.pointerId !== e.pointerId) return;
		if (!removeDrag.moved) {
			const dx = e.clientX - removeDrag.startX;
			const dy = e.clientY - removeDrag.startY;
			if (Math.hypot(dx, dy) < REMOVE_DRAG_THRESHOLD) return;
			removeDrag.moved = true;
			scrollLockRestore = lockPageScroll();
		}
		const zone = findTrackZoneAt(e.clientX, e.clientY);
		const valid =
			zone &&
			zone.root === removeDrag.grid &&
			zone.axis === removeDrag.axis &&
			zone.index !== removeDrag.sourceIdx;
		removeDrag.targetIdx = valid ? zone.index : null;
	}

	function endRemovePointer(e: PointerEvent) {
		if (!removeDrag || removeDrag.pointerId !== e.pointerId) return;
		const state = removeDrag;
		removeDrag = null;
		try {
			state.captureTarget.releasePointerCapture?.(e.pointerId);
		} catch {
			// already released
		}
		window.removeEventListener('pointermove', onRemoveMove);
		window.removeEventListener('pointerup', endRemovePointer);
		window.removeEventListener('pointercancel', endRemovePointer);
		if (state.moved) {
			scrollLockRestore?.();
			scrollLockRestore = null;
		}
		if (state.moved && state.targetIdx !== null) {
			collapseTrack(state.grid, state.shell, state.axis, state.sourceIdx, state.targetIdx);
		} else if (!state.moved) {
			removeTrack(state.grid, state.shell, state.axis, state.sourceIdx);
		}
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
			window.removeEventListener('pointermove', onRemoveMove);
			window.removeEventListener('pointerup', endRemovePointer);
			window.removeEventListener('pointercancel', endRemovePointer);
			scrollLockRestore?.();
			scrollLockRestore = null;
			restoreLabels();
			for (const shell of [...bpPreviewSnapshots.keys()]) restoreBpSnapshot(shell);
		};
	});
</script>

<div
	class="layout-inspector"
	data-dragging={dragging ? '' : undefined}
	data-collapse-dragging={removeDrag?.moved ? '' : undefined}
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
				onclick={(e) => startRename(e, a)}
			>
				{a.name}
			</button>
		{/if}
	{/each}

	{#each trackRemoves as t (t.key)}
		{#if (tool === 'remove-col' && t.axis === 'col') || (tool === 'remove-row' && t.axis === 'row')}
			{@const isSource =
				removeDrag?.moved &&
				removeDrag.grid === t.root &&
				removeDrag.axis === t.axis &&
				removeDrag.sourceIdx === t.index}
			{@const isTarget =
				removeDrag?.moved &&
				removeDrag.grid === t.root &&
				removeDrag.axis === t.axis &&
				removeDrag.targetIdx === t.index}
			<button
				class="layout-track-zone layout-track-remove-zone"
				data-axis={t.axis}
				data-source={isSource || undefined}
				data-target={isTarget || undefined}
				type="button"
				aria-label="Remove {t.axis === 'col' ? 'column' : 'row'} {t.index + 1}"
				style="left: {t.zoneX}px; top: {t.zoneY}px; width: {t.zoneW}px; height: {t.zoneH}px;"
				onpointerdown={(e) => startRemovePointer(e, t)}
				onclick={(e) => {
					if (e.detail !== 0) return;
					e.stopPropagation();
					removeTrack(t.root, t.shell, t.axis, t.index);
				}}
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
		z-index: 2;
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

	.layout-inspector:not([data-collapse-dragging]) .layout-track-remove-zone:hover,
	.layout-inspector:not([data-collapse-dragging]) .layout-track-remove-zone:focus-visible {
		background: hsl(0 75% 55% / 0.18);
		border-color: hsl(0 75% 60%);
		outline: none;
	}

	.layout-inspector[data-collapse-dragging] .layout-track-remove-zone {
		background: hsl(25 100% 55% / 0.06);
		border-color: hsl(25 100% 55% / 0.45);
		border-style: dashed;
	}

	.layout-track-remove-zone[data-source] {
		background: hsl(25 100% 55% / 0.32) !important;
		border-color: hsl(25 100% 55%) !important;
		border-style: solid !important;
		cursor: grabbing;
	}

	.layout-track-remove-zone[data-target] {
		background: hsl(145 60% 50% / 0.22) !important;
		border-color: hsl(145 65% 55%) !important;
		border-style: solid !important;
	}
</style>
