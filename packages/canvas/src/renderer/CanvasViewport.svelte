<script lang="ts">
	import type { LayoutDocument } from '../ast/types.js';
	import ComponentWrapper from './ComponentWrapper.svelte';
	import SelectionOverlay from '../overlay/SelectionOverlay.svelte';
	import { buildCanvasThemeStyle } from './style.js';

	interface Props {
		document: LayoutDocument;
		selectedNodeIds?: string[];
		hoveredNodeId?: string | null;
		showOverlay?: boolean;
		scale?: number;
		offsetX?: number;
		offsetY?: number;
		onnodeclick?: (nodeId: string) => void;
		oncanvasclick?: () => void;
		ondropcomponent?: (component: string) => void;
	}

	let {
		document,
		selectedNodeIds = [],
		hoveredNodeId = null,
		showOverlay = true,
		scale = 1,
		offsetX: controlledOffsetX = 0,
		offsetY: controlledOffsetY = 0,
		onnodeclick,
		oncanvasclick,
		ondropcomponent
	}: Props = $props();

	const PALETTE_DRAG_MIME = 'application/vnd.dryui.palette-item+json';

	let isPanning = $state(false);
	let viewport = $state<HTMLDivElement | null>(null);
	let scaleDelta = $state(0);
	let panDelta = $state({ x: 0, y: 0 });
	let panOrigin = $state({ x: 0, y: 0, startX: 0, startY: 0 });
	let currentScale = $derived(Math.min(4, Math.max(0.25, Number((scale + scaleDelta).toFixed(2)))));
	let offsetX = $derived(controlledOffsetX + panDelta.x);
	let offsetY = $derived(controlledOffsetY + panDelta.y);

	function captureViewport(node: HTMLDivElement) {
		viewport = node;

		return () => {
			if (viewport === node) {
				viewport = null;
			}
		};
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			const delta = event.deltaY > 0 ? -0.1 : 0.1;
			scaleDelta = Number((scaleDelta + delta).toFixed(2));
			return;
		}

		panDelta = {
			x: panDelta.x - event.deltaX,
			y: panDelta.y - event.deltaY
		};
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 1) {
			return;
		}

		isPanning = true;
		panOrigin = {
			x: event.clientX,
			y: event.clientY,
			startX: panDelta.x,
			startY: panDelta.y
		};
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isPanning) {
			return;
		}

		panDelta = {
			x: panOrigin.startX + (event.clientX - panOrigin.x),
			y: panOrigin.startY + (event.clientY - panOrigin.y)
		};
	}

	function stopPanning() {
		isPanning = false;
	}

	function handleClick(event: MouseEvent) {
		const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
			'[data-studio-node-id]'
		);
		const nodeId = target?.dataset.studioNodeId;

		if (!nodeId) {
			oncanvasclick?.();
			return;
		}

		onnodeclick?.(nodeId);
	}

	function handleDragOver(event: DragEvent) {
		if (!event.dataTransfer?.types.includes(PALETTE_DRAG_MIME)) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}

	function handleDrop(event: DragEvent) {
		const payload = event.dataTransfer?.getData(PALETTE_DRAG_MIME);
		if (!payload) {
			return;
		}

		event.preventDefault();

		try {
			const parsed = JSON.parse(payload) as { component?: unknown };
			if (typeof parsed.component === 'string') {
				ondropcomponent?.(parsed.component);
			}
		} catch {
			return;
		}
	}
</script>

<svelte:window onpointermove={handlePointerMove} onpointerup={stopPanning} />

<div class="viewport-frame">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="viewport"
		data-studio-canvas-viewport
		role="application"
		aria-label="Studio canvas viewport"
		tabindex="0"
		onclick={handleClick}
		ondragover={handleDragOver}
		ondrop={handleDrop}
		onkeydown={(event) => {
			if (event.key === 'Escape') {
				oncanvasclick?.();
			}
		}}
		onpointerdown={handlePointerDown}
		onwheel={handleWheel}
		{@attach captureViewport}
	>
		<div
			class="canvas-surface"
			style={`transform: translate(${offsetX}px, ${offsetY}px) scale(${currentScale}); width: ${document.canvas.width}px; ${buildCanvasThemeStyle(document)}`}
		>
			<ComponentWrapper node={document.root} />
		</div>

		{#if showOverlay}
			<SelectionOverlay {viewport} {selectedNodeIds} {hoveredNodeId} />
		{/if}
	</div>
</div>

<style>
	.viewport-frame {
		position: relative;
		height: 100%;
		min-height: 480px;
		overflow: hidden;
		border: 1px solid var(--dry-color-border);
		border-radius: var(--dry-radius-xl);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--dry-color-surface-raised) 75%, transparent),
				transparent
			),
			linear-gradient(
				90deg,
				color-mix(in srgb, var(--dry-color-border) 18%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				color-mix(in srgb, var(--dry-color-border) 18%, transparent) 1px,
				transparent 1px
			),
			var(--dry-color-muted);
		background-size:
			auto,
			24px 24px,
			24px 24px,
			auto;
	}

	.viewport {
		position: relative;
		height: 100%;
		overflow: hidden;
		cursor: grab;
	}

	.viewport:active {
		cursor: grabbing;
	}

	.canvas-surface {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: top left;
		min-height: 100%;
		padding: var(--dry-space-8);
	}
</style>
