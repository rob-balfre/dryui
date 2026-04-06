<script lang="ts">
	import { onMount } from 'svelte';
	import { getHandTrackingContext } from '@dryui/hand-tracking';
	import type { HandLandmarks } from '@dryui/hand-tracking';

	type TransformMode = 'move' | 'rotate' | 'scale';
	type Phase = 'idle' | 'wheel' | 'ready' | 'operating';

	let {
		canvasWidth = window.innerWidth,
		canvasHeight = window.innerHeight
	}: { canvasWidth?: number; canvasHeight?: number } = $props();

	const ctx = getHandTrackingContext();

	const DEFAULT_SIZE = 150;
	const PINCH_THRESHOLD = 0.18;
	const PINCH_RELEASE_THRESHOLD = 0.24;
	const PINCH_CONFIRM_FRAMES = 2;
	const RELEASE_CONFIRM_FRAMES = 4;
	const SMOOTHING = 0.35;
	const ROTATION_SMOOTHING = 0.5;
	const DEADZONE = 3;

	const WHEEL_INNER = 100;
	const WHEEL_OUTER = 180;
	const WHEEL_GAP = 6;
	const HALF_GAP = WHEEL_GAP / 2;

	const SLIDER_HEIGHT = 240;
	const SLIDER_HANDLE_R = 18;
	const SLIDER_BOX_GAP = 48;
	const ROTATE_SENSITIVITY = 1.5;
	const SCALE_SENSITIVITY = 2.5;

	let boxX = $state(0);
	let boxY = $state(0);
	let boxSize = $state(DEFAULT_SIZE);
	let boxRotation = $state(0);

	let phase = $state<Phase>('idle');
	let tool = $state<TransformMode | null>(null);
	let hoveredTool = $state<TransformMode | null>(null);

	let grabOffsetX = 0;
	let grabOffsetY = 0;
	let grabCursorY = 0;
	let grabRotation = 0;
	let grabSize = 0;
	let smoothX = 0;
	let smoothY = 0;
	let smoothAngle = 0;
	let smoothSize = 0;

	// Derived for template rendering
	let wheelCx = $derived(boxX + boxSize / 2);
	let wheelCy = $derived(boxY + boxSize / 2);
	const wheelViewSize = (WHEEL_OUTER + 20) * 2;

	let sliderX = $derived(boxX + boxSize + SLIDER_BOX_GAP);
	let sliderTop = $derived(boxY + boxSize / 2 - SLIDER_HEIGHT / 2);

	let sliderHandleY = $derived.by(() => {
		if (tool === 'rotate') {
			const t = ((boxRotation % 360) + 180) / 360;
			return clamp((1 - t) * SLIDER_HEIGHT, 0, SLIDER_HEIGHT);
		}
		if (tool === 'scale') {
			const t = (boxSize - 40) / (600 - 40);
			return clamp((1 - t) * SLIDER_HEIGHT, 0, SLIDER_HEIGHT);
		}
		return SLIDER_HEIGHT / 2;
	});

	// Wheel segments: Move at top, Rotate bottom-right, Scale bottom-left
	const segments: {
		value: TransformMode;
		label: string;
		start: number;
		end: number;
		mid: number;
	}[] = [
		{ value: 'move', label: 'Move', start: -60 + HALF_GAP, end: 60 - HALF_GAP, mid: 0 },
		{ value: 'rotate', label: 'Rotate', start: 60 + HALF_GAP, end: 180 - HALF_GAP, mid: 120 },
		{ value: 'scale', label: 'Scale', start: 180 + HALF_GAP, end: 300 - HALF_GAP, mid: 240 }
	];

	function arcPath(innerR: number, outerR: number, startDeg: number, endDeg: number): string {
		const toRad = (d: number) => (d * Math.PI) / 180;
		const sx = (r: number, a: number) => r * Math.sin(toRad(a));
		const sy = (r: number, a: number) => -r * Math.cos(toRad(a));
		const large = endDeg - startDeg > 180 ? 1 : 0;
		return [
			`M ${sx(outerR, startDeg)} ${sy(outerR, startDeg)}`,
			`A ${outerR} ${outerR} 0 ${large} 1 ${sx(outerR, endDeg)} ${sy(outerR, endDeg)}`,
			`L ${sx(innerR, endDeg)} ${sy(innerR, endDeg)}`,
			`A ${innerR} ${innerR} 0 ${large} 0 ${sx(innerR, startDeg)} ${sy(innerR, startDeg)}`,
			'Z'
		].join(' ');
	}

	function segmentTextPos(midDeg: number): { x: number; y: number } {
		const r = (WHEEL_INNER + WHEEL_OUTER) / 2;
		const rad = (midDeg * Math.PI) / 180;
		return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
	}

	function pinchDistance(hand: HandLandmarks): number {
		const thumb = hand.points[4];
		const index = hand.points[8];
		if (!thumb || !index) return Infinity;
		const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
		const handSize = Math.max(hand.boundingBox.width, hand.boundingBox.height, 1);
		return dist / handSize;
	}

	function getClosestHand(): HandLandmarks | null {
		let best: HandLandmarks | null = null;
		let bestDist = Infinity;
		for (const hand of ctx.hands) {
			const d = pinchDistance(hand);
			if (d < bestDist) {
				bestDist = d;
				best = hand;
			}
		}
		return best;
	}

	function handCursorToViewport(hand: HandLandmarks): { x: number; y: number } | null {
		const thumb = hand.points[4];
		const index = hand.points[8];
		if (!thumb || !index) return null;
		const fw = ctx.debug.frameWidth || 320;
		const fh = ctx.debug.frameHeight || 240;
		return {
			x: (1 - (thumb.x + index.x) / 2 / fw) * canvasWidth,
			y: ((thumb.y + index.y) / 2 / fh) * canvasHeight
		};
	}

	function isOverBox(vx: number, vy: number): boolean {
		const cx = boxX + boxSize / 2;
		const cy = boxY + boxSize / 2;
		const margin = boxSize / 2 + 40;
		return Math.abs(vx - cx) < margin && Math.abs(vy - cy) < margin;
	}

	function hitTestWheel(vx: number, vy: number): TransformMode | null {
		const cx = boxX + boxSize / 2;
		const cy = boxY + boxSize / 2;
		const dx = vx - cx;
		const dy = vy - cy;
		const dist = Math.hypot(dx, dy);
		if (dist < WHEEL_INNER - 10 || dist > WHEEL_OUTER + 10) return null;

		let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
		if (angle < 0) angle += 360;

		if (angle >= 300 + HALF_GAP || angle < 60 - HALF_GAP) return 'move';
		if (angle >= 60 + HALF_GAP && angle < 180 - HALF_GAP) return 'rotate';
		if (angle >= 180 + HALF_GAP && angle < 300 - HALF_GAP) return 'scale';
		return null;
	}

	function isNearSliderHandle(vx: number, vy: number): boolean {
		const hx = boxX + boxSize + SLIDER_BOX_GAP;
		const top = boxY + boxSize / 2 - SLIDER_HEIGHT / 2;
		let offset = SLIDER_HEIGHT / 2;
		if (tool === 'rotate') {
			const t = ((boxRotation % 360) + 180) / 360;
			offset = clamp((1 - t) * SLIDER_HEIGHT, 0, SLIDER_HEIGHT);
		} else if (tool === 'scale') {
			const t = (boxSize - 40) / (600 - 40);
			offset = clamp((1 - t) * SLIDER_HEIGHT, 0, SLIDER_HEIGHT);
		}
		return Math.hypot(vx - hx, vy - (top + offset)) < SLIDER_HANDLE_R + 30;
	}

	function ema(current: number, target: number, factor: number): number {
		return current + (target - current) * (1 - factor);
	}

	function clamp(v: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, v));
	}

	const tooltips: Record<TransformMode, string> = {
		move: 'pinch & drag to move',
		rotate: 'pinch & drag slider to rotate',
		scale: 'pinch & drag slider to scale'
	};

	onMount(() => {
		boxX = (canvasWidth - DEFAULT_SIZE) / 2;
		boxY = (canvasHeight - DEFAULT_SIZE) / 2;

		let frame = 0;
		let stablePinch = false;
		let prevStablePinch = false;
		let pinchFrameCount = 0;
		let releaseFrameCount = 0;

		const update = () => {
			const hand = getClosestHand();
			const rawPinching = hand ? pinchDistance(hand) < PINCH_THRESHOLD : false;
			const rawReleasing = !hand || pinchDistance(hand) > PINCH_RELEASE_THRESHOLD;

			if (rawPinching) {
				pinchFrameCount++;
				releaseFrameCount = 0;
			} else if (rawReleasing) {
				releaseFrameCount++;
				pinchFrameCount = 0;
			}

			if (!stablePinch && pinchFrameCount >= PINCH_CONFIRM_FRAMES) {
				stablePinch = true;
			} else if (stablePinch && releaseFrameCount >= RELEASE_CONFIRM_FRAMES) {
				stablePinch = false;
			}

			const pinchStarted = stablePinch && !prevStablePinch;
			const pinchEnded = !stablePinch && prevStablePinch;
			prevStablePinch = stablePinch;

			const cursor = hand ? handCursorToViewport(hand) : null;

			switch (phase) {
				case 'idle': {
					hoveredTool = null;
					if (pinchEnded && cursor && isOverBox(cursor.x, cursor.y)) {
						phase = 'wheel';
						tool = null;
					}
					break;
				}

				case 'wheel': {
					hoveredTool = cursor ? hitTestWheel(cursor.x, cursor.y) : null;

					if (pinchEnded && cursor) {
						const hit = hitTestWheel(cursor.x, cursor.y);
						if (hit) {
							tool = hit;
							phase = 'ready';
							hoveredTool = null;
						} else {
							const cx = boxX + boxSize / 2;
							const cy = boxY + boxSize / 2;
							const dist = Math.hypot(cursor.x - cx, cursor.y - cy);
							if (dist > WHEEL_OUTER + 30) {
								phase = 'idle';
								tool = null;
							}
						}
					}
					break;
				}

				case 'ready': {
					hoveredTool = null;
					if (pinchStarted && cursor && hand) {
						if (tool === 'move' && isOverBox(cursor.x, cursor.y)) {
							phase = 'operating';
							grabOffsetX = boxX - cursor.x;
							grabOffsetY = boxY - cursor.y;
							smoothX = boxX;
							smoothY = boxY;
						} else if (tool !== 'move' && isNearSliderHandle(cursor.x, cursor.y)) {
							phase = 'operating';
							grabCursorY = cursor.y;
							grabRotation = boxRotation;
							grabSize = boxSize;
							smoothAngle = boxRotation;
							smoothSize = boxSize;
						}
					}
					if (pinchEnded && cursor) {
						const overBox = isOverBox(cursor.x, cursor.y);
						const nearHandle = tool !== 'move' && isNearSliderHandle(cursor.x, cursor.y);
						if (!overBox && !nearHandle) {
							phase = 'idle';
							tool = null;
						}
					}
					break;
				}

				case 'operating': {
					if (rawPinching && hand) {
						const c = handCursorToViewport(hand);
						if (c) {
							if (tool === 'move') {
								const tx = c.x + grabOffsetX;
								const ty = c.y + grabOffsetY;
								smoothX = ema(smoothX, tx, SMOOTHING);
								smoothY = ema(smoothY, ty, SMOOTHING);
								if (Math.abs(smoothX - boxX) > DEADZONE || Math.abs(smoothY - boxY) > DEADZONE) {
									boxX = smoothX;
									boxY = smoothY;
								}
							} else if (tool === 'rotate') {
								const delta = grabCursorY - c.y;
								const target = grabRotation + delta * ROTATE_SENSITIVITY;
								smoothAngle = ema(smoothAngle, target, ROTATION_SMOOTHING);
								boxRotation = smoothAngle;
							} else if (tool === 'scale') {
								const delta = grabCursorY - c.y;
								const target = clamp(grabSize + delta * SCALE_SENSITIVITY, 40, 600);
								smoothSize = ema(smoothSize, target, SMOOTHING);
								const cx = boxX + boxSize / 2;
								const cy = boxY + boxSize / 2;
								boxSize = smoothSize;
								boxX = cx - boxSize / 2;
								boxY = cy - boxSize / 2;
							}
						}
					}
					if (!rawPinching) {
						phase = 'ready';
					}
					break;
				}
			}

			frame = requestAnimationFrame(update);
		};

		frame = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div
	class="interactive-box"
	class:selected={phase !== 'idle'}
	class:operating={phase === 'operating'}
	style="left:{boxX}px;top:{boxY}px;width:{boxSize}px;height:{boxSize}px;transform:rotate({boxRotation}deg)"
></div>

{#if phase === 'wheel'}
	<svg
		class="wheel"
		style="left:{wheelCx}px;top:{wheelCy}px"
		viewBox="{-(WHEEL_OUTER + 20)} {-(WHEEL_OUTER + 20)} {wheelViewSize} {wheelViewSize}"
		width={wheelViewSize}
		height={wheelViewSize}
	>
		{#each segments as seg}
			{@const path = arcPath(WHEEL_INNER, WHEEL_OUTER, seg.start, seg.end)}
			{@const tp = segmentTextPos(seg.mid)}
			<path d={path} class="wheel-seg" class:hovered={hoveredTool === seg.value} />
			<text
				x={tp.x}
				y={tp.y}
				class="wheel-label"
				class:hovered={hoveredTool === seg.value}
				dominant-baseline="central"
				text-anchor="middle"
			>
				{seg.label}
			</text>
		{/each}
	</svg>
{/if}

{#if (phase === 'ready' || phase === 'operating') && tool !== 'move'}
	<div class="slider" style="left:{sliderX}px;top:{sliderTop}px;height:{SLIDER_HEIGHT}px">
		<div class="slider-track"></div>
		<div
			class="slider-handle"
			class:operating={phase === 'operating'}
			style="top:{sliderHandleY}px;width:{SLIDER_HANDLE_R * 2}px;height:{SLIDER_HANDLE_R * 2}px"
		></div>
	</div>
{/if}

{#if (phase === 'ready' || phase === 'operating') && tool}
	<div class="tooltip" class:operating={phase === 'operating'}>
		{tooltips[tool]}
	</div>
{/if}

<style>
	.interactive-box {
		position: absolute;
		background: rgba(100, 180, 255, 0.15);
		border: 2px solid rgba(100, 180, 255, 0.6);
		border-radius: 12px;
		pointer-events: none;
	}

	.interactive-box.selected {
		border-color: rgba(100, 200, 255, 0.9);
		box-shadow: 0 0 12px rgba(100, 180, 255, 0.25);
	}

	.interactive-box.operating {
		background: rgba(100, 200, 255, 0.3);
		border-color: rgba(100, 220, 255, 1);
		box-shadow: 0 0 24px rgba(100, 180, 255, 0.5);
	}

	.wheel {
		position: absolute;
		transform: translate(-50%, -50%);
		pointer-events: none;
		filter: drop-shadow(0 0 16px rgba(0, 0, 0, 0.6));
	}

	.wheel-seg {
		fill: rgba(0, 0, 0, 0.6);
		stroke: rgba(255, 255, 255, 0.12);
		stroke-width: 1.5;
		transition:
			fill 0.12s ease,
			stroke 0.12s ease;
	}

	.wheel-seg.hovered {
		fill: rgba(100, 180, 255, 0.25);
		stroke: rgba(100, 180, 255, 0.6);
	}

	.wheel-label {
		fill: rgba(255, 255, 255, 0.45);
		font:
			700 16px ui-monospace,
			'SF Mono',
			Menlo,
			monospace;
		transition: fill 0.12s ease;
		user-select: none;
	}

	.wheel-label.hovered {
		fill: white;
	}

	.slider {
		position: absolute;
		width: 4px;
		pointer-events: none;
	}

	.slider-track {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.slider-handle {
		position: absolute;
		left: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: rgba(100, 180, 255, 0.25);
		border: 2px solid rgba(100, 180, 255, 0.6);
		transition:
			background 0.12s ease,
			box-shadow 0.12s ease;
	}

	.slider-handle.operating {
		background: rgba(100, 200, 255, 0.45);
		border-color: rgba(100, 220, 255, 1);
		box-shadow: 0 0 20px rgba(100, 180, 255, 0.5);
	}

	.tooltip {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.6rem 1.4rem;
		border-radius: 0.5rem;
		background: rgb(0 0 0 / 72%);
		color: rgba(255, 255, 255, 0.6);
		font:
			500 0.95rem/1.2 ui-monospace,
			'SF Mono',
			Menlo,
			monospace;
		pointer-events: none;
		white-space: nowrap;
	}

	.tooltip.operating {
		color: white;
	}
</style>
