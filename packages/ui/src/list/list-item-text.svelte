<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		primary?: Snippet;
		secondary?: Snippet;
		children?: Snippet;
	}

	let { class: className, primary, secondary, children, ...rest }: Props = $props();
</script>

<div data-list-item-text class={className} {...rest}>
	{#if primary}
		<span data-list-item-primary>{@render primary()}</span>
	{:else if children}
		<span data-list-item-primary>{@render children()}</span>
	{/if}
	{#if secondary}
		<span data-list-item-secondary>{@render secondary()}</span>
	{/if}
</div>

<style>
	[data-list-item-text] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-0_5);
	}

	[data-list-item-text] > [data-list-item-primary] {
		font-size: var(--dry-list-primary-size);
		line-height: 1.5;
	}

	[data-list-item-text] > [data-list-item-secondary] {
		font-size: var(--dry-list-secondary-size);
		color: var(--dry-list-secondary-color);
		line-height: 1.4;
	}
</style>
