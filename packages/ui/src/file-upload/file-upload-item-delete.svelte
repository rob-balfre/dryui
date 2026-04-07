<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		index: number;
		children?: Snippet | undefined;
	}

	let { index, children, onclick, class: className, ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		e.stopPropagation();
		ctx.removeFile(index);
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	type="button"
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	data-fu-item-delete
	aria-label="Remove file"
	onclick={handleClick}
	{...rest}
	class={className}
>
	{#if children}
		{@render children()}
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
	{/if}
</button>

<style>
	[data-fu-item-delete] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-12);
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

	[data-fu-item-delete] svg {
		height: 1rem;
		aspect-ratio: 1;
	}

	[data-fu-item-delete]:hover:not([data-disabled]) {
		color: var(--dry-color-text-error);
		background: color-mix(in srgb, var(--dry-color-fill-error) 10%, transparent);
	}

	[data-fu-item-delete]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-fu-item-delete][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
