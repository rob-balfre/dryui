<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ListboxItemProps } from './index.js';
	import { getListboxCtx } from './context.svelte.js';

	let { class: className, value, disabled = false, children, ...rest }: ListboxItemProps = $props();

	const ctx = getListboxCtx();

	const isDisabled = $derived(disabled || ctx.disabled);
	const selected = $derived(ctx.isSelected(value));

	function handleClick() {
		if (!isDisabled) ctx.select(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!isDisabled) ctx.select(value);
		}
	}
</script>

<div
	role="option"
	aria-selected={selected}
	aria-disabled={isDisabled || undefined}
	data-listbox-item
	data-selected={selected ? '' : undefined}
	data-disabled={isDisabled ? '' : undefined}
	data-value={value}
	tabindex={isDisabled ? -1 : 0}
	class={className}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-listbox-item] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-listbox-item-padding-y, var(--dry-space-2))
			var(--dry-listbox-item-padding-x, var(--dry-space-3));
		border-radius: var(
			--dry-listbox-item-radius,
			min(var(--dry-control-radius, var(--dry-radius-md)), var(--dry-space-4))
		);
		color: var(--dry-color-text-strong);
		cursor: pointer;
		user-select: none;
		outline: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-listbox-item]:hover:not([data-disabled]),
	[data-listbox-item]:focus-visible {
		background: var(--dry-listbox-item-hover-bg, var(--dry-color-fill-hover));
	}

	[data-listbox-item][data-selected] {
		background: var(--dry-listbox-item-selected-bg, var(--dry-color-fill-selected));
		color: var(--dry-listbox-item-selected-color, var(--dry-color-on-brand));
		font-weight: 600;
		box-shadow: inset 0 0 0 1px
			var(--dry-listbox-item-selected-border, var(--dry-color-stroke-selected));
	}

	[data-listbox-item][data-selected]:hover:not([data-disabled]),
	[data-listbox-item][data-selected]:focus-visible {
		background: var(--dry-listbox-item-selected-bg, var(--dry-color-fill-selected));
	}

	[data-listbox-item][data-disabled] {
		color: var(--dry-color-text-disabled);
		opacity: 1;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
