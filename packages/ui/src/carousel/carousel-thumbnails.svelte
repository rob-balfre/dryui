<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		position?: 'bottom' | 'left' | 'right';
		children: Snippet<[{ index: number; isActive: boolean; scrollTo: (index: number) => void }]>;
	}

	let { position = 'bottom', class: className, children, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div
	role="tablist"
	aria-label="Slide thumbnails"
	data-carousel-thumbnails
	data-part="thumbnails"
	data-position={position}
	class={className}
	{...rest}
>
	{#each Array(ctx.totalSlides) as _, i}
		<button
			type="button"
			role="tab"
			aria-selected={ctx.activeIndex === i}
			aria-label="Go to slide {i + 1}"
			data-active={ctx.activeIndex === i ? '' : undefined}
			onclick={() => ctx.scrollTo(i)}
		>
			{@render children({ index: i, isActive: ctx.activeIndex === i, scrollTo: ctx.scrollTo })}
		</button>
	{/each}
</div>

<style>
	[data-carousel-thumbnails] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		padding: var(--dry-space-2, 0.5rem) 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	[data-carousel-thumbnails]::-webkit-scrollbar {
		display: none;
	}

	[data-carousel-thumbnails][data-position='bottom'] {
		justify-self: center;
	}

	[data-carousel-thumbnails][data-position='left'],
	[data-carousel-thumbnails][data-position='right'] {
		grid-auto-flow: row;
		grid-auto-columns: unset;
		overflow-y: auto;
		overflow-x: hidden;
	}

	[data-carousel-thumbnails] button {
		all: unset;
		cursor: pointer;
		border-radius: var(--dry-radius-md, 0.375rem);
		overflow: hidden;
		opacity: 0.5;
		transition:
			opacity var(--dry-duration-fast, 0.2s) var(--dry-ease-default, ease),
			outline-color var(--dry-duration-fast, 0.2s) var(--dry-ease-default, ease);
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	[data-carousel-thumbnails] button:hover {
		opacity: 0.8;
	}

	[data-carousel-thumbnails] button[data-active] {
		opacity: 1;
		outline-color: var(--dry-color-fill-brand, #3b82f6);
	}

	[data-carousel-thumbnails] button:focus-visible {
		outline-color: var(--dry-color-focus-ring, var(--dry-color-fill-brand, #3b82f6));
		opacity: 1;
	}
</style>
