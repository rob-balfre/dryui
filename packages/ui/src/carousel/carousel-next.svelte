<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { class: className, children, disabled, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<button
	aria-label="Next slide"
	disabled={disabled ?? !ctx.canScrollNext}
	data-carousel-nav
	class={className}
	{...rest}
	onclick={(e) => {
		ctx.scrollNext();
		rest.onclick?.(e);
	}}
>
	{#if children}
		{@render children()}
	{:else}
		&#8250;
	{/if}
</button>

<style>
	[data-carousel-nav] {
		--dry-carousel-nav-size: var(--dry-space-12);

		display: inline-grid;
		place-items: center;
		height: var(--dry-carousel-nav-size);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		border: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-raised);
		color: var(--dry-color-text-strong);
		cursor: pointer;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-carousel-nav]:hover:not(:disabled) {
		background: var(--dry-color-fill);
	}

	[data-carousel-nav]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-carousel-nav]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
