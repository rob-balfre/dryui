<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCarouselCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { class: className, children, disabled, ...rest }: Props = $props();
	const ctx = getCarouselCtx();
</script>

<button
	aria-label="Previous slide"
	disabled={disabled ?? !ctx.canScrollPrev}
	class={className}
	{...rest}
	onclick={(e) => {
		ctx.scrollPrev();
		rest.onclick?.(e);
	}}
>
	{#if children}
		{@render children()}
	{:else}
		&#8249;
	{/if}
</button>
