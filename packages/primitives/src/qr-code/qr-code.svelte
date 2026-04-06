<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { encodeQR, type ErrorCorrectionLevel } from './qr-encode.js';

	interface Props extends HTMLAttributes<HTMLCanvasElement> {
		value: string;
		size?: number;
		errorCorrection?: ErrorCorrectionLevel;
		fgColor?: string;
		bgColor?: string;
	}

	let {
		value,
		size = 200,
		errorCorrection = 'M',
		fgColor = '#000',
		bgColor = '#fff',
		...rest
	}: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();

	const matrix = $derived(
		(() => {
			try {
				return encodeQR(value, { errorCorrection });
			} catch {
				return null;
			}
		})()
	);

	$effect(() => {
		if (!canvasEl || !matrix) return;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const moduleCount = matrix.length;
		const moduleSize = size / moduleCount;

		canvasEl.width = size;
		canvasEl.height = size;

		// Clear with background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, size, size);

		// Draw dark modules
		ctx.fillStyle = fgColor;
		for (let row = 0; row < moduleCount; row++) {
			for (let col = 0; col < moduleCount; col++) {
				if (matrix[row]![col]) {
					ctx.fillRect(
						Math.round(col * moduleSize),
						Math.round(row * moduleSize),
						Math.ceil(moduleSize),
						Math.ceil(moduleSize)
					);
				}
			}
		}
	});
</script>

<canvas
	bind:this={canvasEl}
	width={size}
	height={size}
	role="img"
	aria-label="QR Code"
	data-qr-code
	data-value={value}
	{...rest}
></canvas>
