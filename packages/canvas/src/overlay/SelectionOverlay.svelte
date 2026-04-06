<script lang="ts">
	interface Props {
		viewport: HTMLElement | null;
		selectedNodeIds: string[];
		hoveredNodeId?: string | null;
	}

	let { viewport, selectedNodeIds, hoveredNodeId = null }: Props = $props();

	let canvas: HTMLCanvasElement;

	function getThemeColor(property: string, fallback: string): string {
		return viewport
			? getComputedStyle(viewport).getPropertyValue(property).trim() || fallback
			: fallback;
	}

	function resizeCanvas() {
		if (!canvas || !viewport) {
			return null;
		}

		const rect = viewport.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.max(1, Math.floor(rect.width * dpr));
		canvas.height = Math.max(1, Math.floor(rect.height * dpr));
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		const context = canvas.getContext('2d');
		if (!context) {
			return null;
		}

		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		context.clearRect(0, 0, rect.width, rect.height);
		return { context, rect };
	}

	function drawOutline(
		context: CanvasRenderingContext2D,
		rect: DOMRect,
		nodeId: string,
		strokeStyle: string,
		fillStyle?: string
	) {
		if (!viewport) {
			return;
		}

		const element = viewport.querySelector<HTMLElement>(`[data-studio-node-id="${nodeId}"]`);
		if (!element) {
			return;
		}
		const target = element.getBoundingClientRect();
		const x = target.left - rect.left;
		const y = target.top - rect.top;

		if (fillStyle) {
			context.fillStyle = fillStyle;
			context.fillRect(x, y, target.width, target.height);
		}

		context.strokeStyle = strokeStyle;
		context.lineWidth = 2;
		context.strokeRect(x, y, target.width, target.height);

		const handleSize = 8;
		context.fillStyle = strokeStyle;
		context.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
		context.fillRect(x + target.width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
		context.fillRect(
			x - handleSize / 2,
			y + target.height - handleSize / 2,
			handleSize,
			handleSize
		);
		context.fillRect(
			x + target.width - handleSize / 2,
			y + target.height - handleSize / 2,
			handleSize,
			handleSize
		);
	}

	function redraw() {
		const resized = resizeCanvas();
		if (!resized) {
			return;
		}

		const primary = getThemeColor('--dry-color-primary', '#2b67f6');
		const highlight = getThemeColor('--dry-color-surface-raised', 'rgba(43, 103, 246, 0.12)');
		const hoverStroke = getThemeColor('--dry-color-focus-ring', primary);

		const { context, rect } = resized;

		if (hoveredNodeId) {
			drawOutline(context, rect, hoveredNodeId, hoverStroke, highlight);
		}

		for (const nodeId of selectedNodeIds) {
			drawOutline(context, rect, nodeId, primary);
		}
	}

	$effect(() => {
		redraw();

		if (!viewport) {
			return;
		}

		const observer = new ResizeObserver(() => {
			redraw();
		});

		observer.observe(viewport);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:window onresize={redraw} />

<canvas bind:this={canvas} class="selection-overlay" aria-hidden="true"></canvas>

<style>
	.selection-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}
</style>
