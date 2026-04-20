<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		leading?: Snippet;
		trailing?: Snippet;
	}

	let {
		class: className,
		style,
		size = 'md',
		placeholder = '',
		leading,
		trailing,
		disabled = false,
		oninput,
		onkeydown,
		onfocus,
		'aria-invalid': ariaInvalid,
		'data-invalid': dataInvalid,
		...rest
	}: Props = $props();

	const ctx = getComboboxCtx();
	const hasLeading = $derived(Boolean(leading));
	const hasTrailing = $derived(Boolean(trailing));
	const isDisabled = $derived(Boolean(ctx.disabled || disabled));
	const isInvalid = $derived(
		isTruthyInvalidValue(ariaInvalid) || isTruthyInvalidValue(dataInvalid)
	);

	function isTruthyInvalidValue(value: unknown): boolean {
		return value != null && value !== false && value !== 'false';
	}

	function attachInput(node: HTMLInputElement) {
		ctx.inputEl = node;
		return () => {
			if (ctx.inputEl === node) {
				ctx.inputEl = null;
			}
		};
	}

	function attachTrigger(node: HTMLElement) {
		ctx.triggerEl = node;
		return () => {
			if (ctx.triggerEl === node) {
				ctx.triggerEl = null;
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
		if (ctx.activeIndex !== -1) ctx.setActiveIndex(-1);
		if (!ctx.open) ctx.show();
		if (oninput) (oninput as (e: Event & { currentTarget: HTMLInputElement }) => void)(e);
	}

	function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
		if (!ctx.open) ctx.show();
		if (onfocus) (onfocus as (e: FocusEvent & { currentTarget: HTMLInputElement }) => void)(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		let cachedItems: HTMLElement[] | undefined;
		const items = () => (cachedItems ??= getOptionItems(getContentEl()));

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				if (!ctx.open) {
					ctx.show();
					ctx.setActiveIndex(0);
				} else {
					const next = ctx.activeIndex < items().length - 1 ? ctx.activeIndex + 1 : 0;
					ctx.setActiveIndex(next);
				}
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				if (!ctx.open) {
					ctx.show();
					ctx.setActiveIndex(items().length - 1);
				} else {
					const prev = ctx.activeIndex > 0 ? ctx.activeIndex - 1 : items().length - 1;
					ctx.setActiveIndex(prev);
				}
				break;
			}
			case 'Enter': {
				e.preventDefault();
				if (ctx.open && ctx.activeIndex >= 0) {
					items()[ctx.activeIndex]?.click();
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
				if (!ctx.open || items().length === 0) break;
				e.preventDefault();
				ctx.setActiveIndex(0);
				break;
			}
			case 'End': {
				if (!ctx.open) break;
				const list = items();
				if (list.length === 0) break;
				e.preventDefault();
				ctx.setActiveIndex(list.length - 1);
				break;
			}
			case 'Tab': {
				if (ctx.open) {
					if (ctx.activeIndex >= 0) {
						const item = items()[ctx.activeIndex];
						if (item) item.click();
						else ctx.close();
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

<label
	{@attach attachTrigger}
	data-combobox-input
	data-size={size}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={isDisabled || undefined}
	data-invalid={isInvalid || undefined}
	data-has-leading={hasLeading || undefined}
	data-has-trailing={hasTrailing || undefined}
	class={className}
	{style}
>
	{#if leading}
		<span data-part="leading" aria-hidden="true">{@render leading()}</span>
	{/if}

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
		aria-invalid={ariaInvalid}
		data-invalid={dataInvalid}
		disabled={isDisabled || undefined}
		data-disabled={isDisabled || undefined}
		value={ctx.inputValue}
		{placeholder}
		autocomplete="off"
		oninput={handleInput}
		onkeydown={handleKeydown}
		onfocus={handleFocus}
		{...rest}
	/>

	{#if trailing}
		<span data-part="trailing" aria-hidden="true">{@render trailing()}</span>
	{/if}
</label>

<style>
	[data-combobox-input] {
		--_dry-combobox-bg: var(--dry-combobox-bg, var(--dry-form-control-bg));
		--_dry-combobox-border: var(--dry-combobox-border, var(--dry-form-control-border));
		--_dry-combobox-color: var(--dry-combobox-color, var(--dry-form-control-color));
		--_dry-combobox-padding-x: var(
			--dry-combobox-padding-x,
			var(--dry-form-control-padding-inline)
		);
		--_dry-combobox-padding-y: var(--dry-combobox-padding-y, var(--dry-form-control-padding-block));
		--_dry-combobox-font-size: var(--dry-combobox-font-size, var(--dry-form-control-font-size));
		--_dry-combobox-affix-gap: var(--dry-combobox-affix-gap, var(--dry-space-2));
		--_dry-combobox-affix-min-inline-size: var(--dry-combobox-affix-min-inline-size, 1.5rem);

		display: grid;
		align-items: center;
		grid-template-columns: minmax(0, 1fr);
		padding-block: var(--_dry-combobox-padding-y);
		padding-inline: var(--_dry-combobox-padding-x);
		font-size: var(--_dry-combobox-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--_dry-combobox-color);
		background: var(--_dry-combobox-bg);
		border: 1px solid var(--_dry-combobox-border);
		border-radius: var(--dry-combobox-radius, var(--dry-form-control-radius));
		box-sizing: border-box;
		column-gap: var(--_dry-combobox-affix-gap);
		cursor: text;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-combobox-input][data-has-leading] {
		grid-template-columns:
			minmax(var(--_dry-combobox-affix-min-inline-size), max-content)
			minmax(0, 1fr);
	}

	[data-combobox-input][data-has-trailing] {
		grid-template-columns: minmax(0, 1fr) max-content;
	}

	[data-combobox-input][data-has-leading][data-has-trailing] {
		grid-template-columns:
			minmax(var(--_dry-combobox-affix-min-inline-size), max-content)
			minmax(0, 1fr) max-content;
	}

	[data-combobox-input]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-combobox-input]:focus-within {
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

	[data-combobox-input][data-invalid] {
		--dry-combobox-bg: color-mix(
			in srgb,
			var(--dry-color-fill-error-weak) 70%,
			var(--dry-color-bg-raised)
		);
		--dry-combobox-border: var(--dry-color-stroke-error);
	}

	[data-combobox-input][data-invalid]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-error-strong);
	}

	[data-combobox-input][data-invalid]:focus-within {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-stroke-error);
	}

	[data-combobox-input] input {
		appearance: none;
		background: transparent;
		border: 0;
		box-sizing: border-box;
		color: inherit;
		font: inherit;
		line-height: inherit;
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0;
	}

	[data-combobox-input] input::placeholder {
		color: var(--dry-form-control-color-placeholder);
	}

	[data-combobox-input] input:focus,
	[data-combobox-input] input:focus-visible {
		outline: none;
	}

	[data-combobox-input] [data-part='leading'],
	[data-combobox-input] [data-part='trailing'] {
		color: var(--dry-color-text-weak);
		display: grid;
		align-items: center;
		justify-items: center;
		line-height: 1;
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
