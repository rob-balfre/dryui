<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { encodeQR, type ErrorCorrectionLevel } from '@dryui/primitives/qr-code';

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
		class: className,
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

		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, size, size);

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

	function setQrVars(node: HTMLDivElement) {
		$effect(() => {
			node.style.setProperty('--dry-qr-size', `${size}px`);
			node.style.setProperty('--dry-qr-bg', bgColor);
		});
	}
</script>

<div {@attach setQrVars} class={className} data-qr-wrapper>
	<canvas
		bind:this={canvasEl}
		width={size}
		height={size}
		role="img"
		aria-label="QR Code"
		data-qr-canvas
		data-value={value}
		{...rest}
	></canvas>
</div>

<style>
	[data-qr-wrapper] {
		/* Component tokens (Tier 3) */
		--dry-qr-padding: var(--dry-space-3);
		--dry-qr-radius: var(--dry-radius-lg);
		--dry-qr-border: var(--dry-color-stroke-weak);
		--dry-qr-bg: #fff;
		--dry-qr-size: 200px;

		display: inline-grid;
		grid-template-columns: var(--dry-qr-size);
		place-items: center;
		padding: var(--dry-qr-padding);
		background: var(--dry-qr-bg);
		border: 1px solid var(--dry-qr-border);
		border-radius: var(--dry-qr-radius);
	}

	[data-qr-canvas] {
		display: block;
		height: var(--dry-qr-size);
		border-radius: var(--dry-radius-sm);
	}
</style>
