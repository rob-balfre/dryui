<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, onclick, class: className, size = 'md', ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (!ctx.disabled) ctx.openFileDialog();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	type="button"
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	onclick={handleClick}
	{...rest}
	class={className}
>
	{@render children()}
</button>

<style>
	[data-fu-trigger] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-space-12);
		gap: var(--dry-space-2);
		padding: var(--dry-space-2_5) var(--dry-space-4);
		font-size: var(--dry-type-small-size);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.25;
		color: var(--dry-color-on-brand);
		background: var(--dry-color-fill-brand);
		border: 1px solid transparent;
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		white-space: nowrap;
		user-select: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-fu-trigger]:hover:not([data-disabled]) {
		background: var(--dry-color-fill-brand-hover);
	}

	[data-fu-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-fu-trigger]:active:not([data-disabled]) {
		transform: translateY(1px);
	}

	[data-fu-trigger][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-fu-trigger][data-size='sm'] {
		padding: var(--dry-space-1_5) var(--dry-space-3);
		font-size: var(--dry-type-tiny-size);
		border-radius: var(--dry-radius-sm);
	}

	[data-fu-trigger][data-size='lg'] {
		padding: var(--dry-space-3) var(--dry-space-6);
		font-size: var(--dry-type-heading-4-size);
		border-radius: var(--dry-radius-lg);
	}
</style>
