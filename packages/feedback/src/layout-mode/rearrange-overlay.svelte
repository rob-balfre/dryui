<script lang="ts">
	import { Badge, Button, Text } from '@dryui/ui';
	import AnnotationPopup from '../components/annotation-popup.svelte';
	import {
		computeSectionSnap,
		createRectFromPoint,
		isMeaningfulDrag,
		MIN_CAPTURE_SIZE,
		MIN_SIZE
	} from './geometry.js';
	import { originalSetTimeout } from './freeze.js';
	import { captureElement, detectPageSections } from './section-detection.js';
	import type { DetectedSection, RearrangeState, Rect } from './types.js';

	interface Props {
		rearrangeState: RearrangeState;
		onChange: (state: RearrangeState) => void;
		blankCanvas?: boolean;
		extraSnapRects?: Rect[];
		deselectSignal?: number;
		clearSignal?: number;
		exiting?: boolean;
		class?: string;
		onSelectionChange?: (selectedIds: Set<string>, isShift: boolean) => void;
		onInteractionChange?: (active: boolean) => void;
		onDragMove?: (dx: number, dy: number) => void;
		onDragEnd?: (dx: number, dy: number, committed: boolean) => void;
	}

	type Point = { x: number; y: number };
	type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
	type PreviewRects = Record<string, Rect>;

	const CORNER_HANDLES: HandleDir[] = ['nw', 'ne', 'se', 'sw'];
	const EDGE_HANDLES: HandleDir[] = ['n', 'e', 's', 'w'];
	const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'link', 'meta', 'br', 'hr']);
	const MAX_SIZE_DELTA = 200;

	let {
		rearrangeState,
		onChange,
		blankCanvas = false,
		extraSnapRects,
		deselectSignal,
		clearSignal,
		exiting = false,
		class: className,
		onSelectionChange,
		onInteractionChange,
		onDragMove,
		onDragEnd
	}: Props = $props();

	let selectedIds = $state<string[]>([]);
	let drawBox = $state<Rect | null>(null);
	let previewRects = $state<PreviewRects>({});
	let guides = $state<{ axis: 'x' | 'y'; pos: number }[]>([]);
	let hoverRect = $state<Rect | null>(null);
	let hoverLabel = $state<string | null>(null);
	let sizeIndicator = $state<{ x: number; y: number; text: string } | null>(null);
	let noteTargetId = $state<string | null>(null);
	let scrollY = $state(typeof window !== 'undefined' ? window.scrollY : 0);
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1440);
	let pointerStart = $state<Point | null>(null);
	let domRevision = $state(0);
	let hasMeasuredInitialDom = false;
	let lastDeselectSignal: number | undefined = undefined;
	let lastClearSignal: number | undefined = undefined;
	let exitingIds = $state<string[]>([]);
	let exitingConnectors = $state<Record<string, { orig: Rect; target: Rect; isFixed?: boolean }>>(
		{}
	);
	const previousChangedIds = new Set<string>();
	const lastChangedRects = new Map<
		string,
		{ currentRect: Rect; originalRect: Rect; isFixed?: boolean }
	>();

	function isSelected(id: string): boolean {
		return selectedIds.includes(id);
	}

	function syncViewport() {
		scrollY = window.scrollY;
		viewportWidth = window.innerWidth;
	}

	function rectChanged(a: Rect, b: Rect): boolean {
		return (
			Math.abs(a.x - b.x) > 0.5 ||
			Math.abs(a.y - b.y) > 0.5 ||
			Math.abs(a.width - b.width) > 0.5 ||
			Math.abs(a.height - b.height) > 0.5
		);
	}

	function isMoved(section: DetectedSection, rect: Rect = getRenderedRect(section)): boolean {
		return (
			Math.abs(section.originalRect.x - rect.x) > 0.5 ||
			Math.abs(section.originalRect.y - rect.y) > 0.5
		);
	}

	function isResized(section: DetectedSection, rect: Rect = getRenderedRect(section)): boolean {
		return (
			Math.abs(section.originalRect.width - rect.width) > 0.5 ||
			Math.abs(section.originalRect.height - rect.height) > 0.5
		);
	}

	function hasChanged(section: DetectedSection, rect: Rect = getRenderedRect(section)): boolean {
		return isMoved(section, rect) || isResized(section, rect);
	}

	function getRenderedRect(section: DetectedSection): Rect {
		return previewRects[section.id] ?? section.currentRect;
	}

	function toViewportRect(section: DetectedSection, rect: Rect = getRenderedRect(section)): Rect {
		return {
			x: rect.x,
			y: section.isFixed ? rect.y : rect.y - scrollY,
			width: rect.width,
			height: rect.height
		};
	}

	function setSelection(ids: string[], shiftKey: boolean = false) {
		selectedIds = ids;
		onSelectionChange?.(new Set(ids), shiftKey);
	}

	function applySelection(id: string, shiftKey: boolean): string[] {
		if (!shiftKey) {
			return [id];
		}

		return isSelected(id)
			? selectedIds.filter((selected) => selected !== id)
			: [...selectedIds, id];
	}

	function handleCursor(handle: HandleDir): string {
		return handle === 'n' || handle === 's'
			? 'ns-resize'
			: handle === 'e' || handle === 'w'
				? 'ew-resize'
				: handle === 'ne' || handle === 'sw'
					? 'nesw-resize'
					: 'nwse-resize';
	}

	function applyCornerHandle(node: HTMLElement, handle: HandleDir) {
		node.style.setProperty(handle.includes('n') ? 'top' : 'bottom', '-4px');
		node.style.setProperty(handle.includes('w') ? 'left' : 'right', '-4px');
		node.style.setProperty('cursor', handleCursor(handle));
	}

	function applyEdgeHandle(node: HTMLElement, handle: HandleDir) {
		node.style.setProperty('cursor', handleCursor(handle));
		switch (handle) {
			case 'n':
				node.style.setProperty('left', '12px');
				node.style.setProperty('right', '12px');
				node.style.setProperty('top', '-6px');
				node.style.setProperty('height', '12px');
				break;
			case 's':
				node.style.setProperty('left', '12px');
				node.style.setProperty('right', '12px');
				node.style.setProperty('bottom', '-6px');
				node.style.setProperty('height', '12px');
				break;
			case 'e':
				node.style.setProperty('top', '12px');
				node.style.setProperty('bottom', '12px');
				node.style.setProperty('right', '-6px');
				node.style.setProperty('width', '12px');
				break;
			case 'w':
				node.style.setProperty('top', '12px');
				node.style.setProperty('bottom', '12px');
				node.style.setProperty('left', '-6px');
				node.style.setProperty('width', '12px');
				break;
		}
	}

	function applyEdgeHandlePip(node: HTMLElement, handle: HandleDir) {
		if (handle === 'n' || handle === 's') {
			node.style.setProperty('width', '24px');
			node.style.setProperty('height', '4px');
		} else {
			node.style.setProperty('width', '4px');
			node.style.setProperty('height', '24px');
		}
	}

	type RectLike = { x: number; y: number; width: number; height: number };

	function setRect(node: HTMLElement, rect: RectLike) {
		node.style.setProperty('left', `${rect.x}px`);
		node.style.setProperty('top', `${rect.y}px`);
		node.style.setProperty('width', `${rect.width}px`);
		node.style.setProperty('height', `${rect.height}px`);
		return {
			update(next: RectLike) {
				node.style.setProperty('left', `${next.x}px`);
				node.style.setProperty('top', `${next.y}px`);
				node.style.setProperty('width', `${next.width}px`);
				node.style.setProperty('height', `${next.height}px`);
			}
		};
	}

	type SectionDynamics = { selected: boolean; exiting: boolean };

	function setUnchangedDynamics(node: HTMLElement, params: SectionDynamics) {
		function apply(p: SectionDynamics) {
			node.style.setProperty(
				'box-shadow',
				p.selected
					? '0 0 0 2px color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 28%, transparent)'
					: 'none'
			);
			node.style.setProperty('opacity', p.exiting ? '0' : '1');
			node.style.setProperty('transform', p.exiting ? 'scale(0.97)' : 'scale(1)');
		}
		apply(params);
		return { update: apply };
	}

	function setChangedDynamics(node: HTMLElement, params: SectionDynamics) {
		function apply(p: SectionDynamics) {
			node.style.setProperty(
				'background',
				p.selected
					? 'color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 9%, transparent)'
					: 'transparent'
			);
			node.style.setProperty(
				'box-shadow',
				p.selected
					? '0 0 0 2px color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 28%, transparent)'
					: 'none'
			);
			node.style.setProperty('opacity', p.exiting ? '0' : '1');
			node.style.setProperty('transform', p.exiting ? 'scale(0.97)' : 'scale(1)');
		}
		apply(params);
		return { update: apply };
	}

	type GuideParams = { axis: 'x' | 'y'; pos: number; scrollY: number };

	function setGuide(node: HTMLElement, params: GuideParams) {
		function apply(p: GuideParams) {
			if (p.axis === 'x') {
				node.style.setProperty('left', `${p.pos}px`);
				node.style.setProperty('top', '0');
				node.style.setProperty('width', '1px');
				node.style.setProperty('height', '100vh');
			} else {
				node.style.setProperty('top', `${p.pos - p.scrollY}px`);
				node.style.setProperty('left', '0');
				node.style.setProperty('height', '1px');
				node.style.setProperty('width', '100vw');
			}
		}
		apply(params);
		return { update: apply };
	}

	type PositionXY = { x: number; y: number };

	function setPosition(node: HTMLElement, pos: PositionXY) {
		function apply(p: PositionXY) {
			node.style.setProperty('left', `${p.x}px`);
			node.style.setProperty('top', `${p.y}px`);
		}
		apply(pos);
		return { update: apply };
	}

	function suggestedChangeLabel(section: DetectedSection, rect: Rect): string | null {
		const moved = isMoved(section, rect);
		const resized = isResized(section, rect);

		if (moved && resized) return 'Suggested Move & Resize';
		if (resized) return 'Suggested Resize';
		if (moved) return 'Suggested Move';
		return null;
	}

	function deriveOriginalOrder(nextSections: DetectedSection[]): string[] {
		const ids = new Set(nextSections.map((section) => section.id));
		const order = rearrangeState.originalOrder.filter((id) => ids.has(id));

		for (const section of nextSections) {
			if (!order.includes(section.id)) {
				order.push(section.id);
			}
		}

		return order;
	}

	function updateState(
		nextSections: DetectedSection[],
		nextOrder: string[] = deriveOriginalOrder(nextSections)
	) {
		onChange({
			...rearrangeState,
			sections: nextSections,
			originalOrder: nextOrder
		});
	}

	function removeSections(ids: string[]) {
		const removed = new Set(ids);
		exitingIds = Array.from(new Set([...exitingIds, ...ids]));
		setSelection([], false);
		originalSetTimeout(() => {
			exitingIds = exitingIds.filter((id) => !removed.has(id));
			updateState(
				rearrangeState.sections.filter((section) => !removed.has(section.id)),
				rearrangeState.originalOrder.filter((id) => !removed.has(id))
			);
		}, 180);
	}

	function captureSections() {
		const sections = detectPageSections();
		updateState(
			sections,
			sections.map((section) => section.id)
		);
	}

	function clearTransientState() {
		drawBox = null;
		previewRects = {};
		guides = [];
		hoverRect = null;
		hoverLabel = null;
		sizeIndicator = null;
		pointerStart = null;
		onInteractionChange?.(false);
	}

	function getDomSection(section: DetectedSection): Element | null {
		if (blankCanvas || !section.selector) return null;

		try {
			return document.querySelector(section.selector);
		} catch {
			return null;
		}
	}

	function isVisibleSection(section: DetectedSection): boolean {
		if (blankCanvas) return true;
		if (selectedIds.includes(section.id) || noteTargetId === section.id) return true;

		const element = getDomSection(section);
		if (!element) return false;

		const rect = element.getBoundingClientRect();
		const expected = section.originalRect;
		const sizeDiff =
			Math.abs(rect.width - expected.width) + Math.abs(rect.height - expected.height);

		return sizeDiff < MAX_SIZE_DELTA;
	}

	let visibleSections = $derived.by(() => {
		domRevision;
		return rearrangeState.sections.filter((section) => isVisibleSection(section));
	});

	let unchangedSections = $derived(visibleSections.filter((section) => !hasChanged(section)));
	let changedSections = $derived(visibleSections.filter((section) => hasChanged(section)));
	let connectorSections = $derived.by(() => {
		const next: Array<{
			id: string;
			orig: Rect;
			target: Rect;
			isFixed?: boolean;
			exiting?: boolean;
		}> = changedSections.map((section) => ({
			id: section.id,
			orig: section.originalRect,
			target: getRenderedRect(section),
			isFixed: section.isFixed
		}));

		for (const [id, connector] of Object.entries(exitingConnectors)) {
			if (next.some((entry) => entry.id === id)) continue;
			next.push({
				id,
				orig: connector.orig,
				target: connector.target,
				isFixed: connector.isFixed,
				exiting: true
			});
		}

		return next;
	});

	function findCapturedSectionByElement(el: Element): DetectedSection | null {
		for (const section of rearrangeState.sections) {
			const matched = getDomSection(section);
			if (matched && (matched === el || matched.contains(el) || el.contains(matched))) {
				return section;
			}
		}

		return null;
	}

	function pickTarget(el: Element | null): HTMLElement | null {
		let current = el instanceof HTMLElement ? el : null;

		while (current && current !== document.body && current !== document.documentElement) {
			if (current.closest('[data-dryui-feedback]')) return null;
			if (current.closest('[data-rearrange-mode-controls]')) return null;
			if (current.closest('[data-rearrange-section]')) return null;

			const tag = current.tagName.toLowerCase();
			if (SKIP_TAGS.has(tag)) {
				current = current.parentElement;
				continue;
			}

			const rect = current.getBoundingClientRect();
			if (rect.width >= MIN_CAPTURE_SIZE && rect.height >= MIN_CAPTURE_SIZE) {
				return current;
			}

			current = current.parentElement;
		}

		return null;
	}

	function captureSectionFromRect(rect: Rect): DetectedSection {
		return {
			id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			label: blankCanvas ? 'Wireframe section' : 'Selected section',
			tagName: 'div',
			selector: `section-${Math.random().toString(36).slice(2, 7)}`,
			role: null,
			className: null,
			textSnippet: null,
			originalRect: {
				x: rect.x,
				y: rect.y + scrollY,
				width: rect.width,
				height: rect.height
			},
			currentRect: {
				x: rect.x,
				y: rect.y + scrollY,
				width: rect.width,
				height: rect.height
			},
			originalIndex: rearrangeState.sections.length,
			isFixed: false
		};
	}

	function openNoteEditor(id: string) {
		noteTargetId = id;
	}

	function saveNote(note: string) {
		if (!noteTargetId) return;

		updateState(
			rearrangeState.sections.map((section) =>
				section.id === noteTargetId ? { ...section, note: note.trim() || undefined } : section
			)
		);
		noteTargetId = null;
	}

	function cancelNote() {
		noteTargetId = null;
	}

	function clearNote() {
		if (!noteTargetId) return;

		updateState(
			rearrangeState.sections.map((section) =>
				section.id === noteTargetId ? { ...section, note: undefined } : section
			)
		);
		noteTargetId = null;
	}

	function getNotePopupPosition(section: DetectedSection): { x: number; y: number } {
		const rect = toViewportRect(section);
		const popupWidth = 360;
		const popupHeight = 240;
		const centerX = rect.x + rect.width / 2;
		const fitsAbove = rect.y > popupHeight + 24;
		const fitsBelow = rect.y + rect.height + popupHeight + 24 < window.innerHeight;
		const x = Math.max(12, Math.min(viewportWidth - popupWidth - 12, centerX - popupWidth / 2));

		if (fitsAbove) {
			return { x, y: Math.max(16, rect.y - popupHeight - 12) };
		}

		if (fitsBelow) {
			return { x, y: rect.y + rect.height + 12 };
		}

		return {
			x,
			y: Math.max(
				16,
				Math.min(window.innerHeight - popupHeight - 16, window.innerHeight / 2 - popupHeight / 2)
			)
		};
	}

	function startMove(
		event: MouseEvent,
		anchorId: string,
		ids: string[],
		sections: DetectedSection[] = rearrangeState.sections
	) {
		if (event.button !== 0) return;

		const baseRects = new Map(
			sections
				.filter((section) => ids.includes(section.id))
				.map((section) => [section.id, { ...section.currentRect }] as const)
		);
		const anchorRect = baseRects.get(anchorId);
		if (!anchorRect) return;

		pointerStart = { x: event.clientX, y: event.clientY };
		onInteractionChange?.(true);
		let moved = false;
		let lastDx = 0;
		let lastDy = 0;

		const handleMove = (moveEvent: MouseEvent) => {
			if (!pointerStart) return;

			const deltaX = moveEvent.clientX - pointerStart.x;
			const deltaY = moveEvent.clientY - pointerStart.y;
			if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
				moved = true;
			}
			const nextAnchor = {
				x: anchorRect.x + deltaX,
				y: anchorRect.y + deltaY,
				width: anchorRect.width,
				height: anchorRect.height
			};
			const snap = computeSectionSnap(
				nextAnchor,
				sections,
				new Set(ids),
				undefined,
				extraSnapRects
			);
			const appliedDx = deltaX + snap.dx;
			const appliedDy = deltaY + snap.dy;
			lastDx = appliedDx;
			lastDy = appliedDy;

			previewRects = Object.fromEntries(
				ids.map((id) => {
					const baseRect = baseRects.get(id)!;
					return [
						id,
						{
							x: Math.max(0, baseRect.x + appliedDx),
							y: Math.max(0, baseRect.y + appliedDy),
							width: baseRect.width,
							height: baseRect.height
						}
					];
				})
			);
			guides = snap.guides;
			onDragMove?.(appliedDx, appliedDy);
		};

		const handleUp = () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);

			if (moved && Object.keys(previewRects).length > 0) {
				updateState(
					sections.map((section) =>
						ids.includes(section.id)
							? {
									...section,
									currentRect: previewRects[section.id] ?? section.currentRect
								}
							: section
					)
				);
			}

			onDragEnd?.(lastDx, lastDy, moved);
			clearTransientState();
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);
	}

	function resizeRect(
		baseRect: Rect,
		dir: HandleDir,
		dx: number,
		dy: number,
		keepAspectRatio: boolean = false
	): Rect {
		let next = { ...baseRect };
		const aspectRatio = baseRect.height > 0 ? baseRect.width / baseRect.height : 1;

		if (dir.includes('e')) {
			next.width = Math.max(MIN_SIZE, baseRect.width + dx);
		}
		if (dir.includes('s')) {
			next.height = Math.max(MIN_SIZE, baseRect.height + dy);
		}
		if (dir.includes('w')) {
			const width = Math.max(MIN_SIZE, baseRect.width - dx);
			next.x = baseRect.x + (baseRect.width - width);
			next.width = width;
		}
		if (dir.includes('n')) {
			const height = Math.max(MIN_SIZE, baseRect.height - dy);
			next.y = baseRect.y + (baseRect.height - height);
			next.height = height;
		}

		if (keepAspectRatio) {
			const isCorner = dir.length === 2;
			if (isCorner) {
				const widthDelta = Math.abs(next.width - baseRect.width);
				const heightDelta = Math.abs(next.height - baseRect.height);
				if (widthDelta > heightDelta) {
					next.height = Math.max(MIN_SIZE, next.width / aspectRatio);
				} else {
					next.width = Math.max(MIN_SIZE, next.height * aspectRatio);
				}
			} else if (dir === 'e' || dir === 'w') {
				next.height = Math.max(MIN_SIZE, next.width / aspectRatio);
			} else {
				next.width = Math.max(MIN_SIZE, next.height * aspectRatio);
			}

			if (dir.includes('w')) {
				next.x = baseRect.x + (baseRect.width - next.width);
			}
			if (dir.includes('n')) {
				next.y = baseRect.y + (baseRect.height - next.height);
			}
		}

		return next;
	}

	function startResize(event: MouseEvent, sectionId: string, dir: HandleDir) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();

		const section = rearrangeState.sections.find((candidate) => candidate.id === sectionId);
		if (!section) return;

		pointerStart = { x: event.clientX, y: event.clientY };
		onInteractionChange?.(true);
		setSelection([sectionId], false);

		const activeEdges = {
			left: dir.includes('w'),
			right: dir.includes('e'),
			top: dir.includes('n'),
			bottom: dir.includes('s')
		};

		const handleMove = (moveEvent: MouseEvent) => {
			if (!pointerStart) return;

			const nextRect = resizeRect(
				section.currentRect,
				dir,
				moveEvent.clientX - pointerStart.x,
				moveEvent.clientY - pointerStart.y,
				moveEvent.shiftKey
			);
			const snap = computeSectionSnap(
				nextRect,
				rearrangeState.sections,
				new Set([sectionId]),
				activeEdges,
				extraSnapRects
			);
			const snappedRect = {
				x: Math.max(0, nextRect.x + snap.dx),
				y: Math.max(0, nextRect.y + snap.dy),
				width: nextRect.width,
				height: nextRect.height
			};

			previewRects = { [sectionId]: snappedRect };
			guides = snap.guides;
			sizeIndicator = {
				x: moveEvent.clientX + 12,
				y: moveEvent.clientY + 12,
				text: `${Math.round(snappedRect.width)} × ${Math.round(snappedRect.height)}`
			};
		};

		const handleUp = () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);

			const nextRect = previewRects[sectionId];
			if (nextRect) {
				updateState(
					rearrangeState.sections.map((candidate) =>
						candidate.id === sectionId ? { ...candidate, currentRect: nextRect } : candidate
					)
				);
			}

			clearTransientState();
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);
	}

	function beginDraw(event: PointerEvent) {
		if (event.button !== 0) return;

		pointerStart = { x: event.clientX, y: event.clientY };
		onInteractionChange?.(true);

		const handleMove = (moveEvent: PointerEvent) => {
			if (!pointerStart) return;

			drawBox = createRectFromPoint(pointerStart, { x: moveEvent.clientX, y: moveEvent.clientY });
			sizeIndicator = {
				x: moveEvent.clientX + 12,
				y: moveEvent.clientY + 12,
				text: `${Math.round(drawBox.width)} x ${Math.round(drawBox.height)}`
			};
		};

		const handleUp = () => {
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleUp);

			if (drawBox && isMeaningfulDrag(drawBox, MIN_SIZE)) {
				const section = captureSectionFromRect(drawBox);
				updateState([...rearrangeState.sections, section]);
				setSelection([section.id], false);
			}

			clearTransientState();
		};

		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleUp);
	}

	function handleDrawLayerPointerDown(event: PointerEvent) {
		if (event.target instanceof HTMLElement && event.target.closest('[data-rearrange-section]'))
			return;
		beginDraw(event);
	}

	function handleDocumentMouseMove(event: MouseEvent) {
		if (blankCanvas || pointerStart) return;

		const target = pickTarget(event.target instanceof Element ? event.target : null);
		if (!target) {
			hoverRect = null;
			hoverLabel = null;
			return;
		}

		if (findCapturedSectionByElement(target)) {
			hoverRect = null;
			hoverLabel = null;
			return;
		}

		const rect = target.getBoundingClientRect();
		hoverRect = {
			x: rect.x,
			y: rect.y,
			width: rect.width,
			height: rect.height
		};
		hoverLabel = target.getAttribute('aria-label') || target.tagName.toLowerCase();
	}

	function handleDocumentMouseDown(event: MouseEvent) {
		if (blankCanvas || event.button !== 0) return;
		if (event.target instanceof Element && event.target.closest('[data-dryui-feedback]')) return;
		if (event.target instanceof Element && event.target.closest('[data-rearrange-mode-controls]'))
			return;
		if (event.target instanceof Element && event.target.closest('[data-rearrange-section]')) return;

		const target = pickTarget(event.target instanceof Element ? event.target : null);
		if (!target) {
			if (!(event.shiftKey || event.metaKey || event.ctrlKey)) {
				setSelection([], false);
			}
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const existing = findCapturedSectionByElement(target);
		if (existing) {
			const nextSelection = applySelection(
				existing.id,
				event.shiftKey || event.metaKey || event.ctrlKey
			);
			setSelection(nextSelection, event.shiftKey || event.metaKey || event.ctrlKey);
			return;
		}

		const captured = captureElement(target);
		const nextSections = [...rearrangeState.sections, captured];
		const nextOrder = [...deriveOriginalOrder(rearrangeState.sections), captured.id];
		updateState(nextSections, nextOrder);
		setSelection([captured.id], false);
		hoverRect = null;
		hoverLabel = null;
		startMove(event, captured.id, [captured.id], nextSections);
	}

	function handleSectionMouseDown(event: MouseEvent, sectionId: string) {
		event.preventDefault();
		event.stopPropagation();

		const shiftKey = event.shiftKey || event.metaKey || event.ctrlKey;
		const nextSelection = applySelection(sectionId, shiftKey);
		const movingIds = isSelected(sectionId) && !shiftKey ? [...selectedIds] : nextSelection;

		setSelection(nextSelection, shiftKey);
		startMove(event, sectionId, movingIds);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			clearTransientState();
			setSelection([], false);
			cancelNote();
			return;
		}

		if (selectedIds.length === 0) return;

		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			removeSections(selectedIds);
			return;
		}

		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

		event.preventDefault();
		const step = event.shiftKey ? 20 : 1;
		const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
		const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

		updateState(
			rearrangeState.sections.map((section) =>
				selectedIds.includes(section.id)
					? {
							...section,
							currentRect: {
								...section.currentRect,
								x: Math.max(0, section.currentRect.x + dx),
								y: Math.max(0, section.currentRect.y + dy)
							}
						}
					: section
			)
		);
	}

	function clearAll() {
		setSelection([], false);
		updateState([], []);
	}

	$effect(() => {
		if (deselectSignal === lastDeselectSignal) return;
		lastDeselectSignal = deselectSignal;
		queueMicrotask(() => {
			selectedIds = [];
			onSelectionChange?.(new Set(), false);
		});
	});

	$effect(() => {
		if (clearSignal === lastClearSignal) return;
		lastClearSignal = clearSignal;
		queueMicrotask(() => {
			drawBox = null;
			previewRects = {};
			guides = [];
			hoverRect = null;
			hoverLabel = null;
			sizeIndicator = null;
			pointerStart = null;
			onInteractionChange?.(false);
			selectedIds = [];
			exitingIds = [];
			exitingConnectors = {};
			onSelectionChange?.(new Set(), false);
			onChange({
				...rearrangeState,
				sections: [],
				originalOrder: []
			});
		});
	});

	$effect(() => {
		if (blankCanvas || typeof MutationObserver === 'undefined') return;

		const root = document.body;
		if (!root) return;

		if (!hasMeasuredInitialDom) {
			hasMeasuredInitialDom = true;
			queueMicrotask(() => {
				domRevision += 1;
			});
		}

		let queued = false;
		const observer = new MutationObserver(() => {
			if (queued) return;
			queued = true;
			queueMicrotask(() => {
				queued = false;
				domRevision += 1;
			});
		});

		observer.observe(root, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['class', 'style', 'hidden', 'aria-hidden']
		});

		return () => observer.disconnect();
	});

	$effect(() => {
		const currentChangedIds = new Set(changedSections.map((section) => section.id));

		for (const section of changedSections) {
			lastChangedRects.set(section.id, {
				currentRect: { ...getRenderedRect(section) },
				originalRect: { ...section.originalRect },
				isFixed: section.isFixed
			});
		}

		for (const [id] of lastChangedRects) {
			if (!rearrangeState.sections.some((section) => section.id === id)) {
				lastChangedRects.delete(id);
			}
		}

		const connectorExits: Record<string, { orig: Rect; target: Rect; isFixed?: boolean }> = {};
		for (const id of previousChangedIds) {
			if (currentChangedIds.has(id)) continue;
			if (!rearrangeState.sections.some((section) => section.id === id)) continue;

			const lastKnown = lastChangedRects.get(id);
			if (!lastKnown) continue;

			connectorExits[id] = {
				orig: lastKnown.originalRect,
				target: lastKnown.currentRect,
				isFixed: lastKnown.isFixed
			};
			lastChangedRects.delete(id);
		}

		previousChangedIds.clear();
		for (const id of currentChangedIds) {
			previousChangedIds.add(id);
		}

		if (Object.keys(connectorExits).length === 0) return;

		exitingConnectors = { ...exitingConnectors, ...connectorExits };
		const exitIds = Object.keys(connectorExits);
		const timer = originalSetTimeout(() => {
			const next = { ...exitingConnectors };
			for (const id of exitIds) {
				delete next[id];
			}
			exitingConnectors = next;
		}, 250);

		return () => clearTimeout(timer);
	});
