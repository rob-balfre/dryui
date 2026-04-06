<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSegmentedControlCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, class: className, onclick, ...rest }: Props = $props();

	const ctx = getSegmentedControlCtx();
	const isSelected = $derived(ctx.value === value);
	const isDisabled = $derived(disabled || ctx.disabled);

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (isDisabled) return;
		ctx.select(value);
		onclick?.(event);
	}
</script>

<button
	type="button"
	aria-pressed={isSelected}
	data-segmented-control-item
	data-state={isSelected ? 'on' : 'off'}
	data-disabled={isDisabled || undefined}
	disabled={isDisabled}
	class={className}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</button>
