<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		children: Snippet;
	}

	let { title, class: className, children, ...rest }: Props = $props();
</script>

<div class={className} {...rest}>
	{#if title}
		<div data-part="column-title">{title}</div>
	{/if}
	{@render children()}
</div>
