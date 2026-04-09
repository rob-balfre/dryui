<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		value,
		disabled = false,
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getTabsCtx();

	const isSelected = $derived(ctx.value === value);
</script>

<button
	role="tab"
	type="button"
	aria-selected={isSelected}
	aria-controls="{ctx.id}-panel-{value}"
	id="{ctx.id}-tab-{value}"
	tabindex={isSelected ? 0 : -1}
	data-state={isSelected ? 'active' : 'inactive'}
	data-disabled={disabled || undefined}
	data-tabs-trigger
	data-size={size}
	class={className}
	{disabled}
	onclick={() => {
		if (!disabled) ctx.select(value);
	}}
	onfocus={() => {
		if (ctx.activationMode === 'automatic' && !disabled) ctx.select(value);
	}}
	{...rest}
>
	<span data-tabs-trigger-content>{@render children()}</span>
</button>

<style>
	[data-tabs-trigger] {
		--dry-tabs-padding-x: var(--dry-space-4);
		--dry-tabs-padding-y: var(--dry-space-2_5);
		--dry-tabs-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));

		display: inline-grid;
		place-items: center;
		min-height: var(--dry-space-12);
		padding: var(--dry-tabs-padding-y) var(--dry-tabs-padding-x);
		font-size: var(--dry-tabs-font-size);
		font-family: var(--dry-font-sans);
		font-weight: 400;
		color: var(--dry-color-text-weak);
		background: transparent;
		border: none;
		border-bottom: var(--dry-tabs-trigger-border-bottom, 4px solid transparent);
		border-right: var(--dry-tabs-trigger-border-right, none);
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-tabs-trigger]:hover:not([data-disabled]) {
		color: var(--dry-color-text-strong);
	}

	[data-tabs-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -2px;
	}

	[data-tabs-trigger][data-state='active'] {
		color: var(--dry-color-text-brand);
		border-bottom-color: var(
			--dry-tabs-trigger-active-border-bottom-color,
			var(--dry-color-stroke-selected)
		);
		border-right-color: var(--dry-tabs-trigger-active-border-right-color, transparent);
		font-weight: 600;
	}

	[data-tabs-trigger]:active:not([data-disabled]):not([data-state='active']) {
		transform: translateY(1px);
	}

	[data-tabs-trigger][data-disabled] {
		color: var(--dry-color-text-disabled);
		opacity: 1;
		cursor: not-allowed;
	}

	[data-tabs-trigger][data-size='sm'] {
		--dry-tabs-padding-x: var(--dry-space-3);
		--dry-tabs-padding-y: var(--dry-space-1_5);
		--dry-tabs-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	[data-tabs-trigger][data-size='md'] {
		--dry-tabs-padding-x: var(--dry-space-4);
		--dry-tabs-padding-y: var(--dry-space-2_5);
		--dry-tabs-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-tabs-trigger][data-size='lg'] {
		--dry-tabs-padding-x: var(--dry-space-6);
		--dry-tabs-padding-y: var(--dry-space-3);
		--dry-tabs-font-size: var(--dry-type-heading-4-size, var(--dry-text-base-size));
	}

	[data-tabs-trigger-content] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-space-1_5);
	}
</style>
