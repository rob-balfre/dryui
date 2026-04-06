<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		disabled?: boolean;
		children: Snippet;
	}

	let { disabled = false, class: className, children, ...rest }: Props = $props();
</script>

<button
	type="button"
	{disabled}
	data-part="button"
	data-disabled={disabled || undefined}
	tabindex={-1}
	class={className}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-part='button'] {
		display: inline-grid;
		place-items: center;
		padding: var(--dry-space-2) var(--dry-space-3);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: transparent;
		border: none;
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='button']:hover:not([data-disabled]) {
		background: var(--dry-color-fill-hover);
	}

	[data-part='button']:active:not([data-disabled]) {
		transform: translateY(1px);
	}

	[data-part='button']:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -2px;
	}

	[data-part='button'][data-disabled] {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}
</style>
