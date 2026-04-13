<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		class: className,
		size = 'md',
		placeholder = '',
		oninput,
		onkeydown,
		onfocus,
		...rest
	}: Props = $props();

	const ctx = getComboboxCtx();

	let el = $state<HTMLInputElement>();

	$effect(() => {
		if (el) {
			ctx.inputEl = el;
		}
	});

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
	bind:this={el}
	id={ctx.inputId}
	type="text"
	role="combobox"
	aria-expanded={ctx.open}
	aria-autocomplete="list"
	aria-controls={ctx.contentId}
	aria-activedescendant={ctx.activeIndex >= 0
		? `${ctx.contentId}-item-${ctx.activeIndex}`
		: undefined}
	data-combobox-input
	data-size={size}
	data-state={ctx.open ? 'open' : 'closed'}
	disabled={ctx.disabled || undefined}
	data-disabled={ctx.disabled || undefined}
	value={ctx.inputValue}
	{placeholder}
	autocomplete="off"
	class={className}
	oninput={handleInput}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	{...rest}
/>

<style>
	[data-combobox-input] {
		--dry-combobox-bg: var(--dry-form-control-bg);
		--dry-combobox-border: var(--dry-form-control-border);
		--dry-combobox-color: var(--dry-form-control-color);
		--dry-combobox-padding-x: var(--dry-form-control-padding-inline);
		--dry-combobox-padding-y: var(--dry-form-control-padding-block);
		--dry-combobox-font-size: var(--dry-form-control-font-size);

		display: grid;
		padding: var(--dry-combobox-padding-y) var(--dry-combobox-padding-x);
		font-size: var(--dry-combobox-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-combobox-color);
		background: var(--dry-combobox-bg);
		border: 1px solid var(--dry-combobox-border);
		border-radius: var(--dry-combobox-radius, var(--dry-form-control-radius));
		box-sizing: border-box;
		appearance: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-combobox-input]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-combobox-input]:focus-visible,
	[data-combobox-input]:focus {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
	}

	[data-combobox-input][data-disabled] {
		--dry-combobox-bg: var(--dry-color-bg-sunken);
		--dry-combobox-border: var(--dry-color-stroke-disabled);
		--dry-combobox-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-combobox-input][aria-invalid='true'],
	[data-combobox-input][data-invalid] {
		--dry-combobox-bg: color-mix(
			in srgb,
			var(--dry-color-fill-error-weak) 70%,
			var(--dry-color-bg-raised)
		);
		--dry-combobox-border: var(--dry-color-stroke-error);
	}

	[data-combobox-input][aria-invalid='true']:hover:not([data-disabled]),
	[data-combobox-input][data-invalid]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-error-strong);
	}

	[data-combobox-input][aria-invalid='true']:focus-visible,
	[data-combobox-input][data-invalid]:focus-visible {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-stroke-error);
	}

	/* Size variants */
	[data-combobox-input][data-size='sm'] {
		--dry-combobox-padding-x: var(--dry-space-2);
		--dry-combobox-padding-y: var(--dry-space-1);
		--dry-combobox-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-combobox-input][data-size='md'] {
		--dry-combobox-padding-x: var(--dry-space-3);
		--dry-combobox-padding-y: var(--dry-space-2);
		--dry-combobox-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-combobox-input][data-size='lg'] {
		--dry-combobox-padding-x: var(--dry-space-4);
		--dry-combobox-padding-y: var(--dry-space-2_5);
		--dry-combobox-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	@container (max-width: 200px) {
		[data-combobox-input] {
			--dry-combobox-padding-x: var(--dry-space-2);
		}
	}
</style>
