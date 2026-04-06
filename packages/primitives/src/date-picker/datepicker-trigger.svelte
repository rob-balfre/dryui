<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
	import { formatDate } from './date-utils.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		children?: Snippet | undefined;
	}

	let { placeholder = 'Select date', children, class: className, ...rest }: Props = $props();

	const ctx = getDatePickerCtx();

	let buttonEl = $state<HTMLButtonElement>();

	$effect(() => {
		if (!buttonEl) return;
		ctx.triggerEl = buttonEl;
	});

	const displayText = $derived(
		ctx.value
			? formatDate(ctx.value, ctx.locale, { year: 'numeric', month: 'long', day: 'numeric' })
			: ''
	);
</script>

<button
	bind:this={buttonEl}
	id={ctx.triggerId}
	type="button"
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled ? '' : undefined}
	disabled={ctx.disabled}
	popovertarget={ctx.contentId}
	class={className}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-placeholder={!ctx.value ? '' : undefined}>
			{displayText || placeholder}
		</span>
	{/if}
</button>
