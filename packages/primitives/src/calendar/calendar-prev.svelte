<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();
</script>

<button
	type="button"
	aria-label="Previous month"
	disabled={ctx.disabled}
	class={className}
	onclick={() => ctx.prevMonth()}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		&#8249;
	{/if}
</button>
