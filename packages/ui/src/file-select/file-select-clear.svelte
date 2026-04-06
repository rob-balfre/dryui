<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet | undefined;
	}

	let { children, class: className, ...rest }: Props = $props();
	const ctx = getFileSelectCtx();

	const hidden = $derived(!ctx.value || ctx.disabled);
</script>

{#if !hidden}
	<button
		type="button"
		onclick={ctx.clear}
		aria-label="Clear selection"
		data-disabled={ctx.disabled || undefined}
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else}
			✕
		{/if}
	</button>
{/if}

<style>
	[data-fs-clear] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		padding: 0;
		color: var(--dry-color-text-weak);
		background: transparent;
		border: none;
		border-radius: var(--dry-radius-sm);
		cursor: pointer;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-fs-clear]::before {
		content: '';
		display: block;
		height: 0.875rem;
		aspect-ratio: 1;
		background: currentColor;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E");
		mask-size: contain;
		mask-repeat: no-repeat;
	}

	[data-fs-clear]:hover {
		color: var(--dry-color-text-error);
		background: color-mix(in srgb, var(--dry-color-fill-error) 10%, transparent);
	}

	[data-fs-clear]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}
</style>
