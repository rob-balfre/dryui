<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getSidebarCtx();
</script>

<Button
	variant="outline"
	type="button"
	aria-label="Toggle sidebar"
	aria-expanded={!ctx.collapsed}
	data-sidebar-trigger
	data-side={ctx.side}
	{...rest}
	onclick={() => ctx.toggle()}
>
	{#if children}
		{@render children()}
	{/if}
</Button>
