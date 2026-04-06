<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();

	let showEmpty = $derived(ctx.query.trim().length > 0 && ctx.itemCount === 0);
</script>

{#if showEmpty}
	<div role="status" data-command-palette-empty class={className} {...rest}>
		{@render children()}
	</div>
{/if}

<style>
	[data-command-palette-empty] {
		padding: var(--dry-space-8) var(--dry-space-4);
		text-align: center;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-weak);
	}
</style>
