<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTagsInputCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		index: number;
		value: string;
		children?: Snippet | undefined;
	}

	let { index, value, children, ...rest }: Props = $props();

	const ctx = getTagsInputCtx();
</script>

<span data-disabled={ctx.disabled || undefined} data-index={index} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		{value}
	{/if}
</span>
