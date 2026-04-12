<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
	data-position={position}
	class={className}
	{...rest}
>
	{#each Array(ctx.totalSlides) as _, i (i)}
		<Button
			variant="bare"
			type="button"
			role="tab"
			aria-selected={ctx.activeIndex === i}
			aria-label="Go to slide {i + 1}"
			data-active={ctx.activeIndex === i ? '' : undefined}
			onclick={() => ctx.scrollTo(i)}
		>
			{@render children({ index: i, isActive: ctx.activeIndex === i, scrollTo: ctx.scrollTo })}
		</Button>
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
</style>
