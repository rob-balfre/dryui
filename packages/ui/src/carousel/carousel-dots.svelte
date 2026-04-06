<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div role="tablist" aria-label="Slide indicators" data-carousel-dots class={className} {...rest}>
	{#each Array(ctx.totalSlides) as _, i}
		<button
			role="tab"
			aria-selected={ctx.activeIndex === i}
			aria-label="Go to slide {i + 1}"
			data-active={ctx.activeIndex === i ? '' : undefined}
			onclick={() => ctx.scrollTo(i)}
		></button>
	{/each}
</div>

<style>
	[data-carousel-dots] {
		--dry-carousel-indicator-size: var(--dry-space-2_5);
		--dry-carousel-indicator-color: var(--dry-color-stroke-weak);
		--dry-carousel-indicator-active-color: var(--dry-color-fill-brand);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(var(--dry-space-12), max-content);
		gap: var(--dry-space-2);
		justify-self: center;
		padding-top: var(--dry-space-3);
	}

	[data-carousel-dots] button {
		height: var(--dry-carousel-indicator-size);
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		border: none;
		padding: 0;
		background: var(--dry-carousel-indicator-color);
		cursor: pointer;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
		min-height: var(--dry-space-12);
		display: inline-grid;
		place-items: center;
	}

	[data-carousel-dots] button[aria-selected='true'] {
		background: var(--dry-carousel-indicator-active-color);
	}

	[data-carousel-dots] button:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
