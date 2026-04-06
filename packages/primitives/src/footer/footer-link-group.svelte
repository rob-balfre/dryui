<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		heading?: string;
	}

	let { children, heading, ...rest }: Props = $props();
</script>

<div {...rest}>
	{#if heading}
		<h3>{heading}</h3>
	{/if}
	{@render children()}
</div>
