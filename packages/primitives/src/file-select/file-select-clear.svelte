<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet | undefined;
	}

	let { children, ...rest }: Props = $props();
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
