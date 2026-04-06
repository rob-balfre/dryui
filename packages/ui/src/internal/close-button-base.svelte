<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<button type="button" class={className} {...rest}>
	{#if children}{@render children()}{/if}
</button>

<style>
	button {
		cursor: pointer;
		background: none;
		border: none;
		padding: var(--dry-space-2);
		color: var(--dry-color-text-weak);
		border-radius: var(--dry-radius-sm);
		min-height: var(--dry-space-11);
		aspect-ratio: 1;
		display: inline-grid;
		place-items: center;
	}

	button:hover {
		background: var(--dry-color-fill);
		color: var(--dry-color-text-strong);
	}

	button:active {
		background: var(--dry-color-fill-hover);
	}

	button:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
