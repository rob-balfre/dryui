<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		src?: string;
		alt?: string;
		fallback?: string;
		size?: 'sm' | 'md' | 'lg';
		shape?: 'square' | 'rounded' | 'circle';
		color?: 'brand' | 'neutral' | 'error' | 'warning' | 'success' | 'info';
	}

	let {
		src,
		alt = '',
		fallback,
		size = 'md',
		shape = 'rounded',
		color = 'neutral',
		class: className,
		...rest
	}: Props = $props();

	let failedSrc = $state<string | null>(null);
	const showImage = $derived(Boolean(src) && src !== failedSrc);

	function handleError() {
		failedSrc = src ?? null;
	}

	function getFallbackText(): string {
		const source = (fallback ?? alt).trim();
		if (!source) return '';

		const compact = source.replace(/[^\p{L}\p{N}]+/gu, '');
		const characters = Array.from(compact || source);
		return characters.slice(0, 2).join('').toUpperCase();
	}
</script>

<span
	role="img"
	aria-label={alt}
	data-logo-mark
	{...variantAttrs({ size, shape, color })}
	class={className}
	{...rest}
>
	{#if showImage}
		<img {src} {alt} onerror={handleError} />
	{:else}
		<span aria-hidden="true">{getFallbackText()}</span>
	{/if}
</span>

<style>
	[data-logo-mark] {
		--_logo-mark-size-default: 32px;
		--_logo-mark-radius-default: var(--dry-radius-md);
		--_logo-mark-bg-default: var(--dry-color-fill);
		--_logo-mark-color-default: var(--dry-color-text-weak);
		--_logo-mark-font-size-default: var(--dry-type-small-size, var(--dry-text-sm-size));

		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-logo-mark-size, var(--_logo-mark-size-default));
		border-radius: var(--dry-logo-mark-radius, var(--_logo-mark-radius-default));
		background: var(--dry-logo-mark-bg, var(--_logo-mark-bg-default));
		color: var(--dry-logo-mark-color, var(--_logo-mark-color-default));
		font-family: var(--dry-font-sans);
		font-size: var(--dry-logo-mark-font-size, var(--_logo-mark-font-size-default));
		font-weight: 600;
		line-height: 1;
		overflow: hidden;
		user-select: none;
	}

	[data-logo-mark] img {
		block-size: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: inherit;
	}

	[data-logo-mark] > span {
		display: grid;
		place-items: center;
	}

	/* -- Shapes ------------------------------------------------------------- */

	[data-shape='square'] {
		--_logo-mark-radius-default: var(--dry-radius-sm);
	}

	[data-shape='rounded'] {
		--_logo-mark-radius-default: var(--dry-radius-md);
	}

	[data-shape='circle'] {
		--_logo-mark-radius-default: var(--dry-radius-full);
	}

	/* -- Sizes -------------------------------------------------------------- */

	[data-size='sm'] {
		--_logo-mark-size-default: 24px;
		--_logo-mark-font-size-default: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	[data-size='md'] {
		--_logo-mark-size-default: 32px;
		--_logo-mark-font-size-default: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-size='lg'] {
		--_logo-mark-size-default: 40px;
		--_logo-mark-font-size-default: var(--dry-type-small-size, var(--dry-text-base-size));
	}

	/* -- Colors ------------------------------------------------------------- */

	[data-color='neutral'] {
		--_logo-mark-bg-default: var(--dry-color-fill);
		--_logo-mark-color-default: var(--dry-color-text-weak);
	}

	[data-color='brand'] {
		--_logo-mark-bg-default: var(--dry-color-fill-brand-weak);
		--_logo-mark-color-default: var(--dry-color-text-brand);
	}

	[data-color='error'] {
		--_logo-mark-bg-default: var(--dry-color-fill-error-weak);
		--_logo-mark-color-default: var(--dry-color-text-error);
	}

	[data-color='warning'] {
		--_logo-mark-bg-default: var(--dry-color-fill-warning-weak);
		--_logo-mark-color-default: var(--dry-color-text-warning);
	}

	[data-color='success'] {
		--_logo-mark-bg-default: var(--dry-color-fill-success-weak);
		--_logo-mark-color-default: var(--dry-color-text-success);
	}

	[data-color='info'] {
		--_logo-mark-bg-default: var(--dry-color-fill-info-weak);
		--_logo-mark-color-default: var(--dry-color-text-info);
	}
</style>
