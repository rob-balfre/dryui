<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** When provided, displays this hex color instead of the current picker color. Clicking selects it. */
		color?: string | undefined;
	}

	let { color, class: className, style, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	const displayColor = $derived(color ?? ctx.hex);
	const displayAlpha = $derived(color ? 1 : ctx.alpha);

	// Build background: solid color over checkerboard for alpha support
	// Svelte action for reliable native event binding
	function interactive(node: HTMLElement) {
		function handleClick() {
			if (color && !ctx.disabled) ctx.setFromHex(color);
		}
		function handleKeydown(e: KeyboardEvent) {
			if (color && !ctx.disabled && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				ctx.setFromHex(color);
			}
		}
		node.addEventListener('click', handleClick);
		node.addEventListener('keydown', handleKeydown);
		return {
			destroy() {
				node.removeEventListener('click', handleClick);
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-swatch-color', displayColor);
			node.style.setProperty('--dry-swatch-opacity', String(displayAlpha));
		});
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{@attach interactive}
	role={color ? 'button' : 'img'}
	tabindex={color && !ctx.disabled ? 0 : undefined}
	aria-label={color ? `Select color ${color}` : 'Current color'}
	data-disabled={ctx.disabled || undefined}
	class={['swatch', color && 'interactive', className]}
	{...rest}
	use:applyStyles
></div>

<style>
	.swatch {
		position: relative;
		overflow: hidden;
		width: 32px;
		height: 32px;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		cursor: default;
		flex-shrink: 0;
	}

	.swatch::before,
	.swatch::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.swatch::before {
		background: repeating-conic-gradient(
				color-mix(in srgb, var(--dry-color-text-strong) 12%, transparent) 0% 25%,
				var(--dry-color-bg-overlay) 0% 50%
			)
			0 0 / 12px 12px;
	}

	.swatch::after {
		background: var(--dry-swatch-color);
		opacity: var(--dry-swatch-opacity, 1);
	}

	.interactive {
		cursor: pointer;
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	.interactive:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
		transform: scale(1.05);
	}

	.interactive:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	.interactive[data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
