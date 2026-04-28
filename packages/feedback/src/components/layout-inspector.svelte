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

	type LayoutTool = 'box';
	type EditingBp = 'auto' | 'base' | 'wide' | 'xl';

	export type LayoutBox = {
		id: string;
		label: string;
		pageX: number;
		pageY: number;
		width: number;
		height: number;
	};

	type BoxCorner = 'nw' | 'ne' | 'sw' | 'se';

	type BoxOp =
		| {
				kind: 'draw';
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				label: string;
				originPageX: number;
				originPageY: number;
				currentPageX: number;
				currentPageY: number;
		  }
		| {
				kind: 'move';
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				startPointerPageX: number;
				startPointerPageY: number;
				currentPointerPageX: number;
				currentPointerPageY: number;
				origin: LayoutBox;
		  }
		| {
				kind: 'resize';
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				corner: BoxCorner;
				startPointerPageX: number;
				startPointerPageY: number;
				currentPointerPageX: number;
				currentPointerPageY: number;
				origin: LayoutBox;
		  };

	interface Props {
		tool?: LayoutTool | null;
		breakpoint?: EditingBp;
		boxes?: LayoutBox[];
		capturing?: boolean;
		onclose: () => void;
		ontool?: (next: LayoutTool | null) => void;
		oncommit?: () => void;
		oncapture?: (el: HTMLElement) => void;
		oncapturelabel?: (el: HTMLElement) => void;
		onboxesapply?: (next: LayoutBox[]) => void;
		onboxescommit?: (next: LayoutBox[]) => void;
	}

	let {
		tool = null,
		breakpoint = 'auto',
		boxes = [],
		capturing = false,
		onclose,
		ontool,
		oncommit,
		oncapture,
		oncapturelabel,
		onboxesapply,
		onboxescommit
	}: Props = $props();

	const editingBreakpoint = $derived(breakpoint);
	let handles = $state<Handle[]>([]);
	let areas = $state<Area[]>([]);
	let editing = $state<{ area: Area; value: string } | null>(null);
	let editingInputEl = $state<HTMLInputElement | null>(null);
	const hiddenLabels = new Map<HTMLElement, string>();

	let boxOp = $state<BoxOp | null>(null);
	let editingBox = $state<{ id: string; value: string } | null>(null);
	let editingBoxInputEl = $state<HTMLInputElement | null>(null);
	let viewScrollX = $state(0);
	let viewScrollY = $state(0);

	const MIN_BOX_SIZE = 12;
	const BOX_DRAG_THRESHOLD = 3;

	function syncScroll() {
		viewScrollX = window.scrollX;
		viewScrollY = window.scrollY;
	}

	function nextBoxLabel(existing: LayoutBox[]): string {
		const used = new Set(existing.map((b) => b.label));
		let i = 1;
		while (used.has(`box-${i}`)) i++;
		return `box-${i}`;
	}

	function normalizeDraft(op: BoxOp & { kind: 'draw' }): LayoutBox {
		const x = Math.min(op.originPageX, op.currentPageX);
		const y = Math.min(op.originPageY, op.currentPageY);
		const w = Math.abs(op.currentPageX - op.originPageX);
		const h = Math.abs(op.currentPageY - op.originPageY);
		return { id: op.id, label: op.label, pageX: x, pageY: y, width: w, height: h };
	}

	function transformedBox(origin: LayoutBox, op: BoxOp & { kind: 'move' | 'resize' }): LayoutBox {
		const dx = op.currentPointerPageX - op.startPointerPageX;
		const dy = op.currentPointerPageY - op.startPointerPageY;
		if (op.kind === 'move') {
			return { ...origin, pageX: origin.pageX + dx, pageY: origin.pageY + dy };
		}
		let { pageX, pageY, width, height } = origin;
		if (op.corner === 'nw') {
			pageX = origin.pageX + dx;
			pageY = origin.pageY + dy;
			width = origin.width - dx;
			height = origin.height - dy;
		} else if (op.corner === 'ne') {
			pageY = origin.pageY + dy;
			width = origin.width + dx;
			height = origin.height - dy;
		} else if (op.corner === 'sw') {
			pageX = origin.pageX + dx;
			width = origin.width - dx;
			height = origin.height + dy;
		} else {
			width = origin.width + dx;
			height = origin.height + dy;
		}
		// Allow flipping: if width/height go negative, flip the rect across the dragged axis.
		if (width < 0) {
			pageX = pageX + width;
			width = -width;
		}
		if (height < 0) {
			pageY = pageY + height;
			height = -height;
		}
		return { ...origin, pageX, pageY, width, height };
	}

	const renderedBoxes = $derived.by<LayoutBox[]>(() => {
		const op = boxOp;
		if (!op) return boxes;
		if (op.kind === 'draw') {
			return [...boxes, normalizeDraft(op)];
		}
		return boxes.map((b) => (b.id === op.id ? transformedBox(op.origin, op) : b));
	});

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

	function areasVar(bp: 'base' | 'wide' | 'xl'): string {
		if (bp === 'xl') return '--dry-area-grid-template-areas-xl';
		if (bp === 'wide') return '--dry-area-grid-template-areas-wide';
		return '--dry-area-grid-template-areas';
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

		const cs = getComputedStyle(area.shell);
		for (const prop of TEMPLATE_AREAS_PROPS) {
			const current = cs.getPropertyValue(prop).trim();
			if (!current || current === 'none') continue;
			const rewritten = renameInTemplate(current, oldName, next);
			if (rewritten !== current) area.shell.style.setProperty(prop, rewritten);
		}

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

	function startBoxDraw(e: PointerEvent) {
		if (tool !== 'box') return;
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'draw',
			pointerId: e.pointerId,
			captureTarget: target,
			id: cryptoId(),
			label: nextBoxLabel(boxes),
			originPageX: px,
			originPageY: py,
			currentPageX: px,
			currentPageY: py
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function startBoxMove(e: PointerEvent, box: LayoutBox) {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'move',
			pointerId: e.pointerId,
			captureTarget: target,
			id: box.id,
			startPointerPageX: px,
			startPointerPageY: py,
			currentPointerPageX: px,
			currentPointerPageY: py,
			origin: { ...box }
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function startBoxResize(e: PointerEvent, box: LayoutBox, corner: BoxCorner) {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'resize',
			pointerId: e.pointerId,
			captureTarget: target,
			id: box.id,
			corner,
			startPointerPageX: px,
			startPointerPageY: py,
			currentPointerPageX: px,
			currentPointerPageY: py,
			origin: { ...box }
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function onBoxOpMove(e: PointerEvent) {
		if (!boxOp || boxOp.pointerId !== e.pointerId) return;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		if (boxOp.kind === 'draw') {
			boxOp = { ...boxOp, currentPageX: px, currentPageY: py };
		} else {
			boxOp = { ...boxOp, currentPointerPageX: px, currentPointerPageY: py };
		}
	}

	function endBoxOp(e: PointerEvent) {
		if (!boxOp || boxOp.pointerId !== e.pointerId) return;
		const op = boxOp;
		boxOp = null;
		try {
			op.captureTarget.releasePointerCapture?.(e.pointerId);
		} catch {
			// already released
		}
		window.removeEventListener('pointermove', onBoxOpMove);
		window.removeEventListener('pointerup', endBoxOp);
		window.removeEventListener('pointercancel', endBoxOp);

		if (op.kind === 'draw') {
			const draft = normalizeDraft(op);
			if (draft.width < MIN_BOX_SIZE || draft.height < MIN_BOX_SIZE) return;
			const next = [...boxes, draft];
			onboxescommit?.(next);
			ontool?.(null);
			editingBox = { id: draft.id, value: draft.label };
		} else {
			const dx = op.currentPointerPageX - op.startPointerPageX;
			const dy = op.currentPointerPageY - op.startPointerPageY;
			if (Math.hypot(dx, dy) < BOX_DRAG_THRESHOLD) return;
			const transformed = transformedBox(op.origin, op);
			if (transformed.width < MIN_BOX_SIZE || transformed.height < MIN_BOX_SIZE) {
				transformed.width = Math.max(MIN_BOX_SIZE, transformed.width);
				transformed.height = Math.max(MIN_BOX_SIZE, transformed.height);
			}
			const next = boxes.map((b) => (b.id === op.id ? transformed : b));
			onboxescommit?.(next);
		}
	}

	function deleteBox(id: string) {
		const next = boxes.filter((b) => b.id !== id);
		if (next.length === boxes.length) return;
		onboxescommit?.(next);
		if (editingBox?.id === id) editingBox = null;
	}

	function startBoxRename(e: MouseEvent, box: LayoutBox) {
		e.stopPropagation();
		editingBox = { id: box.id, value: box.label };
	}

	function cancelBoxRename() {
		editingBox = null;
	}

	function commitBoxRename() {
		const current = editingBox;
		if (!current) return;
		editingBox = null;
		const next = current.value.trim();
		const target = boxes.find((b) => b.id === current.id);
		if (!target) return;
		if (!next || next === target.label) return;
		const updated = boxes.map((b) => (b.id === current.id ? { ...b, label: next } : b));
		onboxescommit?.(updated);
	}

	$effect(() => {
		if (editingBoxInputEl) {
			editingBoxInputEl.focus();
			editingBoxInputEl.select();
		}
	});

	onMount(() => {
		rebuild();
		syncScroll();
		const ro = new ResizeObserver(scheduleRebuild);
		ro.observe(document.body);
		const mo = new MutationObserver(scheduleRebuild);
		mo.observe(document.body, { childList: true, subtree: true, attributes: true });
		window.addEventListener('scroll', scheduleRebuild, true);
		window.addEventListener('resize', scheduleRebuild);
		window.addEventListener('scroll', syncScroll, true);
		window.addEventListener('resize', syncScroll);
		window.addEventListener('keydown', handleKey, true);
		return () => {
			if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
			ro.disconnect();
			mo.disconnect();
			window.removeEventListener('scroll', scheduleRebuild, true);
			window.removeEventListener('resize', scheduleRebuild);
			window.removeEventListener('scroll', syncScroll, true);
			window.removeEventListener('resize', syncScroll);
			window.removeEventListener('keydown', handleKey, true);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', endDrag);
			window.removeEventListener('pointercancel', endDrag);
			window.removeEventListener('pointermove', onBoxOpMove);
			window.removeEventListener('pointerup', endBoxOp);
			window.removeEventListener('pointercancel', endBoxOp);
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
	data-box-active={tool === 'box' || undefined}
	data-capturing={capturing || undefined}
	data-tool={tool ?? undefined}
	role="presentation"
>
	{#if tool === 'box' && !capturing}
		<div class="layout-box-draw-layer" role="presentation" onpointerdown={startBoxDraw}></div>
	{/if}

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

	{#each renderedBoxes as b (b.id)}
		{@const left = b.pageX - viewScrollX}
		{@const top = b.pageY - viewScrollY}
		<div
			class="layout-box"
			data-active={boxOp?.id === b.id || undefined}
			style="left: {left}px; top: {top}px; width: {b.width}px; height: {b.height}px;"
		>
			<button
				class="layout-box-body"
				type="button"
				aria-label="Move box {b.label}"
				onpointerdown={(e) => startBoxMove(e, b)}
			></button>
			{#if !capturing}
				<button
					class="layout-box-corner"
					data-corner="nw"
					type="button"
					aria-label="Resize box {b.label} from top-left"
					onpointerdown={(e) => startBoxResize(e, b, 'nw')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="ne"
					type="button"
					aria-label="Resize box {b.label} from top-right"
					onpointerdown={(e) => startBoxResize(e, b, 'ne')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="sw"
					type="button"
					aria-label="Resize box {b.label} from bottom-left"
					onpointerdown={(e) => startBoxResize(e, b, 'sw')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="se"
					type="button"
					aria-label="Resize box {b.label} from bottom-right"
					onpointerdown={(e) => startBoxResize(e, b, 'se')}
				></button>
				<button
					class="layout-box-delete"
					type="button"
					aria-label="Delete box {b.label}"
					onclick={(e) => {
						e.stopPropagation();
						deleteBox(b.id);
					}}
				>
					×
				</button>
			{/if}
			{#if editingBox?.id === b.id}
				<input
					class="layout-box-input"
					type="text"
					aria-label="Rename box {b.label}"
					bind:value={editingBox.value}
					bind:this={editingBoxInputEl}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							commitBoxRename();
						} else if (e.key === 'Escape') {
							e.preventDefault();
							cancelBoxRename();
						}
					}}
					onblur={commitBoxRename}
				/>
			{:else}
				<button
					class="layout-box-label"
					type="button"
					aria-label="Rename box {b.label}"
					onclick={(e) => startBoxRename(e, b)}
				>
					{b.label}
				</button>
			{/if}
		</div>
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

	.layout-box-draw-layer {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: auto;
		touch-action: none;
		cursor: crosshair;
		background: transparent;
	}

	.layout-box {
		position: fixed;
		z-index: 3;
		display: grid;
		place-items: center;
		border: 1.5px solid hsl(195 80% 60%);
		border-radius: 6px;
		background: hsl(195 80% 60% / 0.12);
		box-shadow:
			0 0 0 1px hsl(225 15% 8% / 0.6),
			0 8px 24px hsl(0 0% 0% / 0.25);
		pointer-events: none;
	}

	.layout-box[data-active] {
		border-color: hsl(195 90% 70%);
		background: hsl(195 80% 60% / 0.22);
	}

	.layout-box-body {
		position: absolute;
		inset: 8px;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		cursor: move;
		pointer-events: auto;
		touch-action: none;
	}

	.layout-box-corner {
		position: absolute;
		inline-size: 14px;
		block-size: 14px;
		margin: 0;
		padding: 0;
		border: 1.5px solid hsl(195 90% 70%);
		border-radius: 3px;
		background: hsl(225 15% 8%);
		pointer-events: auto;
		touch-action: none;
	}

	.layout-box-corner[data-corner='nw'] {
		inset-block-start: -7px;
		inset-inline-start: -7px;
		cursor: nwse-resize;
	}

	.layout-box-corner[data-corner='ne'] {
		inset-block-start: -7px;
		inset-inline-end: -7px;
		cursor: nesw-resize;
	}

	.layout-box-corner[data-corner='sw'] {
		inset-block-end: -7px;
		inset-inline-start: -7px;
		cursor: nesw-resize;
	}

	.layout-box-corner[data-corner='se'] {
		inset-block-end: -7px;
		inset-inline-end: -7px;
		cursor: nwse-resize;
	}

	.layout-box-delete {
		position: absolute;
		inset-block-start: -10px;
		inset-inline-end: -10px;
		inline-size: 20px;
		block-size: 20px;
		margin: 0;
		padding: 0;
		border: 1.5px solid hsl(0 75% 60%);
		border-radius: 999px;
		background: hsl(225 15% 8%);
		color: hsl(0 75% 75%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 14px;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
		pointer-events: auto;
		display: grid;
		place-items: center;
	}

	.layout-box-delete:hover,
	.layout-box-delete:focus-visible {
		background: hsl(0 75% 55%);
		color: hsl(225 15% 8%);
		outline: none;
	}

	.layout-box-label,
	.layout-box-input {
		position: relative;
		z-index: 1;
		margin: 0;
		padding: 2px 10px;
		border: 1px solid hsl(195 80% 60%);
		border-radius: 4px;
		background: hsl(225 15% 8%);
		color: hsl(195 80% 88%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1.25;
		text-transform: lowercase;
		pointer-events: auto;
		cursor: text;
	}

	.layout-box-label:hover,
	.layout-box-label:focus-visible {
		background: hsl(195 80% 60% / 0.9);
		color: hsl(225 15% 8%);
		outline: none;
	}

	.layout-box-input {
		min-inline-size: 6ch;
		max-inline-size: 18ch;
		caret-color: hsl(195 90% 70%);
		outline: 2px solid hsl(195 80% 60%);
		outline-offset: 0;
	}

	.layout-inspector[data-box-active] .layout-area-badge {
		opacity: 0.4;
	}

	.layout-inspector[data-box-active] .layout-area-badge:hover {
		opacity: 1;
	}

	.layout-inspector[data-capturing] .layout-handle,
	.layout-inspector[data-capturing] .layout-area-badge,
	.layout-inspector[data-capturing] .layout-area-input,
	.layout-inspector[data-capturing] .layout-box-corner,
	.layout-inspector[data-capturing] .layout-box-delete {
		display: none;
	}
</style>
