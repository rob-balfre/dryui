<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { encodeQR, type ErrorCorrectionLevel } from '@dryui/primitives/qr-code';

	interface Props extends HTMLAttributes<HTMLDivElement> {
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
		fgColor,
		bgColor,
		class: className,
		...rest
	}: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let wrapperEl = $state<HTMLDivElement>();

	const matrix = $derived(
		(() => {
			try {
				return encodeQR(value, { errorCorrection });
			} catch {
				return null;
			}
		})()
	);

	function resolveColor(rootEl: HTMLElement, varName: string, override: string | undefined) {
		if (override) return override;
		const v = getComputedStyle(rootEl).getPropertyValue(varName).trim();
		return v || '';
	}

	$effect(() => {
		if (!canvasEl || !wrapperEl || !matrix) return;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const moduleCount = matrix.length;
		const moduleSize = size / moduleCount;

		canvasEl.width = size;
		canvasEl.height = size;

		const resolvedBg = resolveColor(wrapperEl, '--dry-qr-bg', bgColor);
		const resolvedFg = resolveColor(wrapperEl, '--dry-qr-fg', fgColor);

		ctx.fillStyle = resolvedBg;
		ctx.fillRect(0, 0, size, size);

		ctx.fillStyle = resolvedFg;
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

	$effect(() => {
		if (!wrapperEl) return;
		wrapperEl.style.setProperty('--dry-qr-size', `${size}px`);
		if (bgColor) wrapperEl.style.setProperty('--dry-qr-bg', bgColor);
		else wrapperEl.style.removeProperty('--dry-qr-bg');
		if (fgColor) wrapperEl.style.setProperty('--dry-qr-fg', fgColor);
		else wrapperEl.style.removeProperty('--dry-qr-fg');
	});
</script>

<div bind:this={wrapperEl} class={className} data-qr-wrapper {...rest}>
	<canvas
		bind:this={canvasEl}
		width={size}
		height={size}
		role="img"
		aria-label="QR Code"
		data-qr-canvas
		data-value={value}
	></canvas>
</div>

<style>
	[data-qr-wrapper] {
		/* Component tokens (Tier 3) */
		--dry-qr-padding: var(--dry-space-3);
		--dry-qr-radius: var(--dry-radius-lg);
		--dry-qr-border: var(--dry-color-stroke-weak);
		--dry-qr-size: 200px;

		display: inline-grid;
		grid-template-columns: var(--dry-qr-size);
		place-items: center;
		padding: var(--dry-qr-padding);
		background: var(--dry-qr-bg, var(--dry-color-bg-raised));
		border: 1px solid var(--dry-qr-border);
		border-radius: var(--dry-qr-radius);
	}

	[data-qr-canvas] {
		display: block;
		height: var(--dry-qr-size);
		border-radius: var(--dry-radius-sm);
	}
</style>
