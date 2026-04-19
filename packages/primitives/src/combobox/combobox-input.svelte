<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLInputAttributes {
		placeholder?: string;
	}

	let { placeholder = '', oninput, onkeydown, onfocus, ...rest }: Props = $props();

	const ctx = getComboboxCtx();

	function attachInput(node: HTMLInputElement) {
		ctx.inputEl = node;
		return () => {
			if (ctx.inputEl === node) {
				ctx.inputEl = null;
			}
		};
	}

	function getOptionItems(contentEl: HTMLElement | null): HTMLElement[] {
		if (!contentEl) return [];
		return Array.from(
			contentEl.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])')
		);
	}

	function getContentEl(): HTMLElement | null {
		return document.getElementById(ctx.contentId);
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const val = e.currentTarget.value;
		ctx.setInputValue(val);
		ctx.setActiveIndex(-1);
		if (!ctx.open) ctx.show();
		if (oninput) (oninput as (e: Event & { currentTarget: HTMLInputElement }) => void)(e);
	}

	function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		if (!ctx.open) ctx.show();
		if (onfocus) (onfocus as (e: FocusEvent & { currentTarget: HTMLInputElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		const contentEl = getContentEl();
		const items = getOptionItems(contentEl);

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				if (!ctx.open) {
					ctx.show();
					ctx.setActiveIndex(0);
				} else {
					const next = ctx.activeIndex < items.length - 1 ? ctx.activeIndex + 1 : 0;
					ctx.setActiveIndex(next);
				}
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				if (!ctx.open) {
					ctx.show();
					ctx.setActiveIndex(items.length - 1);
				} else {
					const prev = ctx.activeIndex > 0 ? ctx.activeIndex - 1 : items.length - 1;
					ctx.setActiveIndex(prev);
				}
				break;
			}
			case 'Enter': {
				e.preventDefault();
				if (ctx.open && ctx.activeIndex >= 0 && items[ctx.activeIndex]) {
					items[ctx.activeIndex]!.click();
				}
				break;
			}
			case 'Escape': {
				e.preventDefault();
				ctx.setInputValue(ctx.displayText);
				ctx.close();
				break;
			}
			case 'Home': {
				if (!ctx.open || items.length === 0) break;
				e.preventDefault();
				ctx.setActiveIndex(0);
				break;
			}
			case 'End': {
				if (!ctx.open || items.length === 0) break;
				e.preventDefault();
				ctx.setActiveIndex(items.length - 1);
				break;
			}
			case 'Tab': {
				if (ctx.open) {
					if (ctx.activeIndex >= 0 && items[ctx.activeIndex]) {
						items[ctx.activeIndex]!.click();
					} else {
						ctx.close();
					}
				}
				break;
			}
		}

		if (onkeydown)
			(onkeydown as (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void)(e);
	}
</script>

<input
	{@attach attachInput}
	id={ctx.inputId}
	type="text"
	role="combobox"
	aria-expanded={ctx.open}
	aria-autocomplete="list"
	aria-controls={ctx.contentId}
	aria-activedescendant={ctx.activeIndex >= 0
		? `${ctx.contentId}-item-${ctx.activeIndex}`
		: undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	disabled={ctx.disabled || undefined}
	data-disabled={ctx.disabled || undefined}
	value={ctx.inputValue}
	{placeholder}
	autocomplete="off"
	oninput={handleInput}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	{...rest}
/>
