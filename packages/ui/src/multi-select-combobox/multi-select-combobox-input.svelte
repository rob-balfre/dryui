<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLInputAttributes {
		placeholder?: string;
	}

	let {
		class: className,
		placeholder = '',
		oninput,
		onkeydown,
		onfocus,
		...rest
	}: Props = $props();

	const ctx = getMultiSelectComboboxCtx();

	function attachInput(node: HTMLInputElement) {
		ctx.inputEl = node;

		return () => {
			if (ctx.inputEl === node) {
				ctx.inputEl = null;
			}
		};
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		const nextQuery = event.currentTarget.value;
		ctx.setQuery(nextQuery);
		ctx.setActiveItem('');
		if (!ctx.open) {
			ctx.show();
		}

		if (oninput) {
			(oninput as (event: Event & { currentTarget: HTMLInputElement }) => void)(event);
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement }) {
		ctx.show();

		if (onfocus) {
			(onfocus as (event: FocusEvent & { currentTarget: HTMLInputElement }) => void)(event);
		}
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		const items = ctx.getEnabledItems();
		const currentIndex = items.findIndex((item) => item.id === ctx.activeItemId);

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				ctx.show();

				if (items.length > 0) {
					const nextIndex =
						currentIndex >= 0 && currentIndex < items.length - 1 ? currentIndex + 1 : 0;
					const nextItem = items[nextIndex];
					if (nextItem) {
						ctx.setActiveItem(nextItem.id);
					}
				}
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				ctx.show();

				if (items.length > 0) {
					const nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
					const nextItem = items[nextIndex];
					if (nextItem) {
						ctx.setActiveItem(nextItem.id);
					}
				}
				break;
			}
			case 'Enter': {
				if (!ctx.open || !ctx.activeItemId) {
					break;
				}

				const activeItem = items.find((item) => item.id === ctx.activeItemId);
				if (activeItem) {
					event.preventDefault();
					activeItem.click();
				}
				break;
			}
			case 'Escape': {
				event.preventDefault();
				ctx.close();
				break;
			}
			case 'Backspace': {
				if (event.currentTarget.value === '') {
					ctx.removeLastValue();
				}
				break;
			}
			case 'Tab': {
				ctx.close();
				break;
			}
		}

		if (onkeydown) {
			(onkeydown as (event: KeyboardEvent & { currentTarget: HTMLInputElement }) => void)(event);
		}
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
	aria-activedescendant={ctx.activeItemId || undefined}
	data-multi-select-input
	data-state={ctx.open ? 'open' : 'closed'}
	disabled={ctx.disabled || undefined}
	data-disabled={ctx.disabled || undefined}
	value={ctx.query}
	{placeholder}
	autocomplete="off"
	class={className}
	oninput={handleInput}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	{...rest}
/>

<style>
	[data-multi-select-input] {
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-strong);
		padding: 0;
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
	}

	[data-multi-select-input]::placeholder {
		color: var(--dry-color-text-weak);
	}

	[data-multi-select-input]:disabled {
		cursor: not-allowed;
	}

</style>
