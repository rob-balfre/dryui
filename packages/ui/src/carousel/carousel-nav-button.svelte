<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import NavArrowButton from '../internal/nav-arrow-button.svelte';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		direction: 'prev' | 'next';
		children?: Snippet;
	}

	let { direction, children, disabled, onclick: consumerClick, ...rest }: Props = $props();
	const ctx = getCarouselCtx();

	const canScroll = $derived(direction === 'prev' ? ctx.canScrollPrev : ctx.canScrollNext);
</script>

<NavArrowButton
	{direction}
	variant="nav"
	size="icon"
	label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
	disabled={disabled ?? !canScroll}
	onclick={(e) => {
		if (direction === 'prev') ctx.scrollPrev();
		else ctx.scrollNext();
		consumerClick?.(e);
	}}
	{children}
	{...rest}
/>
