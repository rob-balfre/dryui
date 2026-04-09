<script lang="ts">
	import { Portal } from '@dryui/ui';
	import { Hotkey } from '@dryui/primitives/hotkey';
	import { Check } from 'lucide-svelte';
	import type { Arrow, Drawing, FeedbackProps, Point, Stroke, TextLabel } from './types.js';
	import Toolbar from './components/toolbar.svelte';

	let {
		color = 'hsl(25 100% 55%)',
		strokeWidth = 3,
		shortcut = '$mod+m',
		serverUrl,
		class: className
	}: FeedbackProps = $props();

	type Tool = 'pencil' | 'arrow' | 'text' | 'move' | 'eraser';

	let active = $state(false);
	let tool: Tool = $state('pencil');
	let drawings: Drawing[] = $state([]);
	let currentStroke: Stroke | null = $state(null);
	let currentArrow: Arrow | null = $state(null);
	let textInput: { position: Point; value: string } | null = $state(null);
	let textInputEl: HTMLInputElement | undefined = $state();
	let erasing = $state(false);
	let moving: { drawingId: string; lastPoint: Point } | null = $state(null);
	let svgEl: SVGSVGElement | undefined = $state();
	let justCommitted = false;

	const ERASE_RADIUS = 12;
	const ARROW_HEAD_SIZE = 12;
	const TEXT_FONT_SIZE = 16;

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

	// --- Freehand path ---

	function pointsToPath(points: Point[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
		if (points.length === 2)
			return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

		const tension = 0.3;
		let d = `M ${points[0].x} ${points[0].y}`;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[Math.max(0, i - 1)];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[Math.min(points.length - 1, i + 2)];

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
				if (distToSegment(pt, drawing.points[i], drawing.points[i + 1]) < threshold) return true;
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
		drawings = drawings.filter((d) => !drawingNearPoint(d, x, y));
	}

	// --- Move ---

	function findDrawingAt(x: number, y: number): Drawing | null {
		for (let i = drawings.length - 1; i >= 0; i--) {
			if (drawingNearPoint(drawings[i], x, y)) return drawings[i];
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

		if (tool === 'text') {
			e.preventDefault();
			if (textInput) {
				commitText();
				return;
			}
			if (justCommitted) return;

			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit && hit.kind === 'text') {
				textInput = { position: hit.position, value: hit.text };
				drawings = drawings.filter((d) => d.id !== hit.id);
			} else {
				textInput = { position: { x: e.clientX, y: e.clientY }, value: '' };
			}
			requestAnimationFrame(() => textInputEl?.focus());
			return;
		}

		e.preventDefault();
		svgEl?.setPointerCapture(e.pointerId);

		if (tool === 'pencil') {
			currentStroke = {
				id: crypto.randomUUID(),
				kind: 'freehand',
				points: [{ x: e.clientX, y: e.clientY }],
				color,
				width: strokeWidth
			};
		} else if (tool === 'arrow') {
			currentArrow = {
				id: crypto.randomUUID(),
				kind: 'arrow',
				start: { x: e.clientX, y: e.clientY },
				end: { x: e.clientX, y: e.clientY },
				color,
				width: strokeWidth
			};
		} else if (tool === 'move') {
			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit) {
				moving = { drawingId: hit.id, lastPoint: { x: e.clientX, y: e.clientY } };
			}
		} else {
			erasing = true;
			eraseAt(e.clientX, e.clientY);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (tool === 'pencil' && currentStroke) {
			e.preventDefault();
			currentStroke.points = [...currentStroke.points, { x: e.clientX, y: e.clientY }];
		} else if (tool === 'arrow' && currentArrow) {
			e.preventDefault();
			currentArrow.end = { x: e.clientX, y: e.clientY };
		} else if (tool === 'move' && moving) {
			e.preventDefault();
			const dx = e.clientX - moving.lastPoint.x;
			const dy = e.clientY - moving.lastPoint.y;
			drawings = drawings.map((d) => (d.id === moving!.drawingId ? offsetDrawing(d, dx, dy) : d));
			moving.lastPoint = { x: e.clientX, y: e.clientY };
		} else if (tool === 'eraser' && erasing) {
			e.preventDefault();
			eraseAt(e.clientX, e.clientY);
		}
	}

	function handlePointerUp() {
		if (tool === 'pencil' && currentStroke) {
			if (currentStroke.points.length > 1) {
				drawings = [...drawings, currentStroke];
			}
			currentStroke = null;
		} else if (tool === 'arrow' && currentArrow) {
			const dx = currentArrow.end.x - currentArrow.start.x;
			const dy = currentArrow.end.y - currentArrow.start.y;
			if (Math.hypot(dx, dy) > 5) {
				drawings = [...drawings, currentArrow];
			}
			currentArrow = null;
		} else if (tool === 'move') {
			moving = null;
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

	// --- Persistence ---

	let loaded = false;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	function pageUrl(): string {
		return typeof location !== 'undefined' ? location.pathname : '/';
	}

	$effect(() => {
		if (!serverUrl) return;
		fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl())}`)
			.then((r) => r.json())
			.then((data: Drawing[]) => {
				if (data.length) drawings = data;
				loaded = true;
			})
			.catch(() => {
				loaded = true;
			});
	});

	$effect(() => {
		// Access drawings to track changes
		const snapshot = JSON.stringify(drawings);
		if (!serverUrl || !loaded) return;

		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl())}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: snapshot
			}).catch(() => {});
		}, 500);
	});
</script>

<Hotkey keys={shortcut} onpress={toggle} />

<Portal>
	<div class="feedback-root {className ?? ''}" data-dryui-feedback>
		{#if showOverlay}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<svg
				class="drawing-canvas {cursorClass}"
				data-active={active || undefined}
				bind:this={svgEl}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerUp}
			>
				<defs>
					<filter id="glow">
						<feGaussianBlur stdDeviation="3" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{#each drawings as drawing (drawing.id)}
					{#if drawing.kind === 'freehand'}
						<path
							d={pointsToPath(drawing.points)}
							stroke={drawing.color}
							stroke-width={drawing.width}
							stroke-linecap="round"
							stroke-linejoin="round"
							fill="none"
							filter="url(#glow)"
						/>
					{:else if drawing.kind === 'arrow'}
						<g filter="url(#glow)">
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
							fill={drawing.color}
							font-size={drawing.fontSize}
							font-family="system-ui, -apple-system, sans-serif"
							font-weight="600"
							filter="url(#glow)">{drawing.text}</text
						>
					{/if}
				{/each}

				{#if currentStroke}
					<path
						d={pointsToPath(currentStroke.points)}
						stroke={currentStroke.color}
						stroke-width={currentStroke.width}
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						filter="url(#glow)"
					/>
				{/if}

				{#if currentArrow}
					<g filter="url(#glow)">
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
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="text-input-wrap"
				style="left: {textInput.position.x}px; top: {textInput.position.y - 10}px;"
				onfocusout={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget as Node)) commitText();
				}}
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

		<Toolbar {active} {tool} {hasDrawings} ontoggle={toggle} ontoolchange={setTool} />
	</div>
</Portal>

<style>
	.feedback-root {
		position: fixed;
		inset: 0;
		z-index: 9998;
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
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E")
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
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/svg%3E")
				4 28,
			crosshair;
	}

	.text-input-wrap {
		position: fixed;
		z-index: 10001;
		display: grid;
		grid-template-columns: 1fr auto;
		border: 2px solid hsl(25 100% 55%);
		border-radius: 6px;
		background: hsl(225 15% 12% / 0.95);
		box-shadow: 0 0 8px hsl(25 100% 55% / 0.5);
		backdrop-filter: blur(4px);
		overflow: hidden;
	}

	.text-input {
		padding: 4px 8px;
		border: none;
		background: transparent;
		color: hsl(25 100% 55%);
		font-size: 16px;
		font-weight: 600;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		outline: none;
	}

	.text-input::placeholder {
		color: hsl(220 10% 50%);
		font-weight: 400;
	}

	.text-confirm-btn {
		display: grid;
		place-items: center;
		padding: 0 8px;
		border: none;
		border-left: 1px solid hsl(25 100% 55% / 0.3);
		background: hsl(25 100% 55% / 0.15);
		color: hsl(25 100% 55%);
		cursor: pointer;
	}

	.text-confirm-btn:hover {
		background: hsl(25 100% 55% / 0.3);
	}
</style>
