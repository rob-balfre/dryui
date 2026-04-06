<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: number;
		max?: number;
		disabled?: boolean;
		readonly?: boolean;
		allowHalf?: boolean;
		onValueChange?: (value: number) => void;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		value = $bindable(0),
		max = 5,
		disabled = false,
		readonly = false,
		allowHalf = false,
		onValueChange,
		onkeydown,
		size = 'md',
		class: className,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);
	const isReadonly = $derived(readonly);

	let hoverValue = $state<number | null>(null);
	let focusedIndex = $state<number | null>(null);

	const displayValue = $derived(hoverValue !== null ? hoverValue : value);

	function getStarState(index: number): 'full' | 'half' | 'empty' {
		const starNumber = index + 1;
		if (displayValue >= starNumber) return 'full';
		if (allowHalf && displayValue >= starNumber - 0.5) return 'half';
		return 'empty';
	}

	function getTabIndex(index: number): number {
		const activeIndex = value === 0 ? 0 : Math.ceil(value) - 1;
		return index === activeIndex ? 0 : -1;
	}

	function handleStarClick(e: MouseEvent & { currentTarget: HTMLButtonElement }, index: number) {
		if (isDisabled || isReadonly) return;

		let newValue: number;
		if (allowHalf) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const isLeftHalf = x < rect.width / 2;
			newValue = isLeftHalf ? index + 0.5 : index + 1;
		} else {
			newValue = index + 1;
		}

		if (newValue === value) {
			newValue = 0;
		}

		value = newValue;
		onValueChange?.(newValue);
	}

	function handleStarMouseEnter(
		e: MouseEvent & { currentTarget: HTMLButtonElement },
		index: number
	) {
		if (isDisabled || isReadonly) return;

		if (allowHalf) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const isLeftHalf = x < rect.width / 2;
			hoverValue = isLeftHalf ? index + 0.5 : index + 1;
		} else {
			hoverValue = index + 1;
		}
	}

	function handleStarMouseMove(
		e: MouseEvent & { currentTarget: HTMLButtonElement },
		index: number
	) {
		if (isDisabled || isReadonly || !allowHalf) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const isLeftHalf = x < rect.width / 2;
		hoverValue = isLeftHalf ? index + 0.5 : index + 1;
	}

	function handleMouseLeave() {
		hoverValue = null;
	}

	function handleStarFocus(index: number) {
		focusedIndex = index;
	}

	function handleStarBlur() {
		focusedIndex = null;
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		if (isDisabled || isReadonly) {
			if (onkeydown)
				(onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
			return;
		}

		const step = allowHalf ? 0.5 : 1;

		switch (e.key) {
			case 'ArrowRight':
			case 'ArrowUp': {
				e.preventDefault();
				const newVal = Math.min(max, value + step);
				value = newVal;
				onValueChange?.(newVal);
				focusStarForValue(newVal);
				break;
			}
			case 'ArrowLeft':
			case 'ArrowDown': {
				e.preventDefault();
				const newVal = Math.max(0, value - step);
				value = newVal;
				onValueChange?.(newVal);
				focusStarForValue(newVal);
				break;
			}
			case 'Home': {
				e.preventDefault();
				const newVal = allowHalf ? 0.5 : 1;
				value = newVal;
				onValueChange?.(newVal);
				focusStarForValue(newVal);
				break;
			}
			case 'End': {
				e.preventDefault();
				value = max;
				onValueChange?.(max);
				focusStarForValue(max);
				break;
			}
		}

		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}

	let wrapperEl = $state<HTMLDivElement | undefined>(undefined);

	function focusStarForValue(val: number) {
		if (!wrapperEl) return;
		const targetIndex = val === 0 ? 0 : Math.ceil(val) - 1;
		const buttons = wrapperEl.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
		const target = buttons[targetIndex];
		if (target) target.focus();
	}

	const hiddenInputName = $derived(ctx?.id ? `${ctx.id}-rating` : 'rating');
</script>

<div
	bind:this={wrapperEl}
	role="radiogroup"
	aria-labelledby={ctx?.labelId}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	aria-required={ctx?.required || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadonly || undefined}
	data-size={size}
	class={className}
	onmouseleave={handleMouseLeave}
	onkeydown={handleKeydown}
	{...rest}
>
	{#each { length: max } as _, i}
		{@const starState = getStarState(i)}
		{@const starNumber = i + 1}
		{@const isHighlighted =
			hoverValue !== null
				? allowHalf
					? hoverValue >= i + 0.5
					: hoverValue > i
				: focusedIndex !== null && focusedIndex === i}
		<button
			type="button"
			role="radio"
			aria-checked={value > 0 && Math.ceil(value) === starNumber ? 'true' : 'false'}
			aria-label="{starNumber} out of {max} stars"
			tabindex={getTabIndex(i)}
			data-state={starState}
			data-highlighted={isHighlighted || undefined}
			data-disabled={isDisabled || undefined}
			data-readonly={isReadonly || undefined}
			disabled={isDisabled}
			onclick={(e) => handleStarClick(e, i)}
			onmouseenter={(e) => handleStarMouseEnter(e, i)}
			onmousemove={(e) => handleStarMouseMove(e, i)}
			onfocus={() => handleStarFocus(i)}
			onblur={handleStarBlur}
		></button>
	{/each}

	<input type="hidden" name={hiddenInputName} {value} required={ctx?.required || undefined} />
</div>

<style>
	div {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1);
		align-items: center;
	}

	button[role='radio'] {
		--dry-rating-unselected-color: var(--dry-color-stroke-weak);
		--dry-rating-selected-color: var(--dry-color-fill-brand);

		appearance: none;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		position: relative;
		display: inline-grid;
		place-items: center;
		min-height: 44px;
		aspect-ratio: 1;
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
		color: var(--dry-rating-unselected-color);
	}

	button[role='radio']::before {
		content: '\2605';
		font-size: var(--dry-star-size, var(--dry-space-6));
		line-height: 1;
		display: block;
	}

	button[role='radio'][data-state='full'] {
		color: var(--dry-rating-selected-color);
	}

	button[role='radio'][data-state='half']::before {
		background: linear-gradient(
			to right,
			var(--dry-rating-selected-color) 50%,
			var(--dry-rating-unselected-color) 50%
		);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	button[role='radio'][data-highlighted]:not([data-disabled]):not([data-readonly]) {
		transform: scale(1.15);
	}

	button[role='radio']:hover:not([data-disabled]):not([data-readonly]) {
		transform: scale(1.1);
	}

	button[role='radio']:active:not([data-disabled]):not([data-readonly]) {
		transform: scale(0.96);
	}

	button[role='radio'][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button[role='radio'][data-readonly] {
		cursor: default;
	}

	button[role='radio']:focus-visible {
		outline: 2px solid var(--dry-rating-focus-ring, var(--dry-color-focus-ring));
		outline-offset: 2px;
		border-radius: var(--dry-rating-radius, var(--dry-radius-sm));
	}

	/* ── Size variants ─────────────────────────────────────────────────────────── */

	div[data-size='sm'] button[role='radio'] {
		--dry-star-size: 20px;
	}

	div[data-size='md'] button[role='radio'] {
		--dry-star-size: var(--dry-space-6);
	}

	div[data-size='lg'] button[role='radio'] {
		--dry-star-size: 36px;
	}
</style>
