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
		role,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		...rest
	}: Props = $props();

	const matrix = $derived(
		(() => {
			try {
				return encodeQR(value, { errorCorrection });
			} catch {
				return null;
			}
		})()
	);

	const wrapperRole = $derived(role ?? 'img');
	const wrapperAriaLabel = $derived(
		ariaLabel ?? (wrapperRole === 'img' && !ariaLabelledby ? 'QR Code' : undefined)
	);

	interface DrawQrParams {
		matrix: typeof matrix;
		size: number;
		bgColor: string | undefined;
		fgColor: string | undefined;
	}

	function drawQr(canvas: HTMLCanvasElement, params: DrawQrParams) {
		function render({
			matrix: nextMatrix,
			size: nextSize,
			bgColor: nextBgColor,
			fgColor: nextFgColor
		}: DrawQrParams) {
			const wrapper = canvas.parentElement;
			if (wrapper instanceof HTMLElement) {
				wrapper.style.setProperty('--dry-qr-size', `${nextSize}px`);
				if (nextBgColor) wrapper.style.setProperty('--dry-qr-bg', nextBgColor);
				else wrapper.style.removeProperty('--dry-qr-bg');
				if (nextFgColor) wrapper.style.setProperty('--dry-qr-fg', nextFgColor);
				else wrapper.style.removeProperty('--dry-qr-fg');
			}

			if (!nextMatrix) return;

			if (!(wrapper instanceof HTMLElement)) return;

			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const moduleCount = nextMatrix.length;
			const moduleSize = nextSize / moduleCount;

			canvas.width = nextSize;
			canvas.height = nextSize;

			const resolvedBg =
				nextBgColor || getComputedStyle(wrapper).getPropertyValue('--dry-qr-bg').trim();
			const resolvedFg =
				nextFgColor || getComputedStyle(wrapper).getPropertyValue('--dry-qr-fg').trim();

			ctx.fillStyle = resolvedBg;
			ctx.fillRect(0, 0, nextSize, nextSize);

			ctx.fillStyle = resolvedFg;
			for (let row = 0; row < moduleCount; row++) {
				for (let col = 0; col < moduleCount; col++) {
					if (nextMatrix[row]![col]) {
						ctx.fillRect(
							Math.round(col * moduleSize),
							Math.round(row * moduleSize),
							Math.ceil(moduleSize),
							Math.ceil(moduleSize)
						);
					}
				}
			}
		}

		render(params);

		return {
			update: render
		};
	}
</script>

<div
	class={className}
	data-qr-wrapper
	role={wrapperRole}
	aria-label={wrapperAriaLabel}
	aria-labelledby={ariaLabelledby}
	{...rest}
>
	<canvas
		use:drawQr={{ matrix, size, bgColor, fgColor }}
		width={size}
		height={size}
		aria-hidden="true"
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
