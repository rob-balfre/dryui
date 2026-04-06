<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		href?: string;
		name?: string;
		children: Snippet;
	}

	let { href, name, class: className, children, ...rest }: Props = $props();
</script>

<figure data-part="item" class={className} {...rest}>
	{#if href}
		<a {href} target="_blank" rel="noopener noreferrer">
			{@render children()}
		</a>
	{:else}
		{@render children()}
	{/if}
	{#if name}
		<figcaption>{name}</figcaption>
	{/if}
</figure>
