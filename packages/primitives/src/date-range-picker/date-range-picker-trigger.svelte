<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { formatDate } from '../utils/date-utils.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		children?: Snippet | undefined;
	}

	let { placeholder = 'Select date range', children, class: className, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	let buttonEl = $state<HTMLButtonElement>();

	$effect(() => {
		if (!buttonEl) return;
		ctx.triggerEl = buttonEl;
	});

	const formatOpts: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};

	const displayText = $derived.by(() => {
		if (ctx.startDate && ctx.endDate) {
			return `${formatDate(ctx.startDate, ctx.locale, formatOpts)} – ${formatDate(ctx.endDate, ctx.locale, formatOpts)}`;
		}
		if (ctx.startDate) {
			return formatDate(ctx.startDate, ctx.locale, formatOpts);
		}
		return '';
	});
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
		<span data-placeholder={!ctx.startDate ? '' : undefined}>
			{displayText || placeholder}
		</span>
	{/if}
</button>
