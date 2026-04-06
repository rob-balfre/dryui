<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		children: Snippet;
	}

	let { value, children, ...rest }: Props = $props();

	const ctx = getTabsCtx();

	const isSelected = $derived(ctx.value === value);
</script>

<div
	role="tabpanel"
	id="{ctx.id}-panel-{value}"
	aria-labelledby="{ctx.id}-tab-{value}"
	tabindex={0}
	data-state={isSelected ? 'active' : 'inactive'}
	hidden={!isSelected || undefined}
	{...rest}
>
	{#if isSelected}{@render children()}{/if}
</div>
