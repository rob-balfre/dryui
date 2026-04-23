<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
		prefix?: string;
	}

	let { children, prefix, ...rest }: Props = $props();
</script>

<span data-ref-id {...rest}>
	{#if prefix}{prefix}
	{/if}{@render children()}
</span>

<style>
	[data-ref-id] {
		white-space: nowrap;
		font-variant-numeric: var(--dry-numeric-variant);
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
	}
</style>
