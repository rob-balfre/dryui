<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		children?: Snippet | undefined;
	}

	let { placeholder = 'Select date range', children, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	$effect(() => {
		const node = document.getElementById(ctx.triggerId);
		if (node) {
			ctx.triggerEl = node as HTMLButtonElement;
		}
		return () => {
			if (ctx.triggerEl && ctx.triggerEl.id === ctx.triggerId) {
				ctx.triggerEl = null;
			}
		};
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

<Button
	variant="outline"
	type="button"
	id={ctx.triggerId}
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled ? '' : undefined}
	disabled={ctx.disabled}
	popovertarget={ctx.contentId}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-placeholder={!ctx.startDate ? '' : undefined}>
			{displayText || placeholder}
		</span>
	{/if}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
		><rect x="3" y="4" width="18" height="17" rx="2" ry="2" /><path
			d="M16 2v4M8 2v4M3 10h18"
		/></svg
	>
</Button>
