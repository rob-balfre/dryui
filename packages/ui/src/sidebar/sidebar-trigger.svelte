<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getSidebarCtx();
</script>

<button
	type="button"
	aria-label="Toggle sidebar"
	aria-expanded={!ctx.collapsed}
	data-sidebar-trigger
	class={className}
	onclick={() => ctx.toggle()}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	[data-sidebar-trigger] {
		display: grid;
		place-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-space-12);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-sidebar-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-md);
		background: transparent;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-sidebar-trigger]::before {
		content: '>';
		display: inline-grid;
		place-items: center;
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-sidebar-trigger]:hover {
		background: var(--dry-color-fill);
	}

	[data-sidebar-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-sidebar-trigger][aria-expanded='true']::before {
		transform: rotate(180deg);
	}

	[data-side='right'] [data-sidebar-trigger]::before {
		transform: rotate(180deg);
	}

	[data-side='right'] [data-sidebar-trigger][aria-expanded='true']::before {
		transform: none;
	}
</style>
