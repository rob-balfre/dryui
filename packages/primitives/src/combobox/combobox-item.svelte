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

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (isHighlighted && el) {
			el.scrollIntoView({ block: 'nearest' });
		}
	});

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		const text = el?.textContent?.trim() ?? '';
		ctx.select(value, text);
		ctx.close();
		ctx.inputEl?.focus();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const text = el?.textContent?.trim() ?? '';
			ctx.select(value, text);
			ctx.close();
			ctx.inputEl?.focus();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	bind:this={el}
	role="option"
	id={`${ctx.contentId}-item-${index}`}
	tabindex={disabled ? undefined : -1}
	aria-selected={isSelected}
	data-state={isSelected ? 'selected' : 'unselected'}
	data-highlighted={isHighlighted || undefined}
	data-disabled={disabled || undefined}
	data-value={value}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{#if icon}
		<span data-part="icon">{@render icon()}</span>
	{/if}
	{@render children()}
</div>
