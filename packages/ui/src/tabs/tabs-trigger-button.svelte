<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { value, disabled = false, size = 'md', children, ...rest }: Props = $props();

	const ctx = getTabsCtx();

	const isSelected = $derived(ctx.value === value);
</script>

<Button
	variant="tab"
	type="button"
	{size}
	role="tab"
	aria-selected={isSelected}
	aria-controls="{ctx.id}-panel-{value}"
	id="{ctx.id}-tab-{value}"
	tabindex={isSelected ? 0 : -1}
	data-state={isSelected ? 'active' : 'inactive'}
	{disabled}
	{...rest}
	onclick={() => {
		if (!disabled) ctx.select(value);
	}}
	onfocus={() => {
		if (ctx.activationMode === 'automatic' && !disabled) ctx.select(value);
	}}
>
	{@render children()}
</Button>
