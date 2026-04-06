<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		color?: string;
	}

	let { color, class: className, style, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	const displayColor = $derived(color ?? ctx.hex);
	const displayAlpha = $derived(color ? 1 : ctx.alpha);

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
	data-cp-swatch
	data-interactive={color ? '' : undefined}
	data-disabled={ctx.disabled || undefined}
	class={className}
	{...rest}
	use:applyStyles
></div>

<style>
	[data-cp-swatch] {
		height: var(--dry-color-picker-swatch-size);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-md);
		border: 1px solid var(--dry-color-stroke-weak);
		cursor: default;
		position: relative;
		overflow: hidden;
	}

	[data-cp-swatch]::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-conic-gradient(
				var(--dry-color-picker-grid-light) 0% 25%,
				var(--dry-color-picker-grid-dark) 0% 50%
			)
			0 0 / var(--dry-color-picker-grid-size) var(--dry-color-picker-grid-size);
		border-radius: inherit;
	}

	[data-cp-swatch]::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--dry-swatch-color);
		opacity: var(--dry-swatch-opacity, 1);
		border-radius: inherit;
	}

	[data-cp-swatch][data-interactive] {
		cursor: pointer;
	}

	[data-cp-swatch][data-interactive]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
		transform: scale(1.05);
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-cp-swatch][data-interactive]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-cp-swatch][data-interactive][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
