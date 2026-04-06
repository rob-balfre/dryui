<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getListboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, ...rest }: Props = $props();

	const ctx = getListboxCtx();

	const isDisabled = $derived(disabled || ctx.disabled);
	const selected = $derived(ctx.isSelected(value));

	function handleClick() {
		if (!isDisabled) ctx.select(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!isDisabled) ctx.select(value);
		}
	}
</script>

<div
	role="option"
	aria-selected={selected}
	aria-disabled={isDisabled || undefined}
	data-selected={selected ? '' : undefined}
	data-disabled={isDisabled ? '' : undefined}
	data-value={value}
	tabindex={isDisabled ? -1 : 0}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
