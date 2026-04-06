<script lang="ts">
	import { Slider } from '@dryui/ui/slider';
	import { NumberInput } from '@dryui/ui/number-input';
	import { Input } from '@dryui/ui/input';
	import { Field } from '@dryui/ui/field';
	import { Label } from '@dryui/ui/label';
	import { hsbToHsl, hslToHex, hexToHsl, hslToHsb } from '../engine/derivation.js';

	interface Props {
		h?: number;
		s?: number;
		b?: number;
		onchange?: (h: number, s: number, b: number) => void;
	}

	let { h = $bindable(230), s = $bindable(65), b = $bindable(85), onchange }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let isDragging = $state(false);

	// Derived hex value from current HSB
	let hexValue = $derived.by(() => {
		const hsl = hsbToHsl(h, s / 100, b / 100);
		return hslToHex(hsl.h, hsl.s, hsl.l);
	});

	// Derived preview color as CSS hsl string
	let previewColor = $derived.by(() => {
		const hsl = hsbToHsl(h, s / 100, b / 100);
		return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
	});

	// Pure hue color for canvas gradient (full saturation, full brightness)
	let hueColor = $derived.by(() => {
		const hsl = hsbToHsl(h, 1, 1);
		return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
	});

	function drawCanvas() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		// Horizontal gradient: white -> full hue color
		const hGrad = ctx.createLinearGradient(0, 0, width, 0);
		hGrad.addColorStop(0, '#ffffff');
		hGrad.addColorStop(1, hueColor);
		ctx.fillStyle = hGrad;
		ctx.fillRect(0, 0, width, height);

		// Vertical gradient: transparent -> black (overlay)
		const vGrad = ctx.createLinearGradient(0, 0, 0, height);
		vGrad.addColorStop(0, 'rgba(0,0,0,0)');
		vGrad.addColorStop(1, 'rgba(0,0,0,1)');
		ctx.fillStyle = vGrad;
		ctx.fillRect(0, 0, width, height);
	}

	$effect(() => {
		// Redraw canvas when hue changes (hueColor is derived from h)
		void hueColor;
		drawCanvas();
	});

	$effect(() => {
		// Initial draw once canvas is mounted
		if (canvas) {
			drawCanvas();
		}
	});

	function getPositionFromEvent(e: PointerEvent): { x: number; y: number } {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
		return { x, y };
	}

	function updateFromCanvasPosition(x: number, y: number) {
		if (!canvas) return;
		const newS = Math.round((x / canvas.width) * 100);
		const newB = Math.round((1 - y / canvas.height) * 100);
		s = Math.max(0, Math.min(100, newS));
		b = Math.max(0, Math.min(100, newB));
		onchange?.(h, s, b);
	}

	function handlePointerDown(e: PointerEvent) {
		if (!canvas) return;
		isDragging = true;
		canvas.setPointerCapture(e.pointerId);
		const { x, y } = getPositionFromEvent(e);
		updateFromCanvasPosition(x, y);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const { x, y } = getPositionFromEvent(e);
		updateFromCanvasPosition(x, y);
	}

	function handlePointerUp(e: PointerEvent) {
		isDragging = false;
		if (canvas) canvas.releasePointerCapture(e.pointerId);
	}

	function handleHexInput(val: string) {
		const hex = val.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
			try {
				const hsl = hexToHsl(hex);
				const hsb = hslToHsb(hsl.h, hsl.s, hsl.l);
				h = Math.round(hsb.h);
				s = Math.round(hsb.s * 100);
				b = Math.round(hsb.b * 100);
				onchange?.(h, s, b);
			} catch {
				// invalid hex, ignore
			}
		}
	}

	// Crosshair position on canvas
	let crosshairX = $derived((s / 100) * 256);
	let crosshairY = $derived((1 - b / 100) * 256);

	function crosshairPosition(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('left', `${crosshairX}px`);
			node.style.setProperty('top', `${crosshairY}px`);
		});
	}

	function swatchBackground(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('background', previewColor);
		});
	}

	// Local bindable values for number inputs
	let hValue = $state(h);
	let sValue = $state(s);
	let bValue = $state(b);
	let hexInputValue = $state('');

	// Sync external changes to local state
	$effect(() => {
		hValue = h;
	});
	$effect(() => {
		sValue = s;
	});
	$effect(() => {
		bValue = b;
	});
	$effect(() => {
		hexInputValue = hexValue;
	});

	// React to local number input changes
	$effect(() => {
		const clamped = Math.max(0, Math.min(360, hValue));
		if (clamped !== h) {
			h = clamped;
			onchange?.(h, s, b);
		}
	});
	$effect(() => {
		const clamped = Math.max(0, Math.min(100, sValue));
		if (clamped !== s) {
			s = clamped;
			onchange?.(h, s, b);
		}
	});
	$effect(() => {
		const clamped = Math.max(0, Math.min(100, bValue));
		if (clamped !== b) {
			b = clamped;
			onchange?.(h, s, b);
		}
	});
</script>

<div class="hsb-picker-root">
	<div class="canvas-wrapper">
		<canvas
			bind:this={canvas}
			width={256}
			height={256}
			class="saturation-canvas"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
		></canvas>
		<div class="crosshair" use:crosshairPosition></div>
	</div>

	<div class="row-slider">
		<Slider
			bind:value={h}
			min={0}
			max={360}
			step={1}
			size="sm"
			oninput={() => onchange?.(h, s, b)}
		/>
	</div>

	<div class="row-fields-end">
		<div class="hsb-field">
			<Field.Root>
				<Label size="sm">H</Label>
				<NumberInput bind:value={hValue} min={0} max={360} step={1} size="sm" />
			</Field.Root>
		</div>
		<div class="hsb-field">
			<Field.Root>
				<Label size="sm">S</Label>
				<NumberInput bind:value={sValue} min={0} max={100} step={1} size="sm" />
			</Field.Root>
		</div>
		<div class="hsb-field">
			<Field.Root>
				<Label size="sm">B</Label>
				<NumberInput bind:value={bValue} min={0} max={100} step={1} size="sm" />
			</Field.Root>
		</div>
	</div>

	<div class="row-swatch">
		<div class="preview-swatch" use:swatchBackground></div>
		<Input
			bind:value={hexInputValue}
			size="sm"
			placeholder="#000000"
			oninput={() => handleHexInput(hexInputValue)}
		/>
	</div>
</div>

<style>
	.hsb-picker-root {
		display: grid;
		grid-template-columns: 256px;
		gap: var(--dry-space-2);
	}

	.row-slider {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		align-items: center;
	}

	.row-fields-end {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		align-items: end;
		gap: var(--dry-space-2);
	}

	.row-swatch {
		display: grid;
		grid-template-columns: var(--dry-space-8) minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
	}

	.canvas-wrapper {
		position: relative;
		height: 256px;
		border-radius: var(--dry-radius-md);
		overflow: hidden;
		cursor: crosshair;
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.saturation-canvas {
		display: block;
		height: 256px;
	}

	.crosshair {
		position: absolute;
		aspect-ratio: 1;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--dry-color-bg-overlay);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--dry-color-text-strong) 40%, transparent);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.preview-swatch {
		aspect-ratio: 1;
		height: var(--dry-space-8);
		border-radius: var(--dry-radius-md);
		border: 1px solid var(--dry-color-stroke-weak);
	}
</style>
