<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';
	import { formatRgb, formatHsl, parseColor, isValidHex } from '@dryui/primitives';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
		format?: 'hex' | 'rgb' | 'hsl';
	}

	let { format = 'hex', class: className, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	let inputValue = $state('');
	let isFocused = $state(false);

	const displayValue = $derived(
		format === 'hex' ? ctx.hex : format === 'rgb' ? formatRgb(ctx.rgb) : formatHsl(ctx.hsl)
	);

	$effect(() => {
		if (!isFocused) {
			inputValue = displayValue;
		}
	});

	const ariaLabel = $derived(
		format === 'hex' ? 'Hex color' : format === 'rgb' ? 'RGB color' : 'HSL color'
	);

	function commit() {
		const trimmed = inputValue.trim();

		if (format === 'hex') {
			if (isValidHex(trimmed)) {
				ctx.setFromHex(trimmed);
				return;
			}
			const withHash = `#${trimmed}`;
			if (isValidHex(withHash)) {
				ctx.setFromHex(withHash);
				return;
			}
		} else {
			const parsed = parseColor(trimmed);
			if (parsed) {
				ctx.setFromRgb(parsed);
				return;
			}
		}

		inputValue = displayValue;
	}

	function onFocus() {
		isFocused = true;
		inputValue = displayValue;
	}

	function onBlur() {
		isFocused = false;
		commit();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit();
			(e.currentTarget as HTMLInputElement).blur();
		} else if (e.key === 'Escape') {
			isFocused = false;
			inputValue = displayValue;
			(e.currentTarget as HTMLInputElement).blur();
		}
	}
</script>

<input
	type="text"
	value={isFocused ? inputValue : displayValue}
	oninput={(e) => {
		inputValue = (e.currentTarget as HTMLInputElement).value;
	}}
	onfocus={onFocus}
	onblur={onBlur}
	onkeydown={onKeyDown}
	disabled={ctx.disabled}
	aria-label={ariaLabel}
	data-cp-input
	data-format={format}
	data-disabled={ctx.disabled || undefined}
	spellcheck={false}
	autocomplete="off"
	class={className}
	{...rest}
/>

<style>
	[data-cp-input] {
		padding: var(--dry-form-control-padding-block) var(--dry-form-control-padding-inline);
		font-size: var(--dry-form-control-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-mono);
		color: var(--dry-form-control-color);
		background: var(--dry-form-control-bg);
		border: 1px solid var(--dry-form-control-border);
		border-radius: var(--dry-form-control-radius);
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		appearance: none;
	}

	[data-cp-input]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-cp-input]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
	}

	[data-cp-input][data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
	}
</style>
