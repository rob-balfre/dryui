<script lang="ts">
	import { Portal, Toast } from '@dryui/ui';
	import { Hotkey } from '@dryui/primitives/hotkey';
	import { Check } from 'lucide-svelte';
	import type {
		Arrow,
		Drawing,
		DrawingSpace,
		FeedbackProps,
		Point,
		Stroke,
		Tool
	} from './types.js';
	import Toolbar from './components/toolbar.svelte';

	const ANNOTATION_FILL = 'hsl(25 100% 55%)';
	const ANNOTATION_OUTLINE = 'hsl(0 0% 100%)';
	const STROKE_OUTLINE_WIDTH = 4;
	const TEXT_OUTLINE_RATIO = 0.22;

	let {
		color = ANNOTATION_FILL,
		strokeWidth = 3,
		shortcut = '$mod+m',
		serverUrl,
		scrollRoot,
		class: className
	}: FeedbackProps = $props();

	let active = $state(false);
	let tool = $state<Tool>('pencil');
	let drawings: Drawing[] = $state([]);
	let currentStroke: Stroke | null = $state(null);
	let currentArrow: Arrow | null = $state(null);
	let textInput: { position: Point; value: string; space: DrawingSpace } | null = $state(null);
	let textInputEl: HTMLInputElement | undefined = $state();
	let erasing = $state(false);
	let moving: { drawingId: string; lastPoint: Point; space: DrawingSpace } | null = $state(null);
	let justCommitted = false;
	let saveVersion = $state(0);
	let submitting = $state(false);
	let sent = $state(false);
	let toasts: FeedbackToast[] = $state([]);
	let toolbarHiddenForCapture = $state(false);
	let scrollRootEl: HTMLElement | null = $state(null);
	let viewportLeft = $state(0);
	let viewportTop = $state(0);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let scrollX = $state(0);
	let scrollY = $state(0);
	let layerHostEl: HTMLElement | null = $state(null);
	let layerOriginLeft = $state(0);
	let layerOriginTop = $state(0);
	const toastTimers: Record<string, ReturnType<typeof setTimeout>> = Object.create(null);

	const ERASE_RADIUS = 12;
	const ARROW_HEAD_SIZE = 12;
	const TEXT_FONT_SIZE = 16;
	const SCROLLABLE_OVERFLOW = new Set(['auto', 'scroll', 'overlay']);
	const SUCCESS_TOAST_DURATION_MS = 4000;
	const ERROR_TOAST_DURATION_MS = 6000;

	interface FeedbackToast {
		id: string;
		variant: 'success' | 'error';
		title: string;
		description: string;
	}

	function outlinedStrokeWidth(width: number): number {
		return width + STROKE_OUTLINE_WIDTH;
	}

	function outlinedTextWidth(fontSize: number): number {
		return Math.max(3, fontSize * TEXT_OUTLINE_RATIO);
	}

	function normalizeDrawing(drawing: Drawing): Drawing {
		return { ...drawing, color };
	}

	function drawingSpace(drawing: Pick<Drawing, 'space'>): DrawingSpace {
		return drawing.space ?? 'scroll';
	}

	function isOpenPopover(node: HTMLElement): boolean {
		try {
			return node.matches(':popover-open');
		} catch {
			return false;
		}
	}

	function isLayerHost(node: Element | null): node is HTMLElement {
		if (node instanceof HTMLDialogElement) return node.open;
		return node instanceof HTMLElement && node.matches('[popover]') && isOpenPopover(node);
	}

	function resolveLayerHost(preferred?: HTMLElement | null): HTMLElement | null {
		if (isLayerHost(preferred ?? null)) return preferred ?? null;

		const popovers = Array.from(document.querySelectorAll<HTMLElement>('[popover]')).filter(
			isOpenPopover
		);
		if (popovers.length > 0) return popovers.at(-1) ?? null;

		const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
		if (dialogs.length > 0) return dialogs.at(-1) ?? null;

		return null;
	}

	function syncLayerHost(preferred?: HTMLElement | null) {
		if (typeof document === 'undefined') return;
		layerHostEl = resolveLayerHost(preferred);
		updateLayerMetrics();
	}

	function updateLayerMetrics() {
		if (!layerHostEl) {
			if (layerOriginLeft !== 0) layerOriginLeft = 0;
			if (layerOriginTop !== 0) layerOriginTop = 0;
			return;
		}

		const rect = layerHostEl.getBoundingClientRect();
		const newLeft = rect.left + layerHostEl.clientLeft;
		const newTop = rect.top + layerHostEl.clientTop;
		if (newLeft !== layerOriginLeft) layerOriginLeft = newLeft;
		if (newTop !== layerOriginTop) layerOriginTop = newTop;
	}

	function toggle() {
		active = !active;
		if (!active) {
			currentStroke = null;
			currentArrow = null;
			commitText();
			erasing = false;
			moving = null;
		}
	}

	function setTool(t: Tool) {
		if (textInput) commitText();
		tool = t;
	}

	// --- Text ---

	function commitText() {
		if (textInput && textInput.value.trim()) {
			drawings = [
				...drawings,
				{
					id: crypto.randomUUID(),
					kind: 'text',
					position: textInput.position,
					text: textInput.value.trim(),
					color,
					space: textInput.space,
					fontSize: TEXT_FONT_SIZE
				}
			];
		}
		textInput = null;
		justCommitted = true;
		saveVersion++;
		setTimeout(() => (justCommitted = false), 0);
	}

	function handleTextKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitText();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			textInput = null;
		}
	}

	function handleTextInputFocusOut(event: FocusEvent) {
		const currentTarget = event.currentTarget as HTMLElement | null;
		if (currentTarget?.contains(event.relatedTarget as Node | null)) return;
		commitText();
	}

	function resolveScrollRoot(): HTMLElement | null {
		if (typeof document === 'undefined') return null;
		if (typeof scrollRoot === 'string') return document.querySelector<HTMLElement>(scrollRoot);
		if (typeof HTMLElement !== 'undefined' && scrollRoot instanceof HTMLElement) return scrollRoot;
		return null;
	}

	function updateScrollMetrics() {
		const target = resolveScrollRoot();
		scrollRootEl = target;

		let newLeft: number, newTop: number, newWidth: number, newHeight: number;
		let newScrollX: number, newScrollY: number;

		if (target) {
			const rect = target.getBoundingClientRect();
			newLeft = rect.left;
			newTop = rect.top;
			newWidth = rect.width;
			newHeight = rect.height;
			newScrollX = target.scrollLeft;
			newScrollY = target.scrollTop;
		} else {
			newLeft = 0;
			newTop = 0;
			newWidth = window.innerWidth;
			newHeight = window.innerHeight;
			newScrollX = window.scrollX;
			newScrollY = window.scrollY;
		}

		if (newLeft !== viewportLeft) viewportLeft = newLeft;
		if (newTop !== viewportTop) viewportTop = newTop;
		if (newWidth !== viewportWidth) viewportWidth = newWidth;
		if (newHeight !== viewportHeight) viewportHeight = newHeight;
		if (newScrollX !== scrollX) scrollX = newScrollX;
		if (newScrollY !== scrollY) scrollY = newScrollY;
	}

	function isInsideScrollViewport(e: PointerEvent): boolean {
		if (!scrollRootEl) return true;

		return (
			e.clientX >= viewportLeft &&
			e.clientX <= viewportLeft + viewportWidth &&
			e.clientY >= viewportTop &&
			e.clientY <= viewportTop + viewportHeight
		);
	}

	function resolvePointerSpace(e: PointerEvent): DrawingSpace {
		if (!scrollRootEl || isInsideScrollViewport(e)) return 'scroll';
		return 'viewport';
	}

	function pointFromPointer(e: PointerEvent, space: DrawingSpace = resolvePointerSpace(e)): Point {
		if (space === 'viewport') {
			return { x: e.clientX, y: e.clientY };
		}

		return {
			x: e.clientX - viewportLeft + scrollX,
			y: e.clientY - viewportTop + scrollY
		};
	}

	function screenPoint(point: Point, space: DrawingSpace): Point {
		if (space === 'viewport') return point;
		return {
			x: viewportLeft - scrollX + point.x,
			y: viewportTop - scrollY + point.y
		};
	}

	function drawingTransform(space: DrawingSpace): string | undefined {
		if (space === 'viewport') return undefined;
		return `translate(${viewportLeft - scrollX} ${viewportTop - scrollY})`;
	}

	const scrollTransform = $derived(drawingTransform('scroll'));

	function removeToast(id: string) {
		toasts = toasts.filter((toast) => toast.id !== id);

		const timer = toastTimers[id];
		if (!timer) return;
		clearTimeout(timer);
		delete toastTimers[id];
	}

	function showToast(
		variant: FeedbackToast['variant'],
		title: string,
		description: string,
		duration: number
	) {
		const id = crypto.randomUUID();
		toasts = [...toasts, { id, variant, title, description }];
		toastTimers[id] = setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	function textInputStyle(position: Point, space: DrawingSpace): string {
		const { x, y } = screenPoint(position, space);
		return `left: ${x}px; top: ${y - 10}px;`;
	}

	function feedbackRootStyle(): string | undefined {
		if (!layerHostEl) return undefined;
		return `left: ${-layerOriginLeft}px; top: ${-layerOriginTop}px;`;
	}

	function waitForNextPaint(): Promise<void> {
		return new Promise((resolve) => requestAnimationFrame(() => resolve()));
	}

	function normalizeWheelDelta(delta: number, deltaMode: number, pageSize: number): number {
		if (deltaMode === WheelEvent.DOM_DELTA_LINE) return delta * 16;
		if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * pageSize;
		return delta;
	}

	function findScrollableAncestor(start: Element | null): HTMLElement | null {
		let el = start instanceof HTMLElement ? start : (start?.parentElement ?? null);

		while (el) {
			const style = getComputedStyle(el);
			const canScrollY =
				SCROLLABLE_OVERFLOW.has(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
			const canScrollX =
				SCROLLABLE_OVERFLOW.has(style.overflowX) && el.scrollWidth > el.clientWidth + 1;

			if (canScrollX || canScrollY) return el;
			el = el.parentElement;
		}

		return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
	}

	function resolveWheelTarget(e: WheelEvent): HTMLElement | null {
		if (scrollRootEl && isInsideScrollViewport(e as PointerEvent)) return scrollRootEl;

		const overlay = e.currentTarget as SVGSVGElement | null;
		const previousPointerEvents = overlay?.style.pointerEvents ?? '';

		if (overlay) overlay.style.pointerEvents = 'none';
		const underlying = document.elementFromPoint(e.clientX, e.clientY);
		if (overlay) overlay.style.pointerEvents = previousPointerEvents;

		return findScrollableAncestor(underlying);
	}

	function handleWheel(e: WheelEvent) {
		const target = resolveWheelTarget(e);
		if (!target) return;

		const dx = normalizeWheelDelta(e.deltaX, e.deltaMode, target.clientWidth);
		const dy = normalizeWheelDelta(e.deltaY, e.deltaMode, target.clientHeight);

		if (dx === 0 && dy === 0) return;

		target.scrollLeft += dx;
		target.scrollTop += dy;
		e.preventDefault();
	}

	// --- Freehand path ---

	function pointsToPath(points: Point[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
		if (points.length === 2)
			return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;

		const tension = 0.3;
		let d = `M ${points[0]!.x} ${points[0]!.y}`;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[Math.max(0, i - 1)]!;
			const p1 = points[i]!;
			const p2 = points[i + 1]!;
			const p3 = points[Math.min(points.length - 1, i + 2)]!;

			const cp1x = p1.x + (p2.x - p0.x) * tension;
			const cp1y = p1.y + (p2.y - p0.y) * tension;
			const cp2x = p2.x - (p3.x - p1.x) * tension;
			const cp2y = p2.y - (p3.y - p1.y) * tension;

			d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
		}

		return d;
	}

	// --- Arrow head path ---

	function arrowHeadPath(start: Point, end: Point): string {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const len = Math.hypot(dx, dy);
		if (len === 0) return '';

		const ux = dx / len;
		const uy = dy / len;

		const tipX = end.x;
		const tipY = end.y;
		const leftX = tipX - ux * ARROW_HEAD_SIZE + uy * ARROW_HEAD_SIZE * 0.5;
		const leftY = tipY - uy * ARROW_HEAD_SIZE - ux * ARROW_HEAD_SIZE * 0.5;
		const rightX = tipX - ux * ARROW_HEAD_SIZE - uy * ARROW_HEAD_SIZE * 0.5;
		const rightY = tipY - uy * ARROW_HEAD_SIZE + ux * ARROW_HEAD_SIZE * 0.5;

		return `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`;
	}

	// --- Eraser ---

	function distToSegment(p: Point, a: Point, b: Point): number {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const lenSq = dx * dx + dy * dy;
		if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
		const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
		return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
	}

	function drawingNearPoint(drawing: Drawing, px: number, py: number): boolean {
		const threshold =
			ERASE_RADIUS + (drawing.kind === 'text' ? drawing.fontSize : drawing.width) / 2;
		const space = drawingSpace(drawing);

		if (drawing.kind === 'freehand') {
			const pt = { x: px, y: py };
			for (let i = 0; i < drawing.points.length - 1; i++) {
				const start = screenPoint(drawing.points[i]!, space);
				const end = screenPoint(drawing.points[i + 1]!, space);
				if (distToSegment(pt, start, end) < threshold) return true;
			}
		} else if (drawing.kind === 'arrow') {
			const start = screenPoint(drawing.start, space);
			const end = screenPoint(drawing.end, space);
			if (distToSegment({ x: px, y: py }, start, end) < threshold) return true;
		} else {
			const position = screenPoint(drawing.position, space);
			const tx = position.x;
			const ty = position.y;
			const approxWidth = drawing.text.length * drawing.fontSize * 0.6;
			if (
				px >= tx - 4 &&
				px <= tx + approxWidth + 4 &&
				py >= ty - drawing.fontSize &&
				py <= ty + 4
			) {
				return true;
			}
		}
		return false;
	}

	function eraseAt(x: number, y: number) {
		const before = drawings.length;
		drawings = drawings.filter((d) => !drawingNearPoint(d, x, y));
		if (drawings.length !== before) saveVersion++;
	}

	// --- Move ---

	function findDrawingAt(x: number, y: number): Drawing | null {
		for (let i = drawings.length - 1; i >= 0; i--) {
			const d = drawings[i]!;
			if (drawingNearPoint(d, x, y)) return d;
		}
		return null;
	}

	function offsetDrawing(drawing: Drawing, dx: number, dy: number): Drawing {
		if (drawing.kind === 'freehand') {
			return { ...drawing, points: drawing.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
		} else if (drawing.kind === 'arrow') {
			return {
				...drawing,
				start: { x: drawing.start.x + dx, y: drawing.start.y + dy },
				end: { x: drawing.end.x + dx, y: drawing.end.y + dy }
			};
		} else {
			return {
				...drawing,
				position: { x: drawing.position.x + dx, y: drawing.position.y + dy }
			};
		}
	}

	// --- Pointer handlers ---

	function handlePointerDown(e: PointerEvent) {
		if (!active) return;
		const space = resolvePointerSpace(e);
		const point = pointFromPointer(e, space);

		if (tool === 'text') {
			e.preventDefault();
			if (textInput) {
				commitText();
				return;
			}
			if (justCommitted) return;

			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit && hit.kind === 'text') {
				textInput = {
					position: hit.position,
					value: hit.text,
					space: drawingSpace(hit)
				};
				drawings = drawings.filter((d) => d.id !== hit.id);
			} else {
				textInput = { position: point, value: '', space };
			}
			return;
		}

		e.preventDefault();
		(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);

		if (tool === 'pencil') {
			currentStroke = {
				id: crypto.randomUUID(),
				kind: 'freehand',
				points: [point],
				color,
				space,
				width: strokeWidth
			};
		} else if (tool === 'arrow') {
			currentArrow = {
				id: crypto.randomUUID(),
				kind: 'arrow',
				start: point,
				end: point,
				color,
				space,
				width: strokeWidth
			};
			// start stays anchored to the initial click; drag updates the arrowhead (end)
		} else if (tool === 'move') {
			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit) {
				const moveSpace = drawingSpace(hit);
				moving = {
					drawingId: hit.id,
					lastPoint: pointFromPointer(e, moveSpace),
					space: moveSpace
				};
			}
		} else {
			erasing = true;
			eraseAt(e.clientX, e.clientY);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (tool === 'pencil' && currentStroke) {
			e.preventDefault();
			const point = pointFromPointer(e, drawingSpace(currentStroke));
			currentStroke.points = [...currentStroke.points, point];
		} else if (tool === 'arrow' && currentArrow) {
			e.preventDefault();
			const point = pointFromPointer(e, drawingSpace(currentArrow));
			currentArrow.end = point;
		} else if (tool === 'move' && moving) {
			e.preventDefault();
			const point = pointFromPointer(e, moving.space);
			const dx = point.x - moving.lastPoint.x;
			const dy = point.y - moving.lastPoint.y;
			drawings = drawings.map((d) => (d.id === moving!.drawingId ? offsetDrawing(d, dx, dy) : d));
			moving.lastPoint = point;
		} else if (tool === 'eraser' && erasing) {
			e.preventDefault();
			eraseAt(e.clientX, e.clientY);
		}
	}

	function handlePointerUp() {
		if (tool === 'pencil' && currentStroke) {
			if (currentStroke.points.length > 1) {
				drawings = [...drawings, currentStroke];
				saveVersion++;
			}
			currentStroke = null;
		} else if (tool === 'arrow' && currentArrow) {
			const dx = currentArrow.end.x - currentArrow.start.x;
			const dy = currentArrow.end.y - currentArrow.start.y;
			if (Math.hypot(dx, dy) > 5) {
				drawings = [...drawings, currentArrow];
				saveVersion++;
			}
			currentArrow = null;
		} else if (tool === 'move' && moving) {
			moving = null;
			saveVersion++;
		} else if (tool === 'eraser') {
			erasing = false;
		}
	}

	const hasDrawings = $derived(drawings.length > 0);
	const showOverlay = $derived(active || hasDrawings);
	const cursorClass = $derived(
		active
			? tool === 'eraser'
				? 'eraser-cursor'
				: tool === 'arrow'
					? 'arrow-cursor'
					: tool === 'text'
						? 'text-cursor'
						: tool === 'move'
							? 'move-cursor'
							: ''
			: ''
	);

	// --- Screenshot + Submit ---

	async function captureScreenshot(): Promise<string> {
		let stream: MediaStream | null = null;
		const video = document.createElement('video');

		toolbarHiddenForCapture = true;
		await waitForNextPaint();
		await waitForNextPaint();

		const w = window.innerWidth;
		const h = window.innerHeight;

		try {
			// Capture the current tab via Screen Capture API
			stream = await navigator.mediaDevices.getDisplayMedia({
				video: { displaySurface: 'browser' },
				preferCurrentTab: true
			} as DisplayMediaStreamOptions);

			video.srcObject = stream;
			video.muted = true;
			await video.play();

			// Wait one frame for the video to render
			await waitForNextPaint();

			const canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext('2d')!;

			// Draw the page capture
			ctx.drawImage(video, 0, 0, w, h);

			const dataUrl = canvas.toDataURL('image/webp', 0.8);
			canvas.width = 0;
			canvas.height = 0;
			return dataUrl.split(',')[1]!;
		} finally {
			stream?.getTracks().forEach((track) => track.stop());
			video.srcObject = null;
			toolbarHiddenForCapture = false;
		}
	}

	async function readSubmissionError(response: Response): Promise<string> {
		try {
			const data = await response.json();
			if (
				typeof data === 'object' &&
				data &&
				'error' in data &&
				typeof data.error === 'string' &&
				data.error.trim()
			) {
				return data.error.trim();
			}
		} catch {
			// Fall back to the HTTP metadata below when the body is not JSON.
		}

		if (response.statusText) {
			return `${response.status} ${response.statusText}`;
		}

		return `Request failed with status ${response.status}`;
	}

	function submissionErrorDescription(error: unknown): string {
		if (error instanceof Error && error.message.trim()) return error.message;
		return 'Please try again.';
	}

	async function handleSubmit() {
		if (!serverUrl || submitting) return;
		submitting = true;
		try {
			const image = await captureScreenshot();
			const response = await fetch(`${serverUrl}/submissions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: location.href,
					image,
					drawings,
					viewport: { width: window.innerWidth, height: window.innerHeight }
				})
			});

			if (!response.ok) {
				throw new Error(await readSubmissionError(response));
			}

			submitting = false;
			sent = true;
			showToast(
				'success',
				'Feedback sent',
				'Your annotation and screenshot were queued for review.',
				SUCCESS_TOAST_DURATION_MS
			);
			setTimeout(() => {
				sent = false;
				drawings = [];
				saveVersion++;
				active = false;
			}, 1500);
		} catch (e) {
			console.error('Failed to submit feedback:', e);
			submitting = false;
			sent = false;
			showToast('error', 'Feedback failed', submissionErrorDescription(e), ERROR_TOAST_DURATION_MS);
		}
	}

	// --- Persistence ---

	let lastSavedVersion = 0;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	function pageUrl(): string {
		return typeof location !== 'undefined' ? location.pathname : '/';
	}

	$effect(() => {
		if (typeof document === 'undefined') return;

		syncLayerHost();

		function handleLayerToggle(event: Event) {
			const newState = event instanceof ToggleEvent ? event.newState : undefined;
			const target = event.target;
			const preferredTarget = newState === 'open' && target instanceof HTMLElement ? target : null;
			syncLayerHost(preferredTarget);
		}

		const observer = new MutationObserver((records) => {
			for (const record of records) {
				if (record.target instanceof HTMLDialogElement && record.attributeName === 'open') {
					syncLayerHost(record.target.open ? record.target : null);
					return;
				}
			}
		});

		document.addEventListener('toggle', handleLayerToggle, true);
		document.addEventListener('close', handleLayerToggle, true);
		document.addEventListener('cancel', handleLayerToggle, true);
		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ['open']
		});

		return () => {
			document.removeEventListener('toggle', handleLayerToggle, true);
			document.removeEventListener('close', handleLayerToggle, true);
			document.removeEventListener('cancel', handleLayerToggle, true);
			observer.disconnect();
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		updateScrollMetrics();
		updateLayerMetrics();

		const target = resolveScrollRoot();
		const host = layerHostEl;
		const updateAll = () => {
			updateScrollMetrics();
			updateLayerMetrics();
		};

		target?.addEventListener('scroll', updateScrollMetrics, { passive: true });
		window.addEventListener('scroll', updateScrollMetrics, { passive: true });
		window.addEventListener('resize', updateAll, { passive: true });

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' && (target || host)
				? new ResizeObserver(updateAll)
				: null;
		if (target && resizeObserver) resizeObserver.observe(target);
		if (host && resizeObserver) resizeObserver.observe(host);

		return () => {
			target?.removeEventListener('scroll', updateScrollMetrics);
			window.removeEventListener('scroll', updateScrollMetrics);
			window.removeEventListener('resize', updateAll);
			resizeObserver?.disconnect();
		};
	});

	$effect(() => {
		if (!serverUrl) return;
		const controller = new AbortController();
		fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl())}`, {
			signal: controller.signal
		})
			.then((r) => r.json())
			.then((data: Drawing[]) => {
				if (data.length) drawings = data.map(normalizeDrawing);
				lastSavedVersion = saveVersion;
			})
			.catch((error) => {
				if (error?.name === 'AbortError') return;
				lastSavedVersion = saveVersion;
			});
		return () => controller.abort();
	});

	$effect(() => {
		const v = saveVersion;
		if (!serverUrl || v === lastSavedVersion) return;

		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			lastSavedVersion = v;
			fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl())}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(drawings)
			}).catch(() => {});
		}, 500);

		return () => clearTimeout(saveTimer);
	});

	$effect(() => {
		if (!textInput || !textInputEl) return;

		const frame = requestAnimationFrame(() => textInputEl?.focus());
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		return () => {
			for (const timer of Object.values(toastTimers)) clearTimeout(timer);
			for (const id of Object.keys(toastTimers)) delete toastTimers[id];
		};
	});
