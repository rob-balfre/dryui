<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';
	import { setPinInputCtx, type PinInputCell } from './context.svelte.js';

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
		children?: Snippet<[{ cells: PinInputCell[] }]>;
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
		children,
		class: className,
		...rest
	}: Props = $props();

	const formCtx = getFormControlCtx();
	const isDisabled = $derived(disabled || formCtx?.disabled || false);
	const hasError = $derived(formCtx?.hasError || false);

	let inputEl: HTMLInputElement | undefined = $state();
	let isFocused = $state(false);
	let mirrorSelectionStart = $state<number | null>(null);
	let mirrorSelectionEnd = $state<number | null>(null);
	let completeFired = $state(false);

	// Build validation regex from type or pattern prop
	const validationRegex = $derived(pattern ?? (type === 'numeric' ? /^\d+$/ : /^[a-zA-Z0-9]+$/));

	// Compute cells from value
	const cells: PinInputCell[] = $derived.by(() => {
		const result: PinInputCell[] = [];
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

	// Set context for child components
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

	// Selection tracking
	function syncSelection() {
		if (!inputEl) return;
		mirrorSelectionStart = inputEl.selectionStart;
		mirrorSelectionEnd = inputEl.selectionEnd;
	}

	$effect(() => {
		const handler = () => {
			if (document.activeElement === inputEl) {
				syncSelection();
			}
		};
		document.addEventListener('selectionchange', handler);
		return () => document.removeEventListener('selectionchange', handler);
	});

	// Reset completeFired when value becomes incomplete
	$effect(() => {
		if (value.length < length) {
			completeFired = false;
		}
	});

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		let newValue = input.value;

		// Filter by validation regex (character by character)
		newValue = newValue
			.split('')
			.filter((ch) => validationRegex.test(ch))
			.join('');

		// Truncate to length
		newValue = newValue.slice(0, length);

		value = newValue;
		syncSelection();

		// Fire oncomplete once when fully filled
		if (newValue.length === length && !completeFired) {
			completeFired = true;
			oncomplete?.(newValue);
			if (blurOnComplete) {
				inputEl?.blur();
			}
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		let pasted = e.clipboardData?.getData('text') ?? '';
		if (pasteTransformer) {
			pasted = pasteTransformer(pasted);
		}

		// Filter characters
		pasted = pasted
			.split('')
			.filter((ch) => validationRegex.test(ch))
			.join('');

		if (!inputEl) return;

		const start = inputEl.selectionStart ?? value.length;
		const end = inputEl.selectionEnd ?? value.length;

		// Replace selection with pasted content
		const before = value.slice(0, start);
		const after = value.slice(end);
		let newValue = before + pasted + after;
		newValue = newValue.slice(0, length);

		value = newValue;

		// Move cursor to end of pasted content
		const newPos = Math.min(before.length + pasted.length, length);
		requestAnimationFrame(() => {
			inputEl?.setSelectionRange(newPos, newPos);
			syncSelection();
		});

		if (newValue.length === length && !completeFired) {
			completeFired = true;
			oncomplete?.(newValue);
			if (blurOnComplete) {
				inputEl?.blur();
			}
		}
	}

	function handleFocus() {
		isFocused = true;
		// Move cursor to end of current value
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
		// Block invalid characters before they reach input
		if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
			if (!validationRegex.test(e.key)) {
				e.preventDefault();
			}
			// Block if already at max length and no selection
			if (value.length >= length && inputEl?.selectionStart === inputEl?.selectionEnd) {
				e.preventDefault();
			}
		}
	}

	// Container click focuses input
	function handleContainerClick() {
		if (!isDisabled) {
			inputEl?.focus();
		}
	}
</script>

<!-- svelte-ignore a11y_role_supports_aria_props -->
<div
	role="group"
	aria-label="PIN input"
	aria-describedby={formCtx?.describedBy}
	aria-invalid={hasError || undefined}
	aria-errormessage={formCtx?.errorMessageId}
	data-pin-input-root
	data-disabled={isDisabled || undefined}
	data-error={hasError || undefined}
	data-complete={value.length === length || undefined}
	class={['pin-input-root', className]}
	onclick={handleContainerClick}
	{...rest}
>
	<input
		bind:this={inputEl}
		type="text"
		inputmode={type === 'numeric' ? 'numeric' : 'text'}
		autocomplete="one-time-code"
		maxlength={length}
		{value}
		id={formCtx?.id}
		aria-label="PIN input"
		aria-required={formCtx?.required || undefined}
		disabled={isDisabled}
		spellcheck={false}
		data-pin-input-hidden
		class="pin-input-hidden"
		oninput={handleInput}
		onpaste={handlePaste}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
	/>

	{#if children}
		{@render children({ cells })}
	{:else}
		<!-- Simple mode: render cells in a single Group for consistent styling -->
		<div data-pin-input-group role="presentation">
			{#each cells as cell (cell.index)}
				<div
					data-pin-input-cell
					data-active={cell.isActive || undefined}
					data-inactive={!cell.isActive || undefined}
					data-state={cell.char ? 'filled' : 'empty'}
					data-disabled={isDisabled || undefined}
					data-error={hasError || undefined}
					data-mask={mask || undefined}
					aria-hidden="true"
				>
					{#if cell.char}
						{#if mask}
							<span>•</span>
						{:else}
							<span>{cell.char}</span>
						{/if}
					{:else if cell.hasFakeCaret}
						<div data-pin-input-caret></div>
					{:else}
						<span data-pin-input-placeholder>{placeholder}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
</div>

<style>
	.pin-input-root {
		position: relative;
	}

	.pin-input-hidden {
		position: absolute;
		inset: 0;
		width: 100%;
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
</style>
