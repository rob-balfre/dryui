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
		cursor: pointer;
		background: none;
		border: none;
		padding: var(--dry-space-2);
		color: var(--dry-color-text-weak);
		border-radius: var(--dry-radius-sm);
		min-height: var(--dry-space-11);
		display: inline-grid;
		place-items: center;
	}

	[data-alert-dialog-cancel]:hover {
		color: var(--dry-color-text-strong);
	}

	[data-alert-dialog-cancel]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
