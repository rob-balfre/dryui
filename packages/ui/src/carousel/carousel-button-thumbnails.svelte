<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { VisuallyHidden } from '../visually-hidden/index.js';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		position?: 'bottom' | 'left' | 'right';
		children: Snippet<[{ index: number; isActive: boolean; scrollTo: (index: number) => void }]>;
	}

	let { position = 'bottom', class: className, children, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div
	role="group"
	aria-label="Choose slide to display"
	data-carousel-thumbnails
	data-position={position}
	class={className}
	{...rest}
>
	{#each Array(ctx.totalSlides) as _, i (i)}
		{@const isActive = ctx.activeIndex === i}
		<Button
			variant="bare"
			type="button"
			aria-controls={ctx.getSlideId(i)}
			aria-disabled={isActive ? true : undefined}
			data-active={isActive ? '' : undefined}
			onclick={() => {
				if (!isActive) {
					ctx.scrollTo(i);
				}
			}}
		>
			<VisuallyHidden>
				Show slide {i + 1} of {ctx.totalSlides}
				{#if isActive}
					(current slide)
				{/if}
			</VisuallyHidden>
			<span class="thumbnail-preview" aria-hidden="true">
				{@render children({ index: i, isActive, scrollTo: ctx.scrollTo })}
			</span>
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

	.thumbnail-preview {
		display: inline-grid;
	}
</style>
