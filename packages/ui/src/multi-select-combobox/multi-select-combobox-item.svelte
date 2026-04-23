<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		textValue?: string;
		disabled?: boolean;
		icon?: Snippet;
		children: Snippet;
	}

	let {
		class: className,
		value,
		textValue,
		disabled = false,
		icon,
		children,
		onpointerenter,
		...rest
	}: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
	const uid = $props.id();
	const id = `multi-select-combobox-item-${uid}`;

	const isSelected = $derived(ctx.isSelected(value));
	const isUnavailable = $derived(disabled || !ctx.canSelect(value));
	const isHighlighted = $derived(ctx.activeItemId === id);

	function attachItem(node: HTMLDivElement) {
		ctx.registerItem(id);

		function handlePointerEnter(event: PointerEvent) {
			if (!isUnavailable) {
				ctx.setActiveItem(id);
			}

			if (onpointerenter) {
				(onpointerenter as (event: PointerEvent & { currentTarget: HTMLDivElement }) => void)(
					event as PointerEvent & { currentTarget: HTMLDivElement }
				);
			}
		}

		function handleClick() {
			if (isUnavailable) {
				ctx.focusInput();
				return;
			}

			ctx.selectValue(value);
		}

		node.addEventListener('pointerenter', handlePointerEnter);
		node.addEventListener('click', handleClick);

		return () => {
			node.removeEventListener('pointerenter', handlePointerEnter);
			node.removeEventListener('click', handleClick);
			ctx.unregisterItem(id);
		};
	}

	function keepHighlightedItemVisible(node: HTMLDivElement) {
		node.scrollIntoView({ block: 'nearest' });
	}
</script>

<div
	{@attach attachItem}
	{@attach isHighlighted && keepHighlightedItemVisible}
	role="option"
	{id}
	tabindex={-1}
	aria-selected={isSelected}
	aria-disabled={isUnavailable || undefined}
	aria-label={textValue || undefined}
	data-multi-select-item
	data-value={value}
	data-text-value={textValue || undefined}
	data-state={isSelected ? 'selected' : 'unselected'}
	data-selected={isSelected || undefined}
	data-highlighted={isHighlighted || undefined}
	data-disabled={isUnavailable || undefined}
	class={className}
	{...rest}
>
	{#if icon}
		<span data-part="icon">{@render icon()}</span>
	{/if}
	{@render children()}
</div>

<style>
	[data-multi-select-item] {
		--dry-multi-select-item-radius: min(
			var(--dry-control-radius, var(--dry-radius-sm)),
			var(--dry-space-4)
		);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-multi-select-item-radius);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		user-select: none;
		outline: none;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-10);
	}

	[data-multi-select-item]:hover:not([data-disabled]),
	[data-multi-select-item][data-highlighted] {
		background: var(--dry-color-fill);
	}

	[data-multi-select-item][data-state='selected'] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
	}

	[data-multi-select-item][data-state='selected']:hover:not([data-disabled]),
	[data-multi-select-item][data-state='selected'][data-highlighted] {
		background: var(--dry-color-fill-brand-weak);
	}

	[data-multi-select-item][data-disabled] {
		background: var(--dry-color-bg-sunken);
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-multi-select-item] [data-part='icon'] {
		display: inline-grid;
		align-items: center;
	}
</style>
