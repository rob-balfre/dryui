<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		heading?: string;
		children: Snippet;
	}

	let { heading, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={heading} {...rest}>
	{#if heading}
		<div role="presentation">{heading}</div>
	{/if}
	{@render children()}
</div>
