<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getRadioGroupCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLInputAttributes, 'children'> {
		value: string;
		disabled?: boolean;
		children?: Snippet | undefined;
	}

	let { value, disabled = false, children, class: className, ...rest }: Props = $props();

	const ctx = getRadioGroupCtx();

	const isDisabled = $derived(disabled || ctx.disabled);
	const checked = $derived(ctx.value === value);

	function handleChange() {
		if (isDisabled) return;
		ctx.select(value);
	}
</script>

<label
	data-radio-group-item
	data-state={checked ? 'checked' : 'unchecked'}
	data-disabled={isDisabled || undefined}
	class={className}
>
	<input
		type="radio"
		name={ctx.name}
		{value}
		{checked}
		disabled={isDisabled}
		required={ctx.required}
		data-state={checked ? 'checked' : 'unchecked'}
		data-disabled={isDisabled || undefined}
		onchange={handleChange}
		{...rest}
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
		border: 2px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-bg-raised);
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
		transform: translate(-50%, -50%) scale(0);
		height: 8px;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-on-brand);
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
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
		background: var(--dry-color-fill-selected);
		border-color: var(--dry-color-stroke-selected);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
	}

	[data-radio-group-item] input[type='radio']:checked::after {
		transform: translate(-50%, -50%) scale(1);
	}

	[data-radio-group-item] input[type='radio']:checked:hover:not(:disabled) {
		background: var(--dry-color-fill-selected);
		border-color: var(--dry-color-stroke-selected);
	}

	[data-radio-group-item] input[type='radio']:disabled {
		background: var(--dry-color-fill-disabled);
		border-color: var(--dry-color-stroke-disabled);
		opacity: 1;
		cursor: not-allowed;
	}
</style>
