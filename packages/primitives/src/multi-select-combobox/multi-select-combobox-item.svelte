<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		textValue?: string;
		disabled?: boolean;
		icon?: Snippet;
		children: Snippet;
	}

	let {
		value,
		textValue,
		disabled = false,
		icon,
		children,
		onpointerenter,
		...rest
	}: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
	const id = generateFormId('multi-select-combobox-item');

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
	data-value={value}
	data-text-value={textValue || undefined}
	data-state={isSelected ? 'selected' : 'unselected'}
	data-selected={isSelected || undefined}
	data-highlighted={isHighlighted || undefined}
	data-disabled={isUnavailable || undefined}
	{...rest}
>
	{#if icon}
		<span data-part="icon">{@render icon()}</span>
	{/if}
	{@render children()}
</div>
