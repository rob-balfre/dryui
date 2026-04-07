<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSelectableTileGroupCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'value'> {
		value: string;
		disabled?: boolean;
		unavailable?: boolean;
		children: Snippet;
	}

	let {
		value,
		disabled = false,
		unavailable = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getSelectableTileGroupCtx();
	const isDisabled = $derived(disabled || unavailable || ctx.disabled);
	const isSelected = $derived(ctx.isSelected(value));

	function moveFocus(current: HTMLButtonElement, direction: -1 | 1) {
		const group = current.closest('[role="radiogroup"]');
		if (!(group instanceof HTMLElement)) return;

		const items = Array.from(
			group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])')
		);
		const index = items.indexOf(current);
		if (index === -1) return;

		const target = items[(index + direction + items.length) % items.length];
		target?.focus();
		const nextValue = target?.dataset.value;
		if (nextValue) ctx.select(nextValue);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isDisabled || !(event.currentTarget instanceof HTMLButtonElement)) return;

		const isHorizontal = ctx.orientation === 'horizontal';
		if (
			(isHorizontal && event.key === 'ArrowRight') ||
			(!isHorizontal && event.key === 'ArrowDown')
		) {
			event.preventDefault();
			moveFocus(event.currentTarget, 1);
		}
		if ((isHorizontal && event.key === 'ArrowLeft') || (!isHorizontal && event.key === 'ArrowUp')) {
			event.preventDefault();
			moveFocus(event.currentTarget, -1);
		}
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			ctx.select(value);
		}
	}
</script>

<button
	type="button"
	role="radio"
	aria-checked={isSelected}
	disabled={isDisabled}
	data-option-swatch-group-item
	data-state={isSelected ? 'checked' : 'unchecked'}
	data-disabled={isDisabled || undefined}
	data-unavailable={unavailable || undefined}
	data-value={value}
	tabindex={isSelected ? 0 : -1}
	class={className}
	onclick={() => {
		if (!isDisabled) ctx.select(value);
	}}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-option-swatch-group-item] {
		--dry-option-swatch-bg: var(--dry-color-bg-raised);
		--dry-option-swatch-border: var(--dry-color-stroke-weak);
		--dry-option-swatch-border-selected: var(--dry-color-stroke-focus);
		--dry-option-swatch-text: var(--dry-color-text-strong);
		--dry-option-swatch-muted: var(--dry-color-text-weak);

		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-option-swatch-border);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-option-swatch-bg);
		color: var(--dry-option-swatch-text);
		box-shadow: var(--dry-shadow-xs);
		cursor: pointer;
		text-align: left;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-option-swatch-group-item]:hover:not(:disabled) {
		border-color: var(--dry-color-stroke-strong);
		transform: translateY(-1px);
	}

	[data-option-swatch-group-item]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-option-swatch-group-item][data-state='checked'] {
		border-color: var(--dry-option-swatch-border-selected);
		box-shadow: 0 0 0 1px var(--dry-option-swatch-border-selected);
	}

	[data-option-swatch-group-item][data-unavailable] {
		opacity: 0.6;
	}
</style>
