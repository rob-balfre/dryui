<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

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

<style>
	[data-drp-trigger] {
		display: inline-grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-space-12);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		cursor: pointer;
		text-align: left;
		box-sizing: border-box;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-drp-trigger]::after {
		content: '';
		aspect-ratio: 1;
		height: 1rem;
		background: currentColor;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='17' rx='2' ry='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E");
		mask-size: contain;
		mask-repeat: no-repeat;
		opacity: 0.75;
	}

	[data-drp-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-drp-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
	}

	[data-drp-trigger][data-disabled] {
		opacity: 0.55;
		cursor: not-allowed;
	}

	[data-drp-trigger] [data-placeholder] {
		color: var(--dry-color-text-weak);
	}
</style>
