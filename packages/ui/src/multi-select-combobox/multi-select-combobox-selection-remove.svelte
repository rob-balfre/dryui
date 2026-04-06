<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		label?: string | undefined;
	}

	let { class: className, value, label, onclick, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (ctx.disabled) {
			return;
		}

		ctx.removeValue(value);
		ctx.focusInput();

		if (onclick) {
			(onclick as (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(event);
		}
	}
</script>

<button
	type="button"
	aria-label={`Remove selection: ${label ?? value}`}
	disabled={ctx.disabled}
	data-multi-select-selection-remove
	data-disabled={ctx.disabled || undefined}
	class={className}
	onclick={handleClick}
	{...rest}
></button>

<style>
	[data-multi-select-selection-remove] {
		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: 16px;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		border-radius: var(--dry-radius-full);
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-multi-select-selection-remove]::after {
		content: '\00d7';
		font-size: 14px;
		line-height: 1;
		font-weight: 400;
	}

	[data-multi-select-selection-remove]:hover:not(:disabled) {
		background: var(--dry-color-fill-hover);
	}

	[data-multi-select-selection-remove]:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -1px;
	}

	[data-multi-select-selection-remove]:disabled {
		color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}
</style>
