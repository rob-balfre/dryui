<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLButtonAttributes {
		pressed?: boolean;
		disabled?: boolean;
		children?: Snippet;
	}

	type ToggleClickEvent = Parameters<NonNullable<HTMLButtonAttributes['onclick']>>[0];

	let {
		pressed = $bindable(false),
		disabled = false,
		children,
		onclick,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	function handleClick(event: ToggleClickEvent) {
		onclick?.(event);

		if (event.defaultPrevented || isDisabled) {
			return;
		}

		pressed = !pressed;
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={pressed}
	id={ctx?.id}
	disabled={isDisabled}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	data-state={pressed ? 'on' : 'off'}
	data-disabled={isDisabled || undefined}
	onclick={handleClick}
	{...rest}
>
	{#if children}{@render children()}{/if}
</button>
