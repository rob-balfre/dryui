<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		children: Snippet;
	}

	let { value, class: className, children, ...rest }: Props = $props();

	const ctx = getTabsCtx();

	const isSelected = $derived(ctx.value === value);
</script>

<div
	role="tabpanel"
	id="{ctx.id}-panel-{value}"
	aria-labelledby="{ctx.id}-tab-{value}"
	tabindex={0}
	data-state={isSelected ? 'active' : 'inactive'}
	data-tabs-content
	hidden={!isSelected || undefined}
	class={className}
	{...rest}
>
	{#if isSelected}{@render children()}{/if}
</div>

<style>
	[data-tabs-content] {
		padding: var(--dry-space-4) 0;
	}
</style>
