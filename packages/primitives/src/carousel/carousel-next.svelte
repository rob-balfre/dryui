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
	aria-label="Next slide"
	disabled={disabled ?? !ctx.canScrollNext}
	class={className}
	{...rest}
	onclick={(e) => {
		ctx.scrollNext();
		rest.onclick?.(e);
	}}
>
	{#if children}
		{@render children()}
	{:else}
		&#8250;
	{/if}
</button>
