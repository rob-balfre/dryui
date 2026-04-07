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
		--dry-btn-accent: var(--dry-color-fill-error);
		--dry-btn-accent-hover: var(--dry-color-fill-error-hover);
		--dry-btn-accent-active: var(--dry-color-fill-error-hover);
		--dry-btn-on-accent: var(--dry-color-on-error);
		--dry-btn-border: transparent;

		cursor: pointer;
		background: var(--dry-btn-accent);
		color: var(--dry-btn-on-accent);
		border: 1px solid var(--dry-btn-border);
		padding: var(--dry-space-2_5) var(--dry-space-4);
		border-radius: var(--dry-radius-md);
		box-shadow: var(--dry-shadow-raised);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.01em;
		min-height: var(--dry-space-12);
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		gap: var(--dry-space-2);
		text-decoration: none;
		white-space: nowrap;
		user-select: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-alert-dialog-action]:hover {
		background: var(--dry-btn-accent-hover);
	}

	[data-alert-dialog-action]:active:not(:disabled) {
		background: var(--dry-btn-accent-active);
		transform: translateY(1px);
	}

	[data-alert-dialog-action]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}

	[data-alert-dialog-action]:disabled {
		background: var(--dry-color-fill-disabled);
		color: var(--dry-color-text-disabled);
		border-color: var(--dry-color-stroke-disabled);
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
