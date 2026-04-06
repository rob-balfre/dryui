<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		children: Snippet;
		onclick?: () => void;
	}

	let { class: className, children, onclick, ...rest }: Props = $props();
</script>

<button type="button" data-part="action" class={className} {onclick} {...rest}>
	{@render children()}
</button>

<style>
	[data-part='action'] {
		all: unset;
		cursor: pointer;
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		color: var(--dry-toast-accent, var(--dry-color-fill-brand, #3b82f6));
		padding: var(--dry-space-1) var(--dry-space-2);
		border-radius: var(--dry-radius-sm, 0.25rem);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
		white-space: nowrap;

		&:hover {
			background: var(--dry-toast-action-hover-bg, var(--dry-color-fill));
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}
	}
</style>
