<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
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

<button
	type="button"
	aria-pressed={isSelected}
	disabled={isDisabled}
	data-state={isSelected ? 'on' : 'off'}
	data-disabled={isDisabled || undefined}
	onclick={() => {
		if (!isDisabled) {
			ctx.toggle(value);
		}
	}}
	{...rest}
>
	{@render children()}
</button>
