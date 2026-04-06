<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getRadioGroupCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'children'> {
		value: string;
		disabled?: boolean;
		children?: Snippet | undefined;
	}

	let { value, disabled = false, children, class: className, ...rest }: Props = $props();

	const ctx = getRadioGroupCtx();

	const isDisabled = $derived(disabled || ctx.disabled);
	const checked = $derived(ctx.value === value);

	function handleChange() {
		if (isDisabled) return;
		ctx.select(value);
	}
</script>

<label
	data-radio-group-item
	data-state={checked ? 'checked' : 'unchecked'}
	data-disabled={isDisabled || undefined}
	class={className}
>
	<input
		type="radio"
		name={ctx.name}
		{value}
		{checked}
		disabled={isDisabled}
		required={ctx.required}
		data-state={checked ? 'checked' : 'unchecked'}
		data-disabled={isDisabled || undefined}
		onchange={handleChange}
		{...rest}
	/>
	{#if children}
		{@render children()}
	{/if}
</label>
