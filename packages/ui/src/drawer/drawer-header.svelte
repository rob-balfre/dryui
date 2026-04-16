<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<div data-drawer-header id={ctx.headerId} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-drawer-header] {
		grid-row: 1;
		padding: var(--dry-space-6) var(--dry-space-8);
		border-bottom: 1px solid var(--dry-drawer-border);
	}
</style>
