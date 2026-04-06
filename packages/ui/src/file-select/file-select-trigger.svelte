<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, class: className, size = 'md', ...rest }: Props = $props();
	const ctx = getFileSelectCtx();
</script>

<button
	type="button"
	onclick={ctx.request}
	disabled={ctx.disabled || ctx.loading || undefined}
	data-loading={ctx.loading || undefined}
	data-disabled={ctx.disabled || undefined}
	{...rest}
	class={className}
>
	{@render children()}
</button>

<style>
	[data-fs-trigger] {
		display: inline-grid;
		place-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--dry-color-text-brand);
		background: transparent;
		border: 1px solid var(--dry-color-stroke-brand, var(--dry-color-fill-brand));
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		white-space: nowrap;
		user-select: none;
		min-height: var(--dry-space-10);
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-fs-trigger]:hover:not(:disabled) {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 8%, transparent);
	}

	[data-fs-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-fs-trigger]:active:not(:disabled) {
		transform: translateY(1px);
	}

	[data-fs-trigger]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-fs-trigger][data-size='sm'] {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size);
		border-radius: var(--dry-radius-sm);
		min-height: var(--dry-space-8);
	}

	[data-fs-trigger][data-size='lg'] {
		padding: var(--dry-space-3) var(--dry-space-4);
		font-size: var(--dry-type-heading-4-size);
		border-radius: var(--dry-radius-lg);
		min-height: var(--dry-space-12);
	}
</style>
