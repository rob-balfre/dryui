<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		primary?: Snippet;
		secondary?: Snippet;
		children?: Snippet;
	}

	let { primary, secondary, children, ...rest }: Props = $props();
</script>

<span data-list-item-text {...rest}>
	{#if primary}
		<span data-list-item-primary>{@render primary()}</span>
	{:else if children}
		<span data-list-item-primary>{@render children()}</span>
	{/if}
	{#if secondary}
		<span data-list-item-secondary>{@render secondary()}</span>
	{/if}
</span>

<style>
	[data-list-item-text] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-0_5, 0.125rem);
	}
</style>
