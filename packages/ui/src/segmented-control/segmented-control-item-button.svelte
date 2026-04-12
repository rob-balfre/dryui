<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getSegmentedControlCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, onclick, ...rest }: Props = $props();

	const ctx = getSegmentedControlCtx();
	const isSelected = $derived(ctx.value === value);
	const isDisabled = $derived(disabled || ctx.disabled);

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (isDisabled) return;
		ctx.select(value);
		onclick?.(event);
	}
</script>

<Button
	variant="toggle"
	type="button"
	aria-pressed={isSelected}
	data-state={isSelected ? 'on' : 'off'}
	data-orientation={ctx.orientation}
	disabled={isDisabled}
	{...rest}
	onclick={handleClick}
>
	{@render children()}
</Button>
