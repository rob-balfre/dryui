<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'p' | 'span' | 'div';
		children: Snippet;
	}

	let { as = 'p', children, ...rest }: Props = $props();
</script>

{#if as === 'span'}
	<span {...rest}>{@render children()}</span>
{:else if as === 'div'}
	<div {...rest}>{@render children()}</div>
{:else}
	<p {...rest}>{@render children()}</p>
{/if}
