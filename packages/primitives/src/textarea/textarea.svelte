<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
		disabled?: boolean;
	}

	let { value = $bindable(''), disabled = false, ...rest }: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);
</script>

<textarea
	bind:value
	id={ctx?.id}
	disabled={isDisabled}
	required={ctx?.required || undefined}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	data-disabled={isDisabled || undefined}
	{...rest}
></textarea>
