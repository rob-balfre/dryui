<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLInputAttributes {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
	}

	let { value = $bindable(0), min, max, step = 1, disabled = false, ...rest }: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	function decrement() {
		const next = value - step;
		if (min !== undefined && next < min) return;
		value = next;
	}

	function increment() {
		const next = value + step;
		if (max !== undefined && next > max) return;
		value = next;
	}
</script>

<div role="group" data-disabled={isDisabled || undefined}>
	<button
		type="button"
		tabindex="-1"
		aria-label="Decrease value"
		disabled={isDisabled}
		onclick={decrement}>−</button
	>
	<input
		type="number"
		bind:value
		id={ctx?.id}
		{min}
		{max}
		{step}
		disabled={isDisabled}
		required={ctx?.required || undefined}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		data-disabled={isDisabled || undefined}
		{...rest}
	/>
	<button
		type="button"
		tabindex="-1"
		aria-label="Increase value"
		disabled={isDisabled}
		onclick={increment}>+</button
	>
</div>
