<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div role="tablist" aria-label="Slide indicators" data-carousel-dots class={className} {...rest}>
	{#each Array(ctx.totalSlides) as _, i (i)}
		<Button
			variant="toggle"
			size="icon-sm"
			type="button"
			role="tab"
			aria-selected={ctx.activeIndex === i}
			aria-pressed={ctx.activeIndex === i}
			aria-label="Go to slide {i + 1}"
			onclick={() => ctx.scrollTo(i)}
		>
			<span class="dot"></span>
		</Button>
	{/each}
</div>

<style>
	[data-carousel-dots] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		justify-self: center;
		padding-top: var(--dry-space-3);
	}

	.dot {
		display: inline-grid;
		height: var(--dry-space-2_5);
		aspect-ratio: 1;
		border-radius: 9999px;
		background: currentColor;
		opacity: 0.4;
	}

	[aria-selected='true'] .dot {
		opacity: 1;
	}
</style>