</script>

<svelte:window onkeydown={handleKeyDown} onscroll={syncViewport} onresize={syncViewport} />
<svelte:document
	onmousemove={!blankCanvas ? handleDocumentMouseMove : undefined}
	onmousedowncapture={!blankCanvas ? handleDocumentMouseDown : undefined}
/>

<div
	class="rearrange-container {className}"
	data-rearrange-mode
	data-exiting={exiting ? 'true' : 'false'}
	role="application"
	aria-label="Rearrange mode canvas"
>
	{#if hoverRect}
		<div class="hover-rect" use:setRect={hoverRect}>
			{#if hoverLabel}
				<div class="label-above">
					<Badge variant="soft">{hoverLabel}</Badge>
				</div>
			{/if}
		</div>
	{/if}

	{#if blankCanvas}
		<div
			class="draw-layer"
			data-rearrange-draw-layer
			role="button"
			tabindex="-1"
			aria-label="Draw section"
			onpointerdown={handleDrawLayerPointerDown}
		></div>
	{/if}

	<svg class="connector-svg" aria-hidden="true">
		{#each connectorSections as connector (connector.id)}
			{@const fromX = connector.orig.x + connector.orig.width / 2}
			{@const fromY =
				(connector.isFixed ? connector.orig.y : connector.orig.y - scrollY) +
				connector.orig.height / 2}
			{@const toX = connector.target.x + connector.target.width / 2}
			{@const toY =
				(connector.isFixed ? connector.target.y : connector.target.y - scrollY) +
				connector.target.height / 2}
			{@const deltaX = toX - fromX}
			{@const deltaY = toY - fromY}
			{@const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)}
			{#if distance > 1}
				{@const normalX = -deltaY / distance}
				{@const normalY = deltaX / distance}
				{@const controlOffset = Math.min(distance * 0.3, 60)}
				{@const controlX = (fromX + toX) / 2 + normalX * controlOffset}
				{@const controlY = (fromY + toY) / 2 + normalY * controlOffset}
				{@const proximityScale = Math.min(1, distance / 40)}
				{@const selected = isSelected(connector.id)}
				{@const isDragging = Boolean(previewRects[connector.id])}
				{@const pathOpacity = connector.exiting ? 0.22 : isDragging || selected ? 0.9 : 0.45}
				{@const dotOpacity = connector.exiting ? 0.35 : isDragging || selected ? 0.88 : 0.72}
				<g data-rearrange-connector-group={connector.id}>
					<path
						data-rearrange-connector
						data-rearrange-connector-exiting={connector.exiting ? 'true' : 'false'}
						d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
						fill="none"
						stroke="var(--dry-color-fill-brand, #7c3aed)"
						stroke-width="1.5"
						opacity={pathOpacity * proximityScale}
					></path>
					<circle
						data-rearrange-connector-dot
						cx={fromX}
						cy={fromY}
						r={4 * proximityScale}
						fill="var(--dry-color-fill-brand, #7c3aed)"
						stroke="var(--dry-color-bg-overlay, #fff)"
						stroke-width="1.5"
						opacity={dotOpacity * proximityScale}
					></circle>
					<circle
						data-rearrange-connector-dot
						cx={toX}
						cy={toY}
						r={4 * proximityScale}
						fill="var(--dry-color-fill-brand, #7c3aed)"
						stroke="var(--dry-color-bg-overlay, #fff)"
						stroke-width="1.5"
						opacity={dotOpacity * proximityScale}
					></circle>
				</g>
			{/if}
		{/each}
	</svg>

	{#each unchangedSections as section (section.id)}
		{@const rect = toViewportRect(section)}
		<div
			class="section-box section-unchanged"
			data-rearrange-section={section.id}
			data-rearrange-state="unchanged"
			role="button"
			tabindex="0"
			aria-label={section.label}
			use:setRect={rect}
			use:setUnchangedDynamics={{
				selected: isSelected(section.id),
				exiting: exitingIds.includes(section.id)
			}}
			onmousedown={(event) => handleSectionMouseDown(event, section.id)}
			ondblclick={() => openNoteEditor(section.id)}
		>
			<div class="vstack-sm">
				<div class="section-header">
					<div class="hstack-sm">
						<Badge variant={isSelected(section.id) ? 'solid' : 'soft'}>{section.label}</Badge>
						<Text as="span" size="sm">{section.tagName}</Text>
					</div>
					{#if isSelected(section.id)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={`Delete ${section.label}`}
							onclick={() => removeSections([section.id])}
						>
							×
						</Button>
					{/if}
				</div>
				<Text as="div" size="sm">{Math.round(rect.width)} x {Math.round(rect.height)}</Text>
				{#if section.note}
					<Text as="div" size="sm" color="secondary">{section.note}</Text>
				{/if}
			</div>

			{#if isSelected(section.id) && selectedIds.length === 1}
				{#each CORNER_HANDLES as handle (handle)}
					<button
						class="corner-handle"
						type="button"
						aria-label={`Resize ${handle}`}
						use:applyCornerHandle={handle}
						onmousedown={(event) => startResize(event, section.id, handle)}
					></button>
				{/each}
				{#each EDGE_HANDLES as handle (handle)}
					<button
						class="edge-handle"
						type="button"
						aria-label={`Resize ${handle}`}
						use:applyEdgeHandle={handle}
						onmousedown={(event) => startResize(event, section.id, handle)}
					>
						<span class="edge-handle-pip" aria-hidden="true" use:applyEdgeHandlePip={handle}></span>
						<svg class="edge-handle-icon" aria-hidden="true" viewBox="0 0 12 12">
							{#if handle === 'n' || handle === 's'}
								<path d="M6 2 L3.5 4.5 H8.5 Z" fill="currentColor"></path>
								<path d="M6 10 L3.5 7.5 H8.5 Z" fill="currentColor"></path>
							{:else}
								<path d="M2 6 L4.5 3.5 V8.5 Z" fill="currentColor"></path>
								<path d="M10 6 L7.5 3.5 V8.5 Z" fill="currentColor"></path>
							{/if}
						</svg>
					</button>
				{/each}
			{/if}
		</div>
	{/each}

	{#each changedSections as section (section.id)}
		{@const renderedRect = getRenderedRect(section)}
		{@const rect = toViewportRect(section, renderedRect)}
		{@const changeLabel = suggestedChangeLabel(section, renderedRect)}
		<div
			class="section-box section-changed"
			data-rearrange-section={section.id}
			data-rearrange-state="changed"
			role="button"
			tabindex="0"
			aria-label={section.label}
			use:setRect={rect}
			use:setChangedDynamics={{
				selected: isSelected(section.id),
				exiting: exitingIds.includes(section.id)
			}}
			onmousedown={(event) => handleSectionMouseDown(event, section.id)}
			ondblclick={() => openNoteEditor(section.id)}
		>
			{#if changeLabel}
				<div class="label-above label-above--no-events">
					<Badge variant="outline">{changeLabel}</Badge>
				</div>
			{/if}

			<div class="vstack-sm">
				<div class="section-header">
					<div class="hstack-sm">
						<Badge variant={isSelected(section.id) ? 'solid' : 'soft'}>{section.label}</Badge>
						<Text as="span" size="sm">{section.tagName}</Text>
					</div>
					{#if isSelected(section.id)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={`Delete ${section.label}`}
							onclick={() => removeSections([section.id])}
						>
							×
						</Button>
					{/if}
				</div>
				<Text as="div" size="sm">{Math.round(rect.width)} x {Math.round(rect.height)}</Text>
			</div>

			{#if section.note}
				<div class="note-below">
					<Text as="div" size="sm" color="secondary">{section.note}</Text>
				</div>
			{/if}

			{#if isSelected(section.id) && selectedIds.length === 1}
				{#each CORNER_HANDLES as handle (handle)}
					<button
						class="corner-handle"
						type="button"
						aria-label={`Resize ${handle}`}
						use:applyCornerHandle={handle}
						onmousedown={(event) => startResize(event, section.id, handle)}
					></button>
				{/each}
				{#each EDGE_HANDLES as handle (handle)}
					<button
						class="edge-handle"
						type="button"
						aria-label={`Resize ${handle}`}
						use:applyEdgeHandle={handle}
						onmousedown={(event) => startResize(event, section.id, handle)}
					>
						<span class="edge-handle-pip" aria-hidden="true" use:applyEdgeHandlePip={handle}></span>
						<svg class="edge-handle-icon" aria-hidden="true" viewBox="0 0 12 12">
							{#if handle === 'n' || handle === 's'}
								<path d="M6 2 L3.5 4.5 H8.5 Z" fill="currentColor"></path>
								<path d="M6 10 L3.5 7.5 H8.5 Z" fill="currentColor"></path>
							{:else}
								<path d="M2 6 L4.5 3.5 V8.5 Z" fill="currentColor"></path>
								<path d="M10 6 L7.5 3.5 V8.5 Z" fill="currentColor"></path>
							{/if}
						</svg>
					</button>
				{/each}
			{/if}
		</div>
	{/each}

	{#if drawBox}
		<div class="draw-box" use:setRect={drawBox}></div>
	{/if}

	{#each guides as guide, index (index)}
		<div class="guide-line" use:setGuide={{ axis: guide.axis, pos: guide.pos, scrollY }}></div>
	{/each}

	{#if sizeIndicator}
		<div class="size-indicator" use:setPosition={{ x: sizeIndicator.x, y: sizeIndicator.y }}>
			<Text as="div" size="sm">{sizeIndicator.text}</Text>
		</div>
	{/if}

	{#if noteTargetId}
		{@const noteSection = rearrangeState.sections.find((section) => section.id === noteTargetId)}
		{#if noteSection}
			{#key noteSection.id}
				<AnnotationPopup
					element={noteSection.label}
					initialValue={noteSection.note ?? ''}
					showDelete={Boolean(noteSection.note)}
					position={getNotePopupPosition(noteSection)}
					onsubmit={saveNote}
					oncancel={cancelNote}
					ondelete={clearNote}
				/>
			{/key}
		{/if}
	{/if}

	<div class="controls" data-rearrange-mode-controls>
		<div class="vstack-sm-end">
			<Button variant="outline" onclick={captureSections}>Capture sections</Button>
			<Button variant="ghost" onclick={clearAll}>Clear all</Button>
		</div>
	</div>
</div>

<style>
	.rearrange-container {
		position: fixed;
		inset: 0;
		z-index: 1001;
		pointer-events: none;
	}

	.hover-rect {
		position: absolute;
		border: 1px dashed var(--dry-color-fill-brand, #7c3aed);
		background: color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 6%, transparent);
		border-radius: 12px;
		pointer-events: none;
	}

	.label-above {
		position: absolute;
		left: 8px;
		top: -28px;
	}

	.label-above--no-events {
		pointer-events: none;
	}

	.draw-layer {
		position: fixed;
		inset: 0;
		pointer-events: auto;
	}

	.connector-svg {
		position: fixed;
		inset: 0;
		height: 100vh;
		pointer-events: none;
		overflow: visible;
	}

	.section-box {
		position: absolute;
		border-radius: 12px;
		cursor: move;
		padding: 8px;
		pointer-events: auto;
		transition:
			opacity 0.18s ease,
			transform 0.18s cubic-bezier(0.32, 0.72, 0, 1),
			box-shadow 0.15s ease;
	}

	.section-unchanged {
		border: 1px solid color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 55%, white);
		background: color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 7%, transparent);
	}

	.section-changed {
		border: 1.5px dashed color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 72%, white);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.note-below {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -20px;
		pointer-events: none;
	}

	.corner-handle {
		position: absolute;
		aspect-ratio: 1;
		height: 8px;
		border-radius: 3px;
		border: 1px solid var(--dry-color-bg-overlay, #fff);
		background: var(--dry-color-bg-overlay, #fff);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 36%, transparent);
		pointer-events: auto;
		z-index: 20;
		padding: 0;
	}

	.edge-handle {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		background: transparent;
		pointer-events: auto;
		z-index: 18;
	}

	.edge-handle-pip {
		position: absolute;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 82%, white);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 20%, transparent);
	}

	.edge-handle-icon {
		position: relative;
		z-index: 1;
		aspect-ratio: 1;
		height: 12px;
		opacity: 0.72;
		color: var(--dry-color-bg-overlay, #fff);
		filter: drop-shadow(
			0 0 2px color-mix(in srgb, var(--dry-color-text-strong, #111827) 18%, transparent)
		);
	}

	.draw-box {
		position: absolute;
		border: 1px dashed var(--dry-color-fill-brand, #7c3aed);
		background: color-mix(in srgb, var(--dry-color-fill-brand, #7c3aed) 8%, transparent);
		pointer-events: none;
	}

	.guide-line {
		position: absolute;
		pointer-events: none;
		background: var(--dry-color-fill-brand, #7c3aed);
		opacity: 0.4;
	}

	.size-indicator {
		position: fixed;
		z-index: 1003;
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--dry-color-bg-overlay, #fff);
		border: 1px solid var(--dry-color-stroke-weak, #ddd);
		pointer-events: none;
	}

	.controls {
		position: fixed;
		right: 16px;
		bottom: 16px;
		pointer-events: auto;
	}

	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.hstack-sm {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.vstack-sm-end {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
		justify-items: end;
	}
</style>