</script>

<Hotkey keys={shortcut} handler={toggle} />

<Portal target={layerHostEl ?? 'body'}>
	<div
		class="feedback-root {className ?? ''}"
		data-dryui-feedback
		data-layer-hosted={layerHostEl ? '' : undefined}
		style={feedbackRootStyle()}
	>
		{#if showOverlay}
			<svg
				class="drawing-canvas {cursorClass}"
				data-active={active || undefined}
				role="application"
				aria-label="Feedback drawing canvas"
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerUp}
				onwheel={handleWheel}
			>
				<defs>
					<filter id="annotation-shadow" x="-50%" y="-50%" width="200%" height="200%">
						<feDropShadow
							dx="0"
							dy="1.5"
							stdDeviation="1.5"
							flood-color="black"
							flood-opacity="0.35"
						/>
					</filter>
				</defs>

				{#each drawings as drawing (drawing.id)}
					{@const transform = drawingSpace(drawing) === 'scroll' ? scrollTransform : undefined}
					{#if drawing.kind === 'freehand'}
						<g filter="url(#annotation-shadow)" {transform}>
							<path
								d={pointsToPath(drawing.points)}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(drawing.width)}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
							<path
								d={pointsToPath(drawing.points)}
								stroke={drawing.color}
								stroke-width={drawing.width}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
						</g>
					{:else if drawing.kind === 'arrow'}
						<g filter="url(#annotation-shadow)" {transform}>
							<line
								x1={drawing.start.x}
								y1={drawing.start.y}
								x2={drawing.end.x}
								y2={drawing.end.y}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(drawing.width)}
								stroke-linecap="round"
							/>
							<path
								d={arrowHeadPath(drawing.start, drawing.end)}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(drawing.width)}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
							<line
								x1={drawing.start.x}
								y1={drawing.start.y}
								x2={drawing.end.x}
								y2={drawing.end.y}
								stroke={drawing.color}
								stroke-width={drawing.width}
								stroke-linecap="round"
							/>
							<path
								d={arrowHeadPath(drawing.start, drawing.end)}
								stroke={drawing.color}
								stroke-width={drawing.width}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
						</g>
					{:else}
						<text
							x={drawing.position.x}
							y={drawing.position.y}
							{transform}
							filter="url(#annotation-shadow)"
							fill={drawing.color}
							stroke={ANNOTATION_OUTLINE}
							stroke-width={outlinedTextWidth(drawing.fontSize)}
							paint-order="stroke fill"
							stroke-linejoin="round"
							font-size={drawing.fontSize}
							font-family="system-ui, -apple-system, sans-serif"
							font-weight="600">{drawing.text}</text
						>
					{/if}
				{/each}

				{#if currentStroke}
					<g
						filter="url(#annotation-shadow)"
						transform={drawingTransform(drawingSpace(currentStroke))}
					>
						<path
							d={pointsToPath(currentStroke.points)}
							stroke={ANNOTATION_OUTLINE}
							stroke-width={outlinedStrokeWidth(currentStroke.width)}
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="none"
						/>
						<path
							d={pointsToPath(currentStroke.points)}
							stroke={currentStroke.color}
							stroke-width={currentStroke.width}
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="none"
						/>
					</g>
				{/if}

				{#if currentArrow}
					<g
						filter="url(#annotation-shadow)"
						transform={drawingTransform(drawingSpace(currentArrow))}
					>
						<line
							x1={currentArrow.start.x}
							y1={currentArrow.start.y}
							x2={currentArrow.end.x}
							y2={currentArrow.end.y}
							stroke={ANNOTATION_OUTLINE}
							stroke-width={outlinedStrokeWidth(currentArrow.width)}
							stroke-linecap="round"
						/>
						<path
							d={arrowHeadPath(currentArrow.start, currentArrow.end)}
							stroke={ANNOTATION_OUTLINE}
							stroke-width={outlinedStrokeWidth(currentArrow.width)}
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="none"
						/>
						<line
							x1={currentArrow.start.x}
							y1={currentArrow.start.y}
							x2={currentArrow.end.x}
							y2={currentArrow.end.y}
							stroke={currentArrow.color}
							stroke-width={currentArrow.width}
							stroke-linecap="round"
						/>
						<path
							d={arrowHeadPath(currentArrow.start, currentArrow.end)}
							stroke={currentArrow.color}
							stroke-width={currentArrow.width}
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="none"
						/>
					</g>
				{/if}
			</svg>
		{/if}

		{#if textInput}
			<div
				class="text-input-wrap"
				style={textInputStyle(textInput.position, textInput.space)}
				onfocusout={handleTextInputFocusOut}
			>
				<input
					class="text-input"
					type="text"
					data-feedback-text-input
					bind:this={textInputEl}
					bind:value={textInput.value}
					onkeydown={handleTextKeyDown}
					placeholder="Type annotation..."
				/>
				<button class="text-confirm-btn" onclick={commitText} aria-label="Confirm annotation">
					<Check size={14} />
				</button>
			</div>
		{/if}

		<Toolbar
			{active}
			{tool}
			hasDrawings={hasDrawings || sent}
			hidden={toolbarHiddenForCapture}
			{submitting}
			{sent}
			ontoggle={toggle}
			ontoolchange={setTool}
			onsubmit={handleSubmit}
		/>
	</div>

	{#if toasts.length > 0}
		<Toast.Provider class="feedback-toast-provider" position="top-right">
			{#each toasts as toast (toast.id)}
				<Toast.Root id={toast.id} variant={toast.variant}>
					<div class="feedback-toast-copy">
						<Toast.Title>{toast.title}</Toast.Title>
						<Toast.Description>{toast.description}</Toast.Description>
					</div>
				</Toast.Root>
			{/each}
		</Toast.Provider>
	{/if}
</Portal>

<style>
	.feedback-root {
		position: fixed;
		inset: 0;
		inline-size: 100vw;
		block-size: 100vh;
		z-index: 9998;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		overflow: visible;
		pointer-events: none;
	}

	.feedback-root[data-layer-hosted] {
		inset: auto;
	}

	.feedback-root :global(*) {
		pointer-events: auto;
	}

	.drawing-canvas {
		position: absolute;
		inset: 0;
		z-index: 9999;
		inline-size: 100%;
		block-size: 100%;
		pointer-events: none;
	}

	.drawing-canvas[data-active] {
		pointer-events: all;
		touch-action: none;
		cursor:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg transform='translate(0.6%200.8)' opacity='0.35' stroke='%23000' stroke-width='5'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='4'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3Cg stroke='%23ff7b1a' stroke-width='2.4'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3C/svg%3E")
				2 30,
			crosshair;
	}

	.drawing-canvas.arrow-cursor[data-active] {
		cursor: crosshair;
	}

	.drawing-canvas.text-cursor[data-active] {
		cursor: text;
	}

	.drawing-canvas.move-cursor[data-active] {
		cursor: grab;
	}

	.drawing-canvas.eraser-cursor[data-active] {
		cursor:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg transform='translate(0.6%200.8)' opacity='0.35' stroke='%23000' stroke-width='5'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='4'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3Cg stroke='%23ff7b1a' stroke-width='2.4'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3C/svg%3E")
				4 28,
			crosshair;
	}

	.text-input-wrap {
		position: absolute;
		z-index: 10001;
		display: grid;
		grid-template-columns: 1fr auto;
		border: 2px solid white;
		border-radius: 6px;
		background: hsl(25 100% 55%);
		box-shadow:
			0 0 0 1px black,
			0 8px 20px hsl(0 0% 0% / 0.3);
		backdrop-filter: blur(4px);
		overflow: hidden;
	}

	.text-input {
		padding: 4px 8px;
		border: none;
		background: transparent;
		color: black;
		font-size: 16px;
		font-weight: 600;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		outline: none;
	}

	.text-input::placeholder {
		color: hsl(0 0% 20%);
		font-weight: 400;
	}

	.text-confirm-btn {
		display: grid;
		place-items: center;
		padding: 0 8px;
		border: none;
		border-left: 2px solid white;
		background: hsl(25 100% 55%);
		color: black;
		cursor: pointer;
	}

	.text-confirm-btn:hover {
		background: hsl(25 100% 62%);
	}

	.feedback-toast-provider {
		--dry-layer-overlay: 10002;
		--dry-space-1: 4px;
		--dry-space-2: 8px;
		--dry-space-3: 12px;
		--dry-space-4: 16px;
		--dry-space-8: 32px;
		--dry-space-12: 48px;
		--dry-radius-lg: 16px;
		--dry-shadow-lg: 0 18px 36px hsl(0 0% 0% / 0.34);
		--dry-duration-normal: 180ms;
		--dry-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
		--dry-ease-in: cubic-bezier(0.7, 0, 0.84, 0);
		--dry-font-sans: 'Inter', 'Helvetica Neue', 'Segoe UI', system-ui, sans-serif;
		--dry-type-small-size: 0.875rem;
		--dry-type-small-leading: 1.35;
		--dry-type-tiny-size: 0.75rem;
		--dry-type-tiny-leading: 1.45;
		--dry-color-bg-overlay: hsl(228 18% 12% / 0.98);
		--dry-color-text-strong: hsl(0 0% 100%);
		--dry-color-text-weak: hsl(220 14% 84%);
		--dry-color-stroke-weak: hsl(220 13% 34%);
		--dry-color-fill-success: hsl(145 65% 46%);
		--dry-color-fill-success-weak: hsl(145 50% 18% / 0.96);
		--dry-color-stroke-success: hsl(145 52% 38%);
		--dry-color-fill-error: hsl(6 84% 58%);
		--dry-color-fill-error-weak: hsl(6 58% 18% / 0.96);
		--dry-color-stroke-error: hsl(6 58% 40%);

		pointer-events: none;
	}

	.feedback-toast-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 4px;
	}
</style>
