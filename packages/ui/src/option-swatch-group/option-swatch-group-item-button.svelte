<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getSelectableTileGroupCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'value'> {
		value: string;
		disabled?: boolean;
		unavailable?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, unavailable = false, children, ...rest }: Props = $props();

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

<Button
	variant="outline"
	type="button"
	role="radio"
	aria-checked={isSelected}
	disabled={isDisabled}
	data-option-swatch-group-item
	data-state={isSelected ? 'checked' : 'unchecked'}
	data-unavailable={unavailable || undefined}
	data-value={value}
	tabindex={isSelected ? 0 : -1}
	{...rest}
	onclick={() => {
		if (!isDisabled) ctx.select(value);
	}}
	onkeydown={handleKeydown}
>
	{@render children()}
</Button>
