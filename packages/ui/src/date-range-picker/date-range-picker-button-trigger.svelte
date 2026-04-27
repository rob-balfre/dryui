<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		size?: 'sm' | 'md' | 'lg';
		placeholder?: string;
		children?: Snippet | undefined;
	}

	let { size = 'md', placeholder = 'Select date range', children, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	let triggerEl = $state<HTMLButtonElement>();

	$effect(() => {
		if (!triggerEl) return;
		ctx.triggerEl = triggerEl;
		return () => {
			if (ctx.triggerEl === triggerEl) ctx.triggerEl = null;
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

<span class="wrapper">
	<button
		bind:this={triggerEl}
		type="button"
		id={ctx.triggerId}
		popovertarget={ctx.contentId}
		aria-haspopup="dialog"
		aria-expanded={ctx.open}
		aria-controls={ctx.contentId}
		data-state={ctx.open ? 'open' : 'closed'}
		data-date-range-trigger
		disabled={ctx.disabled}
		data-disabled={ctx.disabled || undefined}
		{...variantAttrs({ size })}
		{...rest}
	>
		<span data-content>
			{#if children}
				{@render children()}
			{:else}
				<span data-placeholder={!ctx.startDate ? '' : undefined}>
					{displayText || placeholder}
				</span>
			{/if}
		</span>
		<svg
			data-indicator
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
	</button>
</span>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	[data-date-range-trigger] {
		/* Form-control surface — derives from --dry-form-control-* so it stays
		   visually consistent with <Input>/<Select.Trigger>, regardless of
		   ambient --dry-btn-* overrides (e.g. Card's nested radius). */
		--_drt-bg: var(--dry-date-range-trigger-bg, var(--dry-form-control-bg));
		--_drt-border: var(--dry-date-range-trigger-border, var(--dry-form-control-border));
		--_drt-color: var(--dry-date-range-trigger-color, var(--dry-form-control-color));
		--_drt-radius: var(--dry-date-range-trigger-radius, var(--dry-form-control-radius));
		--_drt-padding-x: var(
			--dry-date-range-trigger-padding-x,
			var(--dry-form-control-padding-inline)
		);
		--_drt-padding-y: var(
			--dry-date-range-trigger-padding-y,
			var(--dry-form-control-padding-block)
		);
		--_drt-font-size: var(--dry-date-range-trigger-font-size, var(--dry-form-control-font-size));

		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-block: var(--_drt-padding-y);
		padding-inline: var(--_drt-padding-x);
		font-size: var(--_drt-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--_drt-color);
		background: var(--_drt-bg);
		border: 1px solid var(--_drt-border);
		border-radius: var(--_drt-radius);
		box-sizing: border-box;
		appearance: none;
		text-align: start;
		cursor: pointer;
		user-select: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-date-range-trigger] [data-content] {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-date-range-trigger] [data-placeholder] {
		color: var(--dry-form-control-color-placeholder);
	}

	[data-date-range-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-date-range-trigger]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}

	[data-date-range-trigger][data-disabled] {
		--dry-date-range-trigger-bg: var(--dry-color-bg-sunken);
		--dry-date-range-trigger-border: var(--dry-color-stroke-disabled);
		--dry-date-range-trigger-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-date-range-trigger][data-size='sm'] {
		--dry-date-range-trigger-padding-x: var(--dry-space-2);
		--dry-date-range-trigger-padding-y: var(--dry-space-1);
		--dry-date-range-trigger-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-date-range-trigger][data-size='md'] {
		--dry-date-range-trigger-padding-x: var(--dry-space-3);
		--dry-date-range-trigger-padding-y: var(--dry-space-2);
		--dry-date-range-trigger-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-date-range-trigger][data-size='lg'] {
		--dry-date-range-trigger-padding-x: var(--dry-space-4);
		--dry-date-range-trigger-padding-y: var(--dry-space-2_5);
		--dry-date-range-trigger-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	svg[data-indicator] {
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		opacity: 0.7;
	}
</style>
