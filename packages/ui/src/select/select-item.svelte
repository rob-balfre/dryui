<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		class: className,
		value,
		disabled = false,
		children,
		onclick,
		onkeydown,
		...rest
	}: Props = $props();

	const ctx = getSelectCtx();

	const isSelected = $derived(ctx.value === value);

	function handleClick(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		const text = e.currentTarget.textContent?.trim() ?? '';
		ctx.select(value, text);
		ctx.close();
		ctx.triggerEl?.focus();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const text = e.currentTarget.textContent?.trim() ?? '';
			ctx.select(value, text);
			ctx.close();
			ctx.triggerEl?.focus();
		}
		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	role="option"
	tabindex={disabled ? undefined : -1}
	aria-disabled={disabled || undefined}
	aria-selected={isSelected}
	data-select-item
	data-state={isSelected ? 'selected' : 'unselected'}
	data-disabled={disabled || undefined}
	data-value={value}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-select-item] {
		--dry-select-item-radius: min(
			var(--dry-control-radius, var(--dry-radius-sm)),
			var(--dry-space-4)
		);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-select-item-radius);
		font-size: var(--dry-type-small-size);
		cursor: pointer;
		user-select: none;
		outline: none;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-10);

		/* Enter transition so the stagger utility on
		   [data-select-content][data-dry-stagger] can delay it. */
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-out),
			transform var(--dry-duration-fast) var(--dry-ease-out);

		@starting-style {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	[data-select-item]:hover:not([data-disabled]),
	[data-select-item]:focus-visible {
		background: var(--dry-color-fill);
	}

	[data-select-item][data-state='selected'] {
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
		font-weight: 600;
	}

	[data-select-item][data-state='selected']:hover:not([data-disabled]),
	[data-select-item][data-state='selected']:focus-visible {
		background: var(--dry-color-fill-brand-weak);
	}

	[data-select-item][data-disabled] {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
