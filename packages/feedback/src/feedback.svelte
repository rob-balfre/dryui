<script lang="ts">
	import { Portal } from '@dryui/ui';
	import { Hotkey } from '@dryui/primitives/hotkey';
	import { Check } from 'lucide-svelte';
	import type { Arrow, Drawing, FeedbackProps, Point, Stroke, TextLabel, Tool } from './types.js';
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
	let textInput: { position: Point; value: string } | null = $state(null);
	let textInputEl: HTMLInputElement | undefined = $state();
	let erasing = $state(false);
	let moving: { drawingId: string; lastPoint: Point } | null = $state(null);
	let justCommitted = false;
	let saveVersion = $state(0);
	let submitting = $state(false);
	let sent = $state(false);
	let scrollRootEl: HTMLElement | null = $state(null);
	let viewportLeft = $state(0);
	let viewportTop = $state(0);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let scrollX = $state(0);
	let scrollY = $state(0);
	let layerHostEl: HTMLElement | null = $state(null);

	const ERASE_RADIUS = 12;
	const ARROW_HEAD_SIZE = 12;
	const TEXT_FONT_SIZE = 16;
	const SCROLLABLE_OVERFLOW = new Set(['auto', 'scroll', 'overlay']);

	function outlinedStrokeWidth(width: number): number {
		return width + STROKE_OUTLINE_WIDTH;
	}

	function outlinedTextWidth(fontSize: number): number {
		return Math.max(3, fontSize * TEXT_OUTLINE_RATIO);
	}

	function normalizeDrawing(drawing: Drawing): Drawing {
		return { ...drawing, color };
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

		if (target) {
			const rect = target.getBoundingClientRect();
			viewportLeft = rect.left;
			viewportTop = rect.top;
			viewportWidth = rect.width;
			viewportHeight = rect.height;
			scrollX = target.scrollLeft;
			scrollY = target.scrollTop;
			return;
		}

		viewportLeft = 0;
		viewportTop = 0;
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
		scrollX = window.scrollX;
		scrollY = window.scrollY;
	}

	function isInsideDrawingArea(e: PointerEvent): boolean {
		if (!scrollRootEl) return true;

		return (
			e.clientX >= viewportLeft &&
			e.clientX <= viewportLeft + viewportWidth &&
			e.clientY >= viewportTop &&
			e.clientY <= viewportTop + viewportHeight
		);
	}

	function pointFromPointer(e: PointerEvent): Point {
		return {
			x: e.clientX - viewportLeft + scrollX,
			y: e.clientY - viewportTop + scrollY
		};
	}

	function textInputStyle(position: Point): string {
		return `left: ${viewportLeft + position.x - scrollX}px; top: ${viewportTop + position.y - scrollY - 10}px;`;
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
		if (scrollRootEl) return scrollRootEl;

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

		if (drawing.kind === 'freehand') {
			const pt = { x: px, y: py };
			for (let i = 0; i < drawing.points.length - 1; i++) {
				if (distToSegment(pt, drawing.points[i]!, drawing.points[i + 1]!) < threshold) return true;
			}
		} else if (drawing.kind === 'arrow') {
			if (distToSegment({ x: px, y: py }, drawing.start, drawing.end) < threshold) return true;
		} else {
			const tx = drawing.position.x;
			const ty = drawing.position.y;
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
		if (!isInsideDrawingArea(e)) return;
		const point = pointFromPointer(e);

		if (tool === 'text') {
			e.preventDefault();
			if (textInput) {
				commitText();
				return;
			}
			if (justCommitted) return;

			const hit = findDrawingAt(point.x, point.y);
			if (hit && hit.kind === 'text') {
				textInput = { position: hit.position, value: hit.text };
				drawings = drawings.filter((d) => d.id !== hit.id);
			} else {
				textInput = { position: point, value: '' };
			}
			requestAnimationFrame(() => textInputEl?.focus());
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
				width: strokeWidth
			};
		} else if (tool === 'arrow') {
			currentArrow = {
				id: crypto.randomUUID(),
				kind: 'arrow',
				start: point,
				end: point,
				color,
				width: strokeWidth
			};
			// start stays anchored to the initial click; drag updates the arrowhead (end)
		} else if (tool === 'move') {
			const hit = findDrawingAt(point.x, point.y);
			if (hit) {
				moving = { drawingId: hit.id, lastPoint: point };
			}
		} else {
			erasing = true;
			eraseAt(point.x, point.y);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		const point = pointFromPointer(e);

		if (tool === 'pencil' && currentStroke) {
			e.preventDefault();
			currentStroke.points = [...currentStroke.points, point];
		} else if (tool === 'arrow' && currentArrow) {
			e.preventDefault();
			currentArrow.end = point;
		} else if (tool === 'move' && moving) {
			e.preventDefault();
			const dx = point.x - moving.lastPoint.x;
			const dy = point.y - moving.lastPoint.y;
			drawings = drawings.map((d) => (d.id === moving!.drawingId ? offsetDrawing(d, dx, dy) : d));
			moving.lastPoint = point;
		} else if (tool === 'eraser' && erasing) {
			e.preventDefault();
			eraseAt(point.x, point.y);
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
		const w = window.innerWidth;
		const h = window.innerHeight;

		// Capture the current tab via Screen Capture API
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: { displaySurface: 'browser' },
			preferCurrentTab: true
		} as DisplayMediaStreamOptions);

		const video = document.createElement('video');
		video.srcObject = stream;
		video.muted = true;
		await video.play();

		// Wait one frame for the video to render
		await new Promise((r) => requestAnimationFrame(r));

		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d')!;

		// Draw the page capture
		ctx.drawImage(video, 0, 0, w, h);

		// Stop the stream immediately
		stream.getTracks().forEach((t) => t.stop());
		video.srcObject = null;

		const dataUrl = canvas.toDataURL('image/webp', 0.8);
		canvas.width = 0;
		canvas.height = 0;
		return dataUrl.split(',')[1]!;
	}

	async function handleSubmit() {
		if (!serverUrl || submitting) return;
		submitting = true;
		try {
			const image = await captureScreenshot();
			await fetch(`${serverUrl}/submissions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: location.href,
					image,
					drawings,
					viewport: { width: window.innerWidth, height: window.innerHeight }
				})
			});
			submitting = false;
			sent = true;
			setTimeout(() => {
				sent = false;
				drawings = [];
				saveVersion++;
				active = false;
			}, 1500);
		} catch (e) {
			console.error('Failed to submit feedback:', e);
			submitting = false;
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

		const target = resolveScrollRoot();
		const update = () => updateScrollMetrics();

		target?.addEventListener('scroll', update, { passive: true });
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update, { passive: true });

		const resizeObserver = target ? new ResizeObserver(update) : null;
		if (target && resizeObserver) resizeObserver.observe(target);

		return () => {
			target?.removeEventListener('scroll', update);
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
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
</script>

<Hotkey keys={shortcut} handler={toggle} />

<Portal target={layerHostEl ?? 'body'}>
	<div class="feedback-root {className ?? ''}" data-dryui-feedback>
		{#if showOverlay}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
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

				<g transform={`translate(${viewportLeft - scrollX} ${viewportTop - scrollY})`}>
					{#each drawings as drawing (drawing.id)}
						{#if drawing.kind === 'freehand'}
							<g filter="url(#annotation-shadow)">
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
							<g filter="url(#annotation-shadow)">
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
						<g filter="url(#annotation-shadow)">
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
						<g filter="url(#annotation-shadow)">
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
				</g>
			</svg>
		{/if}

		{#if textInput}
			<div
				class="text-input-wrap"
				style={textInputStyle(textInput.position)}
				onfocusout={handleTextInputFocusOut}
			>
				<input
					class="text-input"
					type="text"
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
			{submitting}
			{sent}
			ontoggle={toggle}
			ontoolchange={setTool}
			onsubmit={handleSubmit}
		/>
	</div>
</Portal>

<style>
	.feedback-root {
		position: fixed;
		inset: 0;
		z-index: 9998;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		overflow: visible;
		pointer-events: none;
	}

	.feedback-root :global(*) {
		pointer-events: auto;
	}

	.drawing-canvas {
		position: fixed;
		inset: 0;
		z-index: 9999;
		inline-size: 100vw;
		block-size: 100vh;
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
		position: fixed;
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
</style>
