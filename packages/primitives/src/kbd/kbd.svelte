<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		keys?: string[];
		children?: Snippet;
	}

	let { keys, children, ...rest }: Props = $props();
</script>

<kbd {...rest}>
	{#if keys}
		{#each keys as key, i}
			<kbd>{key}</kbd>{#if i < keys.length - 1}<span>+</span>{/if}
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</kbd>
