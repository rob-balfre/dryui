<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { setComboboxCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		value?: string;
		disabled?: boolean;
		name?: string;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		value = $bindable(''),
		disabled = false,
		name,
		children
	}: Props = $props();

	const inputId = generateFormId('combobox-input');
	const contentId = generateFormId('combobox-content');

	let displayText = $state('');
	let inputValue = $state('');
	let activeIndex = $state(-1);

	setComboboxCtx({
		get open() {
			return open;
		},
		get inputValue() {
			return inputValue;
		},
		get value() {
			return value;
		},
		get displayText() {
			return displayText;
		},
		get disabled() {
			return disabled;
		},
		get activeIndex() {
			return activeIndex;
		},
		inputId,
		contentId,
		inputEl: null,
		show() {
			if (!disabled) open = true;
		},
		close() {
			open = false;
			activeIndex = -1;
		},
		toggle() {
			if (disabled) return;
			const wasOpen = open;
			open = !open;
			if (wasOpen) activeIndex = -1;
		},
		select(v: string, text: string) {
			value = v;
			displayText = text;
			inputValue = text;
		},
		setInputValue(val: string) {
			inputValue = val;
		},
		setActiveIndex(index: number) {
			activeIndex = index;
		}
	});
</script>

{@render children()}

{#if name}
	<input type="hidden" {name} {value} disabled={disabled || undefined} />
{/if}
