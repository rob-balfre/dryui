<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { VisuallyHidden } from '../visually-hidden/index.js';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<div
	role="group"
	aria-label="Choose slide to display"
	data-carousel-dots
	class={className}
	{...rest}
>
	{#each Array(ctx.totalSlides) as _, i (i)}
		{@const isActive = ctx.activeIndex === i}
		<Button
			variant="toggle"
			size="icon-sm"
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
			<span class="dot" data-active={isActive ? '' : undefined} aria-hidden="true"></span>
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
		block-size: var(--dry-space-2);
		padding-inline: calc(var(--dry-space-2) / 2);
		border-radius: 9999px;
		background: var(--dry-color-text-weak);
		opacity: 0.55;
		transition:
			padding-inline var(--dry-duration-fast) var(--dry-ease-default),
			background-color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	.dot[data-active] {
		opacity: 1;
		padding-inline: var(--dry-space-3);
		background: var(--dry-color-fill-brand);
	}
</style>
