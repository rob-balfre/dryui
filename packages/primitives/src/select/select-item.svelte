<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, children, onclick, onkeydown, ...rest }: Props = $props();

	const ctx = getSelectCtx();

	const isSelected = $derived(ctx.value === value);

	let el = $state<HTMLDivElement>();

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		const text = el?.textContent?.trim() ?? '';
		ctx.select(value, text);
		ctx.close();
		ctx.triggerEl?.focus();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const text = el?.textContent?.trim() ?? '';
			ctx.select(value, text);
			ctx.close();
			ctx.triggerEl?.focus();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	bind:this={el}
	role="option"
	tabindex={disabled ? undefined : -1}
	aria-disabled={disabled || undefined}
	aria-selected={isSelected}
	data-state={isSelected ? 'selected' : 'unselected'}
	data-disabled={disabled || undefined}
	data-value={value}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
