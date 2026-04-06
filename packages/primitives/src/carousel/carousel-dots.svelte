<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div role="tablist" aria-label="Slide indicators" class={className} {...rest}>
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
