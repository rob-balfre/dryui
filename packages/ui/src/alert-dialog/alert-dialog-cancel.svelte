<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<button
	type="button"
	data-alert-dialog-cancel
	onclick={() => ctx.close()}
	class={className}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-alert-dialog-cancel] {
		--dry-btn-accent-fg: var(--dry-color-text-brand);
		--dry-btn-accent-stroke: var(--dry-color-stroke-brand);

		cursor: pointer;
		background: transparent;
		border: 1px solid var(--dry-btn-accent-stroke);
		padding: var(--dry-space-2_5) var(--dry-space-4);
		color: var(--dry-btn-accent-fg);
		border-radius: var(--dry-radius-sm);
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

	[data-alert-dialog-cancel]:hover {
		background: var(--dry-color-bg-alternate);
		border-color: var(--dry-color-stroke-strong);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-shadow-sm);
	}

	[data-alert-dialog-cancel]:active:not(:disabled) {
		background: var(--dry-color-fill);
		border-color: var(--dry-color-stroke-strong);
		color: var(--dry-color-text-strong);
		transform: translateY(1px);
	}

	[data-alert-dialog-cancel]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}

	[data-alert-dialog-cancel]:disabled {
		background: var(--dry-color-fill-disabled);
		color: var(--dry-color-text-disabled);
		border-color: var(--dry-color-stroke-disabled);
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
