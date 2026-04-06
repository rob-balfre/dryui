<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();

	let showEmpty = $derived(ctx.query.trim().length > 0 && ctx.itemCount === 0);
</script>

{#if showEmpty}
	<div role="status" {...rest}>
		{@render children()}
	</div>
{/if}
