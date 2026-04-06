<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div role="separator" data-pin-input-separator class={className} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&ndash;</span>
	{/if}
</div>

<style>
	[data-pin-input-separator] {
		color: var(--dry-pin-separator-color);
		font-size: var(--dry-pin-font-size);
		display: grid;
		align-items: center;
		user-select: none;
	}
</style>
