<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAccordionCtx, getAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getAccordionCtx();
	const itemCtx = getAccordionItemCtx();
</script>

<button
	type="button"
	aria-expanded={itemCtx.open}
	aria-controls={itemCtx.contentId}
	data-state={itemCtx.open ? 'open' : 'closed'}
	data-disabled={itemCtx.disabled || undefined}
	data-accordion-trigger
	disabled={itemCtx.disabled}
	class={className}
	onclick={() => ctx.toggle(itemCtx.value)}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-accordion-trigger] {
		display: grid;
		grid-template-columns: 1fr 1rem;
		align-items: center;
		padding: var(--dry-space-4);
		background: none;
		border: none;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-weight: 600;
		font-family: var(--dry-font-sans);
		cursor: pointer;
		color: var(--dry-color-text-strong);
		text-align: left;
		min-height: var(--dry-space-12);
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([data-disabled]) {
			background: color-mix(in srgb, var(--dry-color-fill-brand) 5%, transparent);
		}

		&:active:not([data-disabled]) {
			transform: translateY(1px);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: -2px;
		}

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&[data-state='open']::after {
			transform: rotate(180deg);
		}

		&::after {
			content: '';
			height: 1rem;
			aspect-ratio: 1;
			background: currentColor;
			mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
			mask-size: contain;
			transition: transform var(--dry-duration-fast) var(--dry-ease-default);
		}
	}
</style>
