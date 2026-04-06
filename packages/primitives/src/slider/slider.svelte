<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLInputAttributes {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
	}

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		orientation = 'horizontal',
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let progress = $derived(((value - min) / (max - min)) * 100);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-slider-progress', `${progress}%`);
		});
	}
</script>

<input
	type="range"
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
	data-orientation={orientation}
	use:applyStyles
	{...rest}
/>
