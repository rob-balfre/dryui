<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div data-calendar-header class={className} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-calendar-header] {
		display: grid;
		grid-template-columns: auto max-content auto;
		align-items: center;
		align-content: center;
		justify-content: center;
		gap: var(--dry-space-2);
		margin-bottom: var(--dry-space-2);
	}
</style>
