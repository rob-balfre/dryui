<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, ...rest }: Props = $props();

	const ctx = getTabsCtx();

	const isSelected = $derived(ctx.value === value);
</script>

<button
	role="tab"
	type="button"
	aria-selected={isSelected}
	aria-controls="{ctx.id}-panel-{value}"
	id="{ctx.id}-tab-{value}"
	tabindex={isSelected ? 0 : -1}
	data-state={isSelected ? 'active' : 'inactive'}
	data-disabled={disabled || undefined}
	{disabled}
	onclick={() => {
		if (!disabled) ctx.select(value);
	}}
	onfocus={() => {
		if (ctx.activationMode === 'automatic' && !disabled) ctx.select(value);
	}}
	{...rest}
>
	{@render children()}
</button>
