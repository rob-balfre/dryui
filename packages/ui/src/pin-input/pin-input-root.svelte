<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';
	import { setPinInputCtx } from './context.svelte.js';
	import type { PinInputCellState } from './context.svelte.js';
	import PinInputGroup from './pin-input-group.svelte';
	import PinInputCellStyled from './pin-input-cell.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		value?: string;
		length?: number;
		mask?: boolean;
		type?: 'numeric' | 'alphanumeric';
		pattern?: RegExp;
		placeholder?: string;
		disabled?: boolean;
		oncomplete?: (value: string) => void;
		pasteTransformer?: (text: string) => string;
		blurOnComplete?: boolean;
		name?: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'outline' | 'flushed';
		children?: Snippet<[{ cells: PinInputCellState[] }]>;
	}

	let {
		value = $bindable(''),
		length = 4,
		mask = false,
		type = 'numeric',
		pattern,
		placeholder = '○',
		disabled = false,
		oncomplete,
		pasteTransformer,
		blurOnComplete = false,
		name,
		size = 'md',
		variant = 'outline',
		children: userChildren,
		class: className,
		...rest
	}: Props = $props();

	const formCtx = getFormControlCtx();
	const isDisabled = $derived(disabled || formCtx?.disabled || false);
	const hasError = $derived(formCtx?.hasError || false);

	let inputEl: HTMLInputElement | undefined;
	let isFocused = $state(false);
	let mirrorSelectionStart = $state<number | null>(null);
	let mirrorSelectionEnd = $state<number | null>(null);

	const validationRegex = $derived(pattern ?? (type === 'numeric' ? /^\d+$/ : /^[a-zA-Z0-9]+$/));

	const cells: PinInputCellState[] = $derived.by(() => {
		const result: PinInputCellState[] = [];
		for (let i = 0; i < length; i++) {
			const char = value[i] ?? null;
			const isActive =
				isFocused &&
				mirrorSelectionStart !== null &&
				(mirrorSelectionStart === i ||
					(mirrorSelectionStart <= i && (mirrorSelectionEnd ?? mirrorSelectionStart) > i) ||
					(i === length - 1 && (mirrorSelectionStart ?? 0) >= length));
			const hasFakeCaret = isFocused && isActive && char === null && mirrorSelectionStart === i;
			result.push({ char, isActive, hasFakeCaret, index: i });
		}
		return result;
	});

	setPinInputCtx({
		get cells() {
			return cells;
		},
		get value() {
			return value;
		},
		get disabled() {
			return isDisabled;
		},
		get hasError() {
			return hasError;
		},
		get mask() {
			return mask;
		},
		get placeholder() {
			return placeholder;
		}
	});

	function syncSelection() {
		if (!inputEl) return;
		mirrorSelectionStart = inputEl.selectionStart;
		mirrorSelectionEnd = inputEl.selectionEnd;
	}

	function captureInput(node: HTMLInputElement) {
		inputEl = node;
		return () => {
			if (inputEl === node) {
				inputEl = undefined;
			}
		};
	}

	function maybeFireComplete(previousValue: string, nextValue: string) {
		if (nextValue.length !== length) return;
		if (previousValue.length === length && previousValue === nextValue) return;

		oncomplete?.(nextValue);
		if (blurOnComplete) {
			inputEl?.blur();
		}
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const previousValue = value;
		let newValue = input.value;

		newValue = newValue
			.split('')
			.filter((ch) => validationRegex.test(ch))
			.join('');

		newValue = newValue.slice(0, length);
		value = newValue;
		syncSelection();
		maybeFireComplete(previousValue, newValue);
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const previousValue = value;
		let pasted = e.clipboardData?.getData('text') ?? '';
		if (pasteTransformer) {
			pasted = pasteTransformer(pasted);
		}

		pasted = pasted
			.split('')
			.filter((ch) => validationRegex.test(ch))
			.join('');

		if (!inputEl) return;

		const start = inputEl.selectionStart ?? value.length;
		const end = inputEl.selectionEnd ?? value.length;

		const before = value.slice(0, start);
		const after = value.slice(end);
		let newValue = before + pasted + after;
		newValue = newValue.slice(0, length);

		value = newValue;

		const newPos = Math.min(before.length + pasted.length, length);
		requestAnimationFrame(() => {
			inputEl?.setSelectionRange(newPos, newPos);
			syncSelection();
		});

		maybeFireComplete(previousValue, newValue);
	}

	function handleFocus() {
		isFocused = true;
		requestAnimationFrame(() => {
			if (inputEl) {
				const pos = value.length;
				inputEl.setSelectionRange(pos, pos);
				syncSelection();
			}
		});
	}

	function handleBlur() {
		isFocused = false;
		mirrorSelectionStart = null;
		mirrorSelectionEnd = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
			if (!validationRegex.test(e.key)) {
				e.preventDefault();
			}
			if (value.length >= length && inputEl?.selectionStart === inputEl?.selectionEnd) {
				e.preventDefault();
			}
		}
	}

	function handleContainerClick() {
		if (!isDisabled) {
			inputEl?.focus();
		}
	}

	const sizeAttr = $derived(`data-pin-input-${size}`);
