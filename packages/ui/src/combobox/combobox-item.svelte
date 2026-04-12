<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		index: number;
		disabled?: boolean;
		icon?: Snippet;
		children: Snippet;
	}

	let {
		class: className,
		value,
		index,
		disabled = false,
		icon,
		children,
		onclick,
		onkeydown,
		...rest
	}: Props = $props();

	const ctx = getComboboxCtx();

	const isSelected = $derived(ctx.value === value);
	const isHighlighted = $derived(ctx.activeIndex === index);

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		const text = e.currentTarget.textContent?.trim() ?? '';
		ctx.select(value, text);
		ctx.close();
		ctx.inputEl?.focus();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const text = e.currentTarget.textContent?.trim() ?? '';
			ctx.select(value, text);
			ctx.close();
			ctx.inputEl?.focus();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	function keepHighlightedItemVisible(node: HTMLDivElement) {
		node.scrollIntoView({ block: 'nearest' });
	}
</script>

<div
	{@attach isHighlighted && keepHighlightedItemVisible}
	role="option"
	id={`${ctx.contentId}-item-${index}`}
	tabindex={disabled ? undefined : -1}
	aria-selected={isSelected}
	data-combobox-item
	data-state={isSelected ? 'selected' : 'unselected'}
	data-highlighted={isHighlighted || undefined}
	data-disabled={disabled || undefined}
	data-value={value}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{#if icon}
		<span data-part="icon">{@render icon()}</span>
	{/if}
	{@render children()}
</div>

<style>
	[data-combobox-item] {
		--dry-combobox-item-radius: min(
			var(--dry-control-radius, var(--dry-radius-sm)),
			var(--dry-space-4)
		);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-combobox-item-radius);
		font-size: var(--dry-type-small-size);
		cursor: pointer;
		user-select: none;
		outline: none;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-10);
	}

	[data-combobox-item]:hover:not([data-disabled]),
	[data-combobox-item][data-highlighted] {
		background: var(--dry-color-fill);
	}

	[data-combobox-item][data-state='selected'] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
		font-weight: 600;
	}

	[data-combobox-item][data-state='selected']:hover:not([data-disabled]),
	[data-combobox-item][data-state='selected'][data-highlighted] {
		background: var(--dry-color-fill-brand-weak);
	}

	[data-combobox-item][data-disabled] {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-combobox-item] [data-part='icon'] {
		display: inline-grid;
		align-items: center;
		margin-right: var(--dry-space-2);
	}
</style>
