<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();
</script>

<div role="listbox" id={ctx.listId} aria-label="Commands" {...rest}>
	{@render children()}
</div>
