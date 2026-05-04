<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
	import { getRadioGroupCtx } from './context.svelte.js';

	type WrapperAttrs = Omit<
		HTMLAttributes<HTMLLabelElement>,
		'children' | 'onchange' | 'onfocus' | 'onblur' | 'autofocus'
	>;

	interface Props extends WrapperAttrs {
		value: string;
		disabled?: boolean;
		children?: Snippet | undefined;
		name?: HTMLInputAttributes['name'];
		required?: HTMLInputAttributes['required'];
		autofocus?: HTMLInputAttributes['autofocus'];
		onchange?: HTMLInputAttributes['onchange'];
		onfocus?: HTMLInputAttributes['onfocus'];
		onblur?: HTMLInputAttributes['onblur'];
	}

	let {
		value,
		disabled = false,
		children,
		class: className,
		style,
		id,
		name,
		required,
		autofocus,
		onchange: onchangeProp,
		onfocus,
		onblur,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		'aria-describedby': ariaDescribedby,
		...rest
	}: Props = $props();

	const ctx = getRadioGroupCtx();

	const isDisabled = $derived(disabled || ctx.disabled);
	const checked = $derived(ctx.value === value);

	function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (isDisabled) return;
		ctx.select(value);
		onchangeProp?.(event);
	}
</script>

<label
	{...rest}
	data-radio-group-item
	data-state={checked ? 'checked' : 'unchecked'}
	data-disabled={isDisabled || undefined}
	class={className}
	{style}
>
	<input
		type="radio"
		name={name ?? ctx.name}
		{value}
		{checked}
		disabled={isDisabled}
		required={required ?? ctx.required}
		{id}
		{autofocus}
		{onfocus}
		{onblur}
		aria-label={ariaLabel}
		aria-labelledby={ariaLabelledby}
		aria-describedby={ariaDescribedby}
		data-state={checked ? 'checked' : 'unchecked'}
		data-disabled={isDisabled || undefined}
		onchange={handleChange}
	/>
	{#if children}
		{@render children()}
	{/if}
</label>

<style>
	[data-radio-group-item] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: var(--dry-space-8);
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
		cursor: pointer;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		padding: var(--dry-space-1) 0;
		min-height: 48px;
		user-select: none;

		&[data-disabled] {
			color: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
		}
	}

	[data-radio-group-item] input[type='radio'] {
		appearance: none;
		-webkit-appearance: none;
		height: var(--dry-space-8);
		min-height: var(--dry-space-8);
		border: 2px solid var(--dry-radio-border, var(--dry-color-stroke-strong));
		border-radius: var(--dry-radius-full);
		background: var(--dry-radio-bg, var(--dry-color-bg-raised));
		margin: 0;
		cursor: pointer;
		position: relative;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background-color var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-radio-group-item] input[type='radio']::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0.25);
		opacity: 0;
		filter: blur(4px);
		height: 8px;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-on-brand);
		transform-origin: center;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-fast) var(--dry-ease-spring-snappy),
			filter var(--dry-duration-fast) var(--dry-ease-spring-snappy);
	}

	[data-radio-group-item] input[type='radio']:hover:not(:disabled) {
		border-color: var(--dry-color-stroke-selected);
	}

	[data-radio-group-item] input[type='radio']:active:not(:disabled) {
		transform: scale(0.96);
	}

	[data-radio-group-item] input[type='radio']:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: 2px;
	}

	[data-radio-group-item] input[type='radio']:checked {
		background: var(--dry-radio-checked-bg, var(--dry-color-fill-selected));
		border-color: var(--dry-radio-checked-border, var(--dry-color-stroke-selected));
		box-shadow: inset 0 0 0 1px var(--dry-radio-checked-border, var(--dry-color-stroke-selected));
	}

	[data-radio-group-item] input[type='radio']:checked::after {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		[data-radio-group-item] input[type='radio']::after {
			transition: none;
			filter: none;
		}
	}

	[data-radio-group-item] input[type='radio']:checked:hover:not(:disabled) {
		background: var(--dry-radio-checked-bg, var(--dry-color-fill-selected));
		border-color: var(--dry-radio-checked-border, var(--dry-color-stroke-selected));
	}

	[data-radio-group-item] input[type='radio']:disabled {
		background: var(--dry-color-fill-disabled);
		border-color: var(--dry-color-stroke-disabled);
		opacity: 1;
		cursor: not-allowed;
	}
</style>
