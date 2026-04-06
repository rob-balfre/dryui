<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLInputAttributes {
		value?: string;
		disabled?: boolean;
		step?: number;
	}

	let { value = $bindable(''), disabled = false, step, ...rest }: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);
</script>

<input
	type="time"
	bind:value
	{step}
	id={ctx?.id}
	disabled={isDisabled}
	required={ctx?.required || undefined}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	data-disabled={isDisabled || undefined}
	{...rest}
/>
