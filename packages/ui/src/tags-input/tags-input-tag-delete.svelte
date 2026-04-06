<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		index: number;
		value?: string;
	}

	let { index, value = '', class: className, onclick, ...rest }: Props = $props();

	const ctx = getTagsInputCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (ctx.disabled) return;
		ctx.removeTag(index);
		if (onclick) {
			(onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
		}
	}
</script>

<button
	type="button"
	aria-label="Remove tag: {value}"
	disabled={ctx.disabled}
	data-part="tagDelete"
	data-disabled={ctx.disabled || undefined}
	class={className}
	onclick={handleClick}
	{...rest}
></button>

<style>
	[data-part='tagDelete'] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-4);
		aspect-ratio: 1;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		border-radius: var(--dry-radius-full);
		opacity: 0.7;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);

		&::after {
			content: '\00d7';
			font-size: 1em;
			line-height: 1;
			font-weight: 400;
		}

		&:hover:not(:disabled) {
			opacity: 1;
			background: color-mix(in srgb, currentColor 15%, transparent);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: -1px;
			opacity: 1;
		}

		&:disabled {
			cursor: not-allowed;
		}
	}
</style>
