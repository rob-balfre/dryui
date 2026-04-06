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
