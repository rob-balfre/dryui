<script lang="ts">
	import type { Snippet } from 'svelte';
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

	const uid = $props.id();
	const inputId = `combobox-input-${uid}`;
	const contentId = `combobox-content-${uid}`;

	let displayText = $state('');
	let inputValue = $state('');
	let activeIndex = $state(-1);
	let inputEl = $state<HTMLInputElement | null>(null);
	let triggerEl = $state<HTMLElement | null>(null);

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
		get inputEl() {
			return inputEl;
		},
		set inputEl(element: HTMLInputElement | null) {
			inputEl = element;
		},
		get triggerEl() {
			return triggerEl;
		},
		set triggerEl(element: HTMLElement | null) {
			triggerEl = element;
		},
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

<div data-combobox-wrapper>
	{@render children()}

	{#if name}
		<input type="hidden" {name} {value} disabled={disabled || undefined} />
	{/if}
</div>

<style>
	[data-combobox-wrapper] {
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		position: relative;
	}
</style>
