<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

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
	data-size={size}
	data-shape={shape}
	data-color={color}
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
		--dry-logo-mark-size: 32px;
		--dry-logo-mark-radius: var(--dry-radius-md);
		--dry-logo-mark-bg: var(--dry-color-fill);
		--dry-logo-mark-color: var(--dry-color-text-weak);

		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-logo-mark-size);
		border-radius: var(--dry-logo-mark-radius);
		background: var(--dry-logo-mark-bg);
		color: var(--dry-logo-mark-color);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-logo-mark-font-size, var(--dry-type-small-size, var(--dry-text-sm-size)));
		font-weight: 600;
		line-height: 1;
		overflow: hidden;
		user-select: none;
	}

	[data-logo-mark] img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	[data-logo-mark] > span {
		display: grid;
		place-items: center;
	}

	/* -- Shapes ------------------------------------------------------------- */

	[data-shape='square'] {
		--dry-logo-mark-radius: var(--dry-radius-sm);
	}

	[data-shape='rounded'] {
		--dry-logo-mark-radius: var(--dry-radius-md);
	}

	[data-shape='circle'] {
		--dry-logo-mark-radius: var(--dry-radius-full);
	}

	/* -- Sizes -------------------------------------------------------------- */

	[data-size='sm'] {
		--dry-logo-mark-size: 24px;
		--dry-logo-mark-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	[data-size='md'] {
		--dry-logo-mark-size: 32px;
		--dry-logo-mark-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-size='lg'] {
		--dry-logo-mark-size: 40px;
		--dry-logo-mark-font-size: var(--dry-type-small-size, var(--dry-text-base-size));
	}

	/* -- Colors ------------------------------------------------------------- */

	[data-color='neutral'] {
		--dry-logo-mark-bg: var(--dry-color-fill);
		--dry-logo-mark-color: var(--dry-color-text-weak);
	}

	[data-color='brand'] {
		--dry-logo-mark-bg: var(--dry-color-fill-brand-weak);
		--dry-logo-mark-color: var(--dry-color-text-brand);
	}

	[data-color='error'] {
		--dry-logo-mark-bg: var(--dry-color-fill-error-weak);
		--dry-logo-mark-color: var(--dry-color-text-error);
	}

	[data-color='warning'] {
		--dry-logo-mark-bg: var(--dry-color-fill-warning-weak);
		--dry-logo-mark-color: var(--dry-color-text-warning);
	}

	[data-color='success'] {
		--dry-logo-mark-bg: var(--dry-color-fill-success-weak);
		--dry-logo-mark-color: var(--dry-color-text-success);
	}

	[data-color='info'] {
		--dry-logo-mark-bg: var(--dry-color-fill-info-weak);
		--dry-logo-mark-color: var(--dry-color-text-info);
	}
</style>
