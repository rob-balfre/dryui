<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getPaginationCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getPaginationCtx();
</script>

<button
	type="button"
	disabled={!ctx.canNext}
	data-pagination-button
	class={className}
	onclick={() => ctx.next()}
	aria-label="Go to next page"
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-pagination-button] {
		display: inline-grid;
		grid-template-columns: minmax(var(--dry-space-10), max-content);
		place-items: center;
		height: var(--dry-space-10);
		padding: var(--dry-space-1_5) var(--dry-space-3);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-weak);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast),
			border-color var(--dry-duration-fast),
			transform var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([disabled]) {
			background: var(--dry-color-fill-hover);
			border-color: var(--dry-color-stroke-strong);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-stroke-focus);
			outline-offset: 2px;
		}

		&:active:not([disabled]) {
			transform: translateY(1px);
		}

		&[disabled] {
			color: var(--dry-color-text-disabled);
			background: var(--dry-color-fill-disabled);
			border-color: var(--dry-color-stroke-disabled);
			cursor: not-allowed;
		}
	}
</style>
