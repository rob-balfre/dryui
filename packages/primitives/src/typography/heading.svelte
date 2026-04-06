<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children: Snippet;
	}

	let { level = 2, children, ...rest }: Props = $props();
</script>

{#if level === 1}
	<h1 {...rest}>{@render children()}</h1>
{:else if level === 2}
	<h2 {...rest}>{@render children()}</h2>
{:else if level === 3}
	<h3 {...rest}>{@render children()}</h3>
{:else if level === 4}
	<h4 {...rest}>{@render children()}</h4>
{:else if level === 5}
	<h5 {...rest}>{@render children()}</h5>
{:else}
	<h6 {...rest}>{@render children()}</h6>
{/if}
