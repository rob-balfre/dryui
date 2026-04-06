<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAlertCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getAlertCtx();
</script>

<button
	type="button"
	aria-label="Dismiss alert"
	data-alert-close
	class={className}
	onclick={() => ctx.dismiss()}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&times;</span>
	{/if}
</button>

<style>
	[data-alert-close] {
		grid-column: -2 / -1;
		grid-row: 1 / 3;
		align-self: start;
		display: grid;
		place-items: center;
		height: var(--dry-space-11);
		aspect-ratio: 1;
		padding: 0;
		border: none;
		border-radius: var(--dry-radius-sm);
		background: transparent;
		color: var(--dry-color-text-weak);
		cursor: pointer;
		font-size: var(--dry-type-heading-4-size);
		line-height: 1;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-alert-close]:hover {
		background: var(--dry-color-fill);
		color: var(--dry-color-text-strong);
	}

	[data-alert-close]:active {
		background: var(--dry-color-fill-hover);
		transform: translateY(1px);
	}

	[data-alert-close]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}
</style>
