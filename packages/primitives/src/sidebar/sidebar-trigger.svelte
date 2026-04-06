<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getSidebarCtx();
</script>

<button
	type="button"
	aria-label="Toggle sidebar"
	aria-expanded={!ctx.collapsed}
	onclick={() => ctx.toggle()}
	class={className}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
