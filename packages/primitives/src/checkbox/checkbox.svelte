<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLInputAttributes {
		checked?: boolean;
		indeterminate?: boolean;
		disabled?: boolean;
	}

	let {
		checked = $bindable(false),
		indeterminate = false,
		disabled = false,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let inputEl: HTMLInputElement | undefined = $state();

	let dataState = $derived(indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked');

	$effect(() => {
		if (inputEl) {
			inputEl.indeterminate = indeterminate;
		}
	});
</script>

<input
	bind:this={inputEl}
	type="checkbox"
	bind:checked
	id={ctx?.id}
	disabled={isDisabled}
	required={ctx?.required || undefined}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	data-disabled={isDisabled || undefined}
	data-state={dataState}
	{...rest}
/>