</script>

<div
	role="group"
	aria-label="PIN input"
	aria-describedby={formCtx?.describedBy}
	data-pin-input-root
	data-disabled={isDisabled || undefined}
	data-error={hasError || undefined}
	data-complete={value.length === length || undefined}
	data-variant={variant}
	{...{ [sizeAttr]: '' }}
	class={className}
	onclick={handleContainerClick}
	{...rest}
>
	<input
		{@attach captureInput}
		type="text"
		inputmode={type === 'numeric' ? 'numeric' : 'text'}
		autocomplete="one-time-code"
		maxlength={length}
		{value}
		id={formCtx?.id}
		aria-label="PIN input"
		aria-describedby={formCtx?.describedBy}
		aria-invalid={hasError || undefined}
		aria-errormessage={formCtx?.errorMessageId}
		aria-required={formCtx?.required || undefined}
		disabled={isDisabled}
		spellcheck={false}
		data-pin-input-hidden
		oninput={handleInput}
		onpaste={handlePaste}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		onkeyup={syncSelection}
		onselect={syncSelection}
	/>

	{#if userChildren}
		{@render userChildren({ cells })}
	{:else}
		<PinInputGroup>
			{#each cells as cell (cell.index)}
				<PinInputCellStyled {cell} />
			{/each}
		</PinInputGroup>
	{/if}

	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
</div>

<style>
	[data-pin-input-root] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
		position: relative;

		--dry-pin-size: 44px;
		--dry-pin-font-size: var(--dry-type-small-size);
		--dry-pin-border: var(--dry-color-stroke-strong);
		--dry-pin-bg: var(--dry-color-bg-raised);
		--dry-pin-radius: var(--dry-radius-md);
		--dry-pin-caret-color: var(--dry-color-fill-brand);
		--dry-pin-separator-color: var(--dry-color-text-weak);
	}

	input[data-pin-input-hidden] {
		position: absolute;
		inset: 0;
		height: 100%;
		opacity: 0;
		color: transparent;
		caret-color: transparent;
		background: transparent;
		border: 0;
		outline: 0;
		font-family: monospace;
		letter-spacing: -0.5em;
		font-variant-numeric: tabular-nums;
		z-index: 1;
	}

	[data-pin-input-root][data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
	}

	[data-pin-input-root][data-disabled] input[data-pin-input-hidden] {
		pointer-events: none;
	}

	[data-pin-input-sm] {
		--dry-pin-size: 36px;
		--dry-pin-font-size: var(--dry-type-small-size);
	}

	[data-pin-input-md] {
		--dry-pin-size: 44px;
		--dry-pin-font-size: var(--dry-type-small-size);
	}

	[data-pin-input-lg] {
		--dry-pin-size: 52px;
		--dry-pin-font-size: var(--dry-type-heading-4-size);
	}

	[data-pin-input-root][data-variant='flushed'] {
		--dry-pin-cell-border: none;
		--dry-pin-cell-border-bottom: 2px solid var(--dry-pin-border);
		--dry-pin-cell-radius: 0;
		--dry-pin-cell-bg: transparent;
	}
</style>
