<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();
</script>

<div
	role="listbox"
	data-command-palette-list
	id={ctx.listId}
	aria-label="Commands"
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-command-palette-list] {
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: var(--dry-space-1);
		min-height: 0;
		scrollbar-width: thin;
		scrollbar-color: var(--dry-scrollbar-thumb) var(--dry-scrollbar-track);
	}

	[data-command-palette-list]::-webkit-scrollbar-track {
		background: var(--dry-scrollbar-track);
	}

	[data-command-palette-list]::-webkit-scrollbar-thumb {
		background: var(--dry-scrollbar-thumb);
		border-radius: var(--dry-radius-full);
		border: 2px solid transparent;
		background-clip: content-box;
	}

	[data-command-palette-list]::-webkit-scrollbar-thumb:hover {
		background: var(--dry-scrollbar-thumb-hover);
		background-clip: content-box;
	}
</style>
