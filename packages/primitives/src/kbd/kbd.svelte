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
		{#each keys as key, i (`${i}:${key}`)}
			<span class="key">{key}</span>{#if i < keys.length - 1}<span
					class="separator"
					aria-hidden="true">+</span
				>{/if}
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</kbd>
