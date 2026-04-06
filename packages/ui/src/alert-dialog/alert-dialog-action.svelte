<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<button type="button" data-alert-dialog-action class={className} {...rest}>
	{@render children()}
</button>

<style>
	[data-alert-dialog-action] {
		cursor: pointer;
		background: var(--dry-color-fill-error);
		color: var(--dry-color-on-brand);
		border: none;
		padding: var(--dry-space-2) var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		font-weight: 500;
		min-height: var(--dry-space-11);
		display: inline-grid;
		place-items: center;
	}

	[data-alert-dialog-action]:hover {
		background: var(--dry-color-fill-error-hover);
	}

	[data-alert-dialog-action]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
