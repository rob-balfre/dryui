<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Badge, Text } from '@dryui/ui';
	import AnnotationPopup from '../components/annotation-popup.svelte';
	import {
		computeSnap,
		createRectFromPoint,
		isMeaningfulDrag,
		MIN_SIZE,
		type Guide
	} from './geometry.js';
	import { createMountManager } from './live-mount.js';
	import ResponsiveBar from './responsive-bar.svelte';
	import {
		COMPONENT_REGISTRY,
		DEFAULT_SIZES,
		type CanvasWidth,
		type DesignPlacement,
		type LayoutModeComponentType,
		type Rect
	} from './types.js';

	interface Props {
		placements: DesignPlacement[];
		activeComponent: LayoutModeComponentType | null;
		wireframe?: boolean;
		passthrough?: boolean;
		extraSnapRects?: Rect[];
		deselectSignal?: number;
		clearSignal?: number;
		exiting?: boolean;
		canvasWidth?: CanvasWidth;
		class?: string;
		onChange?: (placements: DesignPlacement[]) => void;
		onActiveComponentChange?: (type: LayoutModeComponentType | null) => void;
		onInteractionChange?: (active: boolean) => void;
		onSelectionChange?: (selectedIds: Set<string>, isShift: boolean) => void;
		onDragMove?: (dx: number, dy: number) => void;
		onDragEnd?: (dx: number, dy: number, committed: boolean) => void;
		onCanvasWidthChange?: (width: CanvasWidth) => void;
		onHistoryPush?: () => void;
	}

	type Point = { x: number; y: number };
	type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
	type Interaction = 'place' | 'move' | 'resize';
	const CORNER_HANDLES: HandleDir[] = ['nw', 'ne', 'se', 'sw'];
	const EDGE_HANDLES: HandleDir[] = ['n', 'e', 's', 'w'];
	const HANDLE_OFFSETS: HandleDir[] = [...CORNER_HANDLES, ...EDGE_HANDLES];
	const TEXT_PLACEHOLDERS: Partial<Record<LayoutModeComponentType, string>> = {
		alert: 'Alert message',
		banner: 'Banner text',
		badge: 'Badge label',
		breadcrumb: 'Breadcrumb labels',
		button: 'Button label',
		card: 'Card title',
		cta: 'Call to action text',
		hero: 'Headline text',
		input: 'Placeholder text',
		modal: 'Dialog title',
		navigation: 'Brand or nav items',
		notification: 'Notification message',
		pricing: 'Plan name or price',
		search: 'Search placeholder',
		stat: 'Metric value',
		tabs: 'Tab labels',
		tag: 'Tag label',
		testimonial: 'Quote text',
		text: 'Label or content text',
		toast: 'Notification message'
	};
	const COMPONENT_LABELS = new Map(
		COMPONENT_REGISTRY.flatMap((section) =>
			section.items.map((item) => [item.type, item.label] as const)
		)
	);

	let {
		placements,
		activeComponent = $bindable(null),
		wireframe = false,
		passthrough = false,
		extraSnapRects,
		deselectSignal,
		clearSignal,
		exiting = false,
		canvasWidth = 1280 as CanvasWidth,
		class: className,
		onChange,
		onActiveComponentChange,
		onInteractionChange,
		onSelectionChange,
		onDragMove,
		onDragEnd,
		onCanvasWidthChange,
		onHistoryPush
	}: Props = $props();

	const mountManager = createMountManager();

	let selectedIds = $state<string[]>([]);
	let guides = $state<Guide[]>([]);
	let drawBox = $state<Rect | null>(null);
	let selectBox = $state<Rect | null>(null);
	let sizeIndicator = $state<{ x: number; y: number; text: string } | null>(null);
	let pointerStart = $state<Point | null>(null);
	let interaction = $state<Interaction | null>(null);
	let editingPlacementId = $state<string | null>(null);
	let interactingId = $state<string | null>(null);
	let documentHeight = $state(0);
	let canvasOverlay = $state<HTMLDivElement | null>(null);
	let lastDeselectSignal: number | undefined = undefined;
	let lastClearSignal: number | undefined = undefined;

	function generateId(): string {
		return `dp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	}

	function isPrimaryButton(event: PointerEvent | MouseEvent): boolean {
		return event.button === 0;
	}

	function isSelected(id: string): boolean {
		return selectedIds.includes(id);
	}

	function setSelection(ids: string[], shiftKey: boolean = false) {
		selectedIds = ids;
		onSelectionChange?.(new Set(ids), shiftKey);
	}

	function updatePlacements(nextPlacements: DesignPlacement[], commit = true) {
		onChange?.(nextPlacements);
		if (commit) onHistoryPush?.();
	}

	function placementAt(id: string): DesignPlacement | undefined {
		return placements.find((placement) => placement.id === id);
	}

	function canvasScrollTop(): number {
		return canvasOverlay?.scrollTop ?? 0;
	}

	function placementViewportRect(placement: DesignPlacement): Rect {
		return {
			x: placement.x,
			y: placement.y - canvasScrollTop(),
			width: placement.width,
			height: placement.height
		};
	}

	function notePopupPosition(placement: DesignPlacement): { x: number; y: number } {
		const rect = placementViewportRect(placement);
		const popupWidth = 360;
		const popupHeight = 240;
		const x = Math.max(
			12,
			Math.min(window.innerWidth - popupWidth - 12, rect.x + rect.width / 2 - popupWidth / 2)
		);
		const fitsAbove = rect.y > popupHeight + 24;
		const fitsBelow = rect.y + rect.height + popupHeight + 24 < window.innerHeight;

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

	function captureDefaultPlacement(point: Point): Rect {
		const size = activeComponent ? DEFAULT_SIZES[activeComponent] : { width: 120, height: 72 };
		return {
			x: point.x - size.width / 2,
			y: point.y - size.height / 2,
			width: size.width,
			height: size.height
		};
	}

	function applySelection(id: string, shiftKey: boolean): string[] {
		if (!shiftKey) {
			return [id];
		}

		return isSelected(id)
			? selectedIds.filter((selected) => selected !== id)
			: [...selectedIds, id];
	}

	function placementLabel(type: LayoutModeComponentType): string {
		return COMPONENT_LABELS.get(type) ?? type;
	}

	function layoutAccent(): string {
		return wireframe ? '#f97316' : 'var(--dry-color-fill-brand, #7c3aed)';
	}

	function handleCursorValue(handle: HandleDir): string {
		return handle === 'n' || handle === 's'
			? 'ns-resize'
			: handle === 'e' || handle === 'w'
				? 'ew-resize'
				: handle === 'ne' || handle === 'sw'
					? 'nesw-resize'
					: 'nwse-resize';
	}

	// --- Svelte actions for dynamic styling ---

	function accentStyle(node: HTMLElement, _wireframe: boolean) {
		function apply() {
			node.style.setProperty('--layout-accent', layoutAccent());
		}
		apply();
		return {
			update() {
				apply();
			}
		};
	}

	function canvasInnerStyle(node: HTMLElement, params: { minHeight: number; maxWidth: number }) {
		function apply(p: typeof params) {
			node.style.setProperty('min-height', `${p.minHeight}px`);
			node.style.setProperty('max-width', `${p.maxWidth}px`);
		}
		apply(params);
		return {
			update(p: typeof params) {
				apply(p);
			}
		};
	}

	function absoluteRect(
		node: HTMLElement,
		params: { x: number; y: number; width: number; height: number }
	) {
		function apply(p: typeof params) {
			node.style.setProperty('left', `${p.x}px`);
			node.style.setProperty('top', `${p.y}px`);
			node.style.setProperty('width', `${p.width}px`);
			node.style.setProperty('height', `${p.height}px`);
		}
		apply(params);
		return {
			update(p: typeof params) {
				apply(p);
			}
		};
	}

	function placementStyle(
		node: HTMLElement,
		params: {
			x: number;
			y: number;
			width: number;
			height: number;
			selected: boolean;
			interacting: boolean;
		}
	) {
		function apply(p: typeof params) {
			node.style.setProperty('left', `${p.x}px`);
			node.style.setProperty('top', `${p.y}px`);
			node.style.setProperty('width', `${p.width}px`);
			node.style.setProperty('height', `${p.height}px`);
			node.style.setProperty(
				'border',
				p.interacting
					? '2px solid var(--dry-color-fill-brand, #7c3aed)'
					: `1px solid color-mix(in srgb, var(--layout-accent) ${p.selected ? '52%' : '34%'}, transparent)`
			);
			node.style.setProperty(
				'background',
				`color-mix(in srgb, var(--layout-accent) ${p.selected ? '9%' : '4%'}, transparent)`
			);
			node.style.setProperty(
				'box-shadow',
				`0 10px 28px color-mix(in srgb, var(--layout-accent) ${p.selected ? '18%' : '8%'}, transparent)`
			);
			node.style.setProperty('cursor', p.interacting ? 'default' : 'move');
		}
		apply(params);
		return {
			update(p: typeof params) {
				apply(p);
			}
		};
	}

	function contentPointerEvents(node: HTMLElement, interacting: boolean) {
		node.style.setProperty('pointer-events', interacting ? 'auto' : 'none');
		return {
			update(value: boolean) {
				node.style.setProperty('pointer-events', value ? 'auto' : 'none');
			}
		};
	}

	function cornerHandleStyle(node: HTMLElement, handle: HandleDir) {
		function apply(h: HandleDir) {
			node.style.setProperty('cursor', handleCursorValue(h));
			node.style.setProperty(h.includes('n') ? 'top' : 'bottom', '-4px');
			node.style.setProperty(h.includes('w') ? 'left' : 'right', '-4px');
			// Clear the opposite sides
			node.style.removeProperty(h.includes('n') ? 'bottom' : 'top');
			node.style.removeProperty(h.includes('w') ? 'right' : 'left');
		}
		apply(handle);
		return {
			update(h: HandleDir) {
				apply(h);
			}
		};
	}

	function edgeHandleStyle(node: HTMLElement, handle: HandleDir) {
		function apply(h: HandleDir) {
			node.style.setProperty('cursor', handleCursorValue(h));
			// Reset all positioning
			node.style.removeProperty('left');
			node.style.removeProperty('right');
			node.style.removeProperty('top');
			node.style.removeProperty('bottom');
			node.style.removeProperty('width');
			node.style.removeProperty('height');
			switch (h) {
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
		apply(handle);
		return {
			update(h: HandleDir) {
				apply(h);
			}
		};
	}

	function edgePillStyle(node: HTMLElement, handle: HandleDir) {
		function apply(h: HandleDir) {
			if (h === 'n' || h === 's') {
				node.style.setProperty('width', '24px');
				node.style.setProperty('height', '4px');
			} else {
				node.style.setProperty('width', '4px');
				node.style.setProperty('height', '24px');
			}
		}
		apply(handle);
		return {
			update(h: HandleDir) {
				apply(h);
			}
		};
	}

	function guideStyle(node: HTMLElement, guide: Guide) {
		function apply(g: Guide) {
			if (g.axis === 'x') {
				node.style.setProperty('left', `${g.pos}px`);
				node.style.setProperty('top', '0');
				node.style.setProperty('width', '1px');
				node.style.setProperty('height', '100%');
			} else {
				node.style.setProperty('top', `${g.pos}px`);
				node.style.setProperty('left', '0');
				node.style.setProperty('height', '1px');
				node.style.setProperty('width', '100%');
			}
		}
		apply(guide);
		return {
			update(g: Guide) {
				apply(g);
			}
		};
	}

	function fixedPosition(node: HTMLElement, params: { x: number; y: number }) {
		function apply(p: typeof params) {
			node.style.setProperty('left', `${p.x}px`);
			node.style.setProperty('top', `${p.y}px`);
		}
		apply(params);
		return {
			update(p: typeof params) {
				apply(p);
			}
		};
	}

	function resetTransientState() {
		drawBox = null;
		selectBox = null;
		sizeIndicator = null;
		guides = [];
		pointerStart = null;
		interaction = null;
		onInteractionChange?.(false);
	}

	function startInteraction(
		event: PointerEvent,
		placementId?: string,
		movingIds: string[] = placementId ? [placementId] : []
	) {
		if (!isPrimaryButton(event) || passthrough) return;
		if (!placementId && !activeComponent) return;

		pointerStart = { x: event.clientX, y: event.clientY };
		interaction = placementId ? 'move' : 'place';
		onInteractionChange?.(true);

		const selectedPlacement = placementId ? placementAt(placementId) : undefined;
		const initialRect = selectedPlacement
			? {
					x: selectedPlacement.x,
					y: selectedPlacement.y,
					width: selectedPlacement.width,
					height: selectedPlacement.height
				}
			: captureDefaultPlacement(pointerStart);
		const baseRects = new Map(
			placements
				.filter((placement) => movingIds.includes(placement.id))
				.map(
					(placement) =>
						[
							placement.id,
							{ x: placement.x, y: placement.y, width: placement.width, height: placement.height }
						] as const
				)
		);

		if (!placementId && activeComponent) {
			const defaultSize = DEFAULT_SIZES[activeComponent];
			drawBox = {
				x: initialRect.x,
				y: initialRect.y,
				width: defaultSize.width,
				height: defaultSize.height
			};
		} else if (!placementId) {
			drawBox = {
				x: initialRect.x,
				y: initialRect.y,
				width: initialRect.width,
				height: initialRect.height
			};
		}

		const excluded = new Set<string>(placementId ? movingIds : selectedIds);
		let moved = false;
		let lastDx = 0;
		let lastDy = 0;
		let duplicated = false;
		let basePlacements = placements;

		const handleMove = (moveEvent: PointerEvent) => {
			if (!pointerStart) return;
			if (placementId) {
				const deltaX = moveEvent.clientX - pointerStart.x;
				const deltaY = moveEvent.clientY - pointerStart.y;
				if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
					moved = true;
				}
				if (moveEvent.altKey && !duplicated) {
					duplicated = true;
					basePlacements = [
						...placements,
						...placements
							.filter((placement) => movingIds.includes(placement.id))
							.map((placement) => ({
								...placement,
								id: generateId(),
								timestamp: Date.now()
							}))
					];
				}

				const movingPlacements = basePlacements.filter((placement) =>
					movingIds.includes(placement.id)
				);
				if (movingPlacements.length === 0) return;

				const bounds = movingPlacements.reduce(
					(acc, placement) => {
						const start = baseRects.get(placement.id);
						if (!start) return acc;
						const x = start.x + deltaX;
						const y = start.y + deltaY;
						return {
							x: Math.min(acc.x, x),
							y: Math.min(acc.y, y),
							right: Math.max(acc.right, x + start.width),
							bottom: Math.max(acc.bottom, y + start.height)
						};
					},
					{ x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity }
				);

				const nextRect = {
					x: bounds.x,
					y: bounds.y,
					width: bounds.right - bounds.x,
					height: bounds.bottom - bounds.y
				};
				const snapped = computeSnap(nextRect, basePlacements, excluded, undefined, extraSnapRects);
				const appliedDx = deltaX + snapped.dx;
				const appliedDy = deltaY + snapped.dy;
				lastDx = appliedDx;
				lastDy = appliedDy;
				guides = snapped.guides;

				updatePlacements(
					basePlacements.map((placement) => {
						const start = baseRects.get(placement.id);
						if (!start) return placement;
						return {
							...placement,
							x: Math.max(0, start.x + appliedDx),
							y: Math.max(0, start.y + appliedDy)
						};
					}),
					false
				);
				onDragMove?.(appliedDx, appliedDy);
				return;
			}

			const nextRect = createRectFromPoint(pointerStart, {
				x: moveEvent.clientX,
				y: moveEvent.clientY
			});
			const snapped = computeSnap(nextRect, placements, excluded, undefined, extraSnapRects);
			const rect = {
				x: nextRect.x + snapped.dx,
				y: nextRect.y + snapped.dy,
				width: nextRect.width,
				height: nextRect.height
			};

			guides = snapped.guides;
			if (!isMeaningfulDrag(rect, MIN_SIZE)) return;

			drawBox = rect;
			sizeIndicator = {
				x: moveEvent.clientX + 12,
				y: moveEvent.clientY + 12,
				text: `${Math.round(rect.width)} x ${Math.round(rect.height)}`
			};
		};

		const handleUp = () => {
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleUp);

			const committed = Boolean(drawBox && isMeaningfulDrag(drawBox, MIN_SIZE));
			if (placementId) {
				onDragEnd?.(lastDx, lastDy, moved);
			} else if (committed && drawBox) {
				const scrollY = canvasScrollTop();
				if (!placementId && activeComponent) {
					const nextPlacement: DesignPlacement = {
						id: generateId(),
						type: activeComponent,
						x: Math.max(0, drawBox.x),
						y: Math.max(0, drawBox.y) + scrollY,
						width: Math.max(MIN_SIZE, drawBox.width),
						height: Math.max(MIN_SIZE, drawBox.height),
						scrollY,
						timestamp: Date.now()
					};
					updatePlacements([...placements, nextPlacement]);
					setSelection([nextPlacement.id], false);
				} else {
					const nextPlacement: DesignPlacement = {
						id: generateId(),
						type: activeComponent ?? 'card',
						x: Math.max(0, drawBox.x),
						y: Math.max(0, drawBox.y) + scrollY,
						width: Math.max(MIN_SIZE, drawBox.width),
						height: Math.max(MIN_SIZE, drawBox.height),
						scrollY,
						timestamp: Date.now()
					};
					updatePlacements([...placements, nextPlacement]);
					setSelection([nextPlacement.id], false);
				}
			} else if (!placementId && activeComponent && pointerStart) {
				const scrollY = canvasScrollTop();
				const size = DEFAULT_SIZES[activeComponent];
				const nextPlacement: DesignPlacement = {
					id: generateId(),
					type: activeComponent,
					x: Math.max(0, pointerStart.x - size.width / 2),
					y: Math.max(0, pointerStart.y - size.height / 2) + scrollY,
					width: size.width,
					height: size.height,
					scrollY,
					timestamp: Date.now()
				};
				updatePlacements([...placements, nextPlacement]);
				setSelection([nextPlacement.id], false);
			}

			if (!placementId && activeComponent) {
				activeComponent = null;
				onActiveComponentChange?.(null);
			}

			resetTransientState();
		};

		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleUp);
	}

	function handleOverlayPointerDown(event: PointerEvent) {
		if (!isPrimaryButton(event) || passthrough) return;
		if (event.target instanceof HTMLElement && event.target.closest('[data-placement-id]')) return;

		const startScrollY = canvasScrollTop();
		const startPoint = { x: event.clientX, y: event.clientY };

		if (activeComponent) {
			onActiveComponentChange?.(activeComponent);
			startInteraction(event);
			return;
		}

		if (!(event.shiftKey || event.metaKey || event.ctrlKey)) {
			setSelection([], false);
		}

		interaction = 'place';
		onInteractionChange?.(true);
		let dragged = false;

		const handleMove = (moveEvent: PointerEvent) => {
			const box = createRectFromPoint(startPoint, { x: moveEvent.clientX, y: moveEvent.clientY });
			if (box.width > 4 || box.height > 4) {
				dragged = true;
			}
			if (!dragged) return;
			selectBox = box;
		};

		const handleUp = (moveEvent: PointerEvent) => {
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleUp);

			if (dragged) {
				const box = createRectFromPoint(startPoint, { x: moveEvent.clientX, y: moveEvent.clientY });
				const boxRect = {
					x: box.x,
					y: box.y + startScrollY,
					width: box.width,
					height: box.height
				};
				const selected = new Set(
					placements
						.filter((placement) => {
							const placementRect = {
								x: placement.x,
								y: placement.y,
								width: placement.width,
								height: placement.height
							};
							return (
								placementRect.x + placementRect.width > boxRect.x &&
								placementRect.x < boxRect.x + boxRect.width &&
								placementRect.y + placementRect.height > boxRect.y &&
								placementRect.y < boxRect.y + boxRect.height
							);
						})
						.map((placement) => placement.id)
				);

				const shiftKey = event.shiftKey || event.metaKey || event.ctrlKey;
				if (shiftKey) {
					setSelection([...new Set([...selectedIds, ...selected])], true);
				} else {
					setSelection(Array.from(selected), false);
				}
			}

			resetTransientState();
		};

		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleUp);
	}

	function handlePlacementPointerDown(event: PointerEvent, id: string) {
		event.stopPropagation();
		const shiftKey = event.shiftKey || event.metaKey || event.ctrlKey;
		const nextSelection = applySelection(id, shiftKey);
		const movingIds = isSelected(id) && !shiftKey ? [...selectedIds] : nextSelection;
		setSelection(nextSelection, shiftKey);
		startInteraction(event, id, movingIds);
	}

	function openPlacementEditor(id: string) {
		setSelection([id], false);
		editingPlacementId = id;
	}

	function closePlacementEditor() {
		editingPlacementId = null;
	}

	function savePlacementText(text: string) {
		if (!editingPlacementId) return;

		updatePlacements(
			placements.map((placement) =>
				placement.id === editingPlacementId
					? { ...placement, text: text.trim() || undefined }
					: placement
			)
		);
		editingPlacementId = null;
	}

	function clearPlacementText() {
		if (!editingPlacementId) return;

		updatePlacements(
			placements.map((placement) =>
				placement.id === editingPlacementId ? { ...placement, text: undefined } : placement
			)
		);
		editingPlacementId = null;
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

	function startResize(event: MouseEvent, placementId: string, dir: HandleDir) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();

		const placement = placementAt(placementId);
		if (!placement) return;

		setSelection([placementId], false);
		onInteractionChange?.(true);
		interaction = 'resize';

		const baseRect = {
			x: placement.x,
			y: placement.y,
			width: placement.width,
			height: placement.height
		};
		const activeEdges = {
			left: dir.includes('w'),
			right: dir.includes('e'),
			top: dir.includes('n'),
			bottom: dir.includes('s')
		};

		const handleMove = (moveEvent: MouseEvent) => {
			const nextRect = resizeRect(
				baseRect,
				dir,
				moveEvent.clientX - event.clientX,
				moveEvent.clientY - event.clientY,
				moveEvent.shiftKey
			);
			const snapped = computeSnap(
				nextRect,
				placements,
				new Set([placementId]),
				activeEdges,
				extraSnapRects
			);
			const resized = { ...nextRect };

			if (snapped.dx !== 0) {
				if (activeEdges.right) {
					resized.width = Math.max(MIN_SIZE, resized.width + snapped.dx);
				} else if (activeEdges.left) {
					resized.x += snapped.dx;
					resized.width = Math.max(MIN_SIZE, resized.width - snapped.dx);
				}
			}

			if (snapped.dy !== 0) {
				if (activeEdges.bottom) {
					resized.height = Math.max(MIN_SIZE, resized.height + snapped.dy);
				} else if (activeEdges.top) {
					resized.y += snapped.dy;
					resized.height = Math.max(MIN_SIZE, resized.height - snapped.dy);
				}
			}

			guides = snapped.guides;
			sizeIndicator = {
				x: moveEvent.clientX + 12,
				y: moveEvent.clientY + 12,
				text: `${Math.round(resized.width)} x ${Math.round(resized.height)}`
			};

			updatePlacements(
				placements.map((candidate) =>
					candidate.id === placementId ? { ...candidate, ...resized } : candidate
				),
				false
			);
		};

		const handleUp = () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);
			sizeIndicator = null;
			guides = [];
			interaction = null;
			onInteractionChange?.(false);
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);
	}

	function deletePlacement(id: string) {
		mountManager.unmountComponent(id);
		if (interactingId === id) interactingId = null;
		updatePlacements(placements.filter((placement) => placement.id !== id));
		setSelection(
			selectedIds.filter((selectedId) => selectedId !== id),
			false
		);
		if (editingPlacementId === id) {
			editingPlacementId = null;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && interactingId) {
			interactingId = null;
			return;
		}

		if (event.key === 'Escape' && editingPlacementId) {
			closePlacementEditor();
			return;
		}

		if (event.key === 'Escape') {
			setSelection([], false);
			activeComponent = null;
			onActiveComponentChange?.(null);
			return;
		}

		if (
			event.key.toLowerCase() === 'i' &&
			!event.metaKey &&
			!event.ctrlKey &&
			selectedIds.length === 1
		) {
			event.preventDefault();
			const targetId = selectedIds[0]!;
			interactingId = interactingId === targetId ? null : targetId;
			return;
		}

		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
			event.preventDefault();
			setSelection(
				placements.map((placement) => placement.id),
				false
			);
			return;
		}

		if (selectedIds.length === 0) return;

		if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'd') {
			event.preventDefault();
			const duplicated = placements
				.filter((placement) => selectedIds.includes(placement.id))
				.map((placement) => ({
					...placement,
					id: generateId(),
					x: Math.max(0, placement.x + 20),
					y: Math.max(0, placement.y + 20),
					timestamp: Date.now()
				}));

			if (duplicated.length === 0) return;

			updatePlacements([...placements, ...duplicated]);
			setSelection(
				duplicated.map((placement) => placement.id),
				false
			);
			return;
		}

		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			updatePlacements(placements.filter((placement) => !selectedIds.includes(placement.id)));
			setSelection([], false);
			return;
		}

		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

		event.preventDefault();
		const step = event.shiftKey ? 20 : 1;
		const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
		const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

		updatePlacements(
			placements.map((placement) =>
				selectedIds.includes(placement.id)
					? { ...placement, x: Math.max(0, placement.x + dx), y: Math.max(0, placement.y + dy) }
					: placement
			)
		);
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
			selectBox = null;
			sizeIndicator = null;
			guides = [];
			pointerStart = null;
			interaction = null;
			onInteractionChange?.(false);
			selectedIds = [];
			onSelectionChange?.(new Set(), false);
			onChange?.([]);
		});
	});

	// Measure document height for inner scroll container
	$effect(() => {
		function measure() {
			documentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
		}
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	});

	// Exit interact mode when clicking outside the interacting placement
	$effect(() => {
		if (!interactingId) return;
		function handleClickOutside(event: MouseEvent) {
			if (!(event.target instanceof HTMLElement)) return;
			const placementEl = event.target.closest(`[data-placement-id="${interactingId}"]`);
			if (!placementEl) {
				interactingId = null;
			}
		}
		window.addEventListener('pointerdown', handleClickOutside, true);
		return () => window.removeEventListener('pointerdown', handleClickOutside, true);
	});

	onDestroy(() => mountManager.unmountAll());

	// Svelte action: mount live thumbnail into placement content wrapper
	function mountLiveThumbnail(
		node: HTMLElement,
		params: { id: string; type: LayoutModeComponentType }
	) {
		mountManager.mountComponent(params.id, params.type, node);
		return {
			destroy() {
				mountManager.unmountComponent(params.id);
			}
		};
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	bind:this={canvasOverlay}
	class="{className} design-canvas-overlay"
	data-layout-mode
	data-exiting={exiting ? 'true' : 'false'}
	role="application"
	aria-label="Layout mode canvas"
	use:accentStyle={wireframe}
	onpointerdown={handleOverlayPointerDown}
>
	<ResponsiveBar value={canvasWidth} onchange={(w) => onCanvasWidthChange?.(w)} />

	<div
		data-canvas-inner
		class="canvas-inner"
		use:canvasInnerStyle={{ minHeight: documentHeight, maxWidth: canvasWidth }}
	>
		{#if wireframe}
			<div class="wireframe-overlay"></div>
		{/if}

		{#if placements.length === 0}
			<div class="empty-hint">
				<div class="vstack-sm">
					<Text as="div" size="md">Layout mode</Text>
					<Text as="div" size="sm" color="secondary">
						Click or drag to place the selected component.
					</Text>
				</div>
			</div>
		{/if}

		{#each placements as placement (placement.id)}
			{@const selected = isSelected(placement.id)}
			{@const interacting = interactingId === placement.id}
			{@const label = placementLabel(placement.type)}
			<div
				data-placement-id={placement.id}
				data-selected={selected ? 'true' : 'false'}
				data-interacting={interacting ? 'true' : 'false'}
				class="placement-box"
				role="button"
				tabindex="0"
				aria-label={label}
				use:placementStyle={{
					x: placement.x,
					y: placement.y,
					width: placement.width,
					height: placement.height,
					selected,
					interacting
				}}
				onpointerdown={(event) => {
					if (!interacting) handlePlacementPointerDown(event, placement.id);
				}}
				ondblclick={() => openPlacementEditor(placement.id)}
			>
				<span data-design-placement-label class="placement-label">
					{label}{#if interacting}
						(interact){/if}
				</span>
				{#if placement.text}
					<span data-design-placement-note class="placement-note">
						{placement.text}
					</span>
				{/if}
				<div
					data-design-placement-content
					class="placement-content"
					use:contentPointerEvents={interacting}
					use:mountLiveThumbnail={{ id: placement.id, type: placement.type }}
				></div>
				{#if selected && !interacting}
					<button
						type="button"
						aria-label={`Delete ${label}`}
						data-testid="design-delete-btn"
						class="placement-delete-btn"
						onpointerdown={(event) => event.stopPropagation()}
						onclick={(event) => {
							event.stopPropagation();
							deletePlacement(placement.id);
						}}
					>
						x
					</button>
				{/if}
				{#if selected && selectedIds.length === 1 && !interacting}
					{#each CORNER_HANDLES as handle (handle)}
						<button
							type="button"
							aria-label={`Resize ${handle}`}
							class="corner-handle"
							use:cornerHandleStyle={handle}
							onmousedown={(event) => startResize(event, placement.id, handle)}
						></button>
					{/each}
					{#each EDGE_HANDLES as handle (handle)}
						<button
							type="button"
							aria-label={`Resize ${handle}`}
							class="edge-handle"
							use:edgeHandleStyle={handle}
							onmousedown={(event) => startResize(event, placement.id, handle)}
						>
							<span aria-hidden="true" class="edge-pill" use:edgePillStyle={handle}></span>
							<svg aria-hidden="true" viewBox="0 0 12 12" class="edge-icon">
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

		{#if editingPlacementId}
			{@const editingPlacement = placementAt(editingPlacementId)}
			{#if editingPlacement}
				{#key editingPlacement.id}
					<AnnotationPopup
						element={editingPlacement.type}
						fieldLabel="Text"
						helperText="Use this to describe the component label or content."
						initialValue={editingPlacement.text ?? ''}
						placeholder={TEXT_PLACEHOLDERS[editingPlacement.type] ?? 'Label or content text'}
						position={notePopupPosition(editingPlacement)}
						showDelete={Boolean(editingPlacement.text)}
						submitLabel={editingPlacement.text ? 'Save' : 'Set'}
						onsubmit={savePlacementText}
						oncancel={closePlacementEditor}
						ondelete={clearPlacementText}
					/>
				{/key}
			{/if}
		{/if}

		{#if drawBox}
			<div
				class="draw-box"
				use:absoluteRect={{
					x: drawBox.x,
					y: drawBox.y,
					width: drawBox.width,
					height: drawBox.height
				}}
			></div>
		{/if}

		{#if selectBox}
			<div
				data-design-select-box
				class="select-box"
				use:absoluteRect={{
					x: selectBox.x,
					y: selectBox.y,
					width: selectBox.width,
					height: selectBox.height
				}}
			></div>
		{/if}

		{#each guides as guide, index (index)}
			<div class="guide-line" use:guideStyle={guide}></div>
		{/each}
	</div>

	{#if sizeIndicator}
		<div class="size-indicator" use:fixedPosition={{ x: sizeIndicator.x, y: sizeIndicator.y }}>
			<Text as="div" size="sm">{sizeIndicator.text}</Text>
		</div>
	{/if}

	{#if activeComponent}
		<div class="active-component-hint">
			<div class="vstack-sm-end">
				<Badge variant="solid">{activeComponent}</Badge>
				<Text as="div" size="sm" color="secondary">Drag on the page to size the placement.</Text>
			</div>
		</div>
	{/if}
</div>

<style>
	.design-canvas-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		pointer-events: auto;
		overflow: auto;
		--dry-color-fill-brand: var(--layout-accent);
	}

	.canvas-inner {
		position: relative;
		margin: 0 auto;
	}

	.wireframe-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), transparent);
		pointer-events: none;
	}

	.empty-hint {
		position: fixed;
		left: 24px;
		bottom: 24px;
		pointer-events: none;
	}

	.placement-box {
		position: absolute;
		border-radius: 12px;
		overflow: visible;
	}

	.placement-label {
		position: absolute;
		left: 0;
		bottom: calc(100% + 6px);
		font-size: 11px;
		line-height: 1;
		font-weight: 600;
		color: color-mix(in srgb, var(--dry-color-text-strong, #111827) 72%, transparent);
		pointer-events: none;
		white-space: nowrap;
	}

	.placement-note {
		position: absolute;
		left: 0;
		top: calc(100% + 6px);
		display: grid;
		grid-template-columns: minmax(0, min(22rem, calc(100vw - 48px)));
		font-size: 11px;
		line-height: 1.35;
		color: color-mix(in srgb, var(--dry-color-text-strong, #111827) 56%, transparent);
		pointer-events: none;
	}

	.placement-content {
		block-size: 100%;
		overflow: hidden;
		border-radius: inherit;
		background: color-mix(in srgb, var(--dry-color-bg-overlay, #fff) 92%, transparent);
		backdrop-filter: blur(8px);
	}

	.placement-delete-btn {
		position: absolute;
		top: -16px;
		right: -16px;
		aspect-ratio: 1;
		block-size: 22px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--layout-accent) 28%, transparent);
		background: var(--dry-color-bg-overlay, #fff);
		box-shadow: 0 6px 14px rgba(15, 23, 42, 0.16);
		color: color-mix(in srgb, var(--dry-color-text-strong, #111827) 72%, transparent);
		cursor: pointer;
		z-index: 30;
	}

	.corner-handle {
		position: absolute;
		aspect-ratio: 1;
		height: 8px;
		border-radius: 3px;
		border: 1px solid var(--dry-color-bg-overlay, #fff);
		background: var(--dry-color-bg-overlay, #fff);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--layout-accent) 36%, transparent);
		pointer-events: auto;
		z-index: 20;
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

	.edge-pill {
		position: absolute;
		border-radius: 999px;
		background: color-mix(in srgb, var(--layout-accent) 82%, white);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--layout-accent) 20%, transparent);
	}

	.edge-icon {
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
		border: 1px dashed var(--layout-accent);
		background: color-mix(in srgb, var(--layout-accent) 8%, transparent);
		pointer-events: none;
	}

	.select-box {
		position: absolute;
		border: 1px dashed var(--layout-accent);
		background: color-mix(in srgb, var(--layout-accent) 10%, transparent);
		pointer-events: none;
	}

	.guide-line {
		position: absolute;
		pointer-events: none;
		background: var(--layout-accent);
		opacity: 0.4;
	}

	.size-indicator {
		position: fixed;
		z-index: 1002;
		padding: 6px 10px;
		border-radius: 999px;
		background: var(--dry-color-bg-overlay, #fff);
		border: 1px solid var(--dry-color-stroke-weak, #ddd);
		pointer-events: none;
	}

	.active-component-hint {
		position: fixed;
		right: 16px;
		bottom: 16px;
		pointer-events: none;
	}

	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.vstack-sm-end {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
		justify-items: end;
	}
</style>
