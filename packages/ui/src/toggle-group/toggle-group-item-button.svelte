<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getToggleGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, ...rest }: Props = $props();

	const ctx = getToggleGroupCtx();

	let isDisabled = $derived(disabled || ctx.disabled);
	let isSelected = $derived(ctx.isSelected(value));
</script>

<Button
	variant="toggle"
	type="button"
	aria-pressed={isSelected}
	disabled={isDisabled}
	data-state={isSelected ? 'on' : 'off'}
	data-orientation={ctx.orientation}
	{...rest}
	onclick={() => {
		if (!isDisabled) {
			ctx.toggle(value);
		}
	}}
>
	{@render children()}
</Button>
