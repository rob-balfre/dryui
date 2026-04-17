<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';
	import { clamp } from './color-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		width?: number;
		height?: number;
	}

	let { width = 200, height = 150, class: className, style, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let isDragging = $state(false);

	function setCanvas(node: HTMLCanvasElement) {
		canvasEl = node;
		return () => {
			if (canvasEl === node) canvasEl = null;
		};
	}

	$effect(() => {
		const node = canvasEl;
		const hue = ctx.hsv.h;
		if (!node) return;

		const ctx2d = node.getContext('2d');
		if (!ctx2d) return;

		const w = node.width;
		const h = node.height;
		const hueColor = `hsl(${hue}, 100%, 50%)`;

		const hGrad = ctx2d.createLinearGradient(0, 0, w, 0);
		hGrad.addColorStop(0, '#ffffff');
		hGrad.addColorStop(1, hueColor);
		ctx2d.fillStyle = hGrad;
		ctx2d.fillRect(0, 0, w, h);

		const vGrad = ctx2d.createLinearGradient(0, 0, 0, h);
		vGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
		ctx2d.fillStyle = vGrad;
		ctx2d.fillRect(0, 0, w, h);
	});

	function getPositionFromEvent(e: PointerEvent): { s: number; v: number } {
		if (!canvasEl) return { s: 0, v: 0 };
		const rect = canvasEl.getBoundingClientRect();
		const x = clamp(e.clientX - rect.left, 0, rect.width);
		const y = clamp(e.clientY - rect.top, 0, rect.height);
		const s = (x / rect.width) * 100;
		const v = 100 - (y / rect.height) * 100;
		return { s, v };
	}

	const indicatorX = $derived((ctx.hsv.s / 100) * width);
	const indicatorY = $derived((1 - ctx.hsv.v / 100) * height);

	const valueText = $derived(
		`Saturation ${Math.round(ctx.hsv.s)}%, Brightness ${Math.round(ctx.hsv.v)}%`
	);

	// Svelte action for reliable native pointer event binding
	function pointerInteraction(node: HTMLElement) {
		function handlePointerDown(e: PointerEvent) {
			if (ctx.disabled) return;
			e.preventDefault();
			isDragging = true;
			node.setPointerCapture(e.pointerId);
			const { s, v } = getPositionFromEvent(e);
			ctx.setSaturationValue(s, v);
		}

		function handlePointerMove(e: PointerEvent) {
			if (!isDragging || ctx.disabled) return;
			const { s, v } = getPositionFromEvent(e);
			ctx.setSaturationValue(s, v);
		}

		function handlePointerUp(e: PointerEvent) {
			isDragging = false;
			node.releasePointerCapture(e.pointerId);
		}

		function handleKeydown(e: KeyboardEvent) {
			if (ctx.disabled) return;
			const step = e.shiftKey ? 10 : 1;
			if (e.key === 'ArrowRight') ctx.setSaturationValue(ctx.hsv.s + step, ctx.hsv.v);
			else if (e.key === 'ArrowLeft') ctx.setSaturationValue(ctx.hsv.s - step, ctx.hsv.v);
			else if (e.key === 'ArrowUp') ctx.setSaturationValue(ctx.hsv.s, ctx.hsv.v + step);
			else if (e.key === 'ArrowDown') ctx.setSaturationValue(ctx.hsv.s, ctx.hsv.v - step);
		}

		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('pointermove', handlePointerMove);
		node.addEventListener('pointerup', handlePointerUp);
		node.addEventListener('keydown', handleKeydown);
		return () => {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointermove', handlePointerMove);
			node.removeEventListener('pointerup', handlePointerUp);
			node.removeEventListener('keydown', handleKeydown);
		};
	}

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-color-picker-area-width', `${width}px`);
			node.style.setProperty('--dry-color-picker-area-height', `${height}px`);
			node.style.setProperty('--dry-color-picker-indicator-left', `${indicatorX}px`);
			node.style.setProperty('--dry-color-picker-indicator-top', `${indicatorY}px`);
			node.style.setProperty('--dry-color-picker-indicator-color', ctx.hex);
		});
	}
</script>

<div
	{@attach pointerInteraction}
	role="slider"
	aria-label="Color saturation and brightness"
	aria-valuetext={valueText}
	aria-disabled={ctx.disabled || undefined}
	tabindex={ctx.disabled ? -1 : 0}
	data-disabled={ctx.disabled || undefined}
	class={['area', className]}
	{...rest}
	use:applyStyles
>
	<canvas {@attach setCanvas} {width} {height} class="canvas" aria-hidden="true"></canvas>
	<!-- Indicator circle -->
	<div aria-hidden="true" class="indicator"></div>
</div>

<style>
	.area {
		position: relative;
		display: inline-block;
		width: var(--dry-color-picker-area-width, 200px);
		height: var(--dry-color-picker-area-height, 150px);
		border-radius: var(--dry-radius-md);
		overflow: hidden;
		cursor: crosshair;
		touch-action: none;
	}

	.area:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	.area[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.canvas {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: inherit;
	}

	.indicator {
		position: absolute;
		left: var(--dry-color-picker-indicator-left);
		top: var(--dry-color-picker-indicator-top);
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid var(--dry-color-picker-indicator-border, var(--dry-color-bg-overlay, Canvas));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent),
			0 2px 4px color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
		transform: translate(-50%, -50%);
		pointer-events: none;
		background: var(--dry-color-picker-indicator-color);
	}
</style>
