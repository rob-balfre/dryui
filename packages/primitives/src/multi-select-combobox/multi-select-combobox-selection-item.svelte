<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		value: string;
		children?: Snippet | undefined;
	}

	let { value, children, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
</script>

{#if ctx.isSelected(value)}
	<span role="listitem" data-value={value} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{value}
		{/if}
	</span>
{/if}
