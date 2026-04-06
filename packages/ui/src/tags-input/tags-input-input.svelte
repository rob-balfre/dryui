<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLInputAttributes {
		placeholder?: string;
	}

	let { placeholder, class: className, onkeydown, ...rest }: Props = $props();

	const ctx = getTagsInputCtx();

	let inputValue = $state('');

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const trimmed = inputValue.trim().replace(/,$/, '');
			if (trimmed) {
				const added = ctx.addTag(trimmed);
				if (added) {
					inputValue = '';
				}
			}
		} else if (e.key === 'Backspace' && inputValue === '') {
			ctx.removeLastTag();
		}

		if (onkeydown) {
			(onkeydown as (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void)(e);
		}
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const raw = e.currentTarget.value;
		if (raw.endsWith(',')) {
			const trimmed = raw.slice(0, -1).trim();
			if (trimmed) {
				const added = ctx.addTag(trimmed);
				if (added) {
					inputValue = '';
					return;
				}
			}
			inputValue = raw.slice(0, -1);
		}
	}
</script>

<input
	type="text"
	bind:value={inputValue}
	{placeholder}
	disabled={ctx.disabled}
	data-part="input"
	data-disabled={ctx.disabled || undefined}
	class={className}
	onkeydown={handleKeydown}
	oninput={handleInput}
	{...rest}
/>

<style>
	[data-part='input'] {
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--dry-font-sans);
		font-size: var(--dry-tags-input-font-size, var(--dry-type-small-size, var(--dry-text-sm-size)));
		color: var(--dry-color-text-strong);
		padding: 0;
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));

		&::placeholder {
			color: var(--dry-color-text-weak);
		}

		&:disabled {
			cursor: not-allowed;
		}
	}
</style>
