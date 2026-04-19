<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
	const index = ctx.registerSlide();
	const slideId = ctx.getSlideId(index);

	$effect(() => {
		return () => ctx.unregisterSlide();
	});
</script>

<div
	id={slideId}
	role="group"
	aria-roledescription="slide"
	aria-hidden={ctx.activeIndex === index ? undefined : true}
	aria-label={`${index + 1} of ${ctx.totalSlides}`}
	data-carousel-slide=""
	data-active={ctx.activeIndex === index ? '' : undefined}
	inert={ctx.activeIndex !== index}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-carousel-slide] {
		scroll-snap-align: start;
	}
</style>
