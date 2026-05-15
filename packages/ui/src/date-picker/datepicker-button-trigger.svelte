<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
	import { formatDate, variantAttrs } from '@dryui/primitives';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet | undefined;
	}

	let { placeholder = 'Select date', children, size = 'md', ...rest }: Props = $props();

	const ctx = getDatePickerCtx();

	let triggerEl = $state<HTMLButtonElement>();

	$effect(() => {
		if (!triggerEl) return;
		ctx.triggerEl = triggerEl;
		return () => {
			if (ctx.triggerEl === triggerEl) ctx.triggerEl = null;
		};
	});

	const displayText = $derived(
		ctx.value
			? formatDate(ctx.value, ctx.locale, { year: 'numeric', month: 'long', day: 'numeric' })
			: ''
	);
</script>

<span class="wrapper">
	<button
		bind:this={triggerEl}
		type="button"
		id={ctx.triggerId}
		aria-haspopup="dialog"
		aria-expanded={ctx.open}
		aria-controls={ctx.contentId}
		data-state={ctx.open ? 'open' : 'closed'}
		data-date-picker-trigger
		data-disabled={ctx.disabled || undefined}
		disabled={ctx.disabled}
		popovertarget={ctx.contentId}
		{...variantAttrs({ size })}
		{...rest}
	>
		<span data-content>
			{#if children}
				{@render children()}
			{:else}
				<span data-placeholder={!ctx.value ? '' : undefined}>
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
			><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path
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

	[data-date-picker-trigger] {
		--_dpt-bg: var(--dry-date-picker-trigger-bg, var(--dry-form-control-bg));
		--_dpt-border: var(--dry-date-picker-trigger-border, var(--dry-form-control-border));
		--_dpt-color: var(--dry-date-picker-trigger-color, var(--dry-form-control-color));
		--_dpt-radius: var(--dry-date-picker-trigger-radius, var(--dry-form-control-radius));
		--_dpt-padding-x: var(
			--dry-date-picker-trigger-padding-x,
			var(--dry-form-control-padding-inline)
		);
		--_dpt-padding-y: var(
			--dry-date-picker-trigger-padding-y,
			var(--dry-form-control-padding-block)
		);
		--_dpt-font-size: var(--dry-date-picker-trigger-font-size, var(--dry-form-control-font-size));

		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-block: var(--_dpt-padding-y);
		padding-inline: var(--_dpt-padding-x);
		font-size: var(--_dpt-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--_dpt-color);
		background: var(--_dpt-bg);
		border: 1px solid var(--_dpt-border);
		border-radius: var(--_dpt-radius);
		box-sizing: border-box;
		appearance: none;
		text-align: start;
		cursor: pointer;
		user-select: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-date-picker-trigger] [data-content] {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-date-picker-trigger] [data-placeholder] {
		color: var(--dry-form-control-color-placeholder);
	}

	[data-date-picker-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-date-picker-trigger]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}

	[data-date-picker-trigger][data-disabled] {
		--dry-date-picker-trigger-bg: var(--dry-color-bg-sunken);
		--dry-date-picker-trigger-border: var(--dry-color-stroke-disabled);
		--dry-date-picker-trigger-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-date-picker-trigger][data-size='sm'] {
		--dry-date-picker-trigger-padding-x: var(--dry-space-2);
		--dry-date-picker-trigger-padding-y: var(--dry-space-1);
		--dry-date-picker-trigger-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-date-picker-trigger][data-size='md'] {
		--dry-date-picker-trigger-padding-x: var(--dry-space-3);
		--dry-date-picker-trigger-padding-y: var(--dry-space-2);
		--dry-date-picker-trigger-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-date-picker-trigger][data-size='lg'] {
		--dry-date-picker-trigger-padding-x: var(--dry-space-4);
		--dry-date-picker-trigger-padding-y: var(--dry-space-2_5);
		--dry-date-picker-trigger-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	svg[data-indicator] {
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		opacity: 0.7;
	}
</style>
