<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLInputAttributes {
		value?: string;
		disabled?: boolean;
		type?: string;
	}

	let { value = $bindable(''), disabled = false, type = 'text', ...rest }: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);
</script>

<input
	{type}
	bind:value
	id={ctx?.id}
	disabled={isDisabled}
	required={ctx?.required || undefined}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	data-disabled={isDisabled || undefined}
	{...rest}
/>
